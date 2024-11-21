import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Issues } from './pages/Issues';
import { NewIssue } from './pages/NewIssue';
import { IssueDetail } from './pages/IssueDetail';
import { GovernmentPortal } from './pages/GovernmentPortal';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/issues" 
                element={
                  <ProtectedRoute>
                    <Issues />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/issues/new" 
                element={
                  <ProtectedRoute>
                    <NewIssue />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/issues/:id" 
                element={
                  <ProtectedRoute>
                    <IssueDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/government" 
                element={
                  <ProtectedRoute>
                    <GovernmentPortal />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </Provider>
  );
}

export default App;
