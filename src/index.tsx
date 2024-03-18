/* @refresh reload */
import { lazy } from 'solid-js'
import { createStore } from 'solid-js/store'
import { render } from 'solid-js/web'
import { Router, Routes, Route } from "@solidjs/router"

import { Provider } from './context'

import './index.css'

const root = document.getElementById('root')

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  )
}

const App = lazy(() => import("./App"))
const Group = lazy(() => import("./pages/Group"))

const [state, setState] = createStore({ identity: undefined, groups: {} })

render(() => (
  <Provider>
    <Router>
      <Routes>
        <Route path={import.meta.env.BASE_URL}>
          <Route path="/" component={App} />
          <Route path="/groups/:id" component={Group} />
        </Route>
      </Routes>
    </Router>
  </Provider>
), root!)
