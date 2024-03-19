/* @refresh reload */
import { lazy } from 'solid-js'
import { render } from 'solid-js/web'

import { Provider } from './context'

import './index.css'
import { Router } from '@solidjs/router'

const root = document.getElementById('root')

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  )
}

const App = lazy(() => import("./App"))

render(() => (
  <Provider>
    <Router>
      <App />
    </Router>
  </Provider>
), root!)
