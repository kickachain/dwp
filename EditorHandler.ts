class EditorWrapper {

  sessionMetaData: IUIHandlerObject;
  selectors: ISelectors;
  pageNavigation: PagesNavigation;
  toolBar: ToolBarHandler;
  apiRequest;
  canvas: CanvasController;
  imagePathsArray
  imageArray
  imageSize
  endpoints
  currentPageStatus
  outPutArray

  constructor(imagePathsFileNamesJSON) {

    this.sessionMetaData = {
      document_name: '',
      total_page_count: 0,
      order_set_by_user: true,
      pages: [
        {
          pageCount: 0,
          selected: true,
          setTable: true,
          pagePath: '',
          positionOnPage: {
            startX: 184,
            startY: 260,
            width: 224,
            height: 153
          }
        },
      ],
    };
    this.selectors = {
      rootElement: 'page-editor'
    }

    this.imagePathsArray = imagePathsFileNamesJSON[0];

    this.endpoints = {
      sendForOCRAnalysis: null
    }

    this.outPutArray = Array()
    this.currentPageStatus = Array()

    this.imageSize = {
      width: 592,
      height: 836
    }
  }

  /** 
   * things you have to add to this class, based on responsibilities:
   * 
   * priorities:
   * use sessionMetaData to pass around data from one class to another, this object is going to be extended/updated 50% done
   * dynamically build an object thats shape can handle multiple pages with boxes and multiple column boundaries (comments next to that method)
   * 
   * done:
   * remove hard coded endpoint urls
   * this class should be responsible for being passed back to the backend, this will constantly need to be updated on user interactions.
   * 
   * nice to haves:
   * make this class responsible for all the exchanging of data.
   * **/

  public init(): void {
    if (document.querySelectorAll('.' + this.selectors.rootElement) !== null) {
      this.currentPageStatus[0] = 1;
      this.currentPageStatus[1] = this.makeImageArrayFromImagePathArray().length + 1
      this.setEndpointWithDynamicDataFromImagePathsArray();
      this.pageNavigation = new PagesNavigation(this.makeImageArrayFromImagePathArray(), this);
      this.canvas = new CanvasController(this.pageNavigation, this.makeImageArrayFromImagePathArray());
      this.toolBar = new ToolBarHandler(this.canvas, this);
      this.setUpCanvasController();
      this.setUpToolbar();
      this.setUpPageNavigation();

    } else {
      console.error('missing templates')
    }
  }

  private setUpToolbar(): void {
    this.toolBar.init();
  }

  private setUpPageNavigation(): void {
    this.pageNavigation.init();
  }

  private setUpCanvasController(): void {
    this.canvas.init();
  }

  private reformatImagePathsArray(): Array<string> {
    const re = new RegExp("^web-");
    const fullImagePathArray = new Array()
    let imagePathObjectCounter = 0;

    for (let objectOfFilenameAndPath in this.imagePathsArray) {
      if (this.imagePathsArray.hasOwnProperty(objectOfFilenameAndPath)) {
        let individualObject = this.imagePathsArray[objectOfFilenameAndPath];
        for (let path in individualObject) {
          if (re.test(path)) {
            const fullImagePath = individualObject[path] + '/' + path;
            fullImagePathArray.push(fullImagePath)
            imagePathObjectCounter++;
          }
        }
      }
    }

    /*global value to pass around classes**/
    this.sessionMetaData.total_page_count = imagePathObjectCounter
    return fullImagePathArray
  }

  private setEndpointWithDynamicDataFromImagePathsArray() {

    let endpointSet = false

    for (let objectOfFilenameAndPath in this.reformatImagePathsArray()) {
      if (this.imagePathsArray.hasOwnProperty(objectOfFilenameAndPath)) {
        let individualObject = this.imagePathsArray[objectOfFilenameAndPath];
        for (let path in individualObject) {
          if (!endpointSet) {
            this.endpoints.sendForOCRAnalysis = individualObject[path];
            endpointSet = true
          }
        }
      }
    }

  }

  private makeImageArrayFromImagePathArray(): Array<ImageBitmap> {
    const imageArray = new Array()

    for (let count in this.reformatImagePathsArray()) {

      let img = new Image();
      img.src = this.reformatImagePathsArray()[count];
      img.width = this.imageSize.width;
      img.height = this.imageSize.height;
      imageArray.push(img)
    };

    return imageArray
  }

  /* for each page this happens send multiple objects/packets and they need to push through to an array object

  */
  public setCurrentPageStatus(currentPageArray) {
    this.currentPageStatus = currentPageArray
    console.log(this.currentPageStatus)
  }

  private getPageNumberOnly() {
    return this.currentPageStatus[0]
  }

  private getPageColumns() {
    return this.toolBar.getColumnCoods();
  }

  private buildPageFinalShape() {
    const pageMeta =
      [
        this.toolBar.getBoxCoods()
      ]
    
    pageMeta[0].pageNumber = this.getPageNumberOnly();
    pageMeta[0].columns = this.getPageColumns();

    return pageMeta;
  }

  public addPageToDocFinalShape() {
    this.outPutArray.push(...this.buildPageFinalShape())
  }

  public removePageFromFinalShape() {
    if (this.outPutArray.length >= 0) {
      this.outPutArray.pop()
    }
  }


  private getDocFinalShape() {
    return { packet: this.outPutArray }
  }

  private sendData(): void {
    const jsonPageData = JSON.stringify(this.getDocFinalShape())
    console.log(jsonPageData, 'the data');
    const apiRequest = new XhrApiRequest(this.endpoints.sendForOCRAnalysis, 'POST', jsonPageData, "application/json");

    // const apiRequest = new ApiRequestHandler(this.endpoints.sendForOCRAnalysis, 'POST', jsonPageData);
    apiRequest.sendRequest().then((data) => {
      console.log(data)
      this.redirectToEditResults();
    });
    
  }

  private redirectToEditResults() {
    window.location.href = 'edit_results'
  }

}

interface IUIHandlerObject {
  document_name: string;
  order_set_by_user: boolean;
  total_page_count: number;
  pages: Array<IUI>;
}

interface IUI {
  pageCount: number;
  selected: boolean;
  setTable: boolean;
  pagePath: string;
  positionOnPage: IPageMeta;
}

interface IPageMeta {
  startX: number;
  startY: number;
  width: number;
  height: number;
}

interface ISelectors {
  rootElement: string,
}

interface ITEndpoints {
  sendForOCRAnalysis: string,
}