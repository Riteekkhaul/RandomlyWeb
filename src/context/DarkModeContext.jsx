import React, { createContext, useContext, useState, useCallback } from 'react';

const DarkModeContext = createContext(null);

export const useDarkMode = () => useContext(DarkModeContext);

export const DarkModeProvider = (props) => {
    const [darkMode, setDarkMode] = useState(false);
  
    const toggleDarkMode = useCallback(() => {
      setDarkMode(prevMode => !prevMode);
    }, []); // Memoize the toggleDarkMode function

    return (
        <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
          {props.children}
        </DarkModeContext.Provider>
      );
    };