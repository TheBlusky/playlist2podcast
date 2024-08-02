import {createContext, useState} from "react";

const AppContext = createContext(null);

function AppContextProvider({children}) {
  const [context, setContext] = useState({podcasts: []});
  return (
    <>
      <AppContext.Provider value={{context, setContext}}>
        { children }
      </AppContext.Provider>
    </>
  )
}

export {AppContext, AppContextProvider}
