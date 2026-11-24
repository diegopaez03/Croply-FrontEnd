import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
{/* import { ReactQueryDevtools } from '@tanstack/react-query-devtools'*/}
import App from './App'
import './index.css'

// ── TanStack Query client ──────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error) => {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          return false;
        }
        if (
          axios.isAxiosError(error) &&
          (error.code === 'ECONNABORTED' ||
            error.code === 'ETIMEDOUT' ||
            error.message?.toLowerCase().includes('timeout'))
        ) {
          return false;
        }
        return failureCount < 1;
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {/* Devtools only visible in development */}
      {/*<ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  </React.StrictMode>,
)
