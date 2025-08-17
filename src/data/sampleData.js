// Sample data for testing the pastry business application
// You can use this data to populate your Firestore database

export const sampleProducts = [
  {
    name: "Chocolate Chip Cookies",
    type: "Cookie",
    price: 25.00,
    description: "Classic homemade chocolate chip cookies with premium chocolate chips. Perfect for any occasion.",
    // Note: imageUrl will be populated when you upload actual images
  },
  {
    name: "California Maki Baked Sushi",
    type: "Baked Sushi",
    price: 180.00,
    description: "Delicious baked sushi with crabstick, cucumber, and avocado topped with mayo and cheese.",
  },
  {
    name: "Red Velvet Cupcakes",
    type: "Cake",
    price: 45.00,
    description: "Moist red velvet cupcakes with cream cheese frosting. Sold individually.",
  },
  {
    name: "Butter Croissants",
    type: "Pastry",
    price: 35.00,
    description: "Flaky, buttery croissants baked fresh daily. Perfect for breakfast or snacks.",
  },
  {
    name: "Ube Pandesal",
    type: "Bread",
    price: 8.00,
    description: "Traditional Filipino bread roll with a modern ube twist. Soft and slightly sweet.",
  },
  {
    name: "Leche Flan",
    type: "Dessert",
    price: 120.00,
    description: "Silky smooth traditional Filipino leche flan with rich caramel sauce.",
  }
];

export const sampleOrders = [
  {
    customerName: "Maria Santos",
    phoneNumber: "09123456789",
    deliveryAddress: "123 Main Street, Quezon City",
    deliveryDate: "2025-08-20",
    paymentMode: "COD",
    isPaid: false,
    status: "In Progress",
    orderedItems: [
      {
        productId: "sample1", // This would be the actual product ID from Firestore
        productName: "Chocolate Chip Cookies",
        price: 25.00,
        quantity: 2
      },
      {
        productId: "sample3",
        productName: "Red Velvet Cupcakes", 
        price: 45.00,
        quantity: 4
      }
    ],
    totalAmount: 230.00,
    notes: "Please deliver before 3 PM. Customer will pay cash on delivery."
  },
  {
    customerName: "Juan Dela Cruz",
    phoneNumber: "09987654321",
    deliveryAddress: "456 Oak Avenue, Makati City",
    deliveryDate: "2025-08-22",
    paymentMode: "GCash",
    isPaid: true,
    status: "Pending",
    orderedItems: [
      {
        productId: "sample2",
        productName: "California Maki Baked Sushi",
        price: 180.00,
        quantity: 3
      }
    ],
    totalAmount: 540.00,
    notes: "Birthday party order. Customer prefers afternoon delivery."
  }
];

// Firestore Schema Suggestions:

/* 
PRODUCTS COLLECTION (/products):
{
  id: "auto-generated-id",
  name: "string",
  type: "string", // Cookie, Baked Sushi, Cake, Pastry, Bread, Dessert, Other
  price: "number", // in PHP
  description: "string",
  imageUrl: "string", // Firebase Storage URL
  createdAt: "timestamp",
  updatedAt: "timestamp"
}

ORDERS COLLECTION (/orders):
{
  id: "auto-generated-id",
  customerName: "string",
  phoneNumber: "string",
  deliveryAddress: "string",
  deliveryDate: "string", // YYYY-MM-DD format
  paymentMode: "string", // COD, Bank Transfer, GCash
  isPaid: "boolean", // Payment status
  status: "string", // Pending, In Progress, Completed, Cancelled
  orderedItems: [
    {
      productId: "string", // Reference to product document
      productName: "string", // Cached for easier display
      price: "number", // Cached price at time of order
      quantity: "number"
    }
  ],
  totalAmount: "number", // Calculated total
  notes: "string", // Optional
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
*/

// Instructions for adding sample data to Firestore:
/*
1. Go to Firebase Console > Firestore Database
2. Create a new collection called "products"
3. Add documents using the sampleProducts data above
4. Create a new collection called "orders" 
5. Add documents using the sampleOrders data above
6. Make sure to update productId references in orders to match actual product document IDs
*/
