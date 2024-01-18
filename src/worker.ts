import { init, router, onSubzeroError } from './server';

// this is a simple implementation of the ServerResponse interface from Node.js
// subzero rest module uses this to send the response back to the client
// in this case, we are using it to collect the response and send it back as a Response object
class SimpleServerResponse {
    private headers: {[key: string]: string};
    private statusCode: number;
    private body: string | null;

    constructor() {
        this.headers = {};
        this.statusCode = 200;
        this.body = null;
    }

    // Sets a single header value and returns the instance for chaining.
    setHeader(name: string, value: string): SimpleServerResponse {
        this.headers[name] = value;
        return this;
    }

    // Sets the HTTP status code and headers, and returns the instance for chaining.
    writeHead(statusCode: number, headers = {}): SimpleServerResponse {
        this.statusCode = statusCode;
        this.headers = { ...this.headers, ...headers };
        return this;
    }

    // Sets the response body and returns the instance for chaining.
    end(body: string): SimpleServerResponse {
        this.body = body;
        return this;
    }
    // Optional: A method to get the current state.
    getState(): { statusCode: number, headers: {[key: string]: string}, body: string | null } {
        return {
            statusCode: this.statusCode,
            headers: this.headers,
            body: this.body
        };
    }
}

async function handleRequest(request: Request) {
    const response = new SimpleServerResponse();
    try {
        await router.handle(request, response, function (e) { throw e; });
        const { statusCode, headers, body } = response.getState();
        return { status: statusCode, headers, body };
    } catch (e) {
        // @ts-ignore
        onSubzeroError(e, request, response, function () { 
            response.writeHead(500, { 'content-type': 'application/json' }).end(JSON.stringify({ message: 'Internal Server Error' }));
        });
        const { statusCode, headers, body } = response.getState();
        return { status: statusCode, headers, body };
    }
}

onmessage = async function (event) {
    const { type } = event.data;
    switch (type) {
        case 'worker-fetch':
            const { eventId, requestData } = event.data;
            if (!initialized) {
                postMessage({
                    type: 'worker-fetch-response',
                    eventId,
                    response: {
                        status: 500,
                        headers: { 'content-type': 'application/json' },
                        body: JSON.stringify({ error: 'Service Worker not initialized yet, waiting...' })
                    }
                });
                return;
            }
            const response = await handleRequest(
                new Request(requestData.url, {
                    method: requestData.method,
                    headers: new Headers(requestData.headers),
                    body: requestData.method === 'GET' ? undefined : requestData.body
                })
            );
            postMessage({ type: 'worker-fetch-response', eventId, response });
            break;
    }
};

// self invokes this function when the worker is initialized
let initialized = false;
(async () => {
    await init();
    initialized = true;
    // Indicate that the worker is ready
    postMessage({ type: 'worker-ready'});
}
)();
