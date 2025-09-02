import { useEffect } from 'react'

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light')
  }, [])

  return children
}