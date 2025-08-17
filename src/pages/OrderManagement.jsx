import { useState, useEffect } from 'react';
import { orderService, productService } from '../services/firebaseService';
import OrderForm from '../components/OrderForm';
import OrderList from '../components/OrderList';
import LoadingSpinner from '../components/LoadingSpinner';
import OrderDetailsModal from '../components/OrderDetailsModal';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingOrder, setEditingOrder] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [deliveryDateFilter, setDeliveryDateFilter] = useState('');
  const [showUpcomingDeliveries, setShowUpcomingDeliveries] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const orderStatuses = ['All', 'Pending', 'In Progress', 'Completed', 'Cancelled'];

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

  const handlePaymentToggle = async (orderId, isPaid) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        const updatedOrder = await orderService.updateOrder(orderId, {
          ...order,
          isPaid: isPaid
        });
        setOrders(prev => 
          prev.map(o => o.id === orderId ? updatedOrder : o)
        );
      }
    } catch (err) {
      setError('Failed to update payment status');
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

  // Filter orders based on status and delivery date
  const getFilteredOrders = () => {
    let filtered = statusFilter === 'All' 
      ? orders.filter(order => order.status !== 'Completed')
      : orders.filter(order => order.status === statusFilter);

    // Apply delivery date filter if specified
    if (deliveryDateFilter) {
      filtered = filtered.filter(order => order.deliveryDate === deliveryDateFilter);
    }

    return filtered;
  };

  const filteredOrders = getFilteredOrders();

  // Get upcoming deliveries (next 7 days, non-completed orders)
  const getUpcomingDeliveries = () => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return orders.filter(order => {
      if (!order.deliveryDate || order.status === 'Completed' || order.status === 'Cancelled') {
        return false;
      }
      
      const deliveryDate = new Date(order.deliveryDate);
      return deliveryDate >= today && deliveryDate <= nextWeek;
    }).sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));
  };

  const upcomingDeliveries = getUpcomingDeliveries();

  // Calculate grand total for filtered orders
  const grandTotal = filteredOrders.reduce((total, order) => {
    return total + (order.totalAmount || 0);
  }, 0);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  // Calculate summary statistics
  const orderSummary = {
    All: { count: orders.length, total: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) },
    Pending: { 
      count: orders.filter(o => o.status === 'Pending').length,
      total: orders.filter(o => o.status === 'Pending').reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    },
    'In Progress': { 
      count: orders.filter(o => o.status === 'In Progress').length,
      total: orders.filter(o => o.status === 'In Progress').reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    },
    Completed: { 
      count: orders.filter(o => o.status === 'Completed').length,
      total: orders.filter(o => o.status === 'Completed').reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    },
    Cancelled: { 
      count: orders.filter(o => o.status === 'Cancelled').length,
      total: orders.filter(o => o.status === 'Cancelled').reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Order Management</h1>
        <button
          onClick={() => setShowForm(true)}
          disabled={showForm}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          <span className="sm:hidden">Add Order</span>
          <span className="hidden sm:inline">Add New Order</span>
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
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
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

      {/* Summary Dashboard */}
      {orders.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {orderStatuses.map(status => (
              <div 
                key={status} 
                className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  statusFilter === status 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setStatusFilter(status)}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {orderSummary[status]?.count || 0}
                  </div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    {status === 'All' ? 'Total Orders' : status}
                  </div>
                  <div className="text-sm font-semibold text-indigo-600">
                    {formatPrice(orderSummary[status]?.total || 0)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Deliveries Section */}
      {showUpcomingDeliveries && upcomingDeliveries.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              📅 Upcoming Deliveries (Next 7 Days)
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {upcomingDeliveries.length}
              </span>
            </h3>
            <button
              onClick={() => setShowUpcomingDeliveries(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3">
            {upcomingDeliveries.map(order => {
              const deliveryDate = new Date(order.deliveryDate);
              const today = new Date();
              const isToday = deliveryDate.toDateString() === today.toDateString();
              const isTomorrow = deliveryDate.toDateString() === new Date(today.getTime() + 86400000).toDateString();
              
              let dateLabel = deliveryDate.toLocaleDateString();
              if (isToday) dateLabel = 'Today';
              else if (isTomorrow) dateLabel = 'Tomorrow';

              return (
                <div
                  key={order.id}
                  className={`p-4 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-shadow ${
                    isToday 
                      ? 'border-red-500 bg-red-50 hover:bg-red-100' 
                      : isTomorrow 
                        ? 'border-orange-500 bg-orange-50 hover:bg-orange-100'
                        : 'border-blue-500 bg-blue-50 hover:bg-blue-100'
                  }`}
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowModal(true);
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{order.customerName}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'Pending' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                        {!order.isPaid && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            Unpaid
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center space-x-4">
                          <span className="font-medium">{dateLabel}</span>
                          <span>📞 {order.contactNumber}</span>
                          {order.paymentMode && (
                            <span>💳 {order.paymentMode}</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          Items: {(order.orderedItems || order.items)?.map(item => `${parseInt(item.quantity)}× ${products.find(p => p.id === item.productId)?.name || 'Unknown Product'}`).join(', ')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {formatPrice(order.totalAmount || 0)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Click to view details
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Show message when no upcoming deliveries */}
      {showUpcomingDeliveries && upcomingDeliveries.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">📅 Upcoming Deliveries</h3>
            <button
              onClick={() => setShowUpcomingDeliveries(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📅</div>
            <p>No deliveries scheduled for the next 7 days</p>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
            <h2 className="text-lg sm:text-xl font-semibold">
              Orders ({filteredOrders.length})
              {statusFilter !== 'All' && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  - Filtered by: {statusFilter}
                </span>
              )}
            </h2>
            
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Status:
                </label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {orderStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                {statusFilter !== 'All' && (
                  <button
                    onClick={() => setStatusFilter('All')}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Delivery Date Filter */}
              <div className="flex items-center space-x-2">
                <label htmlFor="deliveryDateFilter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Delivery:
                </label>
                <div className="flex items-center space-x-1">
                  <input
                    type="date"
                    id="deliveryDateFilter"
                    value={deliveryDateFilter}
                    onChange={(e) => setDeliveryDateFilter(e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {deliveryDateFilter && (
                    <button
                      onClick={() => setDeliveryDateFilter('')}
                      className="text-xs text-gray-500 hover:text-gray-700 underline"
                      title="Clear date filter"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Upcoming Deliveries Toggle */}
              <button
                onClick={() => setShowUpcomingDeliveries(!showUpcomingDeliveries)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  showUpcomingDeliveries
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📅 Upcoming ({upcomingDeliveries.length})
              </button>
              
              {/* Grand Total */}
              <div className="bg-indigo-50 px-4 py-2 rounded-md border border-indigo-200">
                <div className="text-center">
                  <div className="text-xs font-medium text-indigo-600 uppercase tracking-wider">
                    {statusFilter === 'All' ? 'Grand Total' : `${statusFilter} Total`}
                  </div>
                  <div className="text-lg font-bold text-indigo-700">
                    {formatPrice(grandTotal)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <OrderList
          orders={filteredOrders}
          products={products}
          onEdit={handleEdit}
          onDelete={handleDeleteOrder}
          onStatusUpdate={handleStatusUpdate}
          onPaymentToggle={handlePaymentToggle}
        />
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        products={products}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedOrder(null);
        }}
      />
    </div>
  );
};

export default OrderManagement;
