import * as Sentry from '@sentry/react';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useSubdomain } from './contexts/SubdomainContext';
import { RootRouter } from './routers/RootRouter';
import { AdminRouter } from './routers/AdminRouter';
import { DistrictRouter } from './routers/DistrictRouter';

/**
 * AppRouter - Renders the appropriate router based on subdomain
 *
 * - stratadash.org → RootRouter (marketing pages)
 * - admin.stratadash.org → AdminRouter (system admin)
 * - westside.stratadash.org → DistrictRouter (district public/admin)
 */
function AppRouter() {
  const { type } = useSubdomain();

  switch (type) {
    case 'admin':
      return <AdminRouter />;
    case 'district':
      return <DistrictRouter />;
    case 'root':
    default:
      return <RootRouter />;
  }
}

function App() {
  return (
    <ErrorBoundary onError={(err) => Sentry.captureException(err)}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
