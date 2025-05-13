import { test, describe } from "vitest";
import { createFetchMockLightMyRequest } from "../src/index.js";
import "@fetch-mock/vitest";

describe.concurrent("fetch-light-my-request", () => {
  test("hello world", async ({ expect }) => {
    const fetchMock = createFetchMockLightMyRequest((req, res) => {
      res.end("Hello, World!");
    });

    const res = await fetchMock.fetchHandler("http://localhost/hello");
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
    console.log(res.headers);
    expect(res.headers.get("X-Test")).toBe("Test");
    expect(fetchMock).toHaveLastGot("http://localhost/hello", {
      headers: { "X-Foo": "Bar" },
    });
  });
});
