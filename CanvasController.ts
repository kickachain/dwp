class CanvasController {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  drag: boolean;
  mouseX: number;
  mouseY: number;
  closeEnough: number;
  dragTL: boolean;
  dragBL: boolean;
  dragTR: boolean;
  dragBR: boolean;
  moveBox: boolean;
  canDrawColumn: boolean;
  page_canvas;
  page_ctx;

  // box being drawn by user 
  rect: IRectangle;
  pagesHandler: IPagesHandler;
  selectors: ICSelectors;
  colors: ICColors;
  imagePathsArray: Array<string>
  pageNavigation: PagesNavigation;
  imageSize
  imageArray
  canvasObject
  bigPageWrapper
  startX
  startY
  boundaryCount
  createBoundary
  redrawBoundary
  Xboundary
  xColumnsSetArray
  trackLength

  constructor(pageNavigation, imageArray) {
    this.canvas = document.querySelector("#canvas");
    this.ctx = this.canvas.getContext('2d');
    this.drag = false;
    this.mouseX = null;
    this.mouseY = null;
    this.dragTL = false;
    this.dragBL = false;
    this.dragTR = false;
    this.dragBR = false;
    this.moveBox = false;
    this.canDrawColumn = false;
    this.closeEnough = 10;
    this.boundaryCount = 0;
    this.createBoundary = false;
    this.redrawBoundary = false;
    this.trackLength;
    this.xColumnsSetArray = new Array();

    this.selectors = {
      bigPageView: 'big-page-view',
      grabElement: '',
      grabbingElement: '',
      pageCanvas: 'page-canvas',
      canvasCount: 'canvas-',
      columnCanvas: 'col-canvas',
      currentCoords: 'current-output',
      drawingTools: 'drawing-tools'
    }

    this.bigPageWrapper = document.querySelector('.' + this.selectors.bigPageView);

    this.colors = {
      transparentOrange: 'rgba(231,121,43,0.5)',
      demarqOrange: 'rgba(231,121,43,1)'
    }

    this.rect = {
      startX: 100,
      startY: 200,
      w: 300,
      h: 200,
    }

    this.canvasObject = {
      width: 589,
      height: 839
    }

    this.pageNavigation = pageNavigation;
    this.imageArray = imageArray;

    console.log(this.imageArray, 'the image array')

    this.pagesHandler = {
      pages: [
        {
          pageTitle: '',
          pageCount: 0,
          selected: true,
          setTable: true,
          pagePath: '',
        },

      ],
    }
  }

  public init(): void {
    this.canvas.addEventListener('mousedown', this.mouseDown, false);
    this.canvas.addEventListener('mouseup', this.mouseUp, false);
    this.canvas.addEventListener('mousemove', this.mouseMove, false);
    window.addEventListener("scroll", this.getScrolled, false);
    this.makeCanvasPerAPage();
    this.addImagesTocanvases();
  }

  private getScrolled = (event?): number => {
    return document.documentElement.scrollTop || document.body.scrollTop
  }

  private mouseDown = (event: MouseEvent): void => {
    const bounds = event.target as HTMLElement;
    const boxCoods = bounds.getBoundingClientRect();
    this.mouseX = (event.pageX - boxCoods.left);
    this.mouseY = (event.pageY - (boxCoods.top + this.getScrolled()));

    const bigpage = document.getElementsByClassName('big-page-view')[0] as HTMLElement

    console.log(this.mouseY, 'with scrooll', (event.pageY - boxCoods.top), 'without scroll',  this.getScrolled(), 'the scroll amounts')
    console.log(this.rect.startY, 'this.rect.startY')

    // if there isn't a rect yet
    if (this.rect.w === undefined) {
      this.rect.startX = this.mouseX;
      this.rect.startY = this.mouseY;
      this.dragBR = true;
    }
    // if there is, check which corner
    //   (if any) was clicked
    //
    // 4 cases:
    // 1. top left

    else if (this.checkCloseEnough(this.mouseX, this.rect.startX) && this.checkCloseEnough(this.mouseY, this.rect.startY)) {
      this.dragTL = true;
    }
    // 2. top right
    else if (this.checkCloseEnough(this.mouseX, this.rect.startX + this.rect.w) && this.checkCloseEnough(this.mouseY, this.rect.startY)) {
      this.dragTR = true;

    }
    // 3. bottom left
    else if (this.checkCloseEnough(this.mouseX, this.rect.startX) && this.checkCloseEnough(this.mouseY, this.rect.startY + this.rect.h)) {
      this.dragBL = true;

    }
    // 4. bottom right
    else if (this.checkCloseEnough(this.mouseX, this.rect.startX + this.rect.w) && this.checkCloseEnough(this.mouseY, this.rect.startY + this.rect.h)) {
      this.dragBR = true;

    }
    // 5. grab whole box
    else if (this.checkInsideBox({ mouseX: this.mouseX, mouseY: this.mouseY }, { rectStartX: this.rect.startX, rectW: this.rect.w, rectStartY: this.rect.startY, rectH: this.rect.h })) {
      this.canDrawColumn = true;

      // handle not resizing but instead inside the rectangle area
      this.moveBox = true;

      // capture the coords of the mouse on the inital mouseDown x/y
      this.startX = this.mouseX;
      this.startY = this.mouseY;
      this.addColumnToCanvas();
      this.cloneColumnsBeingSet(this.startX);
    }

    // 6. none of them
    else {
      // handle not resizing/not being dragged
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.draw();

  }

  private checkCloseEnough(p1: number, p2: number): boolean {
    return Math.abs(p1 - p2) < this.closeEnough;
  }

  private checkInsideBox(mouseXY, boxCoords) {
    let insideBox = false

    if ((mouseXY.mouseX > boxCoords.rectStartX) &&
      (mouseXY.mouseX < (boxCoords.rectStartX + boxCoords.rectW)) &&
      (mouseXY.mouseY > boxCoords.rectStartY) &&
      (mouseXY.mouseY < (boxCoords.rectStartY + boxCoords.rectH))) {
      insideBox = true
      console.log(insideBox, 'insidebox')
    }

    return insideBox
  }

  private mouseUp = (event: MouseEvent): void => {
    this.dragTL = this.dragTR = this.dragBL = this.dragBR = this.moveBox = this.canDrawColumn = false;
    this.redrawColumnBoundaries();
    this.updateCurrentShape();
  }

  private mouseMove = (event: MouseEvent): void => {
    const targetElement = event.target as HTMLElement;
    const targetELementBounds = targetElement.getBoundingClientRect()
    this.mouseX = event.pageX - (targetELementBounds.left);
    this.mouseY = (event.pageY - targetELementBounds.top) - this.getScrolled();
    const draggedY = this.mouseY - this.startY;
    const draggedX = this.mouseX - this.startX;
    if (this.dragTL) {
      this.rect.w += this.rect.startX - this.mouseX;
      this.rect.h += this.rect.startY - this.mouseY;
      this.rect.startX = this.mouseX;
      this.rect.startY = this.mouseY;
    } else if (this.dragTR) {
      this.rect.w = Math.abs(this.rect.startX - this.mouseX);
      this.rect.h += this.rect.startY - this.mouseY;
      this.rect.startY = this.mouseY;
    } else if (this.dragBL) {
      this.rect.w += this.rect.startX - this.mouseX;
      this.rect.h = Math.abs(this.rect.startY - this.mouseY);
      this.rect.startX = this.mouseX;
    } else if (this.dragBR) {
      this.rect.w = Math.abs(this.rect.startX - this.mouseX);
      this.rect.h = Math.abs(this.rect.startY - this.mouseY);
    } else if (this.moveBox) {
      // calculate the distance the mouse has moved
      this.rect.startX += draggedX;
      this.rect.startY += draggedY;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.draw();

    // reset the capturing of co-ordinates on mouseDown
    this.startX = this.mouseX
    this.startY = this.mouseY
  }

  public draw(): void {
    this.ctx.fillStyle = this.colors.transparentOrange;
    this.ctx.fillRect(this.rect.startX, this.rect.startY, this.rect.w, this.rect.h);
    this.drawHandles();
  }

  private drawCircle(x: number, y: number, radius: number): void {
    this.ctx.fillStyle = this.colors.demarqOrange;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  private drawHandles(): void {
    this.drawCircle(this.rect.startX, this.rect.startY, this.closeEnough);
    this.drawCircle(this.rect.startX + this.rect.w, this.rect.startY, this.closeEnough);
    this.drawCircle(this.rect.startX + this.rect.w, this.rect.startY + this.rect.h, this.closeEnough);
    this.drawCircle(this.rect.startX, this.rect.startY + this.rect.h, this.closeEnough);
  }

  private styleMouse(selector: string): void {
    const element = document.querySelector(selector) as HTMLElement;
    element.classList.add();
  }

  private makeCanvasPerAPage() {
    let count = 0;
    for (let imageCount of this.imageArray) {
      this.makeCanvas(count);
      this.getIndivdualPageArea();
      count++
    }
  }

  private addImagesTocanvases() {
    let count = 0;
    for (let image of this.imageArray) {
      this.drawPageOntoCanvas(image, count)
      this.setBigPageMeta(count)
      count++;
    }
  }

  private drawPageOntoCanvas(image, count) {
    const currentPage = this.bigPageWrapper.querySelector('.' + this.selectors.canvasCount + count) as HTMLCanvasElement;
    const currentPageContext = currentPage.getContext('2d');
    // thuis size will need to be changed also
    currentPageContext.drawImage(image, 0, 0, 592, 836);

  }

  private setBigPageMeta(count) {
    const currentPage = this.bigPageWrapper.querySelector('.' + this.selectors.canvasCount + count) as HTMLCanvasElement;
    currentPage.setAttribute('data-src', this.imageArray[count].currentSrc);
  }

  private getIndivdualPageArea() {
    const imageDimensionsArray = new Array()
    let count = 1

    // get the image array, set the canvas for each page at that height and width 
    // also remember to update the mask and columns canvas to the same width / height
    for (let image of this.imageArray) {
      imageDimensionsArray.push({
        count: {
          imageWidth: image.width,
          imageHeight: image.height
      }})
      count++
    }

    console.log(imageDimensionsArray,'imageDimensionsArray');
    return imageDimensionsArray
  }

  private updatePageCanvasArea() {
    // event triggered by user changing page.
  }

  private makeCanvas(imageCount) {
    const mycanvas = document.createElement("canvas");
    mycanvas.className = this.selectors.pageCanvas + " " + this.selectors.canvasCount + imageCount;
    mycanvas.width = this.canvasObject.width;
    mycanvas.height = this.canvasObject.height;
    mycanvas.style.zIndex = imageCount;
    this.bigPageWrapper.appendChild(mycanvas);
  }

  private redrawColumnBoundaries() {
    if (this.xColumnsSetArray.length >= 0) {
      const columnCanvas = this.bigPageWrapper.querySelector('canvas' + '.' + this.selectors.columnCanvas);
      const ctx = columnCanvas.getContext("2d");
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.beginPath();
      for (let xColumnBoundary of this.xColumnsSetArray) {
        // x y of starting point of line
        ctx.moveTo(xColumnBoundary, this.rect.startY);
        // x y of ending point of line
        ctx.lineTo(xColumnBoundary, this.rect.startY + this.rect.h);
        ctx.stroke();
      }
    } else {

    }
  }

  private addColumnToCanvas() {
    if (this.createBoundary && this.canDrawColumn) {
      console.log('add column being called')
      const columnCanvas = this.bigPageWrapper.querySelector('canvas' + '.' + this.selectors.columnCanvas);
      const ctx = columnCanvas.getContext("2d");
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      // x y of starting point of line
      ctx.moveTo(this.mouseX, this.rect.startY);
      // x y of ending point of line
      ctx.lineTo(this.mouseX, this.rect.startY + this.rect.h);
      ctx.stroke();
    }
  }

  private cleanColumnCoords() {
    const finalColumnBounds = Array()
    for (let xColumnBoundary of this.xColumnsSetArray) {
      const relativePosition = xColumnBoundary / this.canvas.width
      finalColumnBounds.push(relativePosition)
    }

    return finalColumnBounds
  }

  private cloneColumnsBeingSet(startX) {
    if (this.createBoundary) {
      this.xColumnsSetArray.push(startX);
      console.log(this.xColumnsSetArray, 'xColumnsSetArray');
    }
  }

  public undoLastColumnBoundary() {
    if (this.redrawBoundary && this.xColumnsSetArray.length >= 0) {
      this.xColumnsSetArray.pop();
      console.log(this.xColumnsSetArray, 'removed last in array')
      this.redrawColumnBoundaries();
      this.updateCurrentShape();
    }
  }

  public getBoxCoords() {
    return this.createRectCoords();
  }

  public getColumnCoords() {
    return this.cleanColumnCoords();
  }

  public currentShape() {
    return {
      boxCoods: this.getBoxCoords(),
      columns: this.cleanColumnCoords(),
    }
  }

  public updateCurrentShape() {
    this.displayCurrentPositions()
  }

  private displayCurrentPositions() {
    // uses update current postion from a getter in the canvas
    const sizeTextDiv: HTMLElement = document.querySelector('.' + this.selectors.currentCoords);
    sizeTextDiv.innerHTML = `<p> ${JSON.stringify(this.currentShape())}</p>`;
  }

  public quitBox(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private createRectCoords(): IFinalShape {
    const correctShape = {
      x1: (this.rect.startX / this.canvasObject.width), y1: (this.rect.startY / this.canvasObject.height), x2: (this.rect.startX + this.rect.w) / this.canvasObject.width, y2: (this.rect.startY + this.rect.h) / this.canvasObject.height
    };

    return correctShape;
  }
}


interface IRectangle {
  startX: number,
  startY: number,
  w: number,
  h: number,
}

interface IPagesHandler {
  pages: Array<IPage>
}

interface IPage {
  pageTitle: string;
  pageCount: number,
  selected: boolean,
  setTable: boolean,
  pagePath: string,
}

interface ICSelectors {
  bigPageView: string,
  grabElement: string,
  grabbingElement: string,
  pageCanvas: string,
  canvasCount: string,
  columnCanvas: string,
  currentCoords: string,
  drawingTools: string
}

interface ICColors {
  transparentOrange: string,
  demarqOrange: string,
}

interface IFinalShape {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  pageNumber?: number;
  columns?: Array<number>
}

interface IColumn {

} 