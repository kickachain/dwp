class TableWrapper {
    selectors
    myTabulator
    endpoint
    table_data
    confidenceTable
    setChanges
    keyInfoAdded
    constructor(myTabulator,confidenceTable, table_data) {
        this.selectors = {
            setChanges: 'set-changes',
            sendResults: 'send-results',
            submitKeyInfo: 'submit-key-info',
            form: 'key-info',
            downloadContainer: 'download-container',
            hide: 'hide'
        }

        this.myTabulator = myTabulator;
        this.confidenceTable = confidenceTable;
        this.table_data = table_data;
        this.endpoint = 'edit_results';
        this.setChanges = false;
        this.keyInfoAdded = false;
    }

    public init() {
        this.displayConfidenceLevels();
        this.displayOCRresults();
        this.userHasSetChanges();
        this.userHasAddedKeyInfo();
        this.confirmChanges();
        this.getConfidenceLevels();
    }

    private displayOCRresults() {
        const ocr_results = this.getOCRresults();
        const tabar = Array();
        
        for (var results in ocr_results) {
            tabar.push(ocr_results[results])
        } 
        this.myTabulator.replaceData(tabar);
    }

    private getOCRresults() {
        return this.table_data[0]
    }

    private getConfidenceData() {
        return this.table_data[1]
    }

    private displayConfidenceLevels() {
        const confidence = this.getConfidenceData();
        const tabar = Array();
        
        for (var results in confidence) {
            tabar.push(confidence[results])
        } 
        this.confidenceTable.replaceData(tabar);
    }

    private getConfidenceLevels() {
        console.log('should be confidence levels', this.table_data[1]);
    }

    private getChangedData() {
        console.log(this.myTabulator.getData("active"), 'to be sent across')
        return this.myTabulator.getData("active");
    }

    private extendChangedDataToExpectedShape() {
        // this is hacky until Ben makes a change

        return {
            packet: {
                table: this.getChangedData(),
                key_info: {
                    account_number: this.getFormData()[0],
                    account_type: this.getFormData()[1],
                    account_name: this.getFormData()[2],
                    branch: this.getFormData()[3]
                }
            }
        }
    }

    private getExpectedDataShape() {
        return this.extendChangedDataToExpectedShape()
    }

    private userHasSetChanges() {
        document.querySelector('.' + this.selectors.setChanges).addEventListener('click', () => {
            this.setChanges = true
        });
    }

    private userHasAddedKeyInfo() {
        document.querySelector('.' + this.selectors.submitKeyInfo).addEventListener('click', () => {
            this.keyInfoAdded = true
            this.getFormData();
        });
    }

    private confirmChanges() {
        document.querySelector('.' + this.selectors.sendResults).addEventListener('click', () => {
            if (this.setChanges && this.keyInfoAdded) {
                this.sendData();
                this.displayDownload();
            } else {

            }
        });
    }

    private displayDownload() {
        const downloadContainer = document.querySelector('.' + this.selectors.downloadContainer);
        downloadContainer.classList.remove(this.selectors.hide)
    }

    private getFormData() { 

        const formInputs = (<HTMLFormElement>document.querySelector('#' + this.selectors.form))
        const formArray = Array()
        var i;
        for (i = 0; i < formInputs.elements.length; i++) {
            formArray.push((<HTMLInputElement>formInputs.elements[i]).value)
        }
        
        console.log(formArray)
        return formArray
    }

    private sendData() {
        console.log(JSON.stringify(this.getExpectedDataShape()))
        // const api = new ApiRequestHandler(this.endpoint, 'POST', JSON.stringify(this.getExpectedDataShape()));
        const api = new XhrApiRequest(this.endpoint, 'POST', JSON.stringify(this.getExpectedDataShape()), "application/json");
        api.sendRequest();
    }
}