import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CategoryList from './pages/CategoryList';
import CategoryForm from './pages/CategoryForm';
import ProductList from './pages/ProductList';
import ProductForm from './pages/ProductForm';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/categories" element={<CategoryList />} />
            <Route path="/categories/new" element={<CategoryForm />} />
            <Route path="/categories/edit/:id" element={<CategoryForm />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/edit/:id" element={<ProductForm />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;