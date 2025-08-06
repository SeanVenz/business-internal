import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProductManagement from './pages/ProductManagement';
import OrderManagement from './pages/OrderManagement';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Layout>
          <Routes>
            <Route path="/" element={<ProductManagement />} />
            <Route path="/orders" element={<OrderManagement />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
