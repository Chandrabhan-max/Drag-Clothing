import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Heart, ArrowLeft } from 'lucide-react';
import { productService } from '../../api/services';
import { useLikes } from '../../context/LikesContext';

// --- SKELETON COMPONENT ---
const SkeletonCard = () => (
  <div className="flex flex-col gap-4">
    <div className="w-full aspect-[3/4] bg-gray-200 animate-pulse rounded-sm"></div>
    <div className="h-4 bg-gray-200 w-3/4 rounded animate-pulse"></div>
    <div className="h-4 bg-gray-200 w-1/2 rounded animate-pulse"></div>
  </div>
);

const Products = () => {
  const { gender: pathGender, category: pathCategory, type: pathType } = useParams();
  const [searchParams] = useSearchParams();

  const initialCategory = searchParams.get('category') || pathCategory;
  const searchQuery = searchParams.get('search');
  const genderQuery = searchParams.get('gender') || pathGender;
  const typeQuery = searchParams.get('type') || pathType;
  const merchQuery = searchParams.get('merch') === 'true';

  const { likedItems, toggleLike } = useLikes();

  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState(initialCategory ? [initialCategory] : []);
  const [selectedColors, setSelectedColors] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ categories: [], colors: [], sizes: [] });

  // --- FETCH PRODUCTS FROM BACKEND ---
  // --- FETCH PRODUCTS FROM BACKEND ---
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      try {
        const params = {
          page: 1,
          limit: 100,
        };

        if (searchQuery) {
          params.search = searchQuery;
        }

        // Normal gender pages:
        // /products?gender=MEN
        // /products?gender=WOMEN
        //
        // Merch is intentionally NOT restricted to one gender.
        if (genderQuery && !merchQuery) {
          params.gender = genderQuery.toUpperCase();
        }

        if (typeQuery) {
          params.type = typeQuery;
        }

        if (selectedColors.length > 0) {
          params.color = selectedColors.join(',');
        }

        const res = await productService.getProducts(params);

        const apiProducts =
          res.data?.data?.data ||
          res.data?.data ||
          [];

        setProducts(
          Array.isArray(apiProducts)
            ? apiProducts
            : []
        );
      } catch (err) {
        console.error(
          "Failed to fetch products:",
          err
        );

        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    searchQuery,
    genderQuery,
    typeQuery,
    selectedColors,
    merchQuery,
  ]);

  useEffect(() => {
    setSelectedCategories(initialCategory ? [initialCategory] : []);
  }, [initialCategory]);

  // Fetch filter options
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await productService.getFilters();
        const data = res.data?.data || res.data || {};
        setFilterOptions({
          categories: data.categories || [],
          colors: data.colors || [],
          sizes: data.sizes || [],
        });
      } catch (err) {
        console.error("Failed to fetch filters");
      }
    };
    fetchFilters();
  }, []);

  // Filter Logic
  // =========================================================
  // PRODUCT FILTER LOGIC
  // =========================================================

  const filteredProducts = products.filter((p) => {
    const productGender = String(
      p.gender ||
      p.genderType ||
      p.forGender ||
      ''
    )
      .toLowerCase()
      .trim();

    const productCategory = String(
      p.category?.name ||
      p.category ||
      p.categoryName ||
      ''
    )
      .toLowerCase()
      .replace(/_/g, ' ')
      .trim();

    const productType = String(
      p.type ||
      p.productType ||
      p.subCategory ||
      p.subcategory ||
      ''
    )
      .toLowerCase()
      .replace(/_/g, ' ')
      .trim();


    // =======================================================
    // MERCH
    // =======================================================
    //
    // Merch:
    // - MEN + WOMEN
    // - ONLY TOPWEAR
    // - ONLY HOODIES + SWEATSHIRTS
    //
    if (merchQuery) {
      const isMen =
        productGender === 'men' ||
        productGender === 'male' ||
        productGender === 'man';

      const isWomen =
        productGender === 'women' ||
        productGender === 'female' ||
        productGender === 'woman';

      const isTopwear =
        productCategory.includes('topwear') ||
        productCategory.includes('top wear') ||
        productType.includes('topwear') ||
        productType.includes('top wear');

      const isHoodie =
        productType.includes('hoodie') ||
        productCategory.includes('hoodie');

      const isSweatshirt =
        productType.includes('sweatshirt') ||
        productType.includes('sweat shirt') ||
        productCategory.includes('sweatshirt') ||
        productCategory.includes('sweat shirt');

      return (
        (isMen || isWomen) &&
        isTopwear &&
        (isHoodie || isSweatshirt)
      );
    }


    // =======================================================
    // FOR HIM
    // =======================================================
    if (
      genderQuery &&
      genderQuery.toUpperCase() === 'MEN'
    ) {
      const isMen =
        productGender === 'men' ||
        productGender === 'male' ||
        productGender === 'man';

      if (!isMen) {
        return false;
      }
    }


    // =======================================================
    // FOR HER
    // =======================================================
    if (
      genderQuery &&
      genderQuery.toUpperCase() === 'WOMEN'
    ) {
      const isWomen =
        productGender === 'women' ||
        productGender === 'female' ||
        productGender === 'woman';

      if (!isWomen) {
        return false;
      }
    }


    // =======================================================
    // NORMAL CATEGORY FILTER
    // =======================================================

    const categoryMatch =
      selectedCategories.length === 0 ||
      selectedCategories.some((c) => {
        const selectedCategory = String(c)
          .toLowerCase()
          .replace(/_/g, ' ')
          .trim();

        return (
          productCategory.includes(selectedCategory) ||
          productType.includes(selectedCategory)
        );
      });

    return categoryMatch;
  });

  const toggleFilter = (item, state, setState) => {
    if (state.includes(item)) setState(state.filter(i => i !== item));
    else setState([...state, item]);
  };

  const FILTER_CATEGORIES = filterOptions.categories.length > 0
    ? filterOptions.categories.map(c => c.name || c)
    : ["Topwear", "Bottomwear", "Outerwear", "Footwear", "Accessories", "Thermal Wear"];

  const FILTER_COLORS = filterOptions.colors.length > 0
    ? filterOptions.colors
    : ["Black", "White", "Beige", "Green", "Blue", "Grey"];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A] font-sans pt-24 pb-20">

      {/* HEADER */}
      <div className="px-6 md:px-10 mb-10 border-b border-[#1A1A1A]/10 pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-[1800px] mx-auto">
          <div>
            {/* Back Button added here */}
            {genderQuery && (
              <Link to={`/category/${genderQuery}`} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#9B4819] hover:text-black transition-colors mb-4 w-fit group">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Back to {genderQuery}'s Directory
              </Link>
            )}

            <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Collection</div>

            {/* Dynamic Title added here */}
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9]">
              {searchQuery ? searchQuery : (typeQuery ? typeQuery.replace(/_/g, ' ') : initialCategory || "All")}
              <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A1A1A] to-gray-500 ml-2 md:ml-0">Items.</span>
            </h1>
          </div>

          <button className="md:hidden flex items-center gap-2 border border-black px-4 py-2 text-xs font-bold uppercase" onClick={() => setIsMobileFilterOpen(true)}>
            <SlidersHorizontal size={14} /> Filters
          </button>
        </div>
      </div>

      <div className="flex max-w-[1800px] mx-auto px-6 md:px-10 gap-10">

        {/* --- SIDEBAR FILTERS --- */}
        <aside className="hidden md:block w-64 sticky top-32 h-fit shrink-0">
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest mb-4 border-b pb-2">Category</h3>
              {FILTER_CATEGORIES.map(cat => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer mb-2">
                  <input type="checkbox" onChange={() => toggleFilter(cat, selectedCategories, setSelectedCategories)} checked={selectedCategories.includes(cat)} className="accent-black w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">{cat}</span>
                </label>
              ))}
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest mb-4 border-b pb-2">Color</h3>
              <div className="flex flex-wrap gap-2">
                {FILTER_COLORS.map(color => (
                  <button key={color} onClick={() => toggleFilter(color, selectedColors, setSelectedColors)}
                    className={`w-6 h-6 rounded-full border border-gray-300 ${selectedColors.includes(color) ? 'ring-2 ring-black ring-offset-2' : ''}`}
                    style={{ backgroundColor: color.toLowerCase() }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* --- PRODUCT GRID --- */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
              {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
              {filteredProducts.map((product) => (
                <Link to={`/product/${product.id}`} key={product.id || product._id} className="group cursor-pointer block h-full flex flex-col">
                  <div className="relative aspect-[3/4] bg-gray-200 mb-4 overflow-hidden flex items-center justify-center">
                    {/* Fallback styling for products without an image yet */}
                    {product.imageUrl || product.image ? (
                      <img
                        src={product.imageUrl || product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <span className="text-gray-400 font-black uppercase tracking-widest text-xl rotate-[-45deg] opacity-50 px-4 text-center">
                        {product.name}
                      </span>
                    )}

                    <div className="absolute bottom-0 w-full bg-white py-3 text-center text-xs font-black uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-300">View Product</div>

                    {/* Like Button */}
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleLike(product); }}
                      className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Heart size={14} fill={likedItems.some(l => l.id === product.id) ? '#9B4819' : 'none'} color={likedItems.some(l => l.id === product.id) ? '#9B4819' : '#1A1A1A'} />
                    </button>
                  </div>

                  <div className="flex flex-col flex-grow">
                    <h3 className="text-sm font-bold uppercase group-hover:text-[#9B4819] transition-colors">{product.name}</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                      {product.type ? product.type.replace(/_/g, ' ') : (product.category?.name || product.category || '')}
                    </p>
                    <div className="flex items-center gap-2 mt-auto pt-2">
                      {product.hasFlashSale ? (
                        <>
                          <span className="text-sm font-black text-[#9B4819]">
                            ₹{Number(product.discountedPrice).toLocaleString('en-IN')}
                          </span>

                          <span className="text-xs text-gray-400 line-through">
                            ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                          </span>

                          <span className="text-[9px] font-black text-green-600">
                            {product.discountPercentage}% OFF
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-black">
                          ₹{Number(product.price).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </motion.div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-gray-400 font-bold uppercase tracking-widest mb-4">No products found.</p>
              <Link to={`/category/${genderQuery}`} className="text-[#9B4819] text-xs font-bold uppercase tracking-widest border-b border-[#9B4819]">
                Back to Categories
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
