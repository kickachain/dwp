class ApiRequestHandler {
    endpoint: string;
    method: string | undefined;
    data: JSON | string | undefined;

    constructor(endpoint: string, method?: string, data?: JSON | string) {
        this.endpoint = endpoint;
        this.method = method;
        this.data = data;
    }

    public async apiService(): Promise<Response> {

        console.log(this.endpoint, this.method, this.data, "it's been activated");

        const headers = {
            "content-type": "application/json",
        };

        const config: RequestInit = {
            method: this.method || "GET",
            body: this.data !== undefined ? JSON.stringify(this.data) : null,
            headers: headers
        };

        return (
            fetch(this.endpoint, config)
                .then(response => response.json())
                .catch(err => {
                    throw err;
                })
        );
    }

    public async progress() {
        const response = await this.apiService()
        const reader = response.body.getReader();

        // get total length
        const contentLength = +response.headers.get('Content-Length');

        // read the data
        let receivedLength = 0; // received that many bytes at the moment
        let chunks = Array() // array of received binary chunks (comprises the body)
        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                break;
            }

            chunks.push(value);
            receivedLength += value.length;

            console.log(`Received ${receivedLength} of ${contentLength}`)
        }

        // concatenate chunks into single Uint8Array
        const chunksAll = new Uint8Array(receivedLength); // (4.1)
        let position = 0;
        for (let chunk of chunks) {
            chunksAll.set(chunk, position); // (4.2)
            position += chunk.length;
        }

        // decode into a string
        const result = new TextDecoder("utf-8").decode(chunksAll);

        const commits = JSON.parse(result);
        return commits[0].author.login
    }
}
