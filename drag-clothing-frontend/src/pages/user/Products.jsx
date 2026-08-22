import React, { useState, useEffect } from 'react';
import {
  useSearchParams,
  Link,
  useParams,
} from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal,
  Heart,
  ArrowLeft,
  X,
} from 'lucide-react';

import { productService } from '../../api/services';
import { useLikes } from '../../context/LikesContext';

// =========================================================
// SKELETON
// =========================================================

const SkeletonCard = () => (
  <div className="flex flex-col gap-4">
    <div className="w-full aspect-[3/4] bg-gray-200 animate-pulse rounded-sm" />
    <div className="h-4 bg-gray-200 w-3/4 rounded animate-pulse" />
    <div className="h-4 bg-gray-200 w-1/2 rounded animate-pulse" />
  </div>
);

// =========================================================
// PRODUCTS
// =========================================================

const Products = () => {
  const {
    gender: pathGender,
    category: pathCategory,
    type: pathType,
  } = useParams();

  const [searchParams, setSearchParams] =
    useSearchParams();

  const initialCategory =
    searchParams.get('category') || pathCategory;

  const searchQuery =
    searchParams.get('search');

  const genderQuery =
    searchParams.get('gender') || pathGender;

  const typeQuery =
    searchParams.get('type') || pathType;

  const merchQuery =
    searchParams.get('merch') === 'true';

  const { likedItems, toggleLike } = useLikes();

  // =========================================================
  // STATE
  // =========================================================

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isMobileFilterOpen, setIsMobileFilterOpen] =
    useState(false);

  const [selectedCategories, setSelectedCategories] =
    useState(
      initialCategory
        ? [initialCategory]
        : []
    );

  const [selectedColors, setSelectedColors] =
    useState([]);

  const [selectedGender, setSelectedGender] =
    useState('');

  const [filterOptions, setFilterOptions] =
    useState({
      categories: [],
      colors: [],
      sizes: [],
    });

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      try {
        const params = {
          page: 1,
          limit: 100,
        };

        // SEARCH
        if (searchQuery) {
          params.search = searchQuery;
        }

        // URL GENDER
        if (genderQuery && !merchQuery) {
          params.gender =
            genderQuery.toUpperCase();
        }

        // FILTER GENDER
        if (selectedGender && !merchQuery) {
          params.gender =
            selectedGender;
        }

        // TYPE
        if (typeQuery) {
          params.type = typeQuery;
        }

        // CATEGORY
        if (selectedCategories.length > 0) {
          params.category =
            selectedCategories[0];
        }

        // COLOR
        if (selectedColors.length > 0) {
          params.color =
            selectedColors.join(',');
        }

        const res =
          await productService.getProducts(
            params
          );

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
          'Failed to fetch products:',
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
    selectedGender,
    typeQuery,
    selectedCategories,
    selectedColors,
    merchQuery,
  ]);

  // =========================================================
  // RESET CATEGORY WHEN URL CHANGES
  // =========================================================

  useEffect(() => {
    setSelectedCategories(
      initialCategory
        ? [initialCategory]
        : []
    );
  }, [initialCategory]);

  // =========================================================
  // KEEP URL GENDER AS ACTIVE FILTER
  // =========================================================

  useEffect(() => {
    if (!genderQuery || merchQuery) {
      setSelectedGender('');
      return;
    }

    const normalized =
      genderQuery.toUpperCase();

    if (
      normalized === 'MEN' ||
      normalized === 'WOMEN'
    ) {
      setSelectedGender(normalized);
    }
  }, [genderQuery, merchQuery]);

  // =========================================================
  // FETCH FILTER OPTIONS
  // =========================================================

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res =
          await productService.getFilters();

        const data =
          res.data?.data ||
          res.data ||
          {};

        setFilterOptions({
          categories:
            data.categories || [],
          colors:
            data.colors || [],
          sizes:
            data.sizes || [],
        });
      } catch (err) {
        console.error(
          'Failed to fetch filters',
          err
        );
      }
    };

    fetchFilters();
  }, []);

  // =========================================================
  // SYNC FILTERS TO URL
  // =========================================================

  const syncFiltersToUrl = (
    categories,
    colors,
    gender
  ) => {
    const params = new URLSearchParams();

    if (searchQuery) {
      params.set('search', searchQuery);
    }

    if (typeQuery) {
      params.set('type', typeQuery);
    }

    if (merchQuery) {
      params.set('merch', 'true');
    }

    if (categories.length > 0) {
      params.set(
        'category',
        categories[0]
      );
    }

    if (colors.length > 0) {
      params.set(
        'color',
        colors.join(',')
      );
    }

    if (gender) {
      params.set(
        'gender',
        gender
      );
    }

    setSearchParams(
      params,
      {
        replace: true,
      }
    );
  };

  // =========================================================
  // FILTER TOGGLE
  // =========================================================

  const toggleFilter = (
    item,
    state,
    setState
  ) => {
    const updatedState =
      state.includes(item)
        ? state.filter(
            (i) => i !== item
          )
        : [...state, item];

    setState(updatedState);

    if (
      setState ===
      setSelectedCategories
    ) {
      syncFiltersToUrl(
        updatedState,
        selectedColors,
        selectedGender
      );
    }

    if (
      setState ===
      setSelectedColors
    ) {
      syncFiltersToUrl(
        selectedCategories,
        updatedState,
        selectedGender
      );
    }
  };

  // =========================================================
  // FILTER LISTS
  // =========================================================

  const FILTER_CATEGORIES =
    filterOptions.categories.length > 0
      ? filterOptions.categories.map(
          (c) => c.name || c
        )
      : [
          'Topwear',
          'Bottomwear',
          'Outerwear',
          'Footwear',
          'Accessories',
          'Thermal Wear',
        ];

  const FILTER_COLORS =
    filterOptions.colors.length > 0
      ? filterOptions.colors
      : [
          'Black',
          'White',
          'Beige',
          'Green',
          'Blue',
          'Grey',
        ];

  const FILTER_GENDERS = [
    '',
    'MEN',
    'WOMEN',
  ];

  // =========================================================
  // FRONTEND FILTER LOGIC
  // =========================================================

  const filteredProducts =
    products.filter((p) => {
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

      // =====================================================
      // SELECTED GENDER FILTER
      // =====================================================

      if (selectedGender) {
        const selected =
          selectedGender.toLowerCase();

        const genderMatch =
          productGender === selected ||
          (
            selected === 'men' &&
            (
              productGender === 'male' ||
              productGender === 'man'
            )
          ) ||
          (
            selected === 'women' &&
            (
              productGender === 'female' ||
              productGender === 'woman'
            )
          );

        if (!genderMatch) {
          return false;
        }
      }

      // =====================================================
      // MERCH
      // =====================================================

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
          productCategory.includes(
            'topwear'
          ) ||
          productCategory.includes(
            'top wear'
          ) ||
          productType.includes(
            'topwear'
          ) ||
          productType.includes(
            'top wear'
          );

        const isHoodie =
          productType.includes(
            'hoodie'
          ) ||
          productCategory.includes(
            'hoodie'
          );

        const isSweatshirt =
          productType.includes(
            'sweatshirt'
          ) ||
          productType.includes(
            'sweat shirt'
          ) ||
          productCategory.includes(
            'sweatshirt'
          ) ||
          productCategory.includes(
            'sweat shirt'
          );

        return (
          (isMen || isWomen) &&
          isTopwear &&
          (isHoodie || isSweatshirt)
        );
      }

      // =====================================================
      // MEN PAGE
      // =====================================================

      if (
        genderQuery &&
        genderQuery.toUpperCase() ===
          'MEN'
      ) {
        const isMen =
          productGender === 'men' ||
          productGender === 'male' ||
          productGender === 'man';

        if (!isMen) {
          return false;
        }
      }

      // =====================================================
      // WOMEN PAGE
      // =====================================================

      if (
        genderQuery &&
        genderQuery.toUpperCase() ===
          'WOMEN'
      ) {
        const isWomen =
          productGender === 'women' ||
          productGender === 'female' ||
          productGender === 'woman';

        if (!isWomen) {
          return false;
        }
      }

      // =====================================================
      // CATEGORY
      // =====================================================

      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.some((c) => {
          const selectedCategory =
            String(c)
              .toLowerCase()
              .replace(/_/g, ' ')
              .trim();

          return (
            productCategory.includes(
              selectedCategory
            ) ||
            productType.includes(
              selectedCategory
            )
          );
        });

      if (!categoryMatch) {
        return false;
      }

      return true;
    });

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const clearFilters = () => {
    const categoryState =
      initialCategory
        ? [initialCategory]
        : [];

    const genderState =
      genderQuery && !merchQuery
        ? genderQuery.toUpperCase()
        : '';

    setSelectedCategories(
      categoryState
    );

    setSelectedColors([]);

    setSelectedGender(
      genderState
    );

    syncFiltersToUrl(
      categoryState,
      [],
      genderState
    );
  };

  // =========================================================
  // APPLY MOBILE FILTER
  // =========================================================

  const applyMobileFilters = () => {
    setIsMobileFilterOpen(false);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="
      min-h-screen
      bg-[#FAFAFA]
      text-[#1A1A1A]
      font-sans
      pt-24
      pb-20
    ">

      {/* =====================================================
          HEADER
         ===================================================== */}

      <div className="
        px-6
        md:px-10
        mb-10
        border-b
        border-[#1A1A1A]/10
        pb-8
      ">

        <div className="
          flex
          flex-col
          md:flex-row
          md:items-end
          justify-between
          gap-6
          max-w-[1800px]
          mx-auto
        ">

          <div>

            {genderQuery && (
              <Link
                to={`/category/${genderQuery}`}
                className="
                  flex
                  items-center
                  gap-2
                  text-xs
                  font-bold
                  uppercase
                  tracking-widest
                  text-[#9B4819]
                  hover:text-black
                  transition-colors
                  mb-4
                  w-fit
                  group
                "
              >

                <ArrowLeft
                  size={14}
                  className="
                    group-hover:-translate-x-1
                    transition-transform
                  "
                />

                Back to {genderQuery}'s Directory

              </Link>
            )}

            <div className="
              text-xs
              font-bold
              uppercase
              tracking-widest
              text-gray-500
              mb-2
            ">
              Collection
            </div>

            <h1 className="
              text-5xl
              md:text-8xl
              font-black
              uppercase
              tracking-tighter
              leading-[0.9]
            ">

              {
                searchQuery
                  ? searchQuery
                  : (
                      typeQuery
                        ? typeQuery.replace(
                            /_/g,
                            ' '
                          )
                        : initialCategory ||
                          'All'
                    )
              }

              <br className="hidden md:block" />

              <span className="
                text-transparent
                bg-clip-text
                bg-gradient-to-r
                from-[#1A1A1A]
                to-gray-500
                ml-2
                md:ml-0
              ">
                Items.
              </span>

            </h1>

          </div>


          {/* MOBILE FILTER BUTTON */}

          <button
            type="button"
            className="
              md:hidden
              flex
              items-center
              justify-center
              gap-2
              border
              border-black
              px-5
              py-3
              text-xs
              font-bold
              uppercase
              tracking-widest
              w-full
            "
            onClick={() =>
              setIsMobileFilterOpen(true)
            }
          >

            <SlidersHorizontal
              size={14}
            />

            Filters

            {(
              selectedCategories.length > 0 ||
              selectedColors.length > 0 ||
              selectedGender
            ) && (

              <span className="
                ml-1
                flex
                h-5
                min-w-5
                items-center
                justify-center
                rounded-full
                bg-[#9B4819]
                px-1.5
                text-[9px]
                text-white
              ">

                {
                  selectedCategories.length +
                  selectedColors.length +
                  (selectedGender ? 1 : 0)
                }

              </span>

            )}

          </button>

        </div>

      </div>


      {/* =====================================================
          MOBILE FILTER DRAWER
         ===================================================== */}

      {isMobileFilterOpen && (
        <>
          {/* Overlay */}

          <div
            className="
              fixed
              inset-0
              z-[400]
              bg-black/40
              backdrop-blur-sm
              md:hidden
            "
            onClick={() =>
              setIsMobileFilterOpen(false)
            }
          />


          {/* Drawer */}

          <div
            className="
              fixed
              bottom-0
              left-0
              right-0
              z-[410]
              max-h-[85vh]
              overflow-y-auto
              rounded-t-[24px]
              bg-white
              p-5
              shadow-2xl
              md:hidden
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* Drawer Header */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-[#1A1A1A]/10
                pb-5
              "
            >

              <div>

                <p
                  className="
                    text-[9px]
                    font-black
                    uppercase
                    tracking-[0.3em]
                    text-[#9B4819]
                  "
                >
                  DRAG CLOTHING
                </p>

                <h2
                  className="
                    mt-1
                    text-xl
                    font-black
                    uppercase
                    tracking-tight
                  "
                >
                  Filters
                </h2>

              </div>


              <button
                type="button"
                onClick={() =>
                  setIsMobileFilterOpen(false)
                }
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-gray-200
                  bg-white
                  active:scale-95
                "
                aria-label="Close filters"
              >
                <X size={18} />
              </button>

            </div>


            {/* =================================================
                GENDER
               ================================================= */}

            <div className="mt-7">

              <div
                className="
                  mb-4
                  flex
                  items-center
                  justify-between
                "
              >

                <h3
                  className="
                    text-xs
                    font-black
                    uppercase
                    tracking-[0.2em]
                  "
                >
                  Gender
                </h3>

                {selectedGender && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGender('');

                      syncFiltersToUrl(
                        selectedCategories,
                        selectedColors,
                        ''
                      );
                    }}
                    className="
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-widest
                      text-[#9B4819]
                    "
                  >
                    Clear
                  </button>
                )}

              </div>


              <div
                className="
                  grid
                  grid-cols-3
                  gap-2
                "
              >

                {FILTER_GENDERS.map(
                  (gender) => {
                    const isSelected =
                      selectedGender ===
                      gender;

                    return (
                      <button
                        key={
                          gender || 'ALL'
                        }
                        type="button"
                        onClick={() => {
                          setSelectedGender(
                            gender
                          );

                          syncFiltersToUrl(
                            selectedCategories,
                            selectedColors,
                            gender
                          );
                        }}
                        className={
                          isSelected
                            ? 'border border-[#1A1A1A] bg-[#1A1A1A] py-3 text-[10px] font-black uppercase tracking-widest text-white'
                            : 'border border-gray-200 bg-white py-3 text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]'
                        }
                      >
                        {gender || 'All'}
                      </button>
                    );
                  }
                )}

              </div>

            </div>


            {/* =================================================
                CATEGORY
               ================================================= */}

            <div className="mt-7">

              <div
                className="
                  mb-4
                  flex
                  items-center
                  justify-between
                "
              >

                <h3
                  className="
                    text-xs
                    font-black
                    uppercase
                    tracking-[0.2em]
                  "
                >
                  Category
                </h3>

                {selectedCategories.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const updated =
                        initialCategory
                          ? [initialCategory]
                          : [];

                      setSelectedCategories(
                        updated
                      );

                      syncFiltersToUrl(
                        updated,
                        selectedColors,
                        selectedGender
                      );
                    }}
                    className="
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-widest
                      text-[#9B4819]
                    "
                  >
                    Clear
                  </button>
                )}

              </div>


              <div
                className="
                  grid
                  grid-cols-2
                  gap-3
                "
              >

                {FILTER_CATEGORIES.map(
                  (cat) => {
                    const isSelected =
                      selectedCategories.includes(
                        cat
                      );

                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() =>
                          toggleFilter(
                            cat,
                            selectedCategories,
                            setSelectedCategories
                          )
                        }
                        className={
                          isSelected
                            ? 'min-h-[46px] border border-[#1A1A1A] bg-[#1A1A1A] px-3 text-left text-[10px] font-bold uppercase tracking-widest text-white'
                            : 'min-h-[46px] border border-gray-200 bg-white px-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]'
                        }
                      >
                        {cat}
                      </button>
                    );
                  }
                )}

              </div>

            </div>


            {/* =================================================
                COLOR
               ================================================= */}

            <div className="mt-8">

              <h3
                className="
                  mb-4
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.2em]
                "
              >
                Color
              </h3>


              <div
                className="
                  flex
                  flex-wrap
                  gap-4
                "
              >

                {FILTER_COLORS.map(
                  (color) => {
                    const isSelected =
                      selectedColors.includes(
                        color
                      );

                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() =>
                          toggleFilter(
                            color,
                            selectedColors,
                            setSelectedColors
                          )
                        }
                        aria-label={
                          `Filter by ${color}`
                        }
                        className={
                          isSelected
                            ? 'flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 ring-2 ring-black ring-offset-2'
                            : 'flex h-10 w-10 items-center justify-center rounded-full border border-gray-300'
                        }
                        style={{
                          backgroundColor:
                            color.toLowerCase(),
                        }}
                      >
                        {isSelected && (
                          <span
                            className="
                              h-2
                              w-2
                              rounded-full
                              bg-white
                              shadow
                            "
                          />
                        )}
                      </button>
                    );
                  }
                )}

              </div>

            </div>


            {/* =================================================
                ACTION BUTTONS
               ================================================= */}

            <div
              className="
                sticky
                bottom-0
                mt-9
                flex
                gap-3
                border-t
                border-[#1A1A1A]/10
                bg-white
                pt-5
              "
            >

              <button
                type="button"
                onClick={clearFilters}
                className="
                  flex-1
                  border
                  border-[#1A1A1A]
                  py-4
                  text-[10px]
                  font-black
                  uppercase
                  tracking-widest
                "
              >
                Clear
              </button>


              <button
                type="button"
                onClick={applyMobileFilters}
                className="
                  flex-[1.5]
                  bg-[#1A1A1A]
                  py-4
                  text-[10px]
                  font-black
                  uppercase
                  tracking-widest
                  text-white
                "
              >
                Apply Filters
              </button>

            </div>

          </div>
        </>
      )}


      {/* =====================================================
          MAIN CONTENT
         ===================================================== */}

      <div className="
        flex
        max-w-[1800px]
        mx-auto
        px-6
        md:px-10
        gap-10
      ">

        {/* ===================================================
            DESKTOP SIDEBAR
           =================================================== */}

        <aside className="
          hidden
          md:block
          w-64
          sticky
          top-32
          h-fit
          shrink-0
        ">

          <div className="space-y-8">

            {/* =================================================
                GENDER
               ================================================= */}

            <div>

              <h3 className="
                text-sm
                font-black
                uppercase
                tracking-widest
                mb-4
                border-b
                pb-2
              ">
                Gender
              </h3>


              {FILTER_GENDERS.map(
                (gender) => {

                  const isSelected =
                    selectedGender ===
                    gender;

                  return (
                    <label
                      key={
                        gender || 'ALL'
                      }
                      className="
                        flex
                        items-center
                        gap-3
                        cursor-pointer
                        mb-2
                      "
                    >

                      <input
                        type="radio"
                        name="desktop-gender-filter"
                        checked={isSelected}
                        onChange={() => {
                          setSelectedGender(
                            gender
                          );

                          syncFiltersToUrl(
                            selectedCategories,
                            selectedColors,
                            gender
                          );
                        }}
                        className="
                          accent-black
                          w-4
                          h-4
                        "
                      />


                      <span className="
                        text-xs
                        font-bold
                        uppercase
                        tracking-wider
                      ">
                        {
                          gender ||
                          'All'
                        }
                      </span>

                    </label>
                  );
                }
              )}

            </div>


            {/* =================================================
                CATEGORY
               ================================================= */}

            <div>

              <h3 className="
                text-sm
                font-black
                uppercase
                tracking-widest
                mb-4
                border-b
                pb-2
              ">
                Category
              </h3>


              {FILTER_CATEGORIES.map(
                (cat) => (

                  <label
                    key={cat}
                    className="
                      flex
                      items-center
                      gap-3
                      cursor-pointer
                      mb-2
                    "
                  >

                    <input
                      type="checkbox"
                      onChange={() =>
                        toggleFilter(
                          cat,
                          selectedCategories,
                          setSelectedCategories
                        )
                      }
                      checked={selectedCategories.includes(
                        cat
                      )}
                      className="
                        accent-black
                        w-4
                        h-4
                      "
                    />


                    <span className="
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                    ">
                      {cat}
                    </span>

                  </label>

                )
              )}

            </div>


            {/* =================================================
                COLOR
               ================================================= */}

            <div>

              <h3 className="
                text-sm
                font-black
                uppercase
                tracking-widest
                mb-4
                border-b
                pb-2
              ">
                Color
              </h3>


              <div className="
                flex
                flex-wrap
                gap-2
              ">

                {FILTER_COLORS.map(
                  (color) => (

                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        toggleFilter(
                          color,
                          selectedColors,
                          setSelectedColors
                        )
                      }
                      className={
                        selectedColors.includes(
                          color
                        )
                          ? 'w-6 h-6 rounded-full border border-gray-300 ring-2 ring-black ring-offset-2'
                          : 'w-6 h-6 rounded-full border border-gray-300'
                      }
                      style={{
                        backgroundColor:
                          color.toLowerCase(),
                      }}
                      title={color}
                    />

                  )
                )}

              </div>

            </div>

          </div>

        </aside>


        {/* ===================================================
            PRODUCT GRID
           =================================================== */}

        <div className="flex-1">

          {loading ? (

            <div className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
              gap-x-6
              gap-y-12
            ">

              {[...Array(8)].map(
                (_, i) => (
                  <SkeletonCard
                    key={i}
                  />
                )
              )}

            </div>

          ) : (

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
                gap-x-6
                gap-y-12
              "
            >

              {filteredProducts.map(
                (product) => (

                  <Link
                    to={`/product/${product.id}`}
                    key={
                      product.id ||
                      product._id
                    }
                    className="
                      group
                      cursor-pointer
                      block
                      h-full
                      flex
                      flex-col
                    "
                  >

                    <div className="
                      relative
                      aspect-[3/4]
                      bg-gray-200
                      mb-4
                      overflow-hidden
                      flex
                      items-center
                      justify-center
                    ">

                      {product.imageUrl ||
                      product.image ? (

                        <img
                          src={
                            product.imageUrl ||
                            product.image
                          }
                          alt={
                            product.name
                          }
                          className="
                            w-full
                            h-full
                            object-cover
                            transition-transform
                            duration-700
                            group-hover:scale-110
                          "
                        />

                      ) : (

                        <span className="
                          text-gray-400
                          font-black
                          uppercase
                          tracking-widest
                          text-xl
                          rotate-[-45deg]
                          opacity-50
                          px-4
                          text-center
                        ">
                          {product.name}
                        </span>

                      )}


                      <div className="
                        absolute
                        bottom-0
                        w-full
                        bg-white
                        py-3
                        text-center
                        text-xs
                        font-black
                        uppercase
                        translate-y-full
                        group-hover:translate-y-0
                        transition-transform
                        duration-300
                      ">
                        View Product
                      </div>


                      {/* LIKE */}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleLike(product);
                        }}
                        className="
                          absolute
                          top-4
                          right-4
                          w-8
                          h-8
                          bg-white
                          rounded-full
                          flex
                          items-center
                          justify-center
                          shadow
                          opacity-0
                          group-hover:opacity-100
                          transition-opacity
                        "
                      >

                        <Heart
                          size={14}
                          fill={
                            likedItems.some(
                              (l) =>
                                l.id ===
                                product.id
                            )
                              ? '#9B4819'
                              : 'none'
                          }
                          color={
                            likedItems.some(
                              (l) =>
                                l.id ===
                                product.id
                            )
                              ? '#9B4819'
                              : '#1A1A1A'
                          }
                        />

                      </button>

                    </div>


                    <div className="
                      flex
                      flex-col
                      flex-grow
                    ">

                      <h3 className="
                        text-sm
                        font-bold
                        uppercase
                        group-hover:text-[#9B4819]
                        transition-colors
                      ">
                        {product.name}
                      </h3>


                      <p className="
                        text-[10px]
                        text-gray-500
                        uppercase
                        tracking-widest
                        mt-1
                      ">
                        {
                          product.type
                            ? product.type.replace(
                                /_/g,
                                ' '
                              )
                            : (
                              product.category?.name ||
                              product.category ||
                              ''
                            )
                        }
                      </p>


                      <div className="
                        flex
                        items-center
                        gap-2
                        mt-auto
                        pt-2
                      ">

                        {product.hasFlashSale ? (

                          <>

                            <span className="
                              text-sm
                              font-black
                              text-[#9B4819]
                            ">
                              ₹
                              {Number(
                                product.discountedPrice
                              ).toLocaleString(
                                'en-IN'
                              )}
                            </span>


                            <span className="
                              text-xs
                              text-gray-400
                              line-through
                            ">
                              ₹
                              {Number(
                                product.originalPrice
                              ).toLocaleString(
                                'en-IN'
                              )}
                            </span>


                            <span className="
                              text-[9px]
                              font-black
                              text-green-600
                            ">
                              {
                                product.discountPercentage
                              }%
                              OFF
                            </span>

                          </>

                        ) : (

                          <span className="
                            text-sm
                            font-black
                          ">
                            ₹
                            {Number(
                              product.price
                            ).toLocaleString(
                              'en-IN'
                            )}
                          </span>

                        )}

                      </div>

                    </div>

                  </Link>

                )
              )}

            </motion.div>

          )}


          {/* =================================================
              EMPTY STATE
             ================================================= */}

          {!loading &&
            filteredProducts.length === 0 && (

              <div className="
                py-20
                text-center
              ">

                <p className="
                  text-gray-400
                  font-bold
                  uppercase
                  tracking-widest
                  mb-4
                ">
                  No products found.
                </p>

                <Link
                  to={`/category/${genderQuery || ''}`}
                  className="
                    text-[#9B4819]
                    text-xs
                    font-bold
                    uppercase
                    tracking-widest
                    border-b
                    border-[#9B4819]
                  "
                >
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