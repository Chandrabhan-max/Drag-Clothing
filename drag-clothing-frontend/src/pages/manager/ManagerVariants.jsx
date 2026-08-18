import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  X,
  Loader2,
  Edit2,
  Trash2,
  Archive,
  RefreshCcw,
  Image as ImageIcon,
  ArrowLeft,
  Link as LinkIcon,
  ShieldAlert,
} from 'lucide-react';

import api from '../../api/axios';

const ManagerVariants = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [variants, setVariants] = useState([]);
  const [viewMode, setViewMode] = useState('active');

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [isMediaModalOpen, setIsMediaModalOpen] =
    useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] =
    useState(false);

  const [isHardDeleteModalOpen, setIsHardDeleteModalOpen] =
    useState(false);

  const [modalMode, setModalMode] =
    useState('add');

  const [selectedVariant, setSelectedVariant] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(false);

  const [isMediaLoading, setIsMediaLoading] =
    useState(false);

  const [submitError, setSubmitError] =
    useState('');

  const [formData, setFormData] = useState({
    size: '',
    color: '',
    price: '',
    stock: '',
  });

  const [mediaItems, setMediaItems] =
    useState([]);

  const [newImageUrl, setNewImageUrl] =
    useState('');

  /* =====================================================
     FETCH VARIANTS
  ===================================================== */

  useEffect(() => {
    fetchVariants();
  }, [productId]);

  const fetchVariants = async () => {
    if (!productId) return;

    try {
      const res = await api.get(
        `/manager/product-variants/${productId}`
      );

      setVariants(
        Array.isArray(res?.data?.data)
          ? res.data.data
          : []
      );
    } catch (error) {
      console.error(
        'Failed to fetch manager variants:',
        error?.response?.data || error
      );

      setVariants([]);
    }
  };

  /* =====================================================
     ERROR HANDLER
  ===================================================== */

  const handleApiError = (error) => {
    let msg =
      error?.response?.data?.message ||
      'Action failed';

    if (Array.isArray(msg)) {
      msg = msg[0];
    }

    if (typeof msg === 'object') {
      msg = JSON.stringify(msg);
    }

    setSubmitError(String(msg));
  };

  /* =====================================================
     ADD / EDIT VARIANT
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setSubmitError('');

    try {
      const payload = {
        size: formData.size,
        color: formData.color,
        price: Number(formData.price),
        stock: Number(formData.stock),
      };

      if (modalMode === 'add') {
        payload.productId = productId;

        await api.post(
          '/manager/product-variants',
          payload
        );
      } else {
        await api.put(
          `/manager/product-variants/${selectedVariant.id}`,
          payload
        );
      }

      setIsModalOpen(false);

      setFormData({
        size: '',
        color: '',
        price: '',
        stock: '',
      });

      await fetchVariants();
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  /* =====================================================
     SOFT DELETE
  ===================================================== */

  const handleSoftDelete = async () => {
    if (!selectedVariant) return;

    setIsLoading(true);
    setSubmitError('');

    try {
      await api.delete(
        `/manager/product-variants/${selectedVariant.id}`
      );

      setIsDeleteModalOpen(false);
      setSelectedVariant(null);

      await fetchVariants();
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  /* =====================================================
     PERMANENT DELETE
  ===================================================== */

  const handleHardDelete = async () => {
    if (!selectedVariant) return;

    setIsLoading(true);
    setSubmitError('');

    try {
      await api.delete(
        `/manager/product-variants/${selectedVariant.id}/permanent`
      );

      setIsHardDeleteModalOpen(false);
      setSelectedVariant(null);

      await fetchVariants();
    } catch (error) {
      console.error(
        'Permanent delete failed:',
        error?.response?.data || error
      );

      alert(
        error?.response?.data?.message ||
          'Permanent delete failed. This variant might be linked to existing order records.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* =====================================================
     RESTORE
  ===================================================== */

  const handleRestore = async (id) => {
    try {
      await api.patch(
        `/manager/product-variants/${id}/restore`
      );

      await fetchVariants();
    } catch (error) {
      handleApiError(error);
    }
  };

  /* =====================================================
     MEDIA
  ===================================================== */

  const openMediaModal = async (variant) => {
    setSelectedVariant(variant);
    setIsMediaModalOpen(true);
    setNewImageUrl('');
    setSubmitError('');

    await fetchMedia(productId);
  };

  const fetchMedia = async (targetProductId) => {
    if (!targetProductId) return;

    setIsMediaLoading(true);

    try {
      const res = await api.get(
        `/products/${targetProductId}/images`
      );

      setMediaItems(
        Array.isArray(res?.data?.data)
          ? res.data.data
          : []
      );
    } catch (error) {
      console.error(
        'Failed to fetch images:',
        error?.response?.data || error
      );

      setMediaItems([]);
    } finally {
      setIsMediaLoading(false);
    }
  };

  const handleAddMedia = async (e) => {
    e.preventDefault();

    if (!newImageUrl.trim()) return;

    setIsMediaLoading(true);

    try {
      await api.post(
        `/products/${productId}/images`,
        {
          imageUrl: newImageUrl.trim(),
        }
      );

      setNewImageUrl('');

      await fetchMedia(productId);
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          'Failed to add image'
      );
    } finally {
      setIsMediaLoading(false);
    }
  };

  const handleDeleteMedia = async (imageId) => {
    setIsMediaLoading(true);

    try {
      await api.delete(
        `/images/${imageId}`
      );

      await fetchMedia(productId);
    } catch (error) {
      console.error(
        'Failed to delete image:',
        error
      );
    } finally {
      setIsMediaLoading(false);
    }
  };

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredVariants =
    variants.filter((variant) => {
      const isActive =
        variant?.isActive == 1 ||
        variant?.isActive === true ||
        variant?.isActive === '1';

      return viewMode === 'active'
        ? isActive
        : !isActive;
    });

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="
      space-y-8
      animate-fade-in
      p-4
    ">

      {/* BACK */}

      <button
        type="button"
        onClick={() =>
          navigate('/manager/products')
        }
        className="
          flex
          items-center
          gap-2
          text-[10px]
          font-black
          uppercase
          tracking-widest
          text-gray-400
          hover:text-[#111]
          transition-colors
          mb-4
        "
      >
        <ArrowLeft size={14} />
        Back to Products
      </button>

      {/* HEADER */}

      <div className="
        flex
        flex-col
        md:flex-row
        justify-between
        items-start
        md:items-center
        gap-4
        border-b
        border-gray-200
        pb-8
      ">

        <div>

          <h1 className="
            text-4xl
            font-black
            uppercase
            tracking-tighter
            text-[#111]
          ">
            Manage Variants
          </h1>

          <p className="
            text-gray-500
            text-[10px]
            font-bold
            uppercase
            tracking-[0.3em]
            mt-1
          ">
            Sizes, Colors & Details
          </p>

        </div>

        <div className="
          flex
          gap-3
          w-full
          md:w-auto
        ">

          {/* ACTIVE / BIN */}

          <div className="
            bg-white
            p-1
            rounded-2xl
            border
            border-gray-100
            flex
            shadow-sm
          ">

            <button
              type="button"
              onClick={() =>
                setViewMode('active')
              }
              className={`
                px-6
                py-3
                rounded-xl
                text-[10px]
                font-bold
                uppercase
                tracking-widest
                transition-all
                ${
                  viewMode === 'active'
                    ? 'bg-[#1A1A1A] text-white'
                    : 'text-gray-400 hover:text-black'
                }
              `}
            >
              Active
            </button>

            <button
              type="button"
              onClick={() =>
                setViewMode('archived')
              }
              className={`
                px-6
                py-3
                rounded-xl
                text-[10px]
                font-bold
                uppercase
                tracking-widest
                transition-all
                flex
                items-center
                gap-2
                ${
                  viewMode === 'archived'
                    ? 'bg-red-50 text-red-600'
                    : 'text-gray-400 hover:text-red-500'
                }
              `}
            >
              <Archive size={14} />
              Bin
            </button>

          </div>

          {/* ADD VARIANT */}

          <button
            type="button"
            onClick={() => {
              setModalMode('add');

              setSelectedVariant(null);

              setSubmitError('');

              setFormData({
                size: '',
                color: '',
                price: '',
                stock: '',
              });

              setIsModalOpen(true);
            }}
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
              gap-2
              font-black
              uppercase
              text-[10px]
              shadow-xl
            "
          >
            <Plus size={16} />
            Add Variant
          </button>

        </div>

      </div>

      {/* VARIANTS TABLE */}

      <div className="
        bg-white
        rounded-[2.5rem]
        border
        border-[#EEE]
        overflow-hidden
        shadow-sm
      ">

        <div className="overflow-x-auto">

          <table className="
            w-full
            text-left
          ">

            <thead className="
              bg-gray-50/50
            ">

              <tr>

                <th className="
                  p-6
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-gray-400
                ">
                  Variant Details
                </th>

                <th className="
                  p-6
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-gray-400
                ">
                  Price / Stock
                </th>

                <th className="
                  p-6
                  text-right
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-gray-400
                ">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="
              divide-y
              divide-[#F9F9F9]
            ">

              {filteredVariants.length > 0 ? (

                filteredVariants.map((variant) => (

                  <tr
                    key={variant.id}
                    className="
                      hover:bg-[#FAFAFA]
                      transition-colors
                    "
                  >

                    {/* DETAILS */}

                    <td className="p-6">

                      <div className="
                        flex
                        items-center
                        gap-2
                      ">

                        <span className="
                          px-3
                          py-1.5
                          bg-[#EBE9E0]
                          text-[#9B4819]
                          rounded-lg
                          text-[10px]
                          font-black
                          uppercase
                          tracking-widest
                        ">
                          SIZE:{' '}
                          {variant?.size ||
                            'N/A'}
                        </span>

                        <span className="
                          px-3
                          py-1.5
                          bg-gray-100
                          text-gray-600
                          rounded-lg
                          text-[10px]
                          font-black
                          uppercase
                          tracking-widest
                        ">
                          COLOR:{' '}
                          {variant?.color ||
                            'N/A'}
                        </span>

                      </div>

                    </td>

                    {/* PRICE / STOCK */}

                    <td className="p-6">

                      <div className="
                        flex
                        flex-col
                        gap-1
                      ">

                        <span className={`
                          font-black
                          text-sm
                          ${
                            viewMode ===
                            'archived'
                              ? 'text-gray-400'
                              : 'text-[#111]'
                          }
                        `}>
                          ₹
                          {variant?.price ||
                            '0.00'}
                        </span>

                        <span className="
                          text-[9px]
                          font-bold
                          text-gray-400
                          uppercase
                          tracking-widest
                        ">
                          {variant?.stock ||
                            0}{' '}
                          In Stock
                        </span>

                      </div>

                    </td>

                    {/* ACTIONS */}

                    <td className="
                      p-6
                      text-right
                    ">

                      <div className="
                        flex
                        justify-end
                        gap-2
                      ">

                        {/* MEDIA */}

                        <button
                          type="button"
                          onClick={() =>
                            openMediaModal(
                              variant
                            )
                          }
                          className="
                            p-2
                            bg-gray-50
                            text-gray-400
                            hover:text-[#9B4819]
                            hover:bg-orange-50
                            rounded-xl
                            transition-all
                          "
                          title="Variant Media"
                        >
                          <ImageIcon
                            size={14}
                          />
                        </button>

                        {viewMode ===
                        'active' ? (
                          <>

                            {/* EDIT */}

                            <button
                              type="button"
                              onClick={() => {
                                setModalMode(
                                  'edit'
                                );

                                setSelectedVariant(
                                  variant
                                );

                                setSubmitError('');

                                setFormData({
                                  size:
                                    variant?.size ||
                                    '',
                                  color:
                                    variant?.color ||
                                    '',
                                  price:
                                    variant?.price ||
                                    '',
                                  stock:
                                    variant?.stock ||
                                    '',
                                });

                                setIsModalOpen(
                                  true
                                );
                              }}
                              className="
                                p-2
                                text-gray-500
                                bg-gray-100
                                hover:bg-[#1A1A1A]
                                hover:text-white
                                rounded-xl
                                transition-colors
                              "
                              title="Edit Variant"
                            >
                              <Edit2
                                size={14}
                              />
                            </button>

                            {/* DELETE */}

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedVariant(
                                  variant
                                );

                                setSubmitError('');

                                setIsDeleteModalOpen(
                                  true
                                );
                              }}
                              className="
                                p-2
                                text-orange-500
                                bg-orange-50
                                hover:bg-orange-500
                                hover:text-white
                                rounded-xl
                                transition-colors
                              "
                              title="Move to Bin"
                            >
                              <Trash2
                                size={14}
                              />
                            </button>

                          </>
                        ) : (
                          <>

                            {/* RESTORE */}

                            <button
                              type="button"
                              onClick={() =>
                                handleRestore(
                                  variant.id
                                )
                              }
                              className="
                                px-4
                                py-2
                                bg-green-50
                                text-[9px]
                                flex
                                items-center
                                gap-2
                                font-black
                                uppercase
                                tracking-widest
                                text-green-600
                                hover:bg-green-600
                                hover:text-white
                                rounded-xl
                                transition-all
                              "
                            >
                              <RefreshCcw
                                size={12}
                              />
                              Set Live
                            </button>

                            {/* PERMANENT DELETE */}

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedVariant(
                                  variant
                                );

                                setSubmitError('');

                                setIsHardDeleteModalOpen(
                                  true
                                );
                              }}
                              className="
                                p-2
                                bg-red-50
                                text-red-600
                                hover:bg-red-600
                                hover:text-white
                                rounded-xl
                                transition-all
                              "
                              title="Permanent Delete"
                            >
                              <ShieldAlert
                                size={14}
                              />
                            </button>

                          </>
                        )}

                      </div>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="3"
                    className="
                      p-12
                      text-center
                      text-gray-400
                      text-xs
                      font-bold
                      uppercase
                      tracking-widest
                    "
                  >
                    No variants found in
                    this view.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      <AnimatePresence>

        {isModalOpen && (

          <div className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            p-4
          ">

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
              className="
                absolute
                inset-0
                bg-black/60
                backdrop-blur-md
              "
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
              exit={{
                opacity: 0,
                scale: 0.95,
              }}
              className="
                relative
                bg-white
                w-full
                max-w-lg
                rounded-[3rem]
                p-12
                shadow-2xl
              "
            >

              <div className="
                flex
                justify-between
                items-start
                mb-8
              ">

                <h2 className="
                  text-3xl
                  font-black
                  uppercase
                  tracking-tighter
                ">
                  {modalMode === 'add'
                    ? 'Add Variant'
                    : 'Edit Variant'}
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    setIsModalOpen(false)
                  }
                  className="
                    p-2
                    hover:bg-gray-100
                    rounded-full
                    transition-colors
                  "
                >
                  <X size={24} />
                </button>

              </div>

              {submitError && (

                <div className="
                  bg-red-50
                  text-red-600
                  text-[10px]
                  font-bold
                  uppercase
                  p-4
                  rounded-2xl
                  mb-6
                  border
                  border-red-100
                ">
                  {submitError}
                </div>

              )}

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >

                <div className="
                  grid
                  grid-cols-2
                  gap-4
                ">

                  <div>

                    <label className="
                      text-[9px]
                      font-black
                      text-gray-400
                      uppercase
                      ml-2
                    ">
                      Size / Variation
                    </label>

                    <input
                      required
                      placeholder="E.G. XL"
                      value={formData.size}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          size:
                            e.target.value,
                        })
                      }
                      className="
                        w-full
                        bg-[#FAFAFA]
                        rounded-xl
                        p-4
                        text-[11px]
                        font-bold
                        outline-none
                        border
                        border-transparent
                        focus:border-gray-200
                        mt-1
                      "
                    />

                  </div>

                  <div>

                    <label className="
                      text-[9px]
                      font-black
                      text-gray-400
                      uppercase
                      ml-2
                    ">
                      Color
                    </label>

                    <input
                      required
                      placeholder="E.G. RED"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          color:
                            e.target.value,
                        })
                      }
                      className="
                        w-full
                        bg-[#FAFAFA]
                        rounded-xl
                        p-4
                        text-[11px]
                        font-bold
                        outline-none
                        border
                        border-transparent
                        focus:border-gray-200
                        mt-1
                      "
                    />

                  </div>

                </div>

                <div className="
                  grid
                  grid-cols-2
                  gap-4
                ">

                  <div>

                    <label className="
                      text-[9px]
                      font-black
                      text-gray-400
                      uppercase
                      ml-2
                    ">
                      Price (₹)
                    </label>

                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="PRICE"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price:
                            e.target.value,
                        })
                      }
                      className="
                        w-full
                        bg-[#FAFAFA]
                        rounded-xl
                        p-4
                        text-[11px]
                        font-bold
                        outline-none
                        border
                        border-transparent
                        focus:border-gray-200
                        mt-1
                      "
                    />

                  </div>

                  <div>

                    <label className="
                      text-[9px]
                      font-black
                      text-gray-400
                      uppercase
                      ml-2
                    ">
                      Initial Stock
                    </label>

                    <input
                      required
                      type="number"
                      min="0"
                      placeholder="STOCK COUNT"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stock:
                            e.target.value,
                        })
                      }
                      className="
                        w-full
                        bg-[#FAFAFA]
                        rounded-xl
                        p-4
                        text-[11px]
                        font-bold
                        outline-none
                        border
                        border-transparent
                        focus:border-gray-200
                        mt-1
                      "
                    />

                  </div>

                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="
                    w-full
                    bg-[#1A1A1A]
                    hover:bg-[#9B4819]
                    text-white
                    py-5
                    rounded-2xl
                    text-[10px]
                    font-black
                    uppercase
                    tracking-widest
                    mt-8
                    transition-all
                    shadow-xl
                  "
                >

                  {isLoading ? (
                    <Loader2
                      className="
                        animate-spin
                        mx-auto
                      "
                      size={16}
                    />
                  ) : (
                    'Save Configuration'
                  )}

                </button>

              </form>

            </motion.div>

          </div>

        )}

        {/* =====================================================
            MEDIA MANAGEMENT MODAL
        ===================================================== */}

        {isMediaModalOpen && (

          <div className="
            fixed
            inset-0
            z-[150]
            flex
            items-center
            justify-center
            p-4
          ">

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
              className="
                absolute
                inset-0
                bg-black/80
                backdrop-blur-sm
              "
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
              className="
                relative
                bg-white
                w-full
                max-w-3xl
                rounded-[3rem]
                p-10
                shadow-2xl
                overflow-hidden
                flex
                flex-col
                max-h-[90vh]
              "
            >

              <div className="
                flex
                justify-between
                items-center
                mb-6
                shrink-0
              ">

                <div>

                  <h2 className="
                    text-3xl
                    font-black
                    uppercase
                    tracking-tighter
                  ">
                    Variant Media
                  </h2>

                  <p className="
                    text-[10px]
                    font-bold
                    text-[#9B4819]
                    uppercase
                    tracking-[0.2em]
                  ">
                    Size:{' '}
                    {selectedVariant?.size}
                    {' | '}
                    Color:{' '}
                    {selectedVariant?.color}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setIsMediaModalOpen(false)
                  }
                  className="
                    p-2
                    hover:bg-gray-100
                    rounded-full
                    transition-colors
                  "
                >
                  <X size={24} />
                </button>

              </div>

              {/* ADD IMAGE */}

              <form
                onSubmit={handleAddMedia}
                className="
                  flex
                  gap-4
                  mb-8
                  shrink-0
                "
              >

                <div className="
                  relative
                  flex-1
                ">

                  <LinkIcon
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-gray-400
                    "
                    size={16}
                  />

                  <input
                    type="url"
                    required
                    placeholder="
                      PASTE SECURE IMAGE URL
                      (HTTPS://...)
                    "
                    value={newImageUrl}
                    onChange={(e) =>
                      setNewImageUrl(
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      bg-[#FAFAFA]
                      border
                      border-[#EEE]
                      rounded-2xl
                      py-4
                      pl-12
                      pr-4
                      text-[11px]
                      font-bold
                      outline-none
                      focus:border-[#1A1A1A]
                    "
                  />

                </div>

                <button
                  type="submit"
                  disabled={
                    isMediaLoading
                  }
                  className="
                    bg-[#1A1A1A]
                    hover:bg-[#9B4819]
                    text-white
                    px-8
                    rounded-2xl
                    text-[10px]
                    font-black
                    uppercase
                    tracking-widest
                    transition-all
                    whitespace-nowrap
                    min-w-[120px]
                  "
                >

                  {isMediaLoading ? (
                    <Loader2
                      className="
                        animate-spin
                        mx-auto
                      "
                      size={16}
                    />
                  ) : (
                    'Add URL'
                  )}

                </button>

              </form>

              {/* MEDIA GRID */}

              <div className="
                flex-1
                overflow-y-auto
                pr-2
                custom-scrollbar
              ">

                {isMediaLoading &&
                mediaItems.length ===
                  0 ? (

                  <div className="
                    flex
                    justify-center
                    p-12
                  ">
                    <Loader2
                      className="
                        animate-spin
                        text-gray-300
                      "
                      size={40}
                    />
                  </div>

                ) : mediaItems.length ===
                  0 ? (

                  <div className="
                    text-center
                    p-12
                    border-2
                    border-dashed
                    border-gray-200
                    rounded-3xl
                  ">

                    <ImageIcon
                      size={40}
                      className="
                        mx-auto
                        text-gray-300
                        mb-4
                      "
                    />

                    <p className="
                      text-[10px]
                      font-black
                      uppercase
                      tracking-widest
                      text-gray-400
                    ">
                      No media attached to
                      this variant
                    </p>

                  </div>

                ) : (

                  <div className="
                    grid
                    grid-cols-2
                    md:grid-cols-3
                    gap-4
                  ">

                    {mediaItems.map(
                      (media) => (

                        <div
                          key={media.id}
                          className="
                            group
                            relative
                            aspect-square
                            bg-[#FAFAFA]
                            rounded-2xl
                            overflow-hidden
                            border
                            border-gray-100
                          "
                        >

                          <img
                            src={
                              media?.imageUrl
                            }
                            alt="Variant"
                            className="
                              w-full
                              h-full
                              object-cover
                              group-hover:scale-105
                              transition-transform
                              duration-500
                            "
                            onError={(e) => {
                              e.currentTarget.src =
                                'https://via.placeholder.com/400?text=Broken+Link';
                            }}
                          />

                          <div className="
                            absolute
                            inset-0
                            bg-black/0
                            group-hover:bg-black/40
                            transition-colors
                            duration-300
                            flex
                            items-center
                            justify-center
                            opacity-0
                            group-hover:opacity-100
                          ">

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteMedia(
                                  media.id
                                )
                              }
                              className="
                                bg-red-500
                                text-white
                                p-3
                                rounded-xl
                                hover:bg-red-600
                                transition-colors
                                shadow-lg
                              "
                              title="Delete Image"
                            >
                              <Trash2
                                size={18}
                              />
                            </button>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>

            </motion.div>

          </div>

        )}

        {/* =====================================================
            SOFT DELETE MODAL
        ===================================================== */}

        {isDeleteModalOpen && (

          <div className="
            fixed
            inset-0
            z-[200]
            flex
            items-center
            justify-center
            p-4
          ">

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
              className="
                absolute
                inset-0
                bg-black/20
                backdrop-blur-sm
              "
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
              className="
                relative
                bg-white
                w-full
                max-w-md
                rounded-3xl
                p-8
                text-center
              "
            >

              <div className="
                w-16
                h-16
                bg-orange-50
                text-orange-500
                rounded-full
                flex
                items-center
                justify-center
                mb-6
                mx-auto
              ">
                <Archive size={32} />
              </div>

              <h2 className="
                text-2xl
                font-black
                uppercase
                mb-2
              ">
                Move to Bin?
              </h2>

              <p className="
                text-xs
                text-gray-500
              ">
                This variant will be moved
                out of the active list.
              </p>

              {submitError && (
                <div className="
                  bg-red-50
                  text-red-600
                  text-[10px]
                  font-bold
                  uppercase
                  p-3
                  rounded-xl
                  mt-4
                ">
                  {submitError}
                </div>
              )}

              <button
                type="button"
                onClick={handleSoftDelete}
                disabled={isLoading}
                className="
                  w-full
                  bg-orange-50
                  text-orange-600
                  hover:bg-orange-500
                  hover:text-white
                  py-4
                  rounded-xl
                  text-[10px]
                  font-black
                  uppercase
                  tracking-widest
                  mt-6
                  transition-all
                "
              >
                {isLoading ? (
                  <Loader2
                    className="
                      w-4
                      h-4
                      animate-spin
                      mx-auto
                    "
                  />
                ) : (
                  'Confirm'
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  setIsDeleteModalOpen(
                    false
                  )
                }
                className="
                  w-full
                  bg-transparent
                  text-gray-400
                  py-4
                  text-[10px]
                  font-black
                  uppercase
                  tracking-widest
                  mt-2
                  transition-all
                "
              >
                Cancel
              </button>

            </motion.div>

          </div>

        )}

        {/* =====================================================
            HARD DELETE MODAL
        ===================================================== */}

        {isHardDeleteModalOpen && (

          <div className="
            fixed
            inset-0
            z-[200]
            flex
            items-center
            justify-center
            p-4
          ">

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
              className="
                absolute
                inset-0
                bg-black/60
                backdrop-blur-sm
              "
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
              className="
                relative
                bg-white
                w-full
                max-w-md
                rounded-3xl
                p-8
                text-center
                shadow-2xl
              "
            >

              <div className="
                w-16
                h-16
                bg-red-100
                text-red-600
                rounded-full
                flex
                items-center
                justify-center
                mb-6
                mx-auto
              ">
                <ShieldAlert
                  size={32}
                />
              </div>

              <h2 className="
                text-2xl
                font-black
                uppercase
                mb-2
              ">
                Permanent Delete?
              </h2>

              <p className="
                text-xs
                text-gray-500
              ">
                This action destroys this
                variant completely.
              </p>

              {submitError && (
                <div className="
                  bg-red-50
                  text-red-600
                  text-[10px]
                  font-bold
                  uppercase
                  p-3
                  rounded-xl
                  mt-4
                ">
                  {submitError}
                </div>
              )}

              <button
                type="button"
                onClick={handleHardDelete}
                disabled={isLoading}
                className="
                  w-full
                  bg-red-600
                  text-white
                  hover:bg-red-700
                  py-4
                  rounded-xl
                  text-[10px]
                  font-black
                  uppercase
                  tracking-widest
                  mt-6
                  transition-all
                "
              >

                {isLoading ? (
                  <Loader2
                    className="
                      w-4
                      h-4
                      animate-spin
                      mx-auto
                    "
                  />
                ) : (
                  'Permanently Destroy'
                )}

              </button>

              <button
                type="button"
                onClick={() =>
                  setIsHardDeleteModalOpen(
                    false
                  )
                }
                className="
                  w-full
                  bg-transparent
                  text-gray-400
                  py-4
                  text-[10px]
                  font-black
                  uppercase
                  tracking-widest
                  mt-2
                  transition-all
                "
              >
                Cancel
              </button>

            </motion.div>

          </div>

        )}

      </AnimatePresence>

    </div>
  );
};

export default ManagerVariants;