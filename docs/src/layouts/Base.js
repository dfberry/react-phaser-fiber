import React from 'react'
import './Layout.css'
import theme from '../theme'
import { ThemeProvider, CSSReset } from '@chakra-ui/core'

// todo: move to gatsby-browser
const Layout = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CSSReset />
      {children}
    </ThemeProvider>
  )
}

export default Layout
