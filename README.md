# fetch-light-my-request
[![CI](https://github.com/segevfiner/fetch-light-my-request/actions/workflows/ci.yml/badge.svg)](https://github.com/segevfiner/fetch-light-my-request/actions/workflows/ci.yml)
[![Docs](https://github.com/segevfiner/fetch-light-my-request/actions/workflows/docs.yml/badge.svg)](https://segevfiner.github.io/fetch-light-my-request/)

[fetch-mock] wrapper over [light-my-request]. This is useful to attach `fetch` based HTTP clients to
a tested plain HTTP or Fastify server.

[Documentation](https://segevfiner.github.io/fetch-light-my-request/)

[fetch-mock]: https://www.wheresrhys.co.uk/fetch-mock/
[light-my-request]: https://www.npmjs.com/package/light-my-request

## Getting Started
```ts
const fetchMock = createFetchMockLightMyRequest((req, res) => {
  res.end("Hello, World!");
});

const res = await fetchMock.fetchHandler("http://localhost/hello");
console.log(res.text());
```

Or with [Fastify]:
```ts
import Fastify from "fastify";

const fastify = Fastify();
fastify.get("/hello", () => {
  return "Hello, World!";
});

const fetchMock = createFetchMockLightMyRequestFromFastify(fastify);
const res = await fetchMock.fetchHandler("http://localhost/hello");
console.log(res.text());
```

You can also use `createFetchLightMyRequest` or `createFetchLightMyRequestFromFastify` to directly
return the resulting mock `fetch` function instead of the `FetchMock` instance.

[Fastify]: https://fastify.dev/

## License
MIT.
