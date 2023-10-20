import React, { use, Suspense } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
const express = require('express')
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

const App = () => (
  <div>
    <Suspense fallback={<h1>Loading Header</h1>}>
      <Header />
    </Suspense>
    <h1>Hello!!</h1>
    <Suspense fallback={<p>Loading...</p>}>
      <Comp />
    </Suspense>
  </div>
)

app.get('/', (request, response) => {
  const { pipe } = renderToPipeableStream(<App />, {
    onShellReady() {
      response.setHeader('content-type', 'text/html');
      pipe(response);
    }
  });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})