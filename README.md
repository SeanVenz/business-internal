# Pastry Business Manager

A complete React application for managing a pastry business inventory and customer orders. Built with Vite, Tailwind CSS, and Firebase.

## Features

### 🍪 Product Management
- Add new products with image upload to Firebase Storage
- Edit existing product information and replace images
- Delete products (with automatic image cleanup)
- View all products in an organized table/grid layout
- Support for different product types: Cookies, Baked Sushi, Cakes, Pastries, Bread, Desserts

### 📋 Order Management
- Create manual customer orders with multiple items
- Track customer information (name, phone, delivery address)
- Manage order status (Pending, In Progress, Completed, Cancelled)
- Calculate order totals automatically
- Add notes for special instructions
- Edit and update existing orders
- Delete orders when needed

### 🎨 UI/UX Features
- Clean, mobile-friendly design with Tailwind CSS
- Responsive layout that works on all devices
- Real-time status updates
- Loading states and error handling
- Intuitive navigation between Product and Order management

## Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS 4
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage (for product images)
- **Routing**: React Router DOM

## Prerequisites

1. Node.js (v20+ recommended)
2. Firebase project with Firestore and Storage enabled
3. Firebase configuration keys

## Installation & Setup

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Firebase**:
   - Update the `.env` file with your Firebase configuration:
   ```env
   VITE_APP_API_KEY=your_firebase_api_key_here
   VITE_APP_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_APP_PROJECT_ID=your_project_id
   VITE_APP_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_APP_MESSAGING_SENDER_ID=your_sender_id
   VITE_APP_APP_ID=your_app_id
   ```

3. **Firebase Security Rules**:
   
   **Firestore Rules** (`/firestore.rules`):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Products collection
       match /products/{document} {
         allow read, write: if true; // Since this is internal use only
       }
       
       // Orders collection
       match /orders/{document} {
         allow read, write: if true; // Since this is internal use only
       }
     }
   }
   ```

   **Storage Rules** (`/storage.rules`):
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /products/{allPaths=**} {
         allow read, write: if true; // Since this is internal use only
       }
     }
   }
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Visit the application**:
   Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
src/
├── components/           # Reusable components
│   ├── Layout.jsx       # Main layout with navigation
│   ├── ProductForm.jsx  # Form for adding/editing products
│   ├── ProductList.jsx  # Display list of products
│   ├── OrderForm.jsx    # Form for adding/editing orders
│   ├── OrderList.jsx    # Display list of orders
│   └── LoadingSpinner.jsx
├── pages/               # Main page components
│   ├── ProductManagement.jsx
│   └── OrderManagement.jsx
├── services/           # Firebase service functions
│   └── firebaseService.js
├── data/               # Sample data and schemas
│   └── sampleData.js
├── firebase.js         # Firebase configuration
├── App.jsx            # Main app component with routing
└── main.jsx           # App entry point
```

## Usage

### Product Management (`/admin/products`)
1. Click "Add New Product" to add a product
2. Fill in product details and upload an image
3. Use Edit/Delete buttons in the product list to manage existing products

### Order Management (`/admin/orders`)
1. Click "Add New Order" to create a new order
2. Fill in customer information
3. Add products to the order using the dropdown
4. Set quantities and add notes if needed
5. Use the status dropdown to update order progress
6. Edit or delete orders as needed

## Sample Data

The `src/data/sampleData.js` file contains sample products and orders that you can use to populate your Firestore database for testing.

## Firestore Collections

### Products Collection
```javascript
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
```

### Orders Collection
```javascript
{
  id: "auto-generated-id",
  customerName: "string",
  phoneNumber: "string",
  deliveryAddress: "string",
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
```

## Deployment

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Firebase Hosting** (optional):
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   firebase deploy
   ```

## Security Note

This application is designed for **internal use only** and does not include authentication. The Firebase security rules allow read/write access to all users. For production use, consider implementing proper authentication and authorization.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for internal business use. Modify and distribute as needed for your pastry business operations.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
