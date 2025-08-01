import { useState, useEffect } from 'react';
import { productService } from '../services/firebaseService';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';
import LoadingSpinner from '../components/LoadingSpinner';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await productService.getProducts();
      setProducts(productsData);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (productData, imageFile) => {
    try {
      const newProduct = await productService.addProduct(productData, imageFile);
      setProducts(prev => [newProduct, ...prev]);
      setShowForm(false);
      setError('');
    } catch (err) {
      setError('Failed to add product');
      console.error(err);
    }
  };

  const handleUpdateProduct = async (productData, imageFile) => {
    try {
      const updatedProduct = await productService.updateProduct(
        editingProduct.id, 
        productData, 
        imageFile
      );
      setProducts(prev => 
        prev.map(product => 
          product.id === editingProduct.id ? updatedProduct : product
        )
      );
      setEditingProduct(null);
      setError('');
    } catch (err) {
      setError('Failed to update product');
      console.error(err);
    }
  };

  const handleDeleteProduct = async (productId, imageUrl) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(productId, imageUrl);
        setProducts(prev => prev.filter(product => product.id !== productId));
        setError('');
      } catch (err) {
        setError('Failed to delete product');
        console.error(err);
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setShowForm(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Product Management</h1>
        <button
          onClick={() => setShowForm(true)}
          disabled={showForm}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          <span className="sm:hidden">Add Product</span>
          <span className="hidden sm:inline">Add New Product</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Product Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <ProductForm
            product={editingProduct}
            onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
            onCancel={handleCancelEdit}
          />
        </div>
      )}

      {/* Products List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold">Products ({products.length})</h2>
        </div>
        <ProductList
          products={products}
          onEdit={handleEdit}
          onDelete={handleDeleteProduct}
        />
      </div>
    </div>
  );
};

export default ProductManagement;
