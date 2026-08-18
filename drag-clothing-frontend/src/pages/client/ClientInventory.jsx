import React, {
  useEffect,
  useState,
} from 'react';

import {
  Search,
  Loader2,
  X,
  AlertCircle,
  Edit2,
  Package,
  RefreshCw,
} from 'lucide-react';

import {
  motion,
  AnimatePresence,
} from 'framer-motion';

import api from '../../api/axios';

const LOW_STOCK_LIMIT = 5;

const ClientInventory = () => {
  const [products, setProducts] =
    useState([]);

  const [variants, setVariants] =
    useState([]);

  // productId -> low stock variant count
  const [
    productLowStockCounts,
    setProductLowStockCounts,
  ] = useState({});

  const [searchTerm, setSearchTerm] =
    useState('');

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [productImages, setProductImages] =
    useState({});

  const [isLoading, setIsLoading] =
    useState(false);

  const [isUpdating, setIsUpdating] =
    useState(false);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [selectedVariant, setSelectedVariant] =
    useState(null);

  const [newStock, setNewStock] =
    useState('');

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');

  // =========================================================
  // GET LOW STOCK COUNT FOR PRODUCT
  // =========================================================

  const getProductLowStockCount =
    async (productId) => {
      if (!productId) {
        return 0;
      }

      try {
        const res = await api.get(
          `/client/product-variants/${productId}`
        );

        const data =
          Array.isArray(
            res?.data?.data
          )
            ? res.data.data
            : Array.isArray(
                res?.data
              )
              ? res.data
              : [];

        return data.filter(
          (variant) =>
            Number(
              variant?.stock
            ) <= LOW_STOCK_LIMIT
        ).length;

      } catch (err) {
        console.error(
          `Failed to check stock for product ${productId}:`,
          err?.response?.data ||
            err
        );

        return 0;
      }
    };

  // =========================================================
  // FETCH PRODUCTS + IMAGES + LOW STOCK
  // =========================================================

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError('');

      const res = await api.get(
        '/client/products'
      );

      const data =
        Array.isArray(
          res?.data?.data
        )
          ? res.data.data
          : Array.isArray(
              res?.data
            )
            ? res.data
            : [];

      // -------------------------------------------------------
      // FETCH IMAGE + LOW STOCK COUNT
      // -------------------------------------------------------

      const productsWithData =
        await Promise.all(
          data.map(
            async (product) => {
              const productId =
                product?.productId ||
                product?.id;

              let imageUrl = '';
              let lowStockCount = 0;

              // -------------------------------------------------
              // IMAGE
              // -------------------------------------------------

              if (productId) {
                try {
                  const imageRes =
                    await api.get(
                      `/products/${productId}/images`
                    );

                  const media =
                    Array.isArray(
                      imageRes?.data?.data
                    )
                      ? imageRes.data.data
                      : Array.isArray(
                          imageRes?.data
                        )
                        ? imageRes.data
                        : [];

                  imageUrl =
                    media?.[0]
                      ?.imageUrl ||
                    media?.[0]?.url ||
                    '';

                } catch (
                  imageError
                ) {
                  console.error(
                    `Failed to fetch image for ${productId}:`,
                    imageError?.response
                      ?.data ||
                      imageError
                  );
                }

                // -------------------------------------------------
                // LOW STOCK
                // -------------------------------------------------

                lowStockCount =
                  await getProductLowStockCount(
                    productId
                  );
              }

              return {
                ...product,
                imageUrl,
                lowStockCount,
              };
            }
          )
        );

      setProducts(
        productsWithData
      );

      // -------------------------------------------------------
      // IMAGE MAP
      // -------------------------------------------------------

      const imageMap = {};

      productsWithData.forEach(
        (product) => {
          const productId =
            product?.productId ||
            product?.id;

          if (
            productId &&
            product?.imageUrl
          ) {
            imageMap[productId] =
              product.imageUrl;
          }
        }
      );

      setProductImages(
        imageMap
      );

      // -------------------------------------------------------
      // LOW STOCK MAP
      // -------------------------------------------------------

      const lowStockMap = {};

      productsWithData.forEach(
        (product) => {
          const productId =
            product?.productId ||
            product?.id;

          if (productId) {
            lowStockMap[productId] =
              Number(
                product?.lowStockCount ||
                  0
              );
          }
        }
      );

      setProductLowStockCounts(
        lowStockMap
      );

      // Do not auto-open a product
      setSelectedProduct(null);
      setVariants([]);

    } catch (err) {
      console.error(
        '❌ Fetch client products failed:',
        err?.response?.data ||
          err
      );

      let message =
        err?.response?.data
          ?.message ||
        'Failed to fetch products.';

      if (
        Array.isArray(message)
      ) {
        message = message[0];
      }

      setError(
        String(message)
      );

    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================
  // FETCH VARIANTS
  // =========================================================

  const fetchVariants = async (
    productId
  ) => {
    if (!productId) {
      setVariants([]);
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const res = await api.get(
        `/client/product-variants/${productId}`
      );

      const data =
        Array.isArray(
          res?.data?.data
        )
          ? res.data.data
          : Array.isArray(
              res?.data
            )
            ? res.data
            : [];

      setVariants(data);

      // -------------------------------------------------------
      // UPDATE LOW STOCK COUNT
      // -------------------------------------------------------

      const count =
        data.filter(
          (variant) =>
            Number(
              variant?.stock
            ) <= LOW_STOCK_LIMIT
        ).length;

      setProductLowStockCounts(
        (prev) => ({
          ...prev,
          [productId]: count,
        })
      );

      // Also keep product data updated
      setProducts(
        (prev) =>
          prev.map(
            (product) => {
              const id =
                product?.productId ||
                product?.id;

              if (
                id === productId
              ) {
                return {
                  ...product,
                  lowStockCount:
                    count,
                };
              }

              return product;
            }
          )
      );

    } catch (err) {
      console.error(
        '❌ Fetch product variants failed:',
        err?.response?.data ||
          err
      );

      setVariants([]);

      let message =
        err?.response?.data
          ?.message ||
        'Failed to fetch product stock.';

      if (
        Array.isArray(message)
      ) {
        message = message[0];
      }

      setError(
        String(message)
      );

    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchProducts();
  }, []);

  // =========================================================
  // SELECTED PRODUCT CHANGE
  // =========================================================

  useEffect(() => {
    const productId =
      selectedProduct?.productId ||
      selectedProduct?.id;

    if (productId) {
      fetchVariants(
        productId
      );
    } else {
      setVariants([]);
    }
  }, [selectedProduct]);

  // =========================================================
  // PRODUCT CLICK
  // =========================================================

  const handleProductClick = (
    product
  ) => {
    const productId =
      product?.productId ||
      product?.id;

    const selectedId =
      selectedProduct?.productId ||
      selectedProduct?.id;

    if (
      selectedId === productId
    ) {
      setSelectedProduct(
        null
      );

      setVariants([]);
      setError('');

      return;
    }

    setError('');
    setSuccess('');

    setSelectedProduct(
      product
    );
  };

  // =========================================================
  // OPEN STOCK MODAL
  // =========================================================

  const openStockModal = (
    variant
  ) => {
    setSelectedVariant(
      variant
    );

    setNewStock(
      String(
        Number(
          variant?.stock
        ) || 0
      )
    );

    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  // =========================================================
  // CLOSE STOCK MODAL
  // =========================================================

  const closeStockModal = () => {
    if (isUpdating) {
      return;
    }

    setIsModalOpen(false);

    setSelectedVariant(
      null
    );

    setNewStock('');

    setError('');
    setSuccess('');
  };

  // =========================================================
  // UPDATE STOCK
  // =========================================================

  const handleStockUpdate =
    async (e) => {
      e.preventDefault();

      if (
        !selectedVariant?.id
      ) {
        setError(
          'Variant ID is missing.'
        );

        return;
      }

      const stockValue =
        Number(newStock);

      if (
        !Number.isInteger(
          stockValue
        ) ||
        stockValue < 0
      ) {
        setError(
          'Stock must be a valid number greater than or equal to 0.'
        );

        return;
      }

      try {
        setIsUpdating(true);
        setError('');
        setSuccess('');

        await api.put(
          `/client/product-variants/${selectedVariant.id}`,
          {
            stock:
              stockValue,
          }
        );

        setSuccess(
          'Stock updated successfully.'
        );

        const productId =
          selectedProduct?.productId ||
          selectedProduct?.id;

        await fetchVariants(
          productId
        );

        setTimeout(() => {
          setIsModalOpen(false);

          setSelectedVariant(
            null
          );

          setNewStock('');

          setSuccess('');
        }, 700);

      } catch (err) {
        console.error(
          '❌ Update stock failed:',
          err?.response?.data ||
            err
        );

        let message =
          err?.response?.data
            ?.message ||
          'Failed to update stock.';

        if (
          Array.isArray(message)
        ) {
          message =
            message[0];
        }

        setError(
          String(message)
        );

      } finally {
        setIsUpdating(false);
      }
    };

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredProducts =
    products.filter(
      (product) =>
        String(
          product?.name || ''
        )
          .toLowerCase()
          .includes(
            searchTerm
              .toLowerCase()
          )
    );

  // =========================================================
  // SELECTED PRODUCT LOW STOCK COUNT
  // =========================================================

  const lowStockCount =
    variants.filter(
      (variant) =>
        Number(
          variant?.stock
        ) <= LOW_STOCK_LIMIT
    ).length;

  // =========================================================
  // GET IMAGE
  // =========================================================

  const getProductImage = (
    product
  ) => {
    const productId =
      product?.productId ||
      product?.id;

    return (
      productImages[
        productId
      ] ||
      product?.imageUrl ||
      product?.images?.[0] ||
      ''
    );
  };

  // =========================================================
  // NORMALIZE IMAGE URL
  // =========================================================

  const normalizeImageUrl = (
    url
  ) => {
    if (!url) {
      return '';
    }

    if (
      url.startsWith(
        'http://'
      ) ||
      url.startsWith(
        'https://'
      )
    ) {
      return url;
    }

    if (
      url.startsWith('/')
    ) {
      return `${import.meta.env.VITE_API_URL}${url}`;
    }

    return url;
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      className="
        space-y-8
        animate-fade-in
        p-4
      "
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          flex
          flex-col
          md:flex-row
          md:justify-between
          md:items-center
          gap-5
          border-b
          border-gray-200
          pb-8
        "
      >

        <div>

          <h1
            className="
              text-4xl
              font-black
              uppercase
              tracking-tighter
              text-[#111]
            "
          >
            Product Stock
          </h1>

          <p
            className="
              text-gray-500
              text-[10px]
              font-bold
              uppercase
              tracking-[0.3em]
              mt-1
            "
          >
            Manage Product & Variant Stock
          </p>

        </div>

        <button
          type="button"
          onClick={() => {
            const productId =
              selectedProduct?.productId ||
              selectedProduct?.id;

            if (productId) {
              fetchVariants(
                productId
              );
            } else {
              fetchProducts();
            }
          }}
          disabled={isLoading}
          className="
            bg-[#1A1A1A]
            text-white
            px-6
            py-3
            rounded-2xl
            hover:bg-[#9B4819]
            transition-all
            flex
            items-center
            justify-center
            gap-2
            font-bold
            uppercase
            text-[10px]
            shadow-xl
            disabled:opacity-50
          "
        >

          <RefreshCw
            size={15}
            className={
              isLoading
                ? 'animate-spin'
                : ''
            }
          />

          Refresh Stock

        </button>

      </div>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div
        className="
          relative
          w-full
          md:w-96
        "
      >

        <Search
          className="
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-gray-300
          "
          size={18}
        />

        <input
          type="text"
          placeholder="SEARCH PRODUCT..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(
              e.target.value
            )
          }
          className="
            w-full
            bg-white
            border
            border-[#EEE]
            rounded-2xl
            py-4
            pl-12
            pr-6
            text-[10px]
            font-bold
            uppercase
            outline-none
            focus:border-[#1A1A1A]
            transition-all
          "
        />

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error &&
        !isModalOpen && (
          <div
            className="
              bg-red-50
              border
              border-red-100
              text-red-600
              rounded-2xl
              p-4
              text-[10px]
              font-bold
              uppercase
              flex
              items-center
              gap-2
            "
          >

            <AlertCircle
              size={15}
            />

            {error}

          </div>
        )}

      {/* =====================================================
          PRODUCT LIST
      ===================================================== */}

      <div
        className="
          bg-white
          rounded-[2.5rem]
          border
          border-[#EEE]
          overflow-hidden
          shadow-sm
        "
      >

        {filteredProducts.length ===
        0 ? (

          <div
            className="
              py-20
              text-center
            "
          >

            <Package
              size={32}
              className="
                mx-auto
                text-gray-300
              "
            />

            <p
              className="
                text-[10px]
                font-black
                uppercase
                tracking-widest
                text-gray-400
                mt-4
              "
            >
              No products found
            </p>

          </div>

        ) : (

          <div
            className="
              divide-y
              divide-[#F5F5F5]
            "
          >

            {filteredProducts.map(
              (product) => {

                const productId =
                  product?.productId ||
                  product?.id;

                const selectedId =
                  selectedProduct?.productId ||
                  selectedProduct?.id;

                const isSelected =
                  selectedId ===
                  productId;

                const imageUrl =
                  getProductImage(
                    product
                  );

                // -------------------------------------------------
                // PRODUCT LEVEL LOW STOCK ALERT
                // -------------------------------------------------

                const productLowStockCount =
                  Number(
                    productLowStockCounts[
                      productId
                    ] ??
                    product?.lowStockCount ??
                    0
                  );

                const hasLowStock =
                  productLowStockCount >
                  0;

                return (
                  <React.Fragment
                    key={productId}
                  >

                    {/* =================================================
                        PRODUCT ROW
                    ================================================= */}

                    <button
                      type="button"
                      onClick={() =>
                        handleProductClick(
                          product
                        )
                      }
                      className={`
                        w-full
                        px-6
                        md:px-8
                        py-5
                        flex
                        items-center
                        justify-between
                        text-left
                        transition-all
                        ${
                          isSelected
                            ? 'bg-[#FAFAFA]'
                            : 'hover:bg-[#FAFAFA]'
                        }
                      `}
                    >

                      <div
                        className="
                          flex
                          items-center
                          gap-4
                        "
                      >

                        {/* PRODUCT IMAGE */}

                        <div
                          className="
                            w-14
                            h-14
                            rounded-2xl
                            bg-[#F5F5F5]
                            overflow-hidden
                            flex
                            items-center
                            justify-center
                            shrink-0
                            border
                            border-[#EEEEEE]
                          "
                        >

                          {imageUrl ? (

                            <img
                              src={normalizeImageUrl(
                                imageUrl
                              )}
                              alt={
                                product?.name ||
                                'Product'
                              }
                              className="
                                w-full
                                h-full
                                object-cover
                              "
                              onError={(
                                e
                              ) => {
                                e.currentTarget.onerror =
                                  null;

                                e.currentTarget.src =
                                  'https://via.placeholder.com/120x120?text=No+Image';
                              }}
                            />

                          ) : (

                            <Package
                              size={18}
                              className="
                                text-[#555]
                              "
                            />

                          )}

                        </div>

                        {/* PRODUCT NAME + RED DOT */}

                        <div>

                          <div
                            className="
                              flex
                              items-center
                              gap-2
                            "
                          >

                            <h3
                              className="
                                font-black
                                uppercase
                                text-sm
                                text-[#111]
                              "
                            >
                              {product?.name}
                            </h3>

                            {/* RED PULSING DOT */}

                            {hasLowStock && (
                              <span
                                className="
                                  relative
                                  flex
                                  h-3
                                  w-3
                                  shrink-0
                                "
                                title={`${productLowStockCount} Low Stock Variant${
                                  productLowStockCount >
                                  1
                                    ? 's'
                                    : ''
                                }`}
                              >

                                <span
                                  className="
                                    absolute
                                    inline-flex
                                    h-full
                                    w-full
                                    rounded-full
                                    bg-red-400
                                    opacity-75
                                    animate-ping
                                  "
                                />

                                <span
                                  className="
                                    relative
                                    inline-flex
                                    h-3
                                    w-3
                                    rounded-full
                                    bg-red-600
                                    border
                                    border-red-700
                                  "
                                />

                              </span>
                            )}

                          </div>

                          <p
                            className="
                              text-[9px]
                              text-gray-400
                              font-bold
                              uppercase
                              tracking-[0.15em]
                              mt-1
                            "
                          >

                            {product?.type ||
                              'PRODUCT'}

                            {product?.gender
                              ? ` • ${product.gender}`
                              : ''}

                          </p>

                          {/* STOCK ALERT TEXT */}

                          {hasLowStock && (
                            <p
                              className="
                                text-[8px]
                                text-red-500
                                font-black
                                uppercase
                                tracking-widest
                                mt-1
                              "
                            >
                              Stock Alert
                            </p>
                          )}

                        </div>

                      </div>

                      <span
                        className={`
                          text-gray-400
                          text-2xl
                          transition-transform
                          ${
                            isSelected
                              ? 'rotate-90'
                              : ''
                          }
                        `}
                      >
                        ›
                      </span>

                    </button>

                    {/* =================================================
                        INLINE VARIANTS
                    ================================================= */}

                    {isSelected && (

                      <div
                        className="
                          bg-[#FAFAFA]
                          border-t
                          border-[#F0F0F0]
                        "
                      >

                        {/* PRODUCT HEADER */}

                        <div
                          className="
                            px-6
                            md:px-8
                            py-5
                            flex
                            flex-col
                            md:flex-row
                            md:justify-between
                            md:items-center
                            gap-4
                            border-b
                            border-[#EEEEEE]
                          "
                        >

                          <div
                            className="
                              flex
                              items-center
                              gap-4
                            "
                          >

                            <div
                              className="
                                w-12
                                h-12
                                rounded-xl
                                overflow-hidden
                                bg-gray-100
                                border
                                border-gray-200
                                shrink-0
                              "
                            >

                              {imageUrl ? (

                                <img
                                  src={normalizeImageUrl(
                                    imageUrl
                                  )}
                                  alt={
                                    product?.name ||
                                    'Product'
                                  }
                                  className="
                                    w-full
                                    h-full
                                    object-cover
                                  "
                                  onError={(
                                    e
                                  ) => {
                                    e.currentTarget.onerror =
                                      null;

                                    e.currentTarget.src =
                                      'https://via.placeholder.com/120x120?text=No+Image';
                                  }}
                                />

                              ) : (

                                <div
                                  className="
                                    w-full
                                    h-full
                                    flex
                                    items-center
                                    justify-center
                                  "
                                >

                                  <Package
                                    size={18}
                                    className="
                                      text-gray-400
                                    "
                                  />

                                </div>

                              )}

                            </div>

                            <div>

                              <p
                                className="
                                  text-[8px]
                                  font-black
                                  uppercase
                                  tracking-[0.25em]
                                  text-gray-400
                                "
                              >
                                Product Variants
                              </p>

                              <div
                                className="
                                  flex
                                  items-center
                                  gap-2
                                "
                              >

                                <h2
                                  className="
                                    text-lg
                                    font-black
                                    uppercase
                                    tracking-tight
                                    text-[#111]
                                    mt-1
                                  "
                                >
                                  {product?.name}
                                </h2>

                                {lowStockCount >
                                  0 && (
                                  <span
                                    className="
                                      h-2.5
                                      w-2.5
                                      rounded-full
                                      bg-red-600
                                      animate-pulse
                                      mt-1
                                    "
                                  />
                                )}

                              </div>

                            </div>

                          </div>

                          {/* LOW STOCK SUMMARY */}

                          {lowStockCount >
                            0 && (

                            <div
                              className="
                                flex
                                items-center
                                gap-2
                                bg-red-50
                                text-red-600
                                px-4
                                py-3
                                rounded-2xl
                              "
                            >

                              <AlertCircle
                                size={14}
                              />

                              <span
                                className="
                                  text-[8px]
                                  font-black
                                  uppercase
                                  tracking-widest
                                "
                              >

                                {
                                  lowStockCount
                                }{' '}

                                Low Stock Variant
                                {lowStockCount >
                                1
                                  ? 's'
                                  : ''}

                              </span>

                            </div>

                          )}

                        </div>

                        {/* =================================================
                            VARIANT TABLE
                        ================================================= */}

                        <div
                          className="
                            overflow-x-auto
                          "
                        >

                          {isLoading ? (

                            <div
                              className="
                                py-16
                                flex
                                justify-center
                              "
                            >

                              <Loader2
                                size={28}
                                className="
                                  animate-spin
                                  text-gray-400
                                "
                              />

                            </div>

                          ) : variants.length ===
                            0 ? (

                            <div
                              className="
                                py-16
                                text-center
                              "
                            >

                              <Package
                                size={28}
                                className="
                                  mx-auto
                                  text-gray-300
                                "
                              />

                              <p
                                className="
                                  text-[9px]
                                  font-black
                                  uppercase
                                  tracking-widest
                                  text-gray-400
                                  mt-4
                                "
                              >
                                No variants found
                              </p>

                            </div>

                          ) : (

                            <table
                              className="
                                w-full
                                text-left
                              "
                            >

                              <thead>

                                <tr
                                  className="
                                    border-b
                                    border-[#EEEEEE]
                                  "
                                >

                                  <th
                                    className="
                                      p-5
                                      text-[9px]
                                      font-black
                                      uppercase
                                      tracking-[0.2em]
                                      text-gray-400
                                    "
                                  >
                                    Size
                                  </th>

                                  <th
                                    className="
                                      p-5
                                      text-[9px]
                                      font-black
                                      uppercase
                                      tracking-[0.2em]
                                      text-gray-400
                                    "
                                  >
                                    Color
                                  </th>

                                  <th
                                    className="
                                      p-5
                                      text-[9px]
                                      font-black
                                      uppercase
                                      tracking-[0.2em]
                                      text-gray-400
                                    "
                                  >
                                    Price
                                  </th>

                                  <th
                                    className="
                                      p-5
                                      text-[9px]
                                      font-black
                                      uppercase
                                      tracking-[0.2em]
                                      text-gray-400
                                    "
                                  >
                                    Stock
                                  </th>

                                  <th
                                    className="
                                      p-5
                                      text-[9px]
                                      font-black
                                      uppercase
                                      tracking-[0.2em]
                                      text-gray-400
                                      text-right
                                    "
                                  >
                                    Action
                                  </th>

                                </tr>

                              </thead>

                              <tbody
                                className="
                                  divide-y
                                  divide-[#EEEEEE]
                                "
                              >

                                {variants.map(
                                  (
                                    variant
                                  ) => {

                                    const stock =
                                      Number(
                                        variant?.stock
                                      ) || 0;

                                    const isLowStock =
                                      stock <=
                                      LOW_STOCK_LIMIT;

                                    return (

                                      <tr
                                        key={
                                          variant?.id
                                        }
                                        className={`
                                          transition-colors
                                          ${
                                            isLowStock
                                              ? 'bg-red-50/40'
                                              : 'hover:bg-white'
                                          }
                                        `}
                                      >

                                        {/* SIZE */}

                                        <td
                                          className="
                                            p-5
                                          "
                                        >

                                          <span
                                            className="
                                              font-black
                                              uppercase
                                              text-sm
                                              text-[#111]
                                            "
                                          >
                                            {variant?.size ||
                                              '-'}
                                          </span>

                                        </td>

                                        {/* COLOR */}

                                        <td
                                          className="
                                            p-5
                                          "
                                        >

                                          <span
                                            className="
                                              text-[10px]
                                              font-bold
                                              uppercase
                                              tracking-widest
                                              text-gray-500
                                            "
                                          >
                                            {variant?.color ||
                                              '-'}
                                          </span>

                                        </td>

                                        {/* PRICE */}

                                        <td
                                          className="
                                            p-5
                                          "
                                        >

                                          <span
                                            className="
                                              font-mono
                                              font-bold
                                              text-sm
                                            "
                                          >
                                            ₹
                                            {Number(
                                              variant?.price ||
                                                0
                                            ).toLocaleString(
                                              'en-IN'
                                            )}
                                          </span>

                                        </td>

                                        {/* STOCK */}

                                        <td
                                          className="
                                            p-5
                                          "
                                        >

                                          <div
                                            className="
                                              flex
                                              items-center
                                              gap-3
                                            "
                                          >

                                            <span
                                              className={`
                                                font-mono
                                                font-black
                                                text-sm
                                                ${
                                                  isLowStock
                                                    ? 'text-red-600'
                                                    : 'text-[#111]'
                                                }
                                              `}
                                            >
                                              {stock}{' '}
                                              Units
                                            </span>

                                            {isLowStock && (

                                              <span
                                                className="
                                                  flex
                                                  items-center
                                                  gap-1
                                                  bg-red-100
                                                  text-red-600
                                                  text-[8px]
                                                  px-2
                                                  py-1
                                                  rounded-lg
                                                  font-black
                                                  uppercase
                                                  tracking-widest
                                                "
                                              >

                                                <AlertCircle
                                                  size={10}
                                                />

                                                Low Stock

                                              </span>

                                            )}

                                          </div>

                                        </td>

                                        {/* ACTION */}

                                        <td
                                          className="
                                            p-5
                                            text-right
                                          "
                                        >

                                          <button
                                            type="button"
                                            onClick={() =>
                                              openStockModal(
                                                variant
                                              )
                                            }
                                            className="
                                              inline-flex
                                              items-center
                                              gap-2
                                              px-4
                                              py-3
                                              bg-white
                                              hover:bg-[#1A1A1A]
                                              hover:text-white
                                              rounded-xl
                                              transition-all
                                              text-[#111]
                                              text-[9px]
                                              font-black
                                              uppercase
                                              border
                                              border-[#EEEEEE]
                                            "
                                          >

                                            <Edit2
                                              size={14}
                                            />

                                            Update Stock

                                          </button>

                                        </td>

                                      </tr>

                                    );
                                  }
                                )}

                              </tbody>

                            </table>

                          )}

                        </div>

                      </div>

                    )}

                  </React.Fragment>
                );
              }
            )}

          </div>

        )}

      </div>

      {/* =====================================================
          UPDATE STOCK MODAL
      ===================================================== */}

      <AnimatePresence>

        {isModalOpen &&
          selectedVariant && (

            <div
              className="
                fixed
                inset-0
                z-[100]
                flex
                items-center
                justify-center
                p-4
              "
            >

              {/* BACKDROP */}

              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                onClick={
                  closeStockModal
                }
                className="
                  absolute
                  inset-0
                  bg-black/60
                  backdrop-blur-md
                "
              />

              {/* MODAL */}

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                }}
                className="
                  relative
                  bg-white
                  w-full
                  max-w-xl
                  rounded-[3rem]
                  p-8
                  md:p-12
                  shadow-2xl
                "
              >

                <div
                  className="
                    flex
                    justify-between
                    items-start
                    mb-8
                  "
                >

                  <div>

                    <p
                      className="
                        text-[9px]
                        font-black
                        uppercase
                        tracking-[0.25em]
                        text-gray-400
                      "
                    >
                      Update Product Stock
                    </p>

                    <h2
                      className="
                        text-3xl
                        font-black
                        uppercase
                        tracking-tighter
                        mt-1
                      "
                    >

                      {selectedVariant?.size ||
                        '-'}

                      {' / '}

                      {selectedVariant?.color ||
                        '-'}

                    </h2>

                  </div>

                  <button
                    type="button"
                    onClick={
                      closeStockModal
                    }
                    disabled={
                      isUpdating
                    }
                    className="
                      p-2
                      hover:bg-gray-100
                      rounded-xl
                    "
                  >
                    <X size={24} />
                  </button>

                </div>

                {error && (

                  <div
                    className="
                      bg-red-50
                      text-red-600
                      text-[10px]
                      font-bold
                      uppercase
                      p-4
                      rounded-2xl
                      mb-6
                      text-center
                      border
                      border-red-100
                      flex
                      items-center
                      justify-center
                      gap-2
                    "
                  >

                    <AlertCircle
                      size={14}
                    />

                    {error}

                  </div>

                )}

                {success && (

                  <div
                    className="
                      bg-green-50
                      text-green-600
                      text-[10px]
                      font-bold
                      uppercase
                      p-4
                      rounded-2xl
                      mb-6
                      text-center
                      border
                      border-green-100
                    "
                  >
                    {success}
                  </div>

                )}

                <form
                  onSubmit={
                    handleStockUpdate
                  }
                  className="
                    space-y-6
                  "
                >

                  {/* CURRENT STOCK */}

                  <div
                    className="
                      bg-[#F7F7F7]
                      rounded-2xl
                      p-5
                    "
                  >

                    <p
                      className="
                        text-[9px]
                        font-black
                        uppercase
                        tracking-widest
                        text-gray-400
                      "
                    >
                      Current Stock
                    </p>

                    <p
                      className={`
                        text-3xl
                        font-black
                        mt-1
                        ${
                          Number(
                            selectedVariant?.stock
                          ) <=
                          LOW_STOCK_LIMIT
                            ? 'text-red-600'
                            : 'text-[#111]'
                        }
                      `}
                    >
                      {Number(
                        selectedVariant?.stock
                      ) || 0}
                    </p>

                  </div>

                  {/* NEW STOCK */}

                  <div>

                    <label
                      className="
                        block
                        text-[9px]
                        font-black
                        uppercase
                        tracking-widest
                        text-gray-400
                        mb-2
                      "
                    >
                      New Stock Quantity
                    </label>

                    <input
                      required
                      type="number"
                      min="0"
                      value={
                        newStock
                      }
                      onChange={(
                        e
                      ) =>
                        setNewStock(
                          e.target.value
                        )
                      }
                      placeholder="ENTER STOCK"
                      className="
                        w-full
                        bg-[#FAFAFA]
                        rounded-2xl
                        p-5
                        text-[11px]
                        font-bold
                        outline-none
                        border
                        border-transparent
                        focus:border-gray-200
                      "
                    />

                    <p
                      className="
                        text-[9px]
                        text-gray-400
                        font-bold
                        uppercase
                        mt-2
                      "
                    >
                      Enter the final stock quantity.
                    </p>

                  </div>

                  {/* SUBMIT */}

                  <button
                    type="submit"
                    disabled={
                      isUpdating
                    }
                    className="
                      w-full
                      bg-[#1A1A1A]
                      hover:bg-[#9B4819]
                      text-white
                      py-6
                      rounded-2xl
                      text-[10px]
                      font-black
                      uppercase
                      transition-all
                      shadow-xl
                      disabled:opacity-50
                    "
                  >

                    {isUpdating ? (

                      <Loader2
                        className="
                          animate-spin
                          mx-auto
                        "
                      />

                    ) : (

                      'Update Stock'

                    )}

                  </button>

                </form>

              </motion.div>

            </div>

          )}

      </AnimatePresence>

    </div>
  );
};

export default ClientInventory;