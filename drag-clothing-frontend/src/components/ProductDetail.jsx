import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Loader2, Heart, Star, ChevronDown, Truck, Shield, RotateCcw, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { productService } from '../api/services';
import { useCart } from '../context/CartContext';
import { useLikes } from '../context/LikesContext';
import Navbar from './Navbar';

// --- Skeleton Loader ---
const SkeletonDetail = () => (
  <div className="min-h-screen bg-[#FAFAFA] pt-24 px-6 pb-20">
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="space-y-4">
        <div className="aspect-[3/4] bg-gray-200 animate-pulse" />
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4 pt-4">
        <div className="h-3 w-24 bg-gray-200 animate-pulse rounded" />
        <div className="h-10 w-3/4 bg-gray-200 animate-pulse rounded" />
        <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
        <div className="h-20 w-full bg-gray-200 animate-pulse rounded" />
        <div className="h-12 w-full bg-gray-200 animate-pulse rounded mt-4" />
      </div>
    </div>
  </div>
);

// --- Accordion Component ---
const Accordion = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#1A1A1A]">{title}</span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-sm text-gray-500 leading-relaxed">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { likedItems, toggleLike } = useLikes();

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Fetch product + variants + related
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const [productRes, variantsRes, relatedRes] = await Promise.allSettled([
          productService.getProductById(id),
          productService.getVariants(id),
          productService.getRelated(id),
        ]);

        if (productRes.status === 'fulfilled') {
          const p = productRes.value.data?.data || productRes.value.data;
          setProduct(p);
        }

        if (variantsRes.status === 'fulfilled') {
          const v = variantsRes.value.data?.data || variantsRes.value.data || [];
          const activeVariants = Array.isArray(v) ? v.filter(va => va.isActive !== false) : [];
          setVariants(activeVariants);
          if (activeVariants.length > 0) {
            setSelectedVariant(activeVariants[0]);
            setSelectedColor(activeVariants[0].color);
          }
        }

        if (relatedRes.status === 'fulfilled') {
          const r = relatedRes.value.data?.data || relatedRes.value.data || [];
          setRelatedProducts(Array.isArray(r) ? r.slice(0, 4) : []);
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    };

    window.scrollTo(0, 0);
    fetchProduct();
  }, [id]);

  // Derived values
  const isLiked = product && likedItems.some(item => item.id === product.id);
  const baseDisplayPrice =
    Number(selectedVariant?.price || product?.price || 0);

  const discountPercentage =
    Number(product?.discountPercentage || 0);

  const displayPrice =
    discountPercentage > 0
      ? Number(
        (
          baseDisplayPrice -
          (baseDisplayPrice * discountPercentage) / 100
        ).toFixed(2)
      )
      : baseDisplayPrice;
  const productImages = product?.images?.length > 0 ? product.images : [product?.imageUrl || FALLBACK_IMAGE];

  // Get unique colors from variants
  const uniqueColors = [...new Set(variants.map(v => v.color).filter(Boolean))];
  // Get sizes filtered by selected color
  const filteredVariants = selectedColor
    ? variants.filter(v => v.color === selectedColor)
    : variants;

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      alert('Please select a size');
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(product.id, selectedVariant.id, 1);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    const firstVariantForColor = variants.find(v => v.color === color);
    if (firstVariantForColor) setSelectedVariant(firstVariantForColor);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <SkeletonDetail />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="h-screen flex flex-col items-center justify-center bg-[#FAFAFA] gap-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <Package size={32} className="text-gray-300" />
          </div>
          <p className="text-sm font-bold uppercase text-gray-400 tracking-widest">Product not found</p>
          <button
            onClick={() => navigate('/products')}
            className="text-[#9B4819] text-xs font-bold uppercase tracking-widest border-b border-[#9B4819] pb-0.5 hover:text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors"
          >
            Browse Products
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#FAFAFA] pt-24 pb-20">

        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <Link to="/" className="hover:text-[#1A1A1A] transition-colors">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-[#1A1A1A] transition-colors">Products</Link>
            <span>/</span>
            <span className="text-[#1A1A1A]">{product.name}</span>
          </div>
        </div>

        {/* Main Layout */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

          {/* LEFT — Image Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Main Image */}
            <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-4 group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImageIndex}
                  src={productImages[selectedImageIndex]}
                  alt={product.name}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                />
              </AnimatePresence>

              {/* Like Button — floating */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleLike(product)}
                className="absolute top-5 right-5 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg z-10 hover:bg-white transition-all"
              >
                <Heart
                  size={20}
                  fill={isLiked ? '#9B4819' : 'none'}
                  color={isLiked ? '#9B4819' : '#1A1A1A'}
                  className="transition-colors"
                />
              </motion.button>

              {/* Image counter */}
              {productImages.length > 1 && (
                <div className="absolute bottom-5 left-5 bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase">
                  {selectedImageIndex + 1} / {productImages.length}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`aspect-square overflow-hidden border-2 transition-all ${selectedImageIndex === idx
                      ? 'border-[#1A1A1A] opacity-100'
                      : 'border-transparent opacity-50 hover:opacity-80'
                      }`}
                  >
                    <img
                      src={img}
                      alt={`View ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* RIGHT — Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col lg:pt-4"
          >
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-xs font-bold uppercase text-gray-400 hover:text-[#1A1A1A] transition-colors mb-6 w-fit"
            >
              <ArrowLeft size={14} /> Back
            </button>

            {/* Category Tag */}
            {product.category && (
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#9B4819] mb-2">
                {product.category?.name || product.category}
              </p>
            )}

            {/* Product Name */}
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-[0.95] mb-4 text-[#1A1A1A]">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-black text-[#1A1A1A]">
                ₹{Number(displayPrice).toLocaleString('en-IN')}
              </span>

              {discountPercentage > 0 && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    ₹{Number(baseDisplayPrice).toLocaleString('en-IN')}
                  </span>

                  <span className="text-xs font-black text-green-600">
                    {discountPercentage}% OFF
                  </span>
                </>
              )}

              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Incl. GST
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-500 leading-relaxed mb-8 max-w-lg">
              {product.description || "Premium quality, crafted for the modern individual. Designed for comfort and style."}
            </p>

            {/* Color Selection */}
            {uniqueColors.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Color</span>
                  {selectedColor && (
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#1A1A1A]">— {selectedColor}</span>
                  )}
                </div>
                <div className="flex gap-3">
                  {uniqueColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${selectedColor === color
                        ? 'border-[#1A1A1A] ring-2 ring-offset-2 ring-[#1A1A1A]'
                        : 'border-gray-200 hover:border-gray-400'
                        }`}
                      style={{ backgroundColor: color.toLowerCase() }}
                      title={color}
                    >
                      {selectedColor === color && (
                        <svg className="w-4 h-4" fill={['white', 'beige', 'cream', 'yellow', 'ivory'].includes(color.toLowerCase()) ? '#1A1A1A' : 'white'} viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {filteredVariants.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Select Size</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {filteredVariants.map((variant) => (
                    <motion.button
                      key={variant.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedVariant(variant)}
                      className={`min-w-[52px] h-12 px-5 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${selectedVariant?.id === variant.id
                        ? 'bg-[#1A1A1A] text-white border-2 border-[#1A1A1A]'
                        : 'bg-white text-[#1A1A1A] border-2 border-gray-200 hover:border-[#1A1A1A]'
                        } ${variant.stock <= 0 ? 'opacity-30 cursor-not-allowed line-through' : ''}`}
                      disabled={variant.stock <= 0}
                    >
                      {variant.size || 'One Size'}
                    </motion.button>
                  ))}
                </div>
                {selectedVariant && selectedVariant.stock > 0 && (
                  <p className="text-[10px] font-bold text-green-600 mt-2 uppercase tracking-widest">
                    ✓ {selectedVariant.stock} in stock
                  </p>
                )}
                {selectedVariant && selectedVariant.stock <= 0 && (
                  <p className="text-[10px] font-bold text-red-500 mt-2 uppercase tracking-widest">
                    Out of stock
                  </p>
                )}
              </div>
            )}

            {/* Add to Cart */}
            <div className="flex gap-3 mb-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={addingToCart || (variants.length > 0 && !selectedVariant) || (selectedVariant?.stock <= 0)}
                className={`flex-1 py-4 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all duration-300 ${addedSuccess
                  ? 'bg-green-600 text-white'
                  : 'bg-[#1A1A1A] text-white hover:bg-[#9B4819]'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {addingToCart ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : addedSuccess ? (
                  <>✓ Added to Cart</>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    Add to Cart — ₹{Number(displayPrice).toLocaleString()}
                  </>
                )}
              </motion.button>

              {/* Like Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleLike(product)}
                className={`w-14 h-14 border-2 flex items-center justify-center transition-all ${isLiked
                  ? 'bg-[#FDF2ED] border-[#9B4819]'
                  : 'bg-white border-gray-200 hover:border-[#1A1A1A]'
                  }`}
              >
                <Heart
                  size={20}
                  fill={isLiked ? '#9B4819' : 'none'}
                  color={isLiked ? '#9B4819' : '#1A1A1A'}
                />
              </motion.button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 mb-8 py-6 border-y border-gray-200">
              <div className="flex flex-col items-center text-center gap-2">
                <Truck size={18} className="text-[#9B4819]" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RotateCcw size={18} className="text-[#9B4819]" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Easy Returns</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Shield size={18} className="text-[#9B4819]" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Secure Checkout</span>
              </div>
            </div>

            {/* Accordions */}
            <div>
              <Accordion title="Product Details" defaultOpen={true}>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li><span className="font-semibold text-[#1A1A1A]">Name:</span> {product.name}</li>
                  {product.gender && product.gender !== 'UNISEX' && (
                    <li><span className="font-semibold text-[#1A1A1A]">Gender:</span> {product.gender}</li>
                  )}
                  {product.type && (
                    <li><span className="font-semibold text-[#1A1A1A]">Type:</span> {product.type.replace(/_/g, ' ')}</li>
                  )}
                  <li><span className="font-semibold text-[#1A1A1A]">Material:</span> Premium Quality Fabric</li>
                </ul>
              </Accordion>

              <Accordion title="Shipping & Returns">
                <ul className="space-y-2">
                  <li>• Free shipping on orders above ₹999</li>
                  <li>• Standard delivery: 5-7 business days</li>
                  <li>• Express delivery: 2-3 business days</li>
                  <li>• Easy 15-day return & exchange policy</li>
                </ul>
              </Accordion>

              <Accordion title="Care Instructions">
                <ul className="space-y-2">
                  <li>• Machine wash cold with similar colors</li>
                  <li>• Do not bleach or tumble dry</li>
                  <li>• Iron on low heat if needed</li>
                  <li>• Hang dry recommended</li>
                </ul>
              </Accordion>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="max-w-7xl mx-auto px-6 mt-24">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#1A1A1A]">
                  You May Also Like
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mt-2">Similar products from our collection</p>
              </div>
              <Link
                to="/products"
                className="text-[10px] font-bold uppercase tracking-widest text-[#9B4819] border-b border-[#9B4819] pb-0.5 hover:text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors hidden md:block"
              >
                View All
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rp) => (
                <Link
                  to={`/product/${rp.id}`}
                  key={rp.id}
                  className="group cursor-pointer block"
                >
                  <div className="relative aspect-[3/4] bg-gray-100 mb-4 overflow-hidden">
                    <img
                      src={rp.imageUrl || rp.image || FALLBACK_IMAGE}
                      alt={rp.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                    />
                    <div className="absolute bottom-0 w-full bg-white py-3 text-center text-xs font-black uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      View Product
                    </div>
                  </div>
                  <h3 className="text-sm font-bold uppercase group-hover:text-[#9B4819] transition-colors">{rp.name}</h3>
                  <span className="text-sm font-bold block mt-1">₹{Number(rp.price).toLocaleString()}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductDetail;