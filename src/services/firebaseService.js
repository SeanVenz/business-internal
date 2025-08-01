import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  orderBy, 
  query,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../firebase';

// Product Services
export const productService = {
  // Add a new product
  async addProduct(productData, imageFile) {
    try {
      let imageUrl = '';
      
      if (imageFile) {
        try {
          // Upload image to Firebase Storage
          const imageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
          const snapshot = await uploadBytes(imageRef, imageFile);
          imageUrl = await getDownloadURL(snapshot.ref);
        } catch (uploadError) {
          console.warn('Image upload failed, using placeholder:', uploadError);
          // If image upload fails, use a placeholder or data URL
          imageUrl = 'placeholder-image-url';
        }
      }

      const docRef = await addDoc(collection(db, 'products'), {
        ...productData,
        imageUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return { id: docRef.id, ...productData, imageUrl };
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  },

  // Get all products
  async getProducts() {
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  },

  // Update a product
  async updateProduct(productId, productData, newImageFile) {
    try {
      let imageUrl = productData.imageUrl;

      if (newImageFile) {
        try {
          // Delete old image if exists
          if (productData.imageUrl && productData.imageUrl !== 'placeholder-image-url') {
            try {
              const oldImageRef = ref(storage, productData.imageUrl);
              await deleteObject(oldImageRef);
            } catch {
              console.log('Old image not found or already deleted');
            }
          }

          // Upload new image
          const imageRef = ref(storage, `products/${Date.now()}_${newImageFile.name}`);
          const snapshot = await uploadBytes(imageRef, newImageFile);
          imageUrl = await getDownloadURL(snapshot.ref);
        } catch (uploadError) {
          console.warn('Image upload failed, keeping existing or using placeholder:', uploadError);
          // If upload fails, keep existing imageUrl or use placeholder
          imageUrl = productData.imageUrl || 'placeholder-image-url';
        }
      }

      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        ...productData,
        imageUrl,
        updatedAt: serverTimestamp()
      });

      return { id: productId, ...productData, imageUrl };
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete a product
  async deleteProduct(productId, imageUrl) {
    try {
      // Delete image from storage if exists and it's not a placeholder
      if (imageUrl && imageUrl !== 'placeholder-image-url') {
        try {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        } catch {
          console.log('Image not found or already deleted');
        }
      }

      // Delete product document
      await deleteDoc(doc(db, 'products', productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
};

// Order Services
export const orderService = {
  // Add a new order
  async addOrder(orderData) {
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return { id: docRef.id, ...orderData };
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  },

  // Get all orders
  async getOrders() {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting orders:', error);
      throw error;
    }
  },

  // Update an order
  async updateOrder(orderId, orderData) {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        ...orderData,
        updatedAt: serverTimestamp()
      });

      return { id: orderId, ...orderData };
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  },

  // Delete an order
  async deleteOrder(orderId) {
    try {
      await deleteDoc(doc(db, 'orders', orderId));
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }
};
