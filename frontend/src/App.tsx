import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppRouter } from './core/routes/AppRouter';

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            borderRadius: '10px',
            background: '#1E293B',
            color: '#fff',
          },
        }}
      />
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;