/// this portion is for the typescript compiler to understand the global scope is a service worker
/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;
import {on as onEvent} from 'events'; // for some reason TS complains if we don't import this

const fetchEventsQueue = {};

function generateUniqueId() {
    const randomPart = Math.random().toString(36).substring(2, 10);
    return `${randomPart}-${Date.now()}`;
}

self.addEventListener('install', function (event) {
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
    const { type } = event.data;
    switch (type) {
        case 'worker-fetch-response':
            const { eventId, response } = event.data;
            const { resolve } = fetchEventsQueue[eventId];
            delete fetchEventsQueue[eventId];
            resolve(new Response(response.body, response));
            break;
    }
});

self.addEventListener('fetch', async function (event) {
    const url = new URL(event.request.url);
    const { pathname } = url;
    if (
        pathname.startsWith('/rest') ||
        pathname.startsWith('/schema') ||
        pathname.startsWith('/permissions') ||
        pathname.startsWith('/functions')
    ) {
        const requestData = {
            url: event.request.url,
            method: event.request.method,
            headers: Array.from(event.request.headers.entries()),
            body: ''
        };

        if (event.request.method !== 'GET' && event.request.method !== 'HEAD') {
            requestData.body = await event.request.text();
        }

        event.respondWith(new Promise(async (resolve) => {
            const client = await self.clients.get(event.clientId);
            const eventId = generateUniqueId();
            fetchEventsQueue[eventId] = {event,resolve};
            client?.postMessage({ type: 'worker-fetch', eventId, requestData });
        }));
    }
});

