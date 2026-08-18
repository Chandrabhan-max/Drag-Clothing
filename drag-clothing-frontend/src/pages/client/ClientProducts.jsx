import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Package,
  X,
  Loader2,
  Power,
  PowerOff,
  AlertTriangle,
  RefreshCcw,
  Edit2,
  Tag,
  Users as UsersIcon,
  Trash2,
  Layers,
  Image as ImageIcon,
  Link as LinkIcon,
  Archive,
} from 'lucide-react';
import api from '../../api/axios';

const ClientProducts = () => {
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState('live');
  const [searchTerm, setSearchTerm] = useState('');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productStocks, setProductStocks] = useState({});
  const [productImages, setProductImages] = useState({});
  const [productTypes, setProductTypes] = useState([]);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  const [modalMode, setModalMode] = useState('add');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Media Upload States
  const [selectedFile, setSelectedFile] = useState(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState('file');
  const [mediaItems, setMediaItems] = useState([]);

  // Drag & Drop State
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    type: '',
    gender: 'UNISEX',
  });

  // =========================================================
  // INITIAL LOAD
  // =========================================================
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchProductTypes();
  }, []);

  // =========================================================
  // FETCH PRODUCTS + IMAGES + TOTAL STOCK
  // =========================================================
  const fetchProducts = async () => {
    try {
      setIsLoading(true);

      const res = await api.get('/client/products');

      const productData = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : [];

      setProducts(productData);

      const stockMap = {};
      const imageMap = {};

      await Promise.all(
        productData.map(async (product) => {
          const productId =
            product.productId || product.id;

          if (!productId) return;

          // -------------------------------------------------
          // FETCH PRODUCT IMAGES
          // -------------------------------------------------
          try {
            const imageRes = await api.get(
              `/products/${productId}/images`
            );

            const media = Array.isArray(imageRes.data?.data)
              ? imageRes.data.data
              : Array.isArray(imageRes.data)
                ? imageRes.data
                : [];

            const firstImage =
              media[0]?.imageUrl ||
              media[0]?.url ||
              '';

            if (firstImage) {
              imageMap[productId] = firstImage;
            }
          } catch (imageError) {
            console.error(
              `Failed to fetch image for ${productId}:`,
              imageError?.response?.data || imageError
            );
          }

          // -------------------------------------------------
          // FETCH VARIANTS + TOTAL STOCK
          // -------------------------------------------------
          try {
            const variantRes = await api.get(
              `/client/product-variants/${productId}`
            );

            const variants = Array.isArray(
              variantRes.data?.data
            )
              ? variantRes.data.data
              : [];

            stockMap[productId] = variants.reduce(
              (total, variant) =>
                total + Number(variant.stock || 0),
              0
            );
          } catch (variantError) {
            console.error(
              `Failed to fetch stock for ${productId}:`,
              variantError?.response?.data ||
                variantError
            );

            stockMap[productId] = 0;
          }
        })
      );

      setProductStocks(stockMap);
      setProductImages(imageMap);
    } catch (error) {
      console.error(
        'Fetch products failed:',
        error?.response?.data || error
      );
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================
  // FETCH CATEGORIES
  // =========================================================
  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');

      const fetchedCats =
        res.data?.data || res.data || [];

      setCategories(
        Array.isArray(fetchedCats)
          ? fetchedCats
          : []
      );
    } catch (error) {
      console.error(
        'Fetch categories failed:',
        error
      );
    }
  };

  // =========================================================
  // FETCH PRODUCT TYPES
  // =========================================================
  const fetchProductTypes = async () => {
    try {
      const res = await api.get(
        '/client/products/types'
      );

      setProductTypes(
        res.data?.data ||
          res.data ||
          []
      );
    } catch (error) {
      console.error(
        'Fetch types failed:',
        error
      );
    }
  };

  // =========================================================
  // HELPERS
  // =========================================================
  const getTargetId = (product) =>
    product?.productId || product?.id;

  const formatType = (typeStr) =>
    typeStr
      ? typeStr.replace(/_/g, ' ')
      : '';

  const getImageUrl = (url) => {
    if (!url) return '';

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    if (url.startsWith('/')) {
      return `${import.meta.env.VITE_API_URL}${url}`;
    }

    return url;
  };

  // =========================================================
  // ADD PRODUCT
  // =========================================================
  const openAddModal = () => {
    setModalMode('add');
    setSelectedProduct(null);
    setSubmitError('');

    setFormData({
      name: '',
      description: '',
      price: '',
      categoryId: '',
      type: '',
      gender: 'UNISEX',
    });

    setIsModalOpen(true);
  };

  // =========================================================
  // EDIT PRODUCT
  // =========================================================
  const openEditModal = (product) => {
    setModalMode('edit');
    setSelectedProduct(product);
    setSubmitError('');

    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      categoryId:
        product.categoryId ||
        product.category_id ||
        product.categoryid ||
        '',
      type: product.type || '',
      gender: product.gender || 'UNISEX',
    });

    setIsModalOpen(true);
  };

  // =========================================================
  // SAVE PRODUCT
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setSubmitError('');

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        categoryId: formData.categoryId,
        type: formData.type,
        gender: formData.gender,
      };

      if (modalMode === 'add') {
        await api.post(
          '/client/products',
          payload
        );
      } else {
        await api.put(
          `/client/products/${getTargetId(selectedProduct)}`,
          payload
        );
      }

      setIsModalOpen(false);
      await fetchProducts();
    } catch (error) {
      let msg =
        error.response?.data?.message ||
        'Action failed.';

      if (Array.isArray(msg)) {
        msg = msg[0];
      }

      setSubmitError(String(msg));
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================
  // STATUS TOGGLE
  // =========================================================
  const handleStatusToggle = async (status) => {
    setIsLoading(true);

    try {
      await api.patch(
        `/client/products/${getTargetId(
          selectedProduct
        )}/live`,
        {
          isActive: status,
        }
      );

      setIsStatusModalOpen(false);
      await fetchProducts();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================
  // HARD DELETE
  // =========================================================
  const handleHardDelete = async () => {
    setIsLoading(true);

    try {
      await api.delete(
        `/client/products/${getTargetId(
          selectedProduct
        )}`
      );

      setIsDeleteModalOpen(false);
      await fetchProducts();
    } catch (error) {
      alert(
        'Cannot delete product linked to existing orders/variants.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================
  // MEDIA
  // =========================================================
  const openMediaModal = async (product) => {
    setSelectedProduct(product);
    setIsMediaModalOpen(true);
    setSelectedFile(null);
    setNewImageUrl('');

    await fetchMedia(
      getTargetId(product)
    );
  };

  const fetchMedia = async (productId) => {
    setIsMediaLoading(true);

    try {
      const res = await api.get(
        `/products/${productId}/images`
      );

      setMediaItems(
        res.data?.data ||
          res.data ||
          []
      );
    } catch (error) {
      console.error(
        'Failed to fetch images',
        error
      );
    } finally {
      setIsMediaLoading(false);
    }
  };

  const handleAddMedia = async (e) => {
    e.preventDefault();

    if (
      uploadMethod === 'file' &&
      !selectedFile
    ) {
      return;
    }

    if (
      uploadMethod === 'url' &&
      !newImageUrl
    ) {
      return;
    }

    setIsMediaLoading(true);

    try {
      if (uploadMethod === 'file') {
        const formDataObj = new FormData();

        formDataObj.append(
          'file',
          selectedFile
        );

        await api.post(
          `/products/${getTargetId(
            selectedProduct
          )}/images`,
          formDataObj,
          {
            headers: {
              'Content-Type':
                'multipart/form-data',
            },
          }
        );
      } else {
        await api.post(
          `/products/${getTargetId(
            selectedProduct
          )}/images`,
          {
            imageUrl: newImageUrl,
          }
        );
      }

      setSelectedFile(null);
      setNewImageUrl('');

      const input =
        document.getElementById(
          'mediaFileInput'
        );

      if (input) {
        input.value = '';
      }

      await fetchMedia(
        getTargetId(selectedProduct)
      );

      // Refresh card image too
      await fetchProducts();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          'Failed to add image'
      );
    } finally {
      setIsMediaLoading(false);
    }
  };

  const handleDeleteMedia = async (
    imageId
  ) => {
    setIsMediaLoading(true);

    try {
      await api.delete(
        `/images/${imageId}`
      );

      await fetchMedia(
        getTargetId(selectedProduct)
      );

      await fetchProducts();
    } catch (error) {
      console.error(
        'Failed to delete image',
        error
      );
    } finally {
      setIsMediaLoading(false);
    }
  };

  // =========================================================
  // DRAG AND DROP
  // =========================================================
  const handleDragStart = (
    e,
    index
  ) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed =
      'move';
  };

  const handleDragOver = (
    e
  ) => {
    e.preventDefault();
  };

  const handleDrop = async (
    e,
    dropIndex
  ) => {
    e.preventDefault();

    if (
      draggedIndex === null ||
      draggedIndex === dropIndex
    ) {
      return;
    }

    const newMedia = [
      ...mediaItems,
    ];

    const draggedItem =
      newMedia[draggedIndex];

    newMedia.splice(
      draggedIndex,
      1
    );

    newMedia.splice(
      dropIndex,
      0,
      draggedItem
    );

    setMediaItems(newMedia);
    setDraggedIndex(null);

    try {
      const orderedIds =
        newMedia.map(
          (media) => media.id
        );

      await api.put(
        `/products/${getTargetId(
          selectedProduct
        )}/images/reorder`,
        {
          orderedIds,
        }
      );

      await fetchProducts();
    } catch (error) {
      console.error(
        'Backend reorder route failed.',
        error
      );
    }
  };

  // =========================================================
  // FILTERED PRODUCTS
  // =========================================================
  const filteredData = products
    .filter((product) => {
      const isActive =
        product.isActive == 1 ||
        product.isActive === true ||
        product.isActive === 'true';

      return viewMode === 'live'
        ? isActive
        : !isActive;
    })
    .filter((product) =>
      product.name
        ?.toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )
    );

  return (
    <div className="space-y-8 animate-fade-in p-4">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-8">

        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-[#111]">
            My Products
          </h1>

          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
            Catalog Control
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">

          <div className="bg-white p-1 rounded-2xl border border-gray-100 flex shadow-sm">

            <button
              onClick={() =>
                setViewMode('live')
              }
              className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                viewMode === 'live'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-gray-400 hover:text-black'
              }`}
            >
              <Power size={14} />
              Live
            </button>

            <button
              onClick={() =>
                setViewMode('offline')
              }
              className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                viewMode === 'offline'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-400 hover:text-orange-500'
              }`}
            >
              <PowerOff size={14} />
              Not Live
            </button>

          </div>

          <button
            onClick={openAddModal}
            className="bg-[#1A1A1A] text-white px-6 py-3 rounded-2xl hover:bg-[#9B4819] transition-all flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-[10px] shadow-xl"
          >
            <Plus size={16} />
            Add Product
          </button>

        </div>

      </div>

      {/* =====================================================
          SEARCH
      ===================================================== */}
      <div className="relative w-full md:w-96">

        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
          size={18}
        />

        <input
          id="searchProducts"
          name="searchProducts"
          type="text"
          placeholder="SEARCH CATALOG..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
          className="w-full bg-white border border-[#EEE] rounded-2xl py-4 pl-12 pr-6 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-[#1A1A1A] transition-all shadow-sm"
        />

      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}
      <div className="bg-white rounded-[2.5rem] border border-[#EEE] overflow-hidden shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full text-left border-collapse">

            <thead>

              <tr className="border-b border-[#F5F5F5] bg-gray-50/50">

                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  Product Details
                </th>

                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  Taxonomy
                </th>

                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  Variants
                </th>

                <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-[#F9F9F9]">

              {filteredData.length > 0 ? (

                filteredData.map((product) => {

                  const pid =
                    getTargetId(product);

                  const isLive =
                    product.isActive == 1 ||
                    product.isActive === true ||
                    product.isActive === 'true';

                  const prodCatId =
                    product.categoryId ||
                    product.category_id ||
                    product.categoryid;

                  const matchingCategory =
                    categories.find(
                      (category) =>
                        String(
                          category.id ||
                            category.categoryId
                        ) ===
                        String(prodCatId)
                    );

                  const categoryName =
                    matchingCategory?.name ||
                    matchingCategory?.categoryName ||
                    'Uncategorized';

                  const imageUrl =
                    productImages[pid] ||
                    product.imageUrl ||
                    product.images?.[0] ||
                    '';

                  return (
                    <tr
                      key={pid}
                      className="hover:bg-[#FAFAFA] transition-colors group"
                    >

                      {/* PRODUCT */}
                      <td className="p-6">

                        <div className="flex items-center gap-4">

                          <div
                            className={`w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 border ${
                              !isLive
                                ? 'bg-orange-50 border-orange-100'
                                : 'bg-gray-100 border-gray-100'
                            }`}
                          >

                            {imageUrl ? (

                              <img
                                src={getImageUrl(
                                  imageUrl
                                )}
                                alt={
                                  product.name ||
                                  'Product'
                                }
                                className="w-full h-full object-cover"
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
                                size={20}
                                className={
                                  !isLive
                                    ? 'text-orange-500'
                                    : 'text-gray-400'
                                }
                              />

                            )}

                          </div>

                          <div>

                            <h4
                              className={`text-sm font-black uppercase tracking-tight ${
                                !isLive
                                  ? 'text-gray-400'
                                  : 'text-[#111]'
                              }`}
                            >
                              {product.name}
                            </h4>

                            <div className="flex items-center gap-2 mt-1 flex-wrap">

                              <p className="text-[10px] font-bold text-gray-400">
                                ₹{product.price}
                              </p>

                              <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg">
                                <Archive
                                  size={10}
                                />
                                {productStocks[pid] ??
                                  0}{' '}
                                IN HQ
                              </span>

                            </div>

                          </div>

                        </div>

                      </td>

                      {/* TAXONOMY */}
                      <td className="p-6">

                        <div className="flex flex-col gap-1">

                          <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[#9B4819]">
                            <Tag size={10} />

                            {categoryName}

                            {product.type
                              ? ` > ${formatType(
                                  product.type
                                )}`
                              : ''}
                          </span>

                          <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-500">
                            <UsersIcon
                              size={10}
                            />

                            {product.gender ||
                              'UNISEX'}
                          </span>

                        </div>

                      </td>

                      {/* VARIANTS */}
                      <td className="p-6">

                        <button
                          onClick={() =>
                            navigate(
                              `/client/products/${pid}/variants`
                            )
                          }
                          className="px-4 py-2 bg-gray-100 hover:bg-[#1A1A1A] hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all w-fit"
                        >
                          <Layers size={12} />
                          Manage Product Variants
                        </button>

                      </td>

                      {/* ACTIONS */}
                      <td className="p-6 text-right">

                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() =>
                              openMediaModal(
                                product
                              )
                            }
                            className="p-2 bg-gray-50 text-gray-400 hover:text-[#9B4819] hover:bg-orange-50 rounded-xl transition-all"
                          >
                            <ImageIcon
                              size={14}
                            />
                          </button>

                          {isLive ? (
                            <>
                              <button
                                onClick={() =>
                                  openEditModal(
                                    product
                                  )
                                }
                                className="p-2 bg-gray-100 hover:bg-[#1A1A1A] hover:text-white text-[#111] rounded-xl transition-all"
                              >
                                <Edit2
                                  size={14}
                                />
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedProduct(
                                    product
                                  );
                                  setIsStatusModalOpen(
                                    true
                                  );
                                }}
                                className="p-2 bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-600 rounded-xl transition-all"
                              >
                                <PowerOff
                                  size={14}
                                />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedProduct(
                                    product
                                  );
                                  handleStatusToggle(
                                    true
                                  );
                                }}
                                className="p-2 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition-all"
                              >
                                <RefreshCcw
                                  size={14}
                                />
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedProduct(
                                    product
                                  );
                                  setIsDeleteModalOpen(
                                    true
                                  );
                                }}
                                className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all rounded-xl"
                              >
                                <Trash2
                                  size={14}
                                />
                              </button>
                            </>
                          )}

                        </div>

                      </td>

                    </tr>
                  );
                })

              ) : (

                <tr>

                  <td
                    colSpan="4"
                    className="p-16 text-center text-gray-400"
                  >

                    <Package
                      size={40}
                      className="mx-auto text-gray-200 mb-4"
                    />

                    <h3 className="text-[10px] font-black uppercase tracking-widest">
                      No {viewMode} Products
                    </h3>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =====================================================
          MODALS
      ===================================================== */}
      <AnimatePresence>

        {/* ADD / EDIT */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

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
              onClick={() =>
                setIsModalOpen(false)
              }
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 30,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 30,
              }}
              className="relative bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl"
            >

              <div className="flex justify-between items-start mb-8">

                <h2 className="text-3xl font-black uppercase tracking-tighter">
                  {modalMode === 'add'
                    ? 'New Product'
                    : 'Edit Product'}
                </h2>

                <button
                  onClick={() =>
                    setIsModalOpen(false)
                  }
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>

              </div>

              {submitError && (
                <div className="bg-red-50 text-red-600 text-[10px] font-bold uppercase p-4 rounded-2xl mb-6 text-center border border-red-100">
                  {submitError}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >

                <div>
                  <label
                    htmlFor="productName"
                    className="text-[9px] font-black text-gray-400 uppercase ml-2"
                  >
                    Product Name
                  </label>

                  <input
                    id="productName"
                    required
                    placeholder="E.G. CLASSIC TEE"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                    className="w-full bg-[#FAFAFA] rounded-2xl p-4 text-[11px] font-bold outline-none focus:border-[#1A1A1A] border border-transparent mt-1"
                  />
                </div>

                <div>
                  <label
                    htmlFor="productDesc"
                    className="text-[9px] font-black text-gray-400 uppercase ml-2"
                  >
                    Description
                  </label>

                  <textarea
                    id="productDesc"
                    placeholder="PRODUCT DETAILS..."
                    value={
                      formData.description
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description:
                          e.target.value,
                      })
                    }
                    rows="3"
                    className="w-full bg-[#FAFAFA] rounded-2xl p-4 text-[11px] font-bold outline-none focus:border-[#1A1A1A] border border-transparent mt-1 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  <div>

                    <label
                      htmlFor="productCategory"
                      className="text-[9px] font-black text-gray-400 uppercase ml-2"
                    >
                      Category
                    </label>

                    <select
                      id="productCategory"
                      required
                      value={
                        formData.categoryId
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          categoryId:
                            e.target.value,
                        })
                      }
                      className="w-full bg-[#FAFAFA] rounded-2xl p-4 text-[11px] font-bold outline-none appearance-none mt-1"
                    >

                      <option
                        value=""
                        disabled
                      >
                        SELECT CATEGORY
                      </option>

                      {categories.map(
                        (category) => (
                          <option
                            key={
                              category.id ||
                              category.categoryId
                            }
                            value={
                              category.id ||
                              category.categoryId
                            }
                          >
                            {category.name ||
                              category.categoryName}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  <div>

                    <label
                      htmlFor="productType"
                      className="text-[9px] font-black text-gray-400 uppercase ml-2"
                    >
                      Product Type
                    </label>

                    <select
                      id="productType"
                      required
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type:
                            e.target.value,
                        })
                      }
                      className="w-full bg-[#FAFAFA] rounded-2xl p-4 text-[11px] font-bold outline-none appearance-none mt-1"
                    >

                      <option
                        value=""
                        disabled
                      >
                        SELECT TYPE
                      </option>

                      {productTypes.map(
                        (type) => (
                          <option
                            key={type}
                            value={type}
                          >
                            {formatType(type)}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  <div>

                    <label
                      htmlFor="productGender"
                      className="text-[9px] font-black text-gray-400 uppercase ml-2"
                    >
                      Gender Focus
                    </label>

                    <select
                      id="productGender"
                      required
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gender:
                            e.target.value,
                        })
                      }
                      className="w-full bg-[#FAFAFA] rounded-2xl p-4 text-[11px] font-bold outline-none appearance-none mt-1"
                    >
                      <option value="MEN">
                        MEN
                      </option>
                      <option value="WOMEN">
                        WOMEN
                      </option>
                      <option value="KIDS">
                        KIDS
                      </option>
                      <option value="UNISEX">
                        UNISEX
                      </option>
                    </select>

                  </div>

                </div>

                <div>

                  <label
                    htmlFor="productPrice"
                    className="text-[9px] font-black text-gray-400 uppercase ml-2"
                  >
                    Base Price (₹)
                  </label>

                  <input
                    id="productPrice"
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="PRICE"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: e.target.value,
                      })
                    }
                    className="w-full bg-[#FAFAFA] rounded-2xl p-4 text-[11px] font-bold outline-none focus:border-[#1A1A1A] border border-transparent mt-1"
                  />

                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#1A1A1A] hover:bg-[#9B4819] flex justify-center items-center text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all shadow-xl mt-4"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    modalMode === 'add'
                      ? 'Publish Catalog Item'
                      : 'Save Changes'
                  )}
                </button>

              </form>

            </motion.div>

          </div>
        )}

        {/* STATUS */}
        {isStatusModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">

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
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl text-center"
            >

              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 mb-6 mx-auto">
                <AlertTriangle size={32} />
              </div>

              <h2 className="text-2xl font-black uppercase mb-2">
                Deactivate Product?
              </h2>

              <p className="text-gray-500 text-xs mb-8">
                Hide{' '}
                <strong>
                  {selectedProduct?.name}
                </strong>{' '}
                from your live store?
              </p>

              <button
                onClick={() =>
                  handleStatusToggle(false)
                }
                disabled={isLoading}
                className="w-full bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mb-2"
              >
                Move to Not Live
              </button>

              <button
                onClick={() =>
                  setIsStatusModalOpen(false)
                }
                className="w-full bg-transparent text-gray-400 py-4 text-[10px] font-black uppercase transition-all"
              >
                Cancel
              </button>

            </motion.div>

          </div>
        )}

        {/* DELETE */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">

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
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl text-center"
            >

              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-6 mx-auto">
                <Trash2 size={32} />
              </div>

              <h2 className="text-2xl font-black uppercase mb-2">
                Delete Forever?
              </h2>

              <p className="text-gray-500 text-xs mb-8">
                This permanently removes{' '}
                <strong>
                  {selectedProduct?.name}
                </strong>{' '}
                from your database.
              </p>

              <button
                onClick={handleHardDelete}
                disabled={isLoading}
                className="w-full bg-red-600 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all mb-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Destroy Permanently'
                )}
              </button>

              <button
                onClick={() =>
                  setIsDeleteModalOpen(false)
                }
                className="w-full bg-transparent text-gray-400 py-4 text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Cancel
              </button>

            </motion.div>

          </div>
        )}

        {/* MEDIA */}
        {isMediaModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">

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
              onClick={() =>
                setIsMediaModalOpen(false)
              }
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 30,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 30,
              }}
              className="relative bg-white w-full max-w-4xl rounded-[3rem] p-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >

              <div className="flex justify-between items-center mb-6 shrink-0">

                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter">
                    Product Media
                  </h2>

                  <p className="text-[10px] font-bold text-[#9B4819] uppercase tracking-[0.2em]">
                    {selectedProduct?.name}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setIsMediaModalOpen(false)
                  }
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>

              </div>

              <div className="flex gap-6 mb-6 shrink-0 border-b border-gray-100">

                <button
                  onClick={() =>
                    setUploadMethod('file')
                  }
                  className={`text-[10px] font-black uppercase tracking-widest pb-3 border-b-2 transition-all ${
                    uploadMethod === 'file'
                      ? 'border-[#1A1A1A] text-[#1A1A1A]'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Upload Local File
                </button>

                <button
                  onClick={() =>
                    setUploadMethod('url')
                  }
                  className={`text-[10px] font-black uppercase tracking-widest pb-3 border-b-2 transition-all ${
                    uploadMethod === 'url'
                      ? 'border-[#1A1A1A] text-[#1A1A1A]'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Paste Web URL
                </button>

              </div>

              <form
                onSubmit={handleAddMedia}
                className="flex gap-4 mb-8 shrink-0 items-center"
              >

                <div className="relative flex-1">

                  {uploadMethod === 'file' ? (
                    <input
                      id="mediaFileInput"
                      type="file"
                      accept="image/*"
                      required
                      onChange={(e) =>
                        setSelectedFile(
                          e.target.files[0]
                        )
                      }
                      className="w-full bg-[#FAFAFA] border border-[#EEE] rounded-2xl py-3 px-4 text-[11px] font-bold outline-none focus:border-[#1A1A1A] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-[#1A1A1A] file:text-white hover:file:bg-[#9B4819] transition-all cursor-pointer"
                    />
                  ) : (
                    <>
                      <LinkIcon
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={16}
                      />

                      <input
                        type="url"
                        required
                        placeholder="HTTPS://..."
                        value={newImageUrl}
                        onChange={(e) =>
                          setNewImageUrl(
                            e.target.value
                          )
                        }
                        className="w-full bg-[#FAFAFA] border border-[#EEE] rounded-2xl py-4 pl-12 pr-4 text-[11px] font-bold outline-none focus:border-[#1A1A1A]"
                      />
                    </>
                  )}

                </div>

                <button
                  type="submit"
                  disabled={
                    isMediaLoading ||
                    (uploadMethod === 'file' &&
                      !selectedFile) ||
                    (uploadMethod === 'url' &&
                      !newImageUrl)
                  }
                  className="bg-[#1A1A1A] hover:bg-[#9B4819] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isMediaLoading ? (
                    <Loader2
                      className="animate-spin mx-auto"
                      size={16}
                    />
                  ) : (
                    'Add Image'
                  )}
                </button>

              </form>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">

                {isMediaLoading &&
                mediaItems.length === 0 ? (
                  <div className="flex justify-center p-12">
                    <Loader2
                      className="animate-spin text-gray-300"
                      size={40}
                    />
                  </div>
                ) : mediaItems.length === 0 ? (
                  <div className="text-center p-12 border-2 border-dashed border-gray-200 rounded-3xl">
                    <ImageIcon
                      size={40}
                      className="mx-auto text-gray-300 mb-4"
                    />

                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      No media attached to this product
                    </p>
                  </div>
                ) : (
                  <div>

                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-4 text-center">
                      Tip: Drag and drop images to rearrange their order
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                      {mediaItems.map(
                        (media, index) => (
                          <div
                            key={media.id}
                            draggable
                            onDragStart={(e) =>
                              handleDragStart(
                                e,
                                index
                              )
                            }
                            onDragOver={
                              handleDragOver
                            }
                            onDrop={(e) =>
                              handleDrop(
                                e,
                                index
                              )
                            }
                            className={`group relative aspect-square bg-[#FAFAFA] rounded-2xl overflow-hidden border-2 cursor-grab active:cursor-grabbing transition-all ${
                              draggedIndex ===
                              index
                                ? 'border-[#9B4819] opacity-50 scale-95'
                                : 'border-transparent hover:border-gray-200'
                            }`}
                          >

                            <div className="absolute top-3 left-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center font-black text-[12px] text-[#1A1A1A] shadow-md border border-gray-100">
                              {index + 1}
                            </div>

                            {index === 0 && (
                              <div className="absolute top-3 left-14 z-10 px-3 py-1.5 bg-[#9B4819] text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-md pointer-events-none">
                                Main Image
                              </div>
                            )}

                            <img
                              src={getImageUrl(
                                media.imageUrl
                              )}
                              alt="Product"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                              onError={(
                                e
                              ) => {
                                e.currentTarget.onerror =
                                  null;

                                e.currentTarget.src =
                                  'https://via.placeholder.com/400?text=Broken+Link';
                              }}
                            />

                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">

                              <button
                                onClick={() =>
                                  handleDeleteMedia(
                                    media.id
                                  )
                                }
                                className="bg-red-500 text-white p-3 rounded-xl hover:bg-red-600 transition-colors shadow-lg cursor-pointer"
                                title="Delete Image"
                              >
                                <Trash2 size={18} />
                              </button>

                            </div>

                          </div>
                        )
                      )}

                    </div>

                  </div>
                )}

              </div>

            </motion.div>

          </div>
        )}

      </AnimatePresence>

    </div>
  );
};

export default ClientProducts;