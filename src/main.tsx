import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { App } from '~/App';
import './globals.css';

const brandColors = {
  50: '#fff3e0',
  100: '#ffddb3',
  200: '#ffc680',
  300: '#ffaf4d',
  400: '#ff9933',
  500: '#ff9a26',
  600: '#e68a23',
  700: '#cc7a20',
  800: '#b36a1d',
  900: '#995a1a',
};

const theme = extendTheme({
  colors: {
    brand: brandColors,
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ChakraProvider theme={theme}>
    <App />
  </ChakraProvider>,
);
