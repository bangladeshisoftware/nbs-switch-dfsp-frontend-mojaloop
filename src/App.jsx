import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Transfers from './pages/Transfers/Transfers';
import Merchants from './pages/Merchants/Merchants';
import Liquidity from './pages/Liquidity/Liquidity';
import Users from './pages/Users/Users';
import Profile from './pages/Profile/Profile';
import ActivityLogs from './pages/ActivityLogs/ActivityLogs';

function Protected({ children }) {
  const token = localStorage.getItem('dfsp_token');
  return token ? children : <Navigate to='/login' replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route
          path='/*'
          element={
            <Protected>
              <Layout>
                <Routes>
                  <Route path='/' element={<Dashboard />} />
                  <Route path='/transfers' element={<Transfers />} />
                  <Route path='/merchants' element={<Merchants />} />
                  <Route path='/liquidity' element={<Liquidity />} />
                  <Route path='/users' element={<Users />} />
                  <Route
                    path='/activity-logs'
                    element={ <ActivityLogs />}
                  />
                  <Route path='/profile' element={<Profile />} />
                  <Route path='*' element={<Navigate to='/' />} />
                </Routes>
              </Layout>
            </Protected>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
