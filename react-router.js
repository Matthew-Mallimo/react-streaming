import React, { use, Suspense } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { json, useLoaderData } from 'react-router-dom';
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
  let data = useLoaderData();
  
  return (
    <div>
      <h1>Hello!!</h1>
      <code>{JSON.stringify(data)}</code>
    </div>
  )
}

const routes = [
  {
    path: "/",
    loader: async () => {
      const x = {
        hello: 'world',
        goodbye: 'world'
      }
      return json(x)
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