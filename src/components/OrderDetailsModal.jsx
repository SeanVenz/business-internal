
import { useState, useEffect } from 'react';

function CopyInfoButton({ order }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    const name = order.customerName || '';
    const contact = order.phoneNumber || '';
    const address = order.deliveryAddress || '';
    let text = `Name: ${name}\nContact: ${contact}`;
    if (address) text += `\nAddress: ${address}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      className={`ml-2 px-3 py-1 text-xs rounded font-medium transition-colors ${copied ? 'bg-green-100 text-green-700' : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'}`}
      title="Copy name, contact, and address"
      onClick={handleCopy}
    >
      {copied ? '✓ Copied!' : 'Copy Info'}
    </button>
  );
}


const OrderDetailsModal = ({ order, products, isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      console.log(order)
    } else {
      // Re-enable body scroll when modal is closed
      document.body.style.overflow = 'unset';
      console.log(order)
    }

    // Cleanup function to ensure body scroll is restored
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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

  const formatDeliveryDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  const getProductPrice = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.price : 0;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 backdrop-blur-sm bg-opacity-10 transition-all"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div 
          className={`relative w-full max-w-2xl bg-white rounded-lg shadow-xl transform transition-all mx-2 sm:mx-0 ${
            mounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
              <p className="text-sm text-gray-500 mt-1">Order ID: {order.id}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 max-h-[70vh] sm:max-h-96 overflow-y-auto">
            {/* Customer Information */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
                <CopyInfoButton order={order} />
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="text-gray-900">{order.customerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Contact:</span>
                  <span className="text-gray-900">{order.phoneNumber}</span>
                </div>
                {order.deliveryAddress && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Address:</span>
                    <span className="text-gray-900 text-right">{order.deliveryAddress}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Status & Payment */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Order Status</h3>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`px-3 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
                <span className={`px-3 py-2 rounded-full text-sm font-medium border ${
                  order.isPaid 
                    ? 'bg-green-100 text-green-800 border-green-200' 
                    : 'bg-red-100 text-red-800 border-red-200'
                }`}>
                  {order.isPaid ? '✅ Paid' : '❌ Unpaid'}
                </span>
                {order.paymentMode && (
                  <span className="px-3 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    💳 {order.paymentMode}
                  </span>
                )}
              </div>
            </div>

            {/* Delivery Information */}
            {order.deliveryDate && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Delivery Information</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📅</span>
                    <div>
                      <p className="font-medium text-gray-900">{formatDeliveryDate(order.deliveryDate)}</p>
                      <p className="text-sm text-gray-600">Scheduled delivery date</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Order Items</h3>
              <div className="space-y-3">
                {(order.orderedItems || order.items) && (order.orderedItems || order.items).map((item, index) => {
                  const productName = getProductName(item.productId);
                  const productPrice = getProductPrice(item.productId);
                  const itemTotal = productPrice * parseInt(item.quantity);
                  
                  return (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{productName}</h4>
                        <p className="text-sm text-gray-600">
                          {formatPrice(productPrice)} × {parseInt(item.quantity)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatPrice(itemTotal)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-gray-900">{formatPrice(order.totalAmount || 0)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                  <span>Total:</span>
                  <span className="text-green-600">{formatPrice(order.totalAmount || 0)}</span>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-xs sm:text-sm text-gray-500 space-y-1">
                {order.createdAt && (
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="font-medium">Order created:</span>
                    <span className="sm:text-right">{formatDate(order.createdAt)}</span>
                  </div>
                )}
                {order.updatedAt && order.updatedAt !== order.createdAt && (
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="font-medium">Last updated:</span>
                    <span className="sm:text-right">{formatDate(order.updatedAt)}</span>
                  </div>
                )}
                {!order.createdAt && !order.updatedAt && (
                  <div className="text-center py-2 text-gray-400">
                    <span className="text-xs">Timestamp information unavailable</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-4 sm:p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
