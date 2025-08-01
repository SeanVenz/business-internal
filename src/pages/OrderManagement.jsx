import { useState, useEffect } from 'react';
import { orderService, productService } from '../services/firebaseService';
import OrderForm from '../components/OrderForm';
import OrderList from '../components/OrderList';
import LoadingSpinner from '../components/LoadingSpinner';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingOrder, setEditingOrder] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, productsData] = await Promise.all([
        orderService.getOrders(),
        productService.getProducts()
      ]);
      setOrders(ordersData);
      setProducts(productsData);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrder = async (orderData) => {
    try {
      const newOrder = await orderService.addOrder(orderData);
      setOrders(prev => [newOrder, ...prev]);
      setShowForm(false);
      setError('');
    } catch (err) {
      setError('Failed to add order');
      console.error(err);
    }
  };

  const handleUpdateOrder = async (orderData) => {
    try {
      const updatedOrder = await orderService.updateOrder(editingOrder.id, orderData);
      setOrders(prev => 
        prev.map(order => 
          order.id === editingOrder.id ? updatedOrder : order
        )
      );
      setEditingOrder(null);
      setError('');
    } catch (err) {
      setError('Failed to update order');
      console.error(err);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await orderService.deleteOrder(orderId);
        setOrders(prev => prev.filter(order => order.id !== orderId));
        setError('');
      } catch (err) {
        setError('Failed to delete order');
        console.error(err);
      }
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        const updatedOrder = await orderService.updateOrder(orderId, {
          ...order,
          status: newStatus
        });
        setOrders(prev => 
          prev.map(o => o.id === orderId ? updatedOrder : o)
        );
      }
    } catch (err) {
      setError('Failed to update order status');
      console.error(err);
    }
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingOrder(null);
    setShowForm(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        <button
          onClick={() => setShowForm(true)}
          disabled={showForm}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          Add New Order
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Order Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingOrder ? 'Edit Order' : 'Add New Order'}
          </h2>
          <OrderForm
            order={editingOrder}
            products={products}
            onSubmit={editingOrder ? handleUpdateOrder : handleAddOrder}
            onCancel={handleCancelEdit}
          />
        </div>
      )}

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Orders ({orders.length})</h2>
        </div>
        <OrderList
          orders={orders}
          products={products}
          onEdit={handleEdit}
          onDelete={handleDeleteOrder}
          onStatusUpdate={handleStatusUpdate}
        />
      </div>
    </div>
  );
};

export default OrderManagement;
