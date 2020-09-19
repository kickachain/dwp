class XhrApiRequest {
    xhttp: XMLHttpRequest;
    endpoint: string;
    method: string | undefined;
    data: string | undefined;
    headers: string;

    constructor(endpoint: string, method?: string, data?: string, headers? :string) {
        this.xhttp = new XMLHttpRequest();
        this.endpoint = endpoint;
        this.method = method;
        this.data = data;
        this.headers = headers;
    }

    // made sure to do it to return a promise instead of traditional implemention
    // this is so we can handle the promise response with thens
    public async sendRequest() {
        console.log(this.data);
        return new Promise((resolve, reject) => {
            this.xhttp.open(this.method, this.endpoint);
            this.xhttp.setRequestHeader("content-type", this.headers);
            this.xhttp.onload = () => {

                if (this.xhttp.status >= 200 && this.xhttp.status < 300) {
                    resolve(this.xhttp.response);
                } else {
                    reject({
                        status: this.xhttp.status,
                        statusText: this.xhttp.statusText
                    });
                }
            };
            this.xhttp.onerror = () => {
                reject({
                    status: this.xhttp.status,
                    statusText: this.xhttp.statusText
                });
            };
            this.xhttp.send(JSON.stringify(this.data));
        
        })
    }
}