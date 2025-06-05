import http from "node:http";
import { DispatchFunc, inject } from "light-my-request";
import { defaultFetchMockConfig, FetchMock } from "fetch-mock";
import type { FastifyInstance } from "fastify";

/**
 * Options for the created fetch mock.
 */
export interface FetchLightMyRequestOptions {
  /** Optional http server. It is used for binding the `dispatchFunc` */
  server?: http.Server;

  /** an optional string specifying the client remote address. Defaults to '127.0.0.1' */
  remoteAddress?: string;
}

// XXX HTTPMethods is not exported from light-my-request
type HTTPMethods =
  | "DELETE"
  | "delete"
  | "GET"
  | "get"
  | "HEAD"
  | "head"
  | "PATCH"
  | "patch"
  | "POST"
  | "post"
  | "PUT"
  | "put"
  | "OPTIONS"
  | "options";

/**
 * Create a [FetchMock] from a light-my-request dispatch function.
 *
 * [FetchMock]: https://www.wheresrhys.co.uk/fetch-mock/docs
 */
export function createFetchMockLightMyRequest(
  dispatchFunc: DispatchFunc,
  opts: FetchLightMyRequestOptions = {},
): FetchMock {
  const fetchMock = new FetchMock({ ...defaultFetchMockConfig });
  fetchMock.route("*", async (callLog) => {
    const res = await inject(dispatchFunc, {
      url: callLog.url,
      method: callLog.options.method as HTTPMethods,
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
    });
  });
  return fetchMock;
}

/**
 * Create a mock fetch function (Directly returning the `FetchMock.fetchHandler`) from a
 * light-my-request dispatch function.
 */
export function createFetchLightMyRequest(
  dispatchFunc: DispatchFunc,
  opts: FetchLightMyRequestOptions = {},
): typeof fetch {
  const fetchMock = createFetchMockLightMyRequest(dispatchFunc, opts);
  return fetchMock.fetchHandler.bind(fetchMock);
}

/**
 * Create a [FetchMock] from a Fastify server.
 *
 * [FetchMock]: https://www.wheresrhys.co.uk/fetch-mock/docs
 */
export function createFetchMockLightMyRequestFromFastify(
  instance: FastifyInstance,
  opts: FetchLightMyRequestOptions = {},
): FetchMock {
  return createFetchMockLightMyRequest((req, res) => {
    instance.ready((err) => {
      if (err) {
        res.emit("error", err);
        return;
      }
      instance.routing(req, res);
    });
  }, opts);
}

/**
 * Create a mock fetch function (Directly returning the `FetchMock.fetchHandler`) from Fastify
 * server.
 */
export function createFetchLightMyRequestFromFastify(
  instance: FastifyInstance,
  opts: FetchLightMyRequestOptions = {},
): typeof fetch {
  const fetchMock = createFetchMockLightMyRequestFromFastify(instance, opts);
  return fetchMock.fetchHandler.bind(fetchMock);
}
