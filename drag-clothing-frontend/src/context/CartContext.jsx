import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

import { cartService } from '../api/services';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // =========================================================
  // CUSTOMER CHECK
  // Handles both:
  // "customer"
  // "CUSTOMER"
  // =========================================================
  const isCustomer =
    !!user &&
    String(user.role || '').toLowerCase() === 'customer';

  // =========================================================
  // FETCH CART
  // GET /cart
  // =========================================================
  const fetchCart = useCallback(async () => {
    console.log('🛒 fetchCart called');
    console.log('👤 Current user:', user);
    console.log('👤 Current role:', user?.role);
    console.log('👤 Is customer:', isCustomer);

    if (!user) {
      console.log('⚠️ No logged-in user. Clearing frontend cart.');
      setCart([]);
      return;
    }

    if (!isCustomer) {
      console.log(
        '⚠️ Logged-in user is not a customer. Cart API will not be called.'
      );
      setCart([]);
      return;
    }

    try {
      setLoading(true);

      console.log('🔥 Calling GET /cart');

      const res = await cartService.getCart();

      console.log('✅ GET /cart response:', res.data);

      const payload = res.data?.data ?? res.data ?? {};
      const items = Array.isArray(payload.items)
        ? payload.items
        : [];

      console.log('🛒 Cart items received:', items);

      setCart(items);
    } catch (err) {
      console.error(
        '❌ GET /cart failed:',
        err?.response?.data || err
      );

      setCart([]);
    } finally {
      setLoading(false);
    }
  }, [user, isCustomer]);

  // =========================================================
  // FETCH CART WHEN USER CHANGES / LOGS IN
  // =========================================================
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // =========================================================
  // CART COUNT
  // =========================================================
  const cartCount = cart.reduce(
    (total, item) =>
      total + Number(item.quantity || 1),
    0
  );

  // =========================================================
  // CART TOTAL
  // =========================================================
  const cartTotal = cart.reduce((total, item) => {
    const price = Number(
      item.discountedPrice ??
      item.price ??
      item.variant?.price ??
      item.product?.price ??
      0
    );

    const quantity = Number(
      item.quantity || 1
    );

    return total + price * quantity;
  }, 0);

  // =========================================================
  // ADD TO CART
  // POST /cart/add
  // =========================================================
  const addToCart = async (
    productId,
    variantId,
    quantity = 1
  ) => {
    console.log('🔥 addToCart called');

    console.log('📦 Product ID:', productId);
    console.log('🎨 Variant ID:', variantId);
    console.log('🔢 Quantity:', quantity);
    console.log('👤 User:', user);

    if (!user) {
      alert('Please login to add items to cart');
      return false;
    }

    if (!isCustomer) {
      console.error(
        '❌ Current user is not a customer:',
        user.role
      );

      alert('Only customers can add products to cart.');
      return false;
    }

    if (!productId) {
      console.error('❌ Missing productId');
      alert('Product ID is missing.');
      return false;
    }

    if (!variantId) {
      console.error('❌ Missing variantId');
      alert('Please select a valid product variant/size.');
      return false;
    }

    const payload = {
      productId,
      variantId,
      quantity: Number(quantity),
    };

    console.log(
      '📤 POST /cart/add payload:',
      payload
    );

    try {
      const response = await cartService.addToCart(
        payload
      );

      console.log(
        '✅ POST /cart/add response:',
        response.data
      );

      await fetchCart();

      setIsCartOpen(true);

      return true;
    } catch (err) {
      console.error(
        '❌ POST /cart/add failed:',
        err?.response?.data || err
      );

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to add item to cart';

      alert(
        typeof message === 'string'
          ? message
          : JSON.stringify(message)
      );

      return false;
    }
  };

  // =========================================================
  // UPDATE CART ITEM
  // PUT /cart/update/:id
  // =========================================================
  const updateCartItem = async (
    cartItemId,
    quantity
  ) => {
    console.log('🔄 updateCartItem called:', {
      cartItemId,
      quantity,
    });

    if (!cartItemId) {
      console.error(
        '❌ Missing cartItemId for update'
      );
      return false;
    }

    try {
      const response =
        await cartService.updateCartItem(
          cartItemId,
          {
            quantity: Number(quantity),
          }
        );

      console.log(
        '✅ UPDATE CART response:',
        response.data
      );

      await fetchCart();

      return true;
    } catch (err) {
      console.error(
        '❌ Update cart failed:',
        err?.response?.data || err
      );

      return false;
    }
  };

  // =========================================================
  // REMOVE CART ITEM
  // DELETE /cart/remove/:id
  // =========================================================
  const removeFromCart = async (cartItemId) => {
    console.log(
      '🗑️ removeFromCart called:',
      cartItemId
    );

    if (!cartItemId) {
      console.error(
        '❌ Missing cartItemId for remove'
      );
      return false;
    }

    try {
      const response =
        await cartService.removeItem(
          cartItemId
        );

      console.log(
        '✅ REMOVE CART response:',
        response.data
      );

      await fetchCart();

      return true;
    } catch (err) {
      console.error(
        '❌ Remove from cart failed:',
        err?.response?.data || err
      );

      return false;
    }
  };

  // =========================================================
  // CLEAR ENTIRE CART
  // DELETE /cart/clear
  // =========================================================
  const clearCart = async () => {
    console.log('🧹 clearCart called');

    try {
      const response =
        await cartService.clearCart();

      console.log(
        '✅ CLEAR CART response:',
        response.data
      );

      setCart([]);

      return true;
    } catch (err) {
      console.error(
        '❌ Clear cart failed:',
        err?.response?.data || err
      );

      return false;
    }
  };

  return (
    <CartContext.Provider
      value={{
        isCartOpen,
        setIsCartOpen,

        cart,
        loading,

        cartCount,
        cartTotal,

        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// =========================================================
// USE CART HOOK
// =========================================================
export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart must be used inside CartProvider'
    );
  }

  return context;
};