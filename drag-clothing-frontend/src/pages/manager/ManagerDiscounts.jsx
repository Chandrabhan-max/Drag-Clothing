import React, {
  useState,
  useEffect,
} from 'react';

import {
  motion,
  AnimatePresence,
} from 'framer-motion';

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
  ShieldAlert,
} from 'lucide-react';

import api from '../../api/axios';

const ManagerDiscounts = () => {
  const [viewMode, setViewMode] =
    useState('active');

  const [discounts, setDiscounts] =
    useState([]);

  const [products, setProducts] =
    useState([]);

  const [searchTerm, setSearchTerm] =
    useState('');

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] =
    useState(false);

  const [isHardDeleteModalOpen, setIsHardDeleteModalOpen] =
    useState(false);

  const [modalMode, setModalMode] =
    useState('add');

  const [selectedDiscount, setSelectedDiscount] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(false);

  const [submitError, setSubmitError] =
    useState('');

  const [formData, setFormData] =
    useState({
      productId: '',
      percentage: '',
      startDate: '',
      endDate: '',
    });

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchDiscounts();
    fetchProducts();
  }, []);

  // =====================================================
  // FETCH DISCOUNTS
  // =====================================================

  const fetchDiscounts = async () => {
    try {
      const res =
        await api.get(
          '/manager/discounts'
        );

      setDiscounts(
        res?.data?.data || []
      );
    } catch (error) {
      console.error(
        'Failed to fetch manager discounts:',
        error
      );
    }
  };

  // =====================================================
  // FETCH PRODUCTS
  // =====================================================

  const fetchProducts = async () => {
    try {
      const res =
        await api.get(
          '/manager/products'
        );

      setProducts(
        res?.data?.data || []
      );
    } catch (error) {
      console.error(
        'Failed to fetch manager products:',
        error
      );
    }
  };

  // =====================================================
  // ADD
  // =====================================================

  const openAddModal = () => {
    setModalMode('add');
    setSelectedDiscount(null);
    setSubmitError('');

    setFormData({
      productId: '',
      percentage: '',
      startDate: '',
      endDate: '',
    });

    setIsModalOpen(true);
  };

  // =====================================================
  // EDIT
  // =====================================================

  const openEditModal = (
    discount
  ) => {
    setModalMode('edit');
    setSelectedDiscount(
      discount
    );
    setSubmitError('');

    const formatDt = (
      dateStr
    ) => {
      if (!dateStr) {
        return '';
      }

      const date =
        new Date(dateStr);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return '';
      }

      return date
        .toISOString()
        .split('T')[0];
    };

    setFormData({
      productId:
        discount?.productId || '',

      percentage:
        discount?.percentage || '',

      startDate:
        formatDt(
          discount?.startDate
        ),

      endDate:
        formatDt(
          discount?.endDate
        ),
    });

    setIsModalOpen(true);
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    setIsLoading(true);
    setSubmitError('');

    try {
      if (
        modalMode === 'add'
      ) {
        await api.post(
          '/manager/discounts',
          {
            productId:
              formData.productId,

            percentage:
              Number(
                formData.percentage
              ),

            startDate:
              formData.startDate,

            endDate:
              formData.endDate,
          }
        );
      } else {
        await api.put(
          `/manager/discounts/${selectedDiscount.discountId}`,
          {
            percentage:
              Number(
                formData.percentage
              ),

            startDate:
              formData.startDate,

            endDate:
              formData.endDate,
          }
        );
      }

      setIsModalOpen(false);

      await fetchDiscounts();
    } catch (error) {
      let msg =
        error?.response?.data
          ?.message ||
        'Action failed.';

      if (
        Array.isArray(msg)
      ) {
        msg = msg[0];
      }

      setSubmitError(
        String(msg)
      );
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================
  // SOFT DELETE
  // =====================================================

  const handleSoftDelete =
    async () => {
      if (!selectedDiscount) {
        return;
      }

      setIsLoading(true);

      try {
        await api.delete(
          `/manager/discounts/${selectedDiscount.discountId}`
        );

        setIsDeleteModalOpen(
          false
        );

        setSelectedDiscount(
          null
        );

        await fetchDiscounts();
      } catch (error) {
        console.error(
          'Delete discount failed:',
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

  // =====================================================
  // HARD DELETE
  // =====================================================

  const handleHardDelete =
    async () => {
      if (!selectedDiscount) {
        return;
      }

      setIsLoading(true);

      try {
        await api.delete(
          `/manager/discounts/${selectedDiscount.discountId}/permanent`
        );

        setIsHardDeleteModalOpen(
          false
        );

        setSelectedDiscount(
          null
        );

        await fetchDiscounts();
      } catch (error) {
        const msg =
          error?.response?.data
            ?.message ||
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

  // =====================================================
  // RESTORE
  // =====================================================

  const handleRestore =
    async (
      discountId
    ) => {
      try {
        await api.patch(
          `/manager/discounts/${discountId}/restore`
        );

        await fetchDiscounts();
      } catch (error) {
        const msg =
          error?.response?.data
            ?.message ||
          'Restore failed.';

        alert(
          Array.isArray(msg)
            ? msg[0]
            : msg
        );
      }
    };

  // =====================================================
  // FILTER
  // =====================================================

  const filteredData =
    discounts
      .filter((discount) => {
        const isLive =
          discount?.isActive == 1 ||
          discount?.isActive === true ||
          discount?.is_active == 1 ||
          discount?.is_active === true;

        return viewMode === 'active'
          ? isLive
          : !isLive;
      })
      .filter((discount) =>
        String(
          discount?.productName ||
            ''
        )
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          )
      );

  return (
    <div className="space-y-8 animate-fade-in p-4">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-8">

        <div>

          <h1 className="text-4xl font-black uppercase tracking-tighter text-[#111]">
            Flash Sales
          </h1>

          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
            Discount Operations
          </p>

        </div>

        <div className="flex gap-3 w-full md:w-auto">

          <div className="bg-white p-1 rounded-2xl border border-gray-100 flex shadow-sm">

            <button
              type="button"
              onClick={() =>
                setViewMode(
                  'active'
                )
              }
              className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                viewMode ===
                'active'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-gray-400 hover:text-black'
              }`}
            >
              Active
            </button>

            <button
              type="button"
              onClick={() =>
                setViewMode(
                  'archived'
                )
              }
              className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                viewMode ===
                'archived'
                  ? 'bg-red-50 text-red-600'
                  : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <Archive
                size={14}
              />

              Bin
            </button>

          </div>

          <button
            type="button"
            onClick={
              openAddModal
            }
            className="bg-[#1A1A1A] text-white px-6 py-3 rounded-2xl hover:bg-[#9B4819] flex items-center gap-2 font-bold uppercase text-[10px] shadow-xl"
          >
            <Plus
              size={16}
            />

            New Flash Sale
          </button>

        </div>

      </div>

      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="relative w-full md:w-96">

        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
          size={18}
        />

        <input
          type="text"
          placeholder="SEARCH BY PRODUCT..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(
              e.target.value
            )
          }
          className="w-full bg-white border border-[#EEE] rounded-2xl py-4 pl-12 pr-6 text-[10px] font-bold uppercase outline-none focus:border-[#1A1A1A]"
        />

      </div>

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="bg-white rounded-[2.5rem] border border-[#EEE] overflow-hidden shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full text-left border-collapse">

            <thead className="bg-gray-50/50">

              <tr>

                <th className="p-6 text-[10px] font-black uppercase text-gray-400">
                  Target Product
                </th>

                <th className="p-6 text-[10px] font-black uppercase text-gray-400">
                  Discount Rate
                </th>

                <th className="p-6 text-[10px] font-black uppercase text-gray-400">
                  Validity Period
                </th>

                <th className="p-6 text-right text-[10px] font-black uppercase text-gray-400">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-[#F9F9F9]">

              {filteredData.length >
              0 ? (
                filteredData.map(
                  (discount) => (
                    <tr
                      key={
                        discount.discountId
                      }
                      className="hover:bg-[#FAFAFA]"
                    >

                      <td
                        className={`p-6 font-black uppercase text-sm ${
                          viewMode ===
                          'archived'
                            ? 'text-gray-400'
                            : 'text-[#111]'
                        }`}
                      >

                        <div className="flex items-center gap-3">

                          <Package
                            size={16}
                            className="text-gray-400"
                          />

                          {discount.productName ||
                            'Unknown Product'}

                        </div>

                      </td>

                      <td className="p-6">

                        <span
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-black border ${
                            viewMode ===
                            'archived'
                              ? 'bg-gray-100 text-gray-500 border-gray-200'
                              : 'bg-green-50 text-green-700 border-green-100'
                          }`}
                        >
                          {discount.percentage}%
                          {' '}
                          OFF
                        </span>

                      </td>

                      <td className="p-6">

                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">

                          <Calendar
                            size={12}
                          />

                          {discount.startDate
                            ? new Date(
                                discount.startDate
                              ).toLocaleDateString()
                            : 'N/A'}

                          {' — '}

                          {discount.endDate
                            ? new Date(
                                discount.endDate
                              ).toLocaleDateString()
                            : 'N/A'}

                        </div>

                      </td>

                      <td className="p-6 text-right">

                        <div className="flex justify-end gap-2">

                          {viewMode ===
                          'active' ? (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  openEditModal(
                                    discount
                                  )
                                }
                                className="p-2 bg-gray-100 hover:bg-[#1A1A1A] hover:text-white rounded-lg transition-colors"
                              >
                                <Edit2
                                  size={14}
                                />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDiscount(
                                    discount
                                  );

                                  setIsDeleteModalOpen(
                                    true
                                  );
                                }}
                                className="p-2 bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white rounded-lg transition-colors"
                              >
                                <Trash2
                                  size={14}
                                />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRestore(
                                    discount.discountId
                                  )
                                }
                                className="px-4 py-2 bg-green-50 text-[9px] flex items-center gap-2 font-black uppercase text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition-all"
                              >
                                <RefreshCcw
                                  size={12}
                                />

                                Restore
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDiscount(
                                    discount
                                  );

                                  setIsHardDeleteModalOpen(
                                    true
                                  );
                                }}
                                className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all"
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
                  )
                )
              ) : (
                <tr>

                  <td
                    colSpan="4"
                    className="p-20 text-center"
                  >

                    <Zap
                      size={40}
                      className="mx-auto text-gray-200 mb-4"
                    />

                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      No {viewMode} Discounts
                    </h3>

                  </td>

                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =================================================
          MODALS
      ================================================= */}

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
                setIsModalOpen(
                  false
                )
              }
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
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
              className="relative bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl"
            >

              <div className="flex justify-between items-start mb-8">

                <h2 className="text-2xl font-black uppercase tracking-tighter">
                  {modalMode ===
                  'add'
                    ? 'New Sale'
                    : 'Edit Sale'}
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    setIsModalOpen(
                      false
                    )
                  }
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X
                    size={20}
                  />
                </button>

              </div>

              {submitError && (
                <div className="bg-red-50 text-red-600 text-[10px] font-bold uppercase p-4 rounded-2xl mb-6 border border-red-100">
                  {submitError}
                </div>
              )}

              <form
                onSubmit={
                  handleSubmit
                }
                className="space-y-4"
              >

                <select
                  required
                  disabled={
                    modalMode ===
                    'edit'
                  }
                  value={
                    formData.productId
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      productId:
                        e.target.value,
                    })
                  }
                  className="w-full bg-[#FAFAFA] rounded-xl p-4 text-[11px] font-bold outline-none disabled:opacity-50 appearance-none focus:ring-2 focus:ring-[#1A1A1A]"
                >

                  <option value="">
                    SELECT PRODUCT
                  </option>

                  {products.map(
                    (
                      product,
                      index
                    ) => (
                      <option
                        key={
                          product?.productId ||
                          product?.id ||
                          index
                        }
                        value={
                          product?.productId ||
                          product?.id
                        }
                      >
                        {String(
                          product?.name ||
                            product?.productName ||
                            'PRODUCT'
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
                        e.target.value,
                    })
                  }
                  className="w-full bg-[#FAFAFA] rounded-xl p-4 text-[11px] font-bold outline-none focus:ring-2 focus:ring-[#1A1A1A]"
                />

                <div className="grid grid-cols-2 gap-4">

                  <div>

                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest">
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
                            e.target.value,
                        })
                      }
                      className="w-full bg-[#FAFAFA] rounded-xl p-4 text-[11px] font-bold outline-none mt-1 focus:ring-2 focus:ring-[#1A1A1A]"
                    />

                  </div>

                  <div>

                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest">
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
                            e.target.value,
                        })
                      }
                      className="w-full bg-[#FAFAFA] rounded-xl p-4 text-[11px] font-bold outline-none mt-1 focus:ring-2 focus:ring-[#1A1A1A]"
                    />

                  </div>

                </div>

                <button
                  type="submit"
                  disabled={
                    isLoading
                  }
                  className="w-full bg-[#1A1A1A] hover:bg-[#9B4819] text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest mt-6 transition-all"
                >

                  {isLoading ? (
                    <Loader2 className="animate-spin mx-auto" />
                  ) : (
                    'Save Sale'
                  )}

                </button>

              </form>

            </motion.div>

          </div>
        )}

        {/* SOFT DELETE */}

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
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
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
              className="relative bg-white w-full max-w-md rounded-3xl p-8 text-center shadow-2xl"
            >

              <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Archive
                  size={32}
                />
              </div>

              <h2 className="text-2xl font-black uppercase mb-2 tracking-tighter">
                Move to Bin?
              </h2>

              <button
                type="button"
                onClick={
                  handleSoftDelete
                }
                disabled={
                  isLoading
                }
                className="w-full bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest mt-6 transition-all"
              >
                Confirm
              </button>

              <button
                type="button"
                onClick={() =>
                  setIsDeleteModalOpen(
                    false
                  )
                }
                className="w-full bg-transparent text-gray-400 py-4 text-[10px] font-black uppercase tracking-widest mt-2 transition-all"
              >
                Cancel
              </button>

            </motion.div>

          </div>
        )}

        {/* HARD DELETE */}

        {isHardDeleteModalOpen && (
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
              className="relative bg-white w-full max-w-md rounded-3xl p-8 text-center shadow-2xl"
            >

              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 mx-auto">

                <ShieldAlert
                  size={32}
                />

              </div>

              <h2 className="text-2xl font-black uppercase mb-2 tracking-tighter">
                Delete Forever?
              </h2>

              <p className="text-xs text-gray-500 font-medium">
                This removes the sale completely. Cannot be undone.
              </p>

              <button
                type="button"
                onClick={
                  handleHardDelete
                }
                disabled={
                  isLoading
                }
                className="w-full bg-red-600 text-white hover:bg-red-700 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest mt-6 transition-all"
              >

                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  'Destroy Permanently'
                )}

              </button>

              <button
                type="button"
                onClick={() =>
                  setIsHardDeleteModalOpen(
                    false
                  )
                }
                className="w-full bg-transparent text-gray-400 py-4 text-[10px] font-black uppercase tracking-widest mt-2 transition-all"
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

export default ManagerDiscounts;