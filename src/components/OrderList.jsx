const OrderList = ({ orders, products, onEdit, onDelete, onStatusUpdate, onPaymentToggle }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    let date;
    if (timestamp.seconds) {
      // Firestore timestamp
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  if (orders.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="text-4xl mb-4">📋</div>
        <p className="text-lg">No orders found</p>
        <p className="text-sm">
          {products.length === 0 
            ? "Add some products first, then create your first order" 
            : "Add your first order to get started"
          }
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Delivery Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {order.customerName}
                    </div>
                    <div className="text-sm text-gray-500">
                      📞 {order.phoneNumber}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    <div className="text-sm text-gray-500 max-w-xs truncate mb-1">
                      📍 {order.deliveryAddress}
                    </div>
                    <div className="text-xs text-gray-500">
                      📅 {order.deliveryDate || 'Not set'}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span>💳 {order.paymentMode || 'COD'}</span>
                        <button
                          onClick={() => onPaymentToggle && onPaymentToggle(order.id, !order.isPaid)}
                          className={`px-1 py-0.5 text-xs rounded font-medium ${
                            order.isPaid 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {order.isPaid ? '✅' : '❌'}
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {order.orderedItems?.map((item, index) => (
                      <div key={index} className="mb-1">
                        <span className="font-medium">{parseInt(item.quantity)}x</span>{' '}
                        {item.productName || getProductName(item.productId)}
                        <span className="text-gray-500 text-xs ml-1">
                          ({formatPrice(item.price)} each)
                        </span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatPrice(order.totalAmount || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={order.status}
                    onChange={(e) => onStatusUpdate(order.id, e.target.value)}
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(order.status)}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => onEdit(order)}
                      className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(order.id)}
                      className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4 p-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-base font-medium text-gray-900">{order.customerName}</h3>
                <p className="text-sm text-gray-500">📞 {order.phoneNumber}</p>
              </div>
              <select
                value={order.status}
                onChange={(e) => onStatusUpdate(order.id, e.target.value)}
                className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(order.status)}`}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="mb-3">
              <p className="text-sm text-gray-500 mb-2">📍 {order.deliveryAddress}</p>
              <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-gray-500 mb-2">
                <span>📅 Delivery: {order.deliveryDate || 'Not set'}</span>
                <div className="flex items-center space-x-2">
                  <span>💳 Payment: {order.paymentMode || 'COD'}</span>
                  <button
                    onClick={() => onPaymentToggle && onPaymentToggle(order.id, !order.isPaid)}
                    className={`px-2 py-1 text-xs rounded font-medium ${
                      order.isPaid 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {order.isPaid ? '✅ Paid' : '❌ Unpaid'}
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-900">
                <p className="font-medium mb-1">Items:</p>
                <div className="space-y-1">
                  {order.orderedItems?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 px-2 py-1 rounded">
                      <span>
                        {parseInt(item.quantity)}x {item.productName || getProductName(item.productId)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatPrice(item.price * parseInt(item.quantity))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <div className="text-lg font-semibold text-gray-900">
                Total: {formatPrice(order.totalAmount || 0)}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(order)}
                  className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md text-sm transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(order.id)}
                  className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="mt-2 text-xs text-gray-500">
              Created: {formatDate(order.createdAt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderList;
