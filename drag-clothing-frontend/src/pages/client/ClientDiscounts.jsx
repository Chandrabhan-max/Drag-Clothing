import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Plus,
  Search,
  Loader2,
  X,
  Trash2,
  Edit2,
  Package,
  Calendar,
  Archive,
  RefreshCcw,
  ShieldAlert
} from 'lucide-react';
import api from '../../api/axios';

const ClientDiscounts = () => {
  const [viewMode, setViewMode] = useState('active');

  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHardDeleteModalOpen, setIsHardDeleteModalOpen] = useState(false);

  const [modalMode, setModalMode] = useState('add');
  const [selectedDiscount, setSelectedDiscount] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [formData, setFormData] = useState({
    productId: '',
    percentage: '',
    startDate: '',
    endDate: ''
  });

  // =========================================================
  // FETCH ON LOAD
  // =========================================================

  useEffect(() => {
    fetchDiscounts();
    fetchProducts();
  }, []);

  // =========================================================
  // FETCH DISCOUNTS
  // =========================================================

  const fetchDiscounts = async () => {
    try {
      const res = await api.get('/client/discounts');

      setDiscounts(
        Array.isArray(res.data?.data)
          ? res.data.data
          : []
      );
    } catch (error) {
      console.error(
        'Failed to fetch discounts:',
        error
      );
    }
  };

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================

  const fetchProducts = async () => {
    try {
      const res = await api.get('/client/products');

      setProducts(
        Array.isArray(res.data?.data)
          ? res.data.data
          : []
      );
    } catch (error) {
      console.error(
        'Failed to fetch products:',
        error
      );
    }
  };

  // =========================================================
  // ADD MODAL
  // =========================================================

  const openAddModal = () => {
    setModalMode('add');
    setSelectedDiscount(null);
    setSubmitError('');

    setFormData({
      productId: '',
      percentage: '',
      startDate: '',
      endDate: ''
    });

    setIsModalOpen(true);
  };

  // =========================================================
  // EDIT MODAL
  // =========================================================

  const openEditModal = (discount) => {
    setModalMode('edit');
    setSelectedDiscount(discount);
    setSubmitError('');

    const formatDt = (dateStr) => {
      if (!dateStr) return '';

      const date = new Date(dateStr);

      if (Number.isNaN(date.getTime())) {
        return '';
      }

      return date.toISOString().split('T')[0];
    };

    setFormData({
      productId: discount.productId,
      percentage: discount.percentage,
      startDate: formatDt(discount.startDate),
      endDate: formatDt(discount.endDate)
    });

    setIsModalOpen(true);
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setSubmitError('');

    try {
      if (modalMode === 'add') {
        await api.post('/client/discounts', {
          productId: formData.productId,
          percentage: Number(formData.percentage),
          startDate: formData.startDate,
          endDate: formData.endDate
        });
      } else {
        await api.put(
          `/client/discounts/${selectedDiscount.discountId}`,
          {
            percentage: Number(formData.percentage),
            startDate: formData.startDate,
            endDate: formData.endDate
          }
        );
      }

      setIsModalOpen(false);

      await fetchDiscounts();
    } catch (error) {
      let msg =
        error?.response?.data?.message ||
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
  // SOFT DELETE
  // =========================================================

  const handleSoftDelete = async () => {
    if (!selectedDiscount) return;

    setIsLoading(true);

    try {
      await api.delete(
        `/client/discounts/${selectedDiscount.discountId}`
      );

      setIsDeleteModalOpen(false);
      setSelectedDiscount(null);

      await fetchDiscounts();
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
    if (!selectedDiscount) return;

    setIsLoading(true);

    try {
      await api.delete(
        `/client/discounts/${selectedDiscount.discountId}/permanent`
      );

      setIsHardDeleteModalOpen(false);
      setSelectedDiscount(null);

      await fetchDiscounts();
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        'Permanent delete failed.';

      alert(
        Array.isArray(msg)
          ? msg[0]
          : msg
      );
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================
  // RESTORE
  // =========================================================

  const handleRestore = async (discountId) => {
    try {
      await api.patch(
        `/client/discounts/${discountId}/restore`
      );

      await fetchDiscounts();
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        'Restore failed.';

      alert(
        Array.isArray(msg)
          ? msg[0]
          : msg
      );
    }
  };

  // =========================================================
  // FILTER
  // =========================================================

  const filteredData = discounts
    .filter((discount) => {
      const isLive =
        discount.isActive == 1 ||
        discount.isActive === true ||
        discount.is_active == 1 ||
        discount.is_active === true;

      return viewMode === 'active'
        ? isLive
        : !isLive;
    })
    .filter((discount) =>
      String(
        discount.productName || ''
      )
        .toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )
    );

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (date) => {
    if (!date) return '--';

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return '--';
    }

    return parsed.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      className="
        w-full
        max-w-[1400px]
        mx-auto
        space-y-6
        sm:space-y-8
        animate-fade-in
        px-1
        sm:px-2
        pb-10
      "
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          flex
          flex-col
          gap-5
          border-b
          border-gray-200
          pb-6
          sm:pb-8
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >

        <div className="min-w-0">

          <h1
            className="
              text-3xl
              sm:text-4xl
              md:text-5xl
              font-black
              uppercase
              tracking-tighter
              text-[#111]
              leading-none
            "
          >
            Flash Sales
          </h1>

          <p
            className="
              text-gray-500
              text-[8px]
              sm:text-[10px]
              font-bold
              uppercase
              tracking-[0.2em]
              sm:tracking-[0.3em]
              mt-2
            "
          >
            Discount Operations
          </p>

        </div>


        {/* ACTIONS */}

        <div
          className="
            flex
            flex-col
            sm:flex-row
            gap-3
            w-full
            lg:w-auto
          "
        >

          {/* ACTIVE / BIN */}

          <div
            className="
              bg-white
              p-1
              rounded-2xl
              border
              border-gray-100
              flex
              shadow-sm
              w-full
              sm:w-auto
            "
          >

            <button
              onClick={() =>
                setViewMode('active')
              }
              className={`
                flex-1
                sm:flex-none
                px-4
                sm:px-6
                py-3
                rounded-xl
                text-[9px]
                sm:text-[10px]
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
              onClick={() =>
                setViewMode('archived')
              }
              className={`
                flex-1
                sm:flex-none
                px-4
                sm:px-6
                py-3
                rounded-xl
                text-[9px]
                sm:text-[10px]
                font-bold
                uppercase
                tracking-widest
                transition-all
                flex
                items-center
                justify-center
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


          {/* NEW SALE */}

          <button
            onClick={openAddModal}
            className="
              w-full
              sm:w-auto
              bg-[#1A1A1A]
              text-white
              px-5
              sm:px-6
              py-3
              rounded-2xl
              hover:bg-[#9B4819]
              flex
              items-center
              justify-center
              gap-2
              font-bold
              uppercase
              text-[9px]
              sm:text-[10px]
              shadow-xl
              transition-colors
              active:scale-[0.98]
            "
          >
            <Plus size={16} />
            New Flash Sale
          </button>

        </div>

      </div>


      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="relative w-full sm:max-w-md">

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
          placeholder="SEARCH BY PRODUCT..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
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
            text-[9px]
            sm:text-[10px]
            font-bold
            uppercase
            outline-none
            focus:border-[#1A1A1A]
            transition-colors
          "
        />

      </div>


      {/* =====================================================
          DESKTOP TABLE
      ===================================================== */}

      <div
        className="
          hidden
          md:block
          bg-white
          rounded-[2rem]
          lg:rounded-[2.5rem]
          border
          border-[#EEE]
          overflow-hidden
          shadow-sm
        "
      >

        <div className="overflow-x-auto">

          <table
            className="
              w-full
              min-w-[760px]
              text-left
              border-collapse
            "
          >

            <thead className="bg-gray-50/50">

              <tr>

                <th className="p-5 lg:p-6 text-[10px] font-black uppercase text-gray-400">
                  Target Product
                </th>

                <th className="p-5 lg:p-6 text-[10px] font-black uppercase text-gray-400">
                  Discount Rate
                </th>

                <th className="p-5 lg:p-6 text-[10px] font-black uppercase text-gray-400">
                  Validity Period
                </th>

                <th className="p-5 lg:p-6 text-right text-[10px] font-black uppercase text-gray-400">
                  Actions
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-[#F9F9F9]">

              {filteredData.length > 0 ? (

                filteredData.map((discount) => (

                  <tr
                    key={discount.discountId}
                    className="
                      hover:bg-[#FAFAFA]
                      transition-colors
                    "
                  >

                    {/* PRODUCT */}

                    <td
                      className={`
                        p-5
                        lg:p-6
                        font-black
                        uppercase
                        text-sm
                        ${
                          viewMode === 'archived'
                            ? 'text-gray-400'
                            : 'text-[#111]'
                        }
                      `}
                    >

                      <div className="flex items-center gap-3 min-w-0">

                        <Package
                          size={16}
                          className="text-gray-400 shrink-0"
                        />

                        <span className="truncate">
                          {discount.productName ||
                            'Unknown Product'}
                        </span>

                      </div>

                    </td>


                    {/* DISCOUNT */}

                    <td className="p-5 lg:p-6">

                      <span
                        className={`
                          inline-flex
                          px-3
                          py-1.5
                          rounded-xl
                          text-[11px]
                          font-black
                          border
                          whitespace-nowrap
                          ${
                            viewMode === 'archived'
                              ? 'bg-gray-100 text-gray-500 border-gray-200'
                              : 'bg-green-50 text-green-700 border-green-100'
                          }
                        `}
                      >
                        {discount.percentage}% OFF
                      </span>

                    </td>


                    {/* VALIDITY */}

                    <td className="p-5 lg:p-6">

                      <div
                        className="
                          flex
                          items-center
                          gap-2
                          text-[10px]
                          font-bold
                          text-gray-500
                          uppercase
                          tracking-widest
                          whitespace-nowrap
                        "
                      >

                        <Calendar size={12} />

                        {formatDate(
                          discount.startDate
                        )}

                        <span>—</span>

                        {formatDate(
                          discount.endDate
                        )}

                      </div>

                    </td>


                    {/* ACTIONS */}

                    <td className="p-5 lg:p-6 text-right">

                      <div className="flex justify-end gap-2">

                        {viewMode === 'active' ? (

                          <>
                            <button
                              onClick={() =>
                                openEditModal(
                                  discount
                                )
                              }
                              className="
                                p-2
                                bg-gray-100
                                hover:bg-[#1A1A1A]
                                hover:text-white
                                rounded-lg
                                transition-colors
                              "
                            >
                              <Edit2 size={14} />
                            </button>


                            <button
                              onClick={() => {
                                setSelectedDiscount(
                                  discount
                                );
                                setIsDeleteModalOpen(
                                  true
                                );
                              }}
                              className="
                                p-2
                                bg-orange-50
                                text-orange-500
                                hover:bg-orange-500
                                hover:text-white
                                rounded-lg
                                transition-colors
                              "
                            >
                              <Trash2 size={14} />
                            </button>
                          </>

                        ) : (

                          <>
                            <button
                              onClick={() =>
                                handleRestore(
                                  discount.discountId
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
                                text-green-600
                                hover:bg-green-600
                                hover:text-white
                                rounded-xl
                                transition-all
                              "
                            >
                              <RefreshCcw size={12} />
                              Restore
                            </button>


                            <button
                              onClick={() => {
                                setSelectedDiscount(
                                  discount
                                );
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
                            >
                              <ShieldAlert size={14} />
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
                    colSpan="4"
                    className="
                      p-20
                      text-center
                    "
                  >

                    <Zap
                      size={40}
                      className="
                        mx-auto
                        text-gray-200
                        mb-4
                      "
                    />

                    <h3
                      className="
                        text-[10px]
                        font-black
                        uppercase
                        tracking-widest
                        text-gray-400
                      "
                    >
                      No {viewMode} Discounts
                    </h3>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =====================================================
          MOBILE CARDS
      ===================================================== */}

      <div className="md:hidden space-y-3">

        {filteredData.length > 0 ? (

          filteredData.map((discount) => (

            <motion.div
              key={discount.discountId}
              initial={{
                opacity: 0,
                y: 10
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              className="
                bg-white
                rounded-2xl
                border
                border-[#EEE]
                p-4
                shadow-sm
              "
            >

              {/* TOP */}

              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-3
                "
              >

                <div
                  className="
                    flex
                    items-start
                    gap-3
                    min-w-0
                    flex-1
                  "
                >

                  <div
                    className="
                      w-10
                      h-10
                      rounded-xl
                      bg-[#F5F5F5]
                      flex
                      items-center
                      justify-center
                      shrink-0
                    "
                  >
                    <Package
                      size={17}
                      className="text-gray-400"
                    />
                  </div>


                  <div className="min-w-0">

                    <p
                      className={`
                        text-xs
                        font-black
                        uppercase
                        leading-tight
                        break-words
                        ${
                          viewMode === 'archived'
                            ? 'text-gray-400'
                            : 'text-[#111]'
                        }
                      `}
                    >
                      {discount.productName ||
                        'Unknown Product'}
                    </p>


                    <p
                      className="
                        text-[8px]
                        font-bold
                        uppercase
                        tracking-widest
                        text-gray-400
                        mt-1
                      "
                    >
                      Discount
                    </p>

                  </div>

                </div>


                {/* PERCENTAGE */}

                <span
                  className={`
                    shrink-0
                    px-2.5
                    py-1.5
                    rounded-xl
                    text-[9px]
                    font-black
                    border
                    ${
                      viewMode === 'archived'
                        ? 'bg-gray-100 text-gray-500 border-gray-200'
                        : 'bg-green-50 text-green-700 border-green-100'
                    }
                  `}
                >
                  {discount.percentage}% OFF
                </span>

              </div>


              {/* VALIDITY */}

              <div
                className="
                  mt-4
                  p-3
                  bg-[#FAFAFA]
                  rounded-xl
                  flex
                  items-start
                  gap-2
                "
              >

                <Calendar
                  size={14}
                  className="
                    text-gray-400
                    shrink-0
                    mt-0.5
                  "
                />

                <div>

                  <p
                    className="
                      text-[7px]
                      font-black
                      uppercase
                      tracking-widest
                      text-gray-400
                    "
                  >
                    Validity Period
                  </p>

                  <p
                    className="
                      text-[9px]
                      font-bold
                      uppercase
                      text-gray-600
                      mt-1
                      leading-relaxed
                    "
                  >
                    {formatDate(
                      discount.startDate
                    )}

                    {' — '}

                    {formatDate(
                      discount.endDate
                    )}
                  </p>

                </div>

              </div>


              {/* ACTIONS */}

              <div
                className="
                  flex
                  gap-2
                  mt-4
                "
              >

                {viewMode === 'active' ? (

                  <>
                    <button
                      onClick={() =>
                        openEditModal(
                          discount
                        )
                      }
                      className="
                        flex-1
                        flex
                        items-center
                        justify-center
                        gap-2
                        py-3
                        rounded-xl
                        bg-gray-100
                        text-[#111]
                        hover:bg-[#1A1A1A]
                        hover:text-white
                        text-[8px]
                        font-black
                        uppercase
                        tracking-widest
                        transition-colors
                      "
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>


                    <button
                      onClick={() => {
                        setSelectedDiscount(
                          discount
                        );
                        setIsDeleteModalOpen(
                          true
                        );
                      }}
                      className="
                        flex-1
                        flex
                        items-center
                        justify-center
                        gap-2
                        py-3
                        rounded-xl
                        bg-orange-50
                        text-orange-500
                        hover:bg-orange-500
                        hover:text-white
                        text-[8px]
                        font-black
                        uppercase
                        tracking-widest
                        transition-colors
                      "
                    >
                      <Trash2 size={14} />
                      Move to Bin
                    </button>
                  </>

                ) : (

                  <>
                    <button
                      onClick={() =>
                        handleRestore(
                          discount.discountId
                        )
                      }
                      className="
                        flex-1
                        flex
                        items-center
                        justify-center
                        gap-2
                        py-3
                        rounded-xl
                        bg-green-50
                        text-green-600
                        hover:bg-green-600
                        hover:text-white
                        text-[8px]
                        font-black
                        uppercase
                        tracking-widest
                        transition-colors
                      "
                    >
                      <RefreshCcw size={14} />
                      Restore
                    </button>


                    <button
                      onClick={() => {
                        setSelectedDiscount(
                          discount
                        );
                        setIsHardDeleteModalOpen(
                          true
                        );
                      }}
                      className="
                        w-12
                        flex
                        items-center
                        justify-center
                        rounded-xl
                        bg-red-50
                        text-red-600
                        hover:bg-red-600
                        hover:text-white
                        transition-colors
                      "
                    >
                      <ShieldAlert size={15} />
                    </button>
                  </>

                )}

              </div>

            </motion.div>

          ))

        ) : (

          <div
            className="
              bg-white
              rounded-2xl
              border
              border-[#EEE]
              p-12
              text-center
            "
          >

            <Zap
              size={36}
              className="
                mx-auto
                text-gray-200
                mb-4
              "
            />

            <h3
              className="
                text-[9px]
                font-black
                uppercase
                tracking-widest
                text-gray-400
              "
            >
              No {viewMode} Discounts
            </h3>

          </div>

        )}

      </div>


      {/* =====================================================
          MODALS
      ===================================================== */}

      <AnimatePresence>

        {/* ===================================================
            ADD / EDIT
        =================================================== */}

        {isModalOpen && (

          <div
            className="
              fixed
              inset-0
              z-[100]
              flex
              items-center
              justify-center
              p-3
              sm:p-4
            "
          >

            <motion.div
              initial={{
                opacity: 0
              }}
              animate={{
                opacity: 1
              }}
              exit={{
                opacity: 0
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
                y: 10
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0
              }}
              className="
                relative
                bg-white
                w-full
                max-w-md
                max-h-[92vh]
                overflow-y-auto
                rounded-[2rem]
                sm:rounded-[3rem]
                p-5
                sm:p-8
                lg:p-10
                shadow-2xl
              "
            >

              {/* HEADER */}

              <div
                className="
                  flex
                  justify-between
                  items-start
                  gap-4
                  mb-6
                  sm:mb-8
                "
              >

                <h2
                  className="
                    text-xl
                    sm:text-2xl
                    font-black
                    uppercase
                    tracking-tighter
                  "
                >
                  {modalMode === 'add'
                    ? 'New Sale'
                    : 'Edit Sale'}
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
                    shrink-0
                  "
                >
                  <X size={20} />
                </button>

              </div>


              {/* ERROR */}

              {submitError && (

                <div
                  className="
                    bg-red-50
                    text-red-600
                    text-[9px]
                    sm:text-[10px]
                    font-bold
                    uppercase
                    p-3
                    sm:p-4
                    rounded-2xl
                    mb-5
                    border
                    border-red-100
                    break-words
                  "
                >
                  {submitError}
                </div>

              )}


              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >

                <select
                  required
                  disabled={
                    modalMode === 'edit'
                  }
                  value={
                    formData.productId
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      productId:
                        e.target.value
                    })
                  }
                  className="
                    w-full
                    bg-[#FAFAFA]
                    rounded-xl
                    p-4
                    text-[10px]
                    sm:text-[11px]
                    font-bold
                    outline-none
                    disabled:opacity-50
                    appearance-none
                    focus:ring-2
                    focus:ring-[#1A1A1A]
                  "
                >

                  <option value="">
                    SELECT PRODUCT
                  </option>

                  {products.map(
                    (product, index) => (

                      <option
                        key={
                          product.productId ||
                          product.id ||
                          index
                        }
                        value={
                          product.productId ||
                          product.id
                        }
                      >
                        {String(
                          product.name ||
                          product.productName ||
                          ''
                        ).toUpperCase()}
                      </option>

                    )
                  )}

                </select>


                <input
                  required
                  type="number"
                  min="1"
                  max="100"
                  placeholder="DISCOUNT PERCENTAGE (%)"
                  value={
                    formData.percentage
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      percentage:
                        e.target.value
                    })
                  }
                  className="
                    w-full
                    bg-[#FAFAFA]
                    rounded-xl
                    p-4
                    text-[10px]
                    sm:text-[11px]
                    font-bold
                    outline-none
                    focus:ring-2
                    focus:ring-[#1A1A1A]
                  "
                />


                {/* DATES */}

                <div
                  className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    gap-4
                  "
                >

                  <div>

                    <label
                      className="
                        text-[8px]
                        sm:text-[9px]
                        font-black
                        text-gray-400
                        uppercase
                        ml-2
                        tracking-widest
                      "
                    >
                      Start Date
                    </label>

                    <input
                      required
                      type="date"
                      value={
                        formData.startDate
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          startDate:
                            e.target.value
                        })
                      }
                      className="
                        w-full
                        bg-[#FAFAFA]
                        rounded-xl
                        p-4
                        text-[10px]
                        sm:text-[11px]
                        font-bold
                        outline-none
                        mt-1
                        focus:ring-2
                        focus:ring-[#1A1A1A]
                      "
                    />

                  </div>


                  <div>

                    <label
                      className="
                        text-[8px]
                        sm:text-[9px]
                        font-black
                        text-gray-400
                        uppercase
                        ml-2
                        tracking-widest
                      "
                    >
                      End Date
                    </label>

                    <input
                      required
                      type="date"
                      value={
                        formData.endDate
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          endDate:
                            e.target.value
                        })
                      }
                      className="
                        w-full
                        bg-[#FAFAFA]
                        rounded-xl
                        p-4
                        text-[10px]
                        sm:text-[11px]
                        font-bold
                        outline-none
                        mt-1
                        focus:ring-2
                        focus:ring-[#1A1A1A]
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
                    py-4
                    sm:py-5
                    rounded-2xl
                    text-[9px]
                    sm:text-[10px]
                    font-black
                    uppercase
                    tracking-widest
                    mt-5
                    transition-all
                    disabled:opacity-50
                  "
                >

                  {isLoading ? (

                    <Loader2
                      className="
                        animate-spin
                        mx-auto
                      "
                    />

                  ) : (

                    'Save Sale'

                  )}

                </button>

              </form>

            </motion.div>

          </div>

        )}


        {/* ===================================================
            SOFT DELETE
        =================================================== */}

        {isDeleteModalOpen && (

          <div
            className="
              fixed
              inset-0
              z-[200]
              flex
              items-center
              justify-center
              p-4
            "
          >

            <motion.div
              initial={{
                opacity: 0
              }}
              animate={{
                opacity: 1
              }}
              exit={{
                opacity: 0
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
                scale: 0.95
              }}
              animate={{
                opacity: 1,
                scale: 1
              }}
              className="
                relative
                bg-white
                w-full
                max-w-md
                rounded-3xl
                p-6
                sm:p-8
                text-center
                shadow-2xl
              "
            >

              <div
                className="
                  w-14
                  h-14
                  sm:w-16
                  sm:h-16
                  bg-orange-50
                  text-orange-500
                  rounded-full
                  flex
                  items-center
                  justify-center
                  mb-5
                  sm:mb-6
                  mx-auto
                "
              >
                <Archive
                  size={28}
                />
              </div>


              <h2
                className="
                  text-xl
                  sm:text-2xl
                  font-black
                  uppercase
                  mb-2
                  tracking-tighter
                "
              >
                Move to Bin?
              </h2>


              <p
                className="
                  text-[10px]
                  text-gray-400
                  font-medium
                "
              >
                This sale will be archived.
              </p>


              <button
                onClick={
                  handleSoftDelete
                }
                disabled={isLoading}
                className="
                  w-full
                  bg-orange-50
                  text-orange-600
                  hover:bg-orange-500
                  hover:text-white
                  py-4
                  rounded-xl
                  text-[9px]
                  font-black
                  uppercase
                  tracking-widest
                  mt-6
                  transition-all
                "
              >
                {isLoading
                  ? 'Processing...'
                  : 'Confirm'}
              </button>


              <button
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
                  text-[9px]
                  font-black
                  uppercase
                  tracking-widest
                  mt-1
                "
              >
                Cancel
              </button>

            </motion.div>

          </div>

        )}


        {/* ===================================================
            HARD DELETE
        =================================================== */}

        {isHardDeleteModalOpen && (

          <div
            className="
              fixed
              inset-0
              z-[200]
              flex
              items-center
              justify-center
              p-4
            "
          >

            <motion.div
              initial={{
                opacity: 0
              }}
              animate={{
                opacity: 1
              }}
              exit={{
                opacity: 0
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
                scale: 0.95
              }}
              animate={{
                opacity: 1,
                scale: 1
              }}
              className="
                relative
                bg-white
                w-full
                max-w-md
                rounded-3xl
                p-6
                sm:p-8
                text-center
                shadow-2xl
              "
            >

              <div
                className="
                  w-14
                  h-14
                  sm:w-16
                  sm:h-16
                  bg-red-100
                  text-red-600
                  rounded-full
                  flex
                  items-center
                  justify-center
                  mb-5
                  sm:mb-6
                  mx-auto
                "
              >
                <ShieldAlert
                  size={28}
                />
              </div>


              <h2
                className="
                  text-xl
                  sm:text-2xl
                  font-black
                  uppercase
                  mb-2
                  tracking-tighter
                "
              >
                Delete Forever?
              </h2>


              <p
                className="
                  text-[10px]
                  sm:text-xs
                  text-gray-500
                  font-medium
                  leading-relaxed
                "
              >
                This removes the sale completely.
                Cannot be undone.
              </p>


              <button
                onClick={
                  handleHardDelete
                }
                disabled={isLoading}
                className="
                  w-full
                  bg-red-600
                  text-white
                  hover:bg-red-700
                  py-4
                  rounded-xl
                  text-[9px]
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

                  'Destroy Permanently'

                )}

              </button>


              <button
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
                  text-[9px]
                  font-black
                  uppercase
                  tracking-widest
                  mt-1
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

export default ClientDiscounts;