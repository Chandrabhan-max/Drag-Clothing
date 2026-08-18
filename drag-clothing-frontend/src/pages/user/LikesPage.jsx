import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLikes } from '../../context/LikesContext';
import { useCart } from '../../context/CartContext';
import { Trash2, ShoppingBag, HeartOff, ArrowRight, X } from 'lucide-react';



// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } }
};

const LikesPage = () => {
  const { likedItems, removeFromLikes, clearAllLikes } = useLikes();
  const { setIsCartOpen } = useCart();
  const navigate = useNavigate();

  const [displayItems, setDisplayItems] = useState(likedItems);

  // Sync with real liked items
  useEffect(() => {
    setDisplayItems(likedItems);
  }, [likedItems]);

  // --- 1. HANDLE SINGLE DELETE ---
  const handleRemove = (id) => {
    // UI Update (Instant)
    setDisplayItems(prev => prev.filter(item => item.id !== id));

    // Context Update (Real Logic)
    removeFromLikes(id);
  };

  // --- 2. HANDLE CLEAR ALL ---
  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to delete everything?")) {
      setDisplayItems([]); // Instant UI Clear
      clearAllLikes();     // Clear Context
    }
  };

  // --- 3. MOVE TO CART ---
  const handleMoveToCart = (product) => {
    // Navigate to product detail so user can pick size/variant before adding to cart
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-24 pb-20 px-6 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-[#E5E5E5] pb-6 gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-black text-[#1A1A1A] uppercase tracking-tighter mb-2">
              Wishlist<span className="text-[#9B4819]">.</span>
            </h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
              {displayItems.length} {displayItems.length === 1 ? 'Item' : 'Items'} Saved
            </p>
          </div>

          {displayItems.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500 hover:text-white hover:bg-red-500 px-5 py-2.5 rounded-full transition-all border border-transparent hover:border-red-500 hover:shadow-lg"
            >
              <Trash2 size={14} /> Remove All
            </button>
          )}
        </div>

        {/* --- CONTENT AREA --- */}
        <AnimatePresence mode="wait">
          {displayItems.length === 0 ? (

            // EMPTY STATE
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-200 rounded-3xl bg-white"
            >
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                <HeartOff size={32} />
              </div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] uppercase tracking-tight mb-2">Your Wishlist is Empty</h2>
              <p className="text-gray-400 text-sm max-w-md mb-8">
                Looks like you haven't saved anything yet. Explore our collection and save your favorites for later.
              </p>
              <Link to="/category/men">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#9B4819] transition-colors flex items-center gap-2"
                >
                  Start Shopping <ArrowRight size={14} />
                </motion.button>
              </Link>
            </motion.div>

          ) : (

            // GRID LIST
            <motion.div
              key="grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <AnimatePresence>
                {displayItems.map((product) => (
                  <motion.div
                    layout
                    variants={itemVariants}
                    exit="exit"
                    key={product.id}
                    className="group bg-white border border-[#E5E5E5] p-4 flex flex-col relative hover:shadow-xl hover:border-transparent transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="aspect-[3/4] bg-[#F5F5F5] mb-4 overflow-hidden relative">
                      <img
                        src={product.imageUrl || product.image || product.images?.[0] || ''}
                        alt={product.name}
                        className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out"
                        onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format'; }}
                      />

                      {/* REMOVE BUTTON (Correctly Wired) */}
                      <button
                        onClick={() => handleRemove(product.id)}
                        className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm flex items-center justify-center text-black hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 z-10 rounded-full shadow-sm"
                        title="Remove Item"
                      >
                        <X size={14} />
                      </button>

                      {/* Hover Add to Cart */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:block">
                        <button
                          onClick={() => handleMoveToCart(product)}
                          className="w-full py-3 bg-white/95 backdrop-blur-md text-[#1A1A1A] text-[10px] font-black uppercase tracking-widest hover:bg-[#1A1A1A] hover:text-white transition-colors flex items-center justify-center gap-2 shadow-lg"
                        >
                          <ShoppingBag size={12} /> Add to Cart
                        </button>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="mt-auto">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-[#1A1A1A] text-sm uppercase tracking-tight line-clamp-1 pr-4">
                          {product.name}
                        </h3>
                        <span className="text-xs font-black text-[#1A1A1A]">₹{product.price}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                        {product.category || 'Collection'}
                      </p>
                    </div>

                    {/* Mobile Only Add Button */}
                    <button
                      onClick={() => handleMoveToCart(product)}
                      className="md:hidden mt-4 w-full py-3 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-widest"
                    >
                      Move to Cart
                    </button>

                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default LikesPage;
