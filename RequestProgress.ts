class RequestProgress {

    selectors
    requestURL
    formData
    request

    constructor(requestURL) {
        this.selectors = {
            progress: "progress",
            progressWrapper: "progress-wrapper",
            progressStatus: "progress-status",
            uploadBtn: "upload-btn",
            loadingBtn: "loading-btn",
            cancelBtn: "cancel-btn",
            alertWrapper: "alert-wrapper",
            fileInputLabel: "file-input-label",
            fileInput: "file-input",
            dNone: "d-none",
            hide: 'hide',
            spinner: 'spinner'
        }

        this.requestURL = requestURL;
        this.formData = new FormData();
        this.request = new XMLHttpRequest();
    }

    public init() {
        console.log(this.requestURL)
        this.uploadHadBeenPressed()
        this.userFileSelectionHandler()
        this.requestLoad()
    }


    private uploadHadBeenPressed(): void {
        document.querySelector('#' + this.selectors.uploadBtn).addEventListener('click', event => {
            this.upload(event);
            this.displaySpinner();
        });
    }

    private displaySpinner() {
        const spinner = document.querySelector('.' + this.selectors.spinner);
        spinner.classList.remove(this.selectors.hide)
    }

    private hideSpinner() {
        const spinner = document.querySelector('.' + this.selectors.spinner);
        spinner.classList.add(this.selectors.hide)
    }

    private cancelUpload() {
        const cancelButton = document.querySelector('#' + this.selectors.cancelBtn)
        cancelButton.addEventListener("click", () => {
            this.requestAbort();
        })
    }

    private userFileSelectionHandler() {
        document.querySelector('#' + this.selectors.fileInput).addEventListener('input', event => {
            this.inputFileName(event);
        });
    }

    private upload(event) {
        const input = (<HTMLInputElement>document.querySelector('#' + this.selectors.fileInput));
        const alertWrapper = document.querySelector('#' + this.selectors.alertWrapper);
        const cancelButton = document.querySelector('#' + this.selectors.cancelBtn);
        const uploadButton = document.querySelector('#' + this.selectors.uploadBtn);
        const loadingButton = document.querySelector('#' + this.selectors.loadingBtn);
        const file = input.files[0];
        const filesize = file.size;
        this.formData.append("file", file);
        this.request.responseType = "json";
        alertWrapper.innerHTML = '';
        input.disabled = true;

        // Hide the upload button
        uploadButton.classList.add("d-none");

        // Show the loading button
        loadingButton.classList.remove("d-none");

        // Show the cancel button
        cancelButton.classList.remove("d-none");

        // set cookie 
        document.cookie = `filesize=${filesize}`;


        if (!input.value) {
            this.showAlert("No file selected", "warning")
        } else {
            console.log(input.value, 'value here')
        }

        this.requestLoad();
        this.requestError();

    
        //   // Open and send the request
        this.request.open("POST", this.requestURL);
        console.log()
        this.request.send(this.formData);
    
        this.cancelUpload();
    

    }

    private requestAbort() {
        this.request.addEventListener("abort", event => {
            this.reset();
            this.showAlert(`Upload cancelled`, "primary");
    
        });
    }

    private requestLoad() {
        this.request.addEventListener("load", event => {
            if (this.request.status == 200) {
                this.showAlert(`${this.request.response.message}`, "success");
                this.hideSpinner()
            }
            else {
                this.showAlert(`Error uploading file`, "danger");
            }
            this.reset();
        });
    }

    private requestProgress() {
        this.request.upload.addEventListener("progress", event => {
            const progress = document.querySelector('#' + this.selectors.progress);
            const progressStatus = document.querySelector('#' + this.selectors.progressStatus) as HTMLElement;
    
            // Get the loaded amount and total filesize (bytes)
            const loaded = event.loaded;
            const total = event.total
        
            // Calculate percent uploaded
            const percent_complete = (loaded / total) * 100;
        
            // Update the progress text and progress bar
            progress.setAttribute("style", `width: ${Math.floor(percent_complete)}%`);
            progressStatus.innerText = `${Math.floor(percent_complete)}% uploaded`;
        })
    }

    private requestError() {
        this.request.addEventListener("error", event => {
            this.reset();
            this.showAlert(`Error uploading file`, "warning");
        });
    }

    private showAlert(message, alert) {

        const alertWrapper = document.querySelector('#' + this.selectors.alertWrapper);

        alertWrapper.innerHTML = `
        <div id="alert" class="alert alert-${alert} alert-dismissible fade show" role="alert">
          <span>${message}</span>
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      `
    }
    
    private inputFileName(event) {
        const input = event.target.files[0] as HTMLInputElement
        // const input = (<HTMLInputElement>document.querySelector('#' + this.selectors.fileInput)).files[0];
        const fileInputLabel = <HTMLElement>document.querySelector('#' + this.selectors.fileInputLabel);
        fileInputLabel.innerText = input.name;
    }

    private reset() {
        const input = (<HTMLInputElement>document.querySelector('#' + this.selectors.fileInput));
        const cancelButton = document.querySelector('#' + this.selectors.cancelBtn);
        const uploadButton = document.querySelector('#' + this.selectors.uploadBtn);
        const loadingButton = document.querySelector('#' + this.selectors.loadingBtn);
        const progressWrapper = document.querySelector('#' + this.selectors.progressWrapper);
        const progress = document.querySelector('#' + this.selectors.progress);
        const fileInputLabel = (<HTMLElement>document.querySelector('#' + this.selectors.fileInputLabel));
        // Clear the input element
        input.value = null;

        cancelButton.classList.add(this.selectors.dNone);
        
        // Reset the input element
        input.disabled = false;

        uploadButton.classList.remove(this.selectors.dNone)

        loadingButton.classList.add(this.selectors.dNone)
        fileInputLabel.innerText = "Select file"
    
    }
}
