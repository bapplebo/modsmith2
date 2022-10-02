import React from 'react';
import ReactDOM from 'react-dom/client';
import { RecoilRoot } from 'recoil';
import App from './App';
import './style.css';
//import { initialize } from './utils/cache';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { bootstrap } from './utils/bootstrap';
import { appWindow } from '@tauri-apps/api/window';

import 'flowbite';

const queryClient = new QueryClient();
bootstrap();

// document.getElementById('titlebar-minimize').addEventListener('click', () => appWindow.minimize());
// document.getElementById('titlebar-maximize').addEventListener('click', () => appWindow.toggleMaximize());
// document.getElementById('titlebar-close').addEventListener('click', () => appWindow.close());

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RecoilRoot>
        <App />
      </RecoilRoot>
    </QueryClientProvider>
  </React.StrictMode>
);
