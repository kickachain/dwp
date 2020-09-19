class ToolBarHandler {
    tselectors: ITSelectors
    toolBarWrapper: HTMLElement;
    canvas: CanvasController;
    editorWrapper: HTMLElement;
    endpoints: ITEndpoints;
    editorContext

    constructor(canvas, editorContext) {
        this.tselectors = {
            createMask: 'create-mask',
            endMask: 'end-mask',
            createColBound: 'create-bound',
            undoColBound: 'undo-bound',
            quitColBound: 'quit-bound',
            setPage: 'set-current',
            unSetPage: 'unset-current',
            sendData: 'send-data',
            currentCoords: 'current-output',
            docCoords: 'doc-output',
            toolbar: 'toolbar',

        }

        this.editorContext = editorContext
        this.toolBarWrapper = document.querySelector('.' + this.tselectors.toolbar)
        this.canvas = canvas;
    }

    public init(): void {
        if (this.toolBarWrapper != null) {
            this.createMask();
            this.quitMaskTool();
            this.createColumnBondary();
            this.undoColumnBondary();
            this.quitColumnBondary();
            this.setPage();
            this.unSetPage();
            this.confirmDocMetaForOCRAnalysis();
        } else {
            console.warn('cannot find toolbar wrapper element, possible template load failure')
        }
    }

    private createMask(): void {
        this.toolBarWrapper.querySelector('.' + this.tselectors.createMask).addEventListener('click', event => {
            this.canvas.draw();
        });
    }

    private quitMaskTool(): void {
        this.toolBarWrapper.querySelector('.' + this.tselectors.endMask).addEventListener('click', () => {
            this.canvas.quitBox();
        });
    }

    private undoColumnBondary(): void {
        this.toolBarWrapper.querySelector('.' + this.tselectors.undoColBound).addEventListener('click', event => {
            this.canvas.redrawBoundary = true;
            this.canvas.undoLastColumnBoundary();
        });
    }

    private createColumnBondary(): void {
        this.toolBarWrapper.querySelector('.' + this.tselectors.createColBound).addEventListener('click', event => {
            this.canvas.createBoundary = true;
        });
    }

    private quitColumnBondary(): void {
        this.toolBarWrapper.querySelector('.' + this.tselectors.quitColBound).addEventListener('click', event => {
            this.canvas.createBoundary = false;
        });
    }

    private setPage(): void {
        this.toolBarWrapper.querySelector('.' + this.tselectors.setPage).addEventListener('click', event => {
            this.canvas.createBoundary = false;
            this.editorContext.addPageToDocFinalShape();
            this.updateDocShape()
        });
    }

    private unSetPage(): void {
        this.toolBarWrapper.querySelector('.' + this.tselectors.unSetPage).addEventListener('click', event => {
            this.canvas.createBoundary = false;
            this.editorContext.removePageFromFinalShape();
            this.updateDocShape()
        });
    }

    private updateDocShape() {
        this.displayDocOutput()
    }

    private displayDocOutput() {
        // uses update current postion from a getter in the canvas
        const sizeTextDiv: HTMLElement = document.querySelector('.' + this.tselectors.docCoords);
        sizeTextDiv.innerHTML = `<p> ${JSON.stringify(this.editorContext.getDocFinalShape())}</p>`;
    }

    public getBoxCoods(): IFinalShape {
        return this.canvas.getBoxCoords();
    }

    public getColumnCoods() {
        return this.canvas.getColumnCoords();
    }
    
    public confirmDocMetaForOCRAnalysis(): void {
        this.toolBarWrapper.querySelector('.' + this.tselectors.sendData).addEventListener('click', () => {
            this.editorContext.sendData();
            //this.redirectToEditResults();
        });
    }

    private redirectToEditResults() {
        window.location.href = 'edit_results'
    }
}

interface ITSelectors {
    createMask: string,
    endMask: string,
    toolbar: string,
    createColBound: string,
    undoColBound: string,
    quitColBound: string,
    sendData: string,
    currentCoords: string,
    docCoords: string,
    setPage: string,
    unSetPage: string
}

