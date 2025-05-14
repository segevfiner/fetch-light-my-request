import { test, describe } from "vitest";
import http from "node:http";
import {
  createFetchLightMyRequest,
  createFetchLightMyRequestFromFastify,
  createFetchMockLightMyRequest,
  createFetchMockLightMyRequestFromFastify,
} from "../src/index.js";
import "@fetch-mock/vitest";
import Fastify from "fastify";

describe.concurrent("fetch-light-my-request", () => {
  test("hello world", async ({ expect }) => {
    const fetchMock = createFetchMockLightMyRequest((req, res) => {
      res.end("Hello, World!");
    });

    const res = await fetchMock.fetchHandler("http://localhost/hello");
    expect(res.status).toBe(200);
    expect(res.statusText).toBe("OK");
    await expect(res.text()).resolves.toBe("Hello, World!");
    expect(fetchMock).toHaveLastGot("http://localhost/hello");
  });

  test("headers", async ({ expect }) => {
    const fetchMock = createFetchMockLightMyRequest((req, res) => {
      res.setHeader("X-Test", "Test");
      res.end("Hello, World!");
    });

    const res = await fetchMock.fetchHandler("http://localhost/hello", {
      headers: { "X-Foo": "Bar" },
    });
    await expect(res.text()).resolves.toBe("Hello, World!");
    expect(res.headers.get("X-Test")).toBe("Test");
    expect(fetchMock).toHaveLastGot("http://localhost/hello", {
      headers: { "X-Foo": "Bar" },
    });
  });

  test("post", async ({ expect }) => {
    const fetchMock = createFetchMockLightMyRequest((req, res) => {
      res.end("Hello, World!");
    });

    const res = await fetchMock.fetchHandler("http://localhost/hello", {
      method: "POST",
    });
    await expect(res.text()).resolves.toBe("Hello, World!");
    expect(fetchMock).toHaveLastPosted("http://localhost/hello");
  });

  test("body", async ({ expect }) => {
    const fetchMock = createFetchMockLightMyRequest((req, res) => {
      req.pipe(res);
    });

    const res = await fetchMock.fetchHandler("http://localhost/hello", {
      method: "POST",
      body: "Test Body",
    });
    await expect(res.text()).resolves.toBe("Test Body");
    expect(fetchMock).toHaveLastPosted("http://localhost/hello");
  });

  test("remoteAddress", async ({ expect }) => {
    const fetchMock = createFetchMockLightMyRequest((req, res) => {
      res.end(req.socket.remoteAddress);
    });

    const res = await fetchMock.fetchHandler("http://localhost/foo");
    await expect(res.text()).resolves.toBe("127.0.0.1");
    expect(fetchMock).toHaveLastGot("http://localhost/foo");

    const fetchMock2 = createFetchMockLightMyRequest(
      (req, res) => {
        res.end(req.socket.remoteAddress);
      },
      { remoteAddress: "192.168.1.1" },
    );

    const res2 = await fetchMock2.fetchHandler("http://localhost/foo");
    await expect(res2.text()).resolves.toBe("192.168.1.1");
    expect(fetchMock).toHaveLastGot("http://localhost/foo");
  });

  test("server", async ({ expect }) => {
    const fetchMock = createFetchMockLightMyRequest(
      function (this: { foo: string }, req, res) {
        res.end(this.foo);
      },
      { server: { foo: "bar" } as unknown as http.Server },
    );

    const res = await fetchMock.fetchHandler("http://localhost/hello");
    await expect(res.text()).resolves.toBe("bar");
    expect(fetchMock).toHaveLastGot("http://localhost/hello");
  });

  test("signal", async ({ expect }) => {
    const fetchMock = createFetchMockLightMyRequest((req, res) => {
      res.end("Hello, World!");
    });

    const controller = new AbortController();
    controller.abort();
    await expect(
      fetchMock.fetchHandler("http://localhost/hello", {
        signal: controller.signal,
      }),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    ).rejects.toThrow(expect.objectContaining({ name: "AbortError" }));
    expect(fetchMock).toHaveLastGot("http://localhost/hello");
  });

  test("status", async ({ expect }) => {
    const fetchMock = createFetchMockLightMyRequest((req, res) => {
      res.writeHead(418, "I'm a teapot");
      res.end("I'm a teapot");
    });

    const res = await fetchMock.fetchHandler("http://localhost/hello");
    expect(res.status).toBe(418);
    expect(res.statusText).toBe("I'm a teapot");
    await expect(res.text()).resolves.toBe("I'm a teapot");
    expect(fetchMock).toHaveLastGot("http://localhost/hello");
  });

  test("createFetchLightMyRequest", async ({ expect }) => {
    const fetch = createFetchLightMyRequest((req, res) => {
      res.end("Hello, World!");
    });

    const res = await fetch("http://localhost/hello");
    await expect(res.text()).resolves.toBe("Hello, World!");
  });

  test("createFetchMockLightMyRequestFromFastify", async ({ expect }) => {
    const fastify = Fastify();
    fastify.get("/hello", () => {
      return "Hello, World!";
    });

    const fetchMock = createFetchMockLightMyRequestFromFastify(fastify);

    const res = await fetchMock.fetchHandler("http://localhost/hello");
    expect(res.status).toBe(200);
    expect(res.statusText).toBe("OK");
    await expect(res.text()).resolves.toBe("Hello, World!");
    expect(fetchMock).toHaveLastGot("http://localhost/hello");

    const res2 = await fetchMock.fetchHandler("http://localhost/foo");
    expect(res2.status).toBe(404);
    expect(res2.statusText).toBe("Not Found");
    await expect(res2.json()).resolves.toStrictEqual(
      expect.objectContaining({ statusCode: 404 }),
    );
    expect(fetchMock).toHaveLastGot("http://localhost/foo");
  });

  test("createFetchMLightMyRequestFromFastify", async ({ expect }) => {
    const fastify = Fastify();
    fastify.get("/hello", () => {
      return "Hello, World!";
    });

    const fetch = createFetchLightMyRequestFromFastify(fastify);

    const res = await fetch("http://localhost/hello");
    expect(res.status).toBe(200);
    expect(res.statusText).toBe("OK");
    await expect(res.text()).resolves.toBe("Hello, World!");
  });
});
