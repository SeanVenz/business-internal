import { useState } from 'react';

const OrderForm = ({ order, products, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    customerName: order?.customerName || '',
    phoneNumber: order?.phoneNumber || '',
    deliveryAddress: order?.deliveryAddress || '',
    status: order?.status || 'Pending',
    notes: order?.notes || ''
  });
  const [orderedItems, setOrderedItems] = useState(order?.orderedItems || []);
  const [loading, setLoading] = useState(false);

  const orderStatuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addOrderItem = () => {
    setOrderedItems(prev => [...prev, {
      productId: '',
      productName: '',
      price: 0,
      quantity: 1
    }]);
  };

  const updateOrderItem = (index, field, value) => {
    setOrderedItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      // If product is selected, auto-fill name and price
      if (field === 'productId' && value) {
        const product = products.find(p => p.id === value);
        if (product) {
          updated[index].productName = product.name;
          updated[index].price = product.price;
        }
      }
      
      return updated;
    });
  };

  const removeOrderItem = (index) => {
    setOrderedItems(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return orderedItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.phoneNumber || !formData.deliveryAddress) {
      alert('Please fill in all required customer information');
      return;
    }

    if (orderedItems.length === 0) {
      alert('Please add at least one item to the order');
      return;
    }

    const invalidItems = orderedItems.some(item => !item.productId || item.quantity <= 0);
    if (invalidItems) {
      alert('Please ensure all items have a product selected and quantity greater than 0');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        ...formData,
        orderedItems,
        totalAmount: calculateTotal()
      };
      await onSubmit(orderData);
    } catch (error) {
      console.error('Error submitting order:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Customer Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
            Customer Name *
          </label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            value={formData.customerName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter customer name"
            required
          />
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter phone number"
            required
          />
        </div>
      </div>

      {/* Delivery Address */}
      <div>
        <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700 mb-2">
          Delivery Address *
        </label>
        <textarea
          id="deliveryAddress"
          name="deliveryAddress"
          value={formData.deliveryAddress}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter delivery address"
          required
        />
      </div>

      {/* Order Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
          Order Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {orderStatuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* Ordered Items */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Ordered Items *
          </label>
          <button
            type="button"
            onClick={addOrderItem}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium"
          >
            <span className="hidden sm:inline">Add Item</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {orderedItems.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center text-gray-500">
            <p>No items added yet</p>
            <p className="text-sm">Click "Add Item" to start</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orderedItems.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-3 sm:p-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product
                    </label>
                    <select
                      value={item.productId}
                      onChange={(e) => updateOrderItem(index, 'productId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      required
                    >
                      <option value="">Select a product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {formatPrice(product.price)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeOrderItem(index)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {item.productId && (
                    <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                      Subtotal: {formatPrice(item.price * item.quantity)}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="bg-gray-50 rounded-md p-4">
              <div className="text-right">
                <span className="text-lg font-semibold">
                  Total: {formatPrice(calculateTotal())}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          Notes (Optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Any special instructions or notes"
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium order-2 sm:order-1"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 font-medium order-1 sm:order-2"
        >
          {loading ? 'Saving...' : (order ? 'Update Order' : 'Create Order')}
        </button>
      </div>
    </form>
  );
};

export default OrderForm;
