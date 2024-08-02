import { createRoot } from 'react-dom/client'
import Home from './page.jsx'
import {AppContextProvider} from "./appcontext.jsx";


createRoot(document.getElementById('root')).render(
  <AppContextProvider>
    <Home />
  </AppContextProvider>
)
