import http from "node:http";
import { DispatchFunc, inject } from "light-my-request"
import { defaultFetchMockConfig, FetchMock } from "fetch-mock";

export interface FetchLightMyRequestOptions {
    /** Optional http server. It is used for binding the `dispatchFunc` */
    server?: http.Server;

    /** an optional string specifying the client remote address. Defaults to '127.0.0.1' */
    remoteAddress?: string;
}

export function createFetchLightMyRequest(dispatchFunc: DispatchFunc, opts: FetchLightMyRequestOptions = {}) {
    const fetchMock = new FetchMock({ ...defaultFetchMockConfig });
    fetchMock.route("*", async (callLog) => {
        const res = await inject(dispatchFunc, {
            url: callLog.url,
            // XXX HTTPMethods is not exported from light-my-request
            method: callLog.options.method as "GET" | undefined,
            headers: callLog.options.headers as http.OutgoingHttpHeaders,
            payload: callLog.options.body ?? undefined,
            remoteAddress: opts.remoteAddress,
            server: opts.server,
            signal: callLog.options.signal ?? undefined,
        });
        return new Response(res.body, {
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers as Record<string, string>,
        })
    });
    return fetchMock.fetchHandler.bind(fetchMock);
}
