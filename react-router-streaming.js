import React, { use, Suspense } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { Await, defer, useLoaderData, Outlet } from 'react-router-dom';
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
          {(d) => (
            <code>{JSON.stringify(d)}</code>
          )}
        </Await>
        </Suspense>
        <Outlet />
    </div>
  )
}

const Child = () => {
  const {data} = useLoaderData();
  return (
    <div>
      <h2>Child</h2>
      <Suspense fallback={<p>Loading data...</p>}>
        <Await resolve={data}>
          {(d) => (
          <div>
            <h1>Child</h1>
            <code>{JSON.stringify(d)}</code>
          </div>
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
      console.log('parent')
      const x = new Promise((res) => {
        setTimeout(() => res({ hello: 'world', goodbye: 'world' }), 1000)
      })

      return defer({
        data: x,
      })
    },
    Component: App,
    children: [
      {
        element: <Child />,
        path: "hello",
        loader: async () => {
          console.log('child')
          const x = new Promise((res) => {
            setTimeout(() => res({ stuff: 'world', cool: 'world' }), 500)
          })
    
          return defer({
            data: x,
          })
        },
      },
    ]
  },
];

let handler = createStaticHandler(routes);


app.get('*', async (request, response) => {
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