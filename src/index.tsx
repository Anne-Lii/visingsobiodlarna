import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import { UserProvider } from './context/UserContext';
import { ToastProvider } from './components/ToastContext';
import { NewsProvider } from './context/NewsContext';



const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <ToastProvider>
      <UserProvider>
        <NewsProvider>
          <App />
        </NewsProvider>        
      </UserProvider>
    </ToastProvider>

  </React.StrictMode>
);



