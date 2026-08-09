import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

/**
 * App — Root router component.
 *
 * Routes will be added here as pages are developed.
 * Each page should be lazy-loaded with React.lazy() for code splitting.
 *
 * Example:
 *   const Dashboard = React.lazy(() => import('@pages/Dashboard/Dashboard'))
 *
 *   <Route path="/dashboard" element={
 *     <React.Suspense fallback={<LoadingSpinner />}>
 *       <Dashboard />
 *     </React.Suspense>
 *   } />
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes ─────────────────────────────────── */}
        {/* <Route path="/login" element={<LoginPage />} /> */}
        {/* <Route path="/register" element={<RegisterPage />} /> */}

        {/* ── Protected routes ──────────────────────────────── */}
        {/* <Route element={<PrivateLayout />}> */}
        {/*   <Route path="/dashboard" element={<DashboardPage />} /> */}
        {/*   <Route path="/farms" element={<FarmsPage />} /> */}
        {/*   <Route path="/crops" element={<CropsPage />} /> */}
        {/*   <Route path="/plots" element={<PlotsPage />} /> */}
        {/*   <Route path="/reports" element={<ReportsPage />} /> */}
        {/* </Route> */}

        {/* ── Fallback ──────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
