class PagesNavigation {

    pselectors: IPSelectors;
    editor: HTMLElement;
    bigPage: HTMLElement;
    thumbnailContainer: HTMLElement;
    imageArray;
    currentPageArray;
    editorContext;


    constructor(imageArray, editorContext) {
        this.pselectors = {
            thumbnail: 'img-thumbnail',
            selected: 'selected',
            beingViewed: 'display-page',
            hidePage: 'hide',
            fitPageContainer: 'page-view',
            thumbnailWrapper: 'thumb-nail-wrapper',
            documentWrapper: 'document-wrapper',
            rootElement: 'page-editor',
            bigPageView: 'big-page-view',
            bigPage: 'big-page',
            pageIndicator: 'page-indicator'
        }


        this.editor = document.querySelector('.' + this.pselectors.rootElement);
        this.thumbnailContainer = this.editor.querySelector('.' + this.pselectors.thumbnailWrapper);
        this.bigPage = this.editor.querySelector('.' + this.pselectors.bigPageView);
        this.imageArray = imageArray;
        this.currentPageArray = new Array();
        this.editorContext = editorContext
    }


    public init(): void {
        this.userSelectionHandler();
        this.bigPageViewSetup();
    }

    private userSelectionHandler(): void {
        this.thumbnailContainer.querySelectorAll('.' + this.pselectors.thumbnail).forEach(item => {
            item.addEventListener('click', event => {
                this.thumbnailSelected(event)
                this.displaySelectedThumbNail(event)
                this.pageCountIndicatorArray(event)
                this.addPageIndicatorToHTML();
                // updates what page the user is on so the editor knows also.
                this.editorContext.setCurrentPageStatus(this.currentPageArray);
            });
        })
    }

    private thumbnailSelected(event: Event): void {
        const allThumbNails: NodeListOf<ChildNode> = this.thumbnailContainer.querySelectorAll('.' + this.pselectors.bigPage);
        allThumbNails.forEach((element: HTMLElement) => {
            element.classList.remove(this.pselectors.selected);
        });
        const selectedThumbNail = event.target as HTMLElement;
        selectedThumbNail.classList.add(this.pselectors.selected);
    }

    public pageCountIndicatorArray(event: Event) {
        const selectedThumbNail = event.target as HTMLImageElement;

        let count = 0;
        for (let image of this.imageArray) {
            if (selectedThumbNail.src === image.src) {
                this.currentPageArray[0] = (count + 1);
                this.currentPageArray[1] = this.imageArray.length;
            }
            count++;
        }
    }

    private addPageIndicatorToHTML() {
        const pageIndicator = this.editor.querySelector('.' + this.pselectors.pageIndicator);
        pageIndicator.innerHTML = JSON.stringify(this.currentPageArray[0]) + '/' + this.imageArray.length
    }

    private displaySelectedThumbNail(event: Event): void {
        const selectedThumbNail = event.target as HTMLImageElement;
        const bigImages: NodeListOf<HTMLCanvasElement> = this.bigPage.querySelectorAll('.' + this.pselectors.bigPage) as NodeListOf<HTMLCanvasElement>;
        let selected: boolean = true;

        bigImages.forEach(bigImage => {
            if (selectedThumbNail.src === bigImage.getAttribute('data-src') && selected) {
                bigImage.classList.remove(this.pselectors.hidePage)
                bigImage.classList.add(this.pselectors.beingViewed, this.pselectors.fitPageContainer)
                selected = false;
            } else {
                bigImage.classList.remove(this.pselectors.beingViewed, this.pselectors.fitPageContainer)
                bigImage.classList.add(this.pselectors.hidePage)
            }
        });
    }

    private bigPageViewSetup(): void {
        const bigImages = this.editor.querySelectorAll('.page-canvas') as NodeListOf<HTMLImageElement>;

        if (bigImages !== null) {
            let count = 0
            bigImages.forEach(bigImage => {
                if (count === 0) {
                    bigImage.classList.add(this.pselectors.bigPage)
                } else {
                    bigImage.classList.add(this.pselectors.hidePage, this.pselectors.bigPage)
                }
                count++
            })
        }
    }
}

interface IPSelectors {
    thumbnail: string,
    selected: string,
    beingViewed: string,
    hidePage: string,
    fitPageContainer: string,
    thumbnailWrapper: string,
    documentWrapper: string,
    rootElement: string,
    bigPageView: string,
    bigPage: string;
    pageIndicator: string;
}