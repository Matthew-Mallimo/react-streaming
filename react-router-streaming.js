import React, { use, Suspense } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { Await, defer, useLoaderData } from 'react-router-dom';
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from "react-router-dom/server";
import express from 'express';
import createFetchRequest from './createFetchRequest';
const app = express()
const port = 3000



const Comp = () => {
  use(new Promise((resolve) => {
    setTimeout(() => resolve(), 3000)
  }))
  return (
    <div>
      <h1>Loaded!</h1>
    </div>
  )
}
const Header = () => {
  use(new Promise((resolve) => {
    setTimeout(() => resolve(), 500)
  }))
  return (
    <div>
      <h1>Header</h1>
    </div>
  )
}


const App = () => {
  let { data } = useLoaderData();
  
  return (
    <div>
      <h1>Hello!!</h1>
      <Suspense fallback={<p>Loading data...</p>}>
        <Await resolve={data}>
          {(data) => (
            <code>{JSON.stringify(data)}</code>
          )}
        </Await>
        </Suspense>
    </div>
  )
}

const routes = [
  {
    path: "/",
    loader: async () => {
      const x = new Promise((res) => {
        setTimeout(() => res({ hello: 'world', goodbye: 'world' }), 1000)
      })

      return defer({
        data: x,
      })
    },
    Component: App,
  },
];

let handler = createStaticHandler(routes);


app.get('/', async (request, response) => {
  let fetchRequest = createFetchRequest(request);
  let context = await handler.query(fetchRequest);
  let router = createStaticRouter(
    handler.dataRoutes,
    context
  );
  const { pipe } = renderToPipeableStream(
    <StaticRouterProvider
    router={router}
    context={context}
  />, {
    onShellReady() {
      response.setHeader('content-type', 'text/html');
      pipe(response);
    }
  });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})