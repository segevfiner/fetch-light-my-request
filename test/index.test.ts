import { test, expect } from "vitest";
import { createFetchLightMyRequest } from "../src/index.js";

test("basic", async () => {
  const fetchMock = createFetchLightMyRequest((req, res) => {
    res.end("Hello, World!");
  });

  const res = await fetchMock("http://localhost/hello");
  await expect(res.text()).resolves.toBe("Hello, World!");
});
