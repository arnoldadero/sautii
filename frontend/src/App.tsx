import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Issues } from './pages/Issues';
import { NewIssue } from './pages/NewIssue';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/issues" element={<Issues />} />
            <Route path="/issues/new" element={<NewIssue />} />
          </Routes>
        </Layout>
      </Router>
    </Provider>
  );
}

export default App;
