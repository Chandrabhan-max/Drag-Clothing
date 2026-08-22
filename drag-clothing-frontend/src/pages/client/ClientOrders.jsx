import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Search,
  Eye,
  RefreshCw,
  CheckCircle,
  Package,
  Truck,
  MapPin,
  PackageCheck,
  X,
  ChevronDown,
  Clock3,
  LoaderCircle,
  CircleCheck,
  CircleX,
  CalendarDays,
  Hash,
  User,
  Phone,
  MapPinned,
  CreditCard,
  Box,
} from 'lucide-react';
import api from '../../api/axios';

const ClientOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filterRef = useRef(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  // =========================================================
  // FETCH ORDERS
  // =========================================================
  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await api.get('/orders/client/my-orders');

      const fetchedOrders =
        res.data?.data?.data ||
        res.data?.data ||
        [];

      setOrders(
        Array.isArray(fetchedOrders)
          ? fetchedOrders
          : []
      );
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // CLOSE FILTER WHEN CLICKING OUTSIDE
  // =========================================================
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target)
      ) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      );
    };
  }, []);

  // =========================================================
  // UPDATE STATUS
  // =========================================================
  const updateStatus = async (
    orderId,
    newStatus
  ) => {
    try {
      await api.put(
        `/orders/${orderId}/status`,
        {
          status: newStatus,
        }
      );

      await fetchOrders();

      // Update currently opened order too
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) =>
          prev
            ? {
                ...prev,
                status: newStatus,
              }
            : prev
        );
      }
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          'Update failed'
      );
    }
  };

  // =========================================================
  // OPEN ORDER DETAILS
  // =========================================================
  const openOrderDetails = async (orderId) => {
    setDetailLoading(true);
    setDetailError('');
    setSelectedOrder(null);

    try {
      const res = await api.get(
        `/orders/${orderId}`
      );

      const orderData =
        res.data?.data || res.data;

      setSelectedOrder(orderData);
    } catch (error) {
      console.error(
        'Failed to fetch order details:',
        error
      );

      setDetailError(
        error?.response?.data?.message ||
          'Failed to load order details.'
      );
    } finally {
      setDetailLoading(false);
    }
  };

  // =========================================================
  // CLOSE ORDER DETAILS
  // =========================================================
  const closeOrderDetails = () => {
    if (detailLoading) return;

    setSelectedOrder(null);
    setDetailError('');
  };

  // =========================================================
  // STATUS CONFIG
  // =========================================================
  const statusConfig = {
    all: {
      label: 'All Orders',
      shortLabel: 'All',
      icon: Box,
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
      badge:
        'bg-gray-50 text-gray-600 border-gray-100',
    },

    pending: {
      label: 'Pending',
      shortLabel: 'Pending',
      icon: Clock3,
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-500',
      badge:
        'bg-orange-50 text-orange-600 border-orange-100',
    },

    confirmed: {
      label: 'Confirmed',
      shortLabel: 'Confirmed',
      icon: CircleCheck,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
      badge:
        'bg-blue-50 text-blue-600 border-blue-100',
    },

    processing: {
      label: 'Processing',
      shortLabel: 'Processing',
      icon: LoaderCircle,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-500',
      badge:
        'bg-purple-50 text-purple-600 border-purple-100',
    },

    shipped: {
      label: 'Shipped',
      shortLabel: 'Shipped',
      icon: Truck,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-500',
      badge:
        'bg-indigo-50 text-indigo-600 border-indigo-100',
    },

    in_transit: {
      label: 'In Transit',
      shortLabel: 'In Transit',
      icon: MapPin,
      iconBg: 'bg-cyan-50',
      iconColor: 'text-cyan-500',
      badge:
        'bg-cyan-50 text-cyan-600 border-cyan-100',
    },

    out_for_delivery: {
      label: 'Out for Delivery',
      shortLabel: 'Out for Delivery',
      icon: Truck,
      iconBg: 'bg-yellow-50',
      iconColor: 'text-yellow-500',
      badge:
        'bg-yellow-50 text-yellow-600 border-yellow-100',
    },

    delivered: {
      label: 'Delivered',
      shortLabel: 'Delivered',
      icon: PackageCheck,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-500',
      badge:
        'bg-green-50 text-green-600 border-green-100',
    },

    cancelled: {
      label: 'Cancelled',
      shortLabel: 'Cancelled',
      icon: CircleX,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500',
      badge:
        'bg-red-50 text-red-600 border-red-100',
    },
  };

  // =========================================================
  // STATUS COLOR
  // =========================================================
  const getStatusColor = (status) => {
    return (
      statusConfig[status]?.badge ||
      'bg-gray-50 text-gray-600 border-gray-100'
    );
  };

  // =========================================================
  // STATUS ICON
  // =========================================================
  const getStatusIcon = (status) => {
    const Icon =
      statusConfig[status]?.icon || Box;

    return Icon;
  };

  // =========================================================
  // STATUS LABEL
  // =========================================================
  const getStatusLabel = (status) => {
    return (
      statusConfig[status]?.label ||
      status?.replace(/_/g, ' ') ||
      'Unknown'
    );
  };

  // =========================================================
  // NEXT ACTION
  // =========================================================
  const getNextAction = (
    status,
    orderId
  ) => {
    const base =
      'p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center';

    switch (status) {
      case 'pending':
        return (
          <button
            onClick={() =>
              updateStatus(
                orderId,
                'confirmed'
              )
            }
            className={`${base} bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white`}
            title="Confirm"
          >
            <CheckCircle size={15} />
          </button>
        );

      case 'confirmed':
        return (
          <button
            onClick={() =>
              updateStatus(
                orderId,
                'processing'
              )
            }
            className={`${base} bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white`}
            title="Processing"
          >
            <Package size={15} />
          </button>
        );

      case 'processing':
        return (
          <button
            onClick={() =>
              updateStatus(
                orderId,
                'shipped'
              )
            }
            className={`${base} bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white`}
            title="Shipped"
          >
            <Truck size={15} />
          </button>
        );

      case 'shipped':
        return (
          <button
            onClick={() =>
              updateStatus(
                orderId,
                'in_transit'
              )
            }
            className={`${base} bg-cyan-50 text-cyan-600 hover:bg-cyan-600 hover:text-white`}
            title="In Transit"
          >
            <MapPin size={15} />
          </button>
        );

      case 'in_transit':
        return (
          <button
            onClick={() =>
              updateStatus(
                orderId,
                'out_for_delivery'
              )
            }
            className={`${base} bg-yellow-50 text-yellow-600 hover:bg-yellow-600 hover:text-white`}
            title="Out for Delivery"
          >
            <Truck size={15} />
          </button>
        );

      case 'out_for_delivery':
        return (
          <button
            onClick={() =>
              updateStatus(
                orderId,
                'delivered'
              )
            }
            className={`${base} bg-green-50 text-green-600 hover:bg-green-600 hover:text-white`}
            title="Delivered"
          >
            <PackageCheck size={15} />
          </button>
        );

      default:
        return null;
    }
  };

  // =========================================================
  // FILTER COUNTS
  // =========================================================
  const getStatusCount = (status) => {
    if (status === 'all') {
      return orders.length;
    }

    return orders.filter(
      (order) => order.status === status
    ).length;
  };

  // =========================================================
  // FILTERED ORDERS
  // =========================================================
  const filteredOrders =
    orders.filter((order) => {
      const matchesStatus =
        filterStatus === 'all' ||
        order.status === filterStatus;

      const orderId =
        String(order.id || '').toLowerCase();

      const matchesSearch =
        orderId.includes(
          searchTerm.toLowerCase()
        );

      return (
        matchesStatus &&
        matchesSearch
      );
    });

  // =========================================================
  // STATUS OPTIONS
  // =========================================================
  const filterOptions = [
    'all',
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'in_transit',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ];

  // =========================================================
  // CURRENT FILTER
  // =========================================================
  const CurrentFilterIcon =
    statusConfig[filterStatus]?.icon ||
    Box;

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-8 animate-fade-in">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-5 sm:pb-8">

        <div className="min-w-0">
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-[#111]">
            Incoming Orders
          </h1>

          <p className="text-gray-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-1">
            Brand Fulfillment Terminal
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="self-end sm:self-auto p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
          title="Refresh Orders"
        >
          <RefreshCw
            size={18}
            className={
              loading
                ? 'animate-spin'
                : ''
            }
          />
        </button>
      </div>

      {/* =====================================================
          SEARCH + FILTER
      ===================================================== */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">

        {/* SEARCH */}
        <div className="relative flex-1 min-w-0">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
            size={17}
          />

          <input
            type="text"
            placeholder="SEARCH BY ORDER ID..."
            className="w-full bg-white border border-[#EEE] rounded-2xl py-4 pl-11 pr-5 text-[10px] font-bold uppercase outline-none focus:border-[#1A1A1A] transition-colors"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
          />
        </div>

        {/* CUSTOM STATUS FILTER */}
        <div
          ref={filterRef}
          className="relative w-full sm:w-[220px]"
        >
          <button
            type="button"
            onClick={() =>
              setIsFilterOpen(
                (prev) => !prev
              )
            }
            className="w-full bg-white border border-[#EEE] rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3 hover:border-gray-300 transition-all shadow-sm"
          >
            <div className="flex items-center gap-3 min-w-0">

              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  statusConfig[
                    filterStatus
                  ]?.iconBg ||
                  'bg-gray-100'
                }`}
              >
                <CurrentFilterIcon
                  size={14}
                  className={
                    statusConfig[
                      filterStatus
                    ]?.iconColor ||
                    'text-gray-600'
                  }
                />
              </div>

              <div className="text-left min-w-0">
                <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">
                  Filter
                </p>

                <p className="text-[10px] font-black uppercase truncate">
                  {
                    statusConfig[
                      filterStatus
                    ]?.label
                  }
                </p>
              </div>
            </div>

            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform duration-300 ${
                isFilterOpen
                  ? 'rotate-180'
                  : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -8,
                  scale: 0.98,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: -8,
                  scale: 0.98,
                }}
                transition={{
                  duration: 0.18,
                }}
                className="absolute right-0 top-[calc(100%+8px)] w-full sm:w-[280px] bg-white border border-gray-100 rounded-2xl shadow-2xl p-2 z-50"
              >
                <div className="px-3 py-2 border-b border-gray-100 mb-1">
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">
                    Order Status
                  </p>
                </div>

                <div className="max-h-[340px] overflow-y-auto custom-scrollbar">

                  {filterOptions.map(
                    (status) => {
                      const config =
                        statusConfig[
                          status
                        ];

                      const Icon =
                        config.icon;

                      const active =
                        filterStatus ===
                        status;

                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => {
                            setFilterStatus(
                              status
                            );
                            setIsFilterOpen(
                              false
                            );
                          }}
                          className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl transition-all ${
                            active
                              ? 'bg-[#111] text-white'
                              : 'hover:bg-gray-50 text-[#111]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">

                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                active
                                  ? 'bg-white/10'
                                  : config.iconBg
                              }`}
                            >
                              <Icon
                                size={14}
                                className={
                                  active
                                    ? 'text-white'
                                    : config.iconColor
                                }
                              />
                            </div>

                            <span className="text-[9px] font-black uppercase tracking-wider truncate">
                              {config.label}
                            </span>
                          </div>

                          <span
                            className={`min-w-[26px] h-6 px-2 rounded-full flex items-center justify-center text-[8px] font-black ${
                              active
                                ? 'bg-white/10 text-white'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {getStatusCount(
                              status
                            )}
                          </span>
                        </button>
                      );
                    }
                  )}

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* =====================================================
          ACTIVE FILTER INFO
      ===================================================== */}
      <div className="flex items-center justify-between gap-3">

        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
            Showing
          </span>

          <span className="text-[9px] font-black uppercase text-[#111] truncate">
            {getStatusLabel(
              filterStatus
            )}
          </span>

          <span className="text-[9px] text-gray-300">
            •
          </span>

          <span className="text-[9px] font-black text-[#9B4819]">
            {filteredOrders.length}
          </span>
        </div>

        {(searchTerm ||
          filterStatus !==
            'all') && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
            }}
            className="shrink-0 text-[8px] font-black uppercase tracking-widest text-gray-400 hover:text-[#9B4819] transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* =====================================================
          DESKTOP TABLE
      ===================================================== */}
      <div className="hidden md:block bg-white rounded-[2.5rem] border border-[#EEE] overflow-hidden shadow-sm">

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">

            <thead className="bg-gray-50/70">
              <tr>

                <th className="p-6 text-[10px] font-black uppercase text-gray-400">
                  Order ID
                </th>

                <th className="p-6 text-[10px] font-black uppercase text-gray-400">
                  Customer
                </th>

                <th className="p-6 text-[10px] font-black uppercase text-gray-400">
                  Total
                </th>

                <th className="p-6 text-[10px] font-black uppercase text-gray-400">
                  Status
                </th>

                <th className="p-6 text-right text-[10px] font-black uppercase text-gray-400">
                  Action
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-[#F9F9F9]">

              {filteredOrders.map(
                (order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-[#FAFAFA] transition-colors group"
                  >

                    <td className="p-6">
                      <span className="text-[10px] font-black font-mono text-gray-400 group-hover:text-[#111]">
                        #
                        {String(
                          order.id
                        ).split('-')[0]}
                      </span>
                    </td>

                    <td className="p-6">
                      <p className="text-[11px] font-black uppercase">
                        {order.customer
                          ?.name ||
                          'Unknown Customer'}
                      </p>

                      <p className="text-[9px] text-gray-400 font-bold mt-1">
                        {order.customer
                          ?.phone ||
                          order.customer
                            ?.email ||
                          ''}
                      </p>

                      <p className="text-[9px] text-gray-400 font-bold mt-1">
                        {order.createdAt
                          ? new Date(
                              order.createdAt
                            ).toLocaleDateString()
                          : ''}
                      </p>
                    </td>

                    <td className="p-6">
                      <span className="text-sm font-black">
                        ₹
                        {Number(
                          order.totalAmount ||
                            0
                        ).toFixed(2)}
                      </span>
                    </td>

                    <td className="p-6">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {React.createElement(
                          getStatusIcon(
                            order.status
                          ),
                          {
                            size: 11,
                          }
                        )}

                        {getStatusLabel(
                          order.status
                        )}
                      </span>
                    </td>

                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            openOrderDetails(
                              order.id
                            )
                          }
                          className="p-2.5 bg-gray-100 text-gray-500 hover:bg-black hover:text-white rounded-xl transition-all"
                          title="View Order Details"
                        >
                          <Eye size={14} />
                        </button>

                        {getNextAction(
                          order.status,
                          order.id
                        )}

                      </div>
                    </td>

                  </tr>
                )
              )}

            </tbody>
          </table>
        </div>

        {filteredOrders.length ===
          0 && (
          <EmptyOrders />
        )}
      </div>

      {/* =====================================================
          MOBILE ORDER CARDS
      ===================================================== */}
      <div className="md:hidden space-y-3">

        {filteredOrders.map(
          (order) => {
            const StatusIcon =
              getStatusIcon(
                order.status
              );

            return (
              <motion.div
                key={order.id}
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="bg-white border border-[#EEE] rounded-2xl p-4 shadow-sm"
              >

                {/* TOP */}
                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">

                    <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">
                      Order ID
                    </p>

                    <p className="text-xs font-black font-mono mt-1 truncate">
                      #
                      {String(
                        order.id
                      ).split('-')[0]}
                    </p>

                  </div>

                  <span
                    className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase border ${getStatusColor(
                      order.status
                    )}`}
                  >
                    <StatusIcon
                      size={10}
                    />

                    {getStatusLabel(
                      order.status
                    )}
                  </span>

                </div>

                {/* CUSTOMER */}
                <div className="mt-4 pt-4 border-t border-gray-100">

                  <div className="flex items-center gap-2">

                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <User
                        size={13}
                        className="text-gray-500"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase truncate">
                        {order.customer
                          ?.name ||
                          'Unknown Customer'}
                      </p>

                      <p className="text-[8px] text-gray-400 font-bold truncate mt-0.5">
                        {order.customer
                          ?.phone ||
                          order.customer
                            ?.email ||
                          ''}
                      </p>
                    </div>

                  </div>

                </div>

                {/* BOTTOM */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">

                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">
                      Total
                    </p>

                    <p className="text-base font-black mt-1">
                      ₹
                      {Number(
                        order.totalAmount ||
                          0
                      ).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        openOrderDetails(
                          order.id
                        )
                      }
                      className="p-2.5 bg-gray-100 text-gray-600 hover:bg-black hover:text-white rounded-xl transition-all"
                    >
                      <Eye size={14} />
                    </button>

                    {getNextAction(
                      order.status,
                      order.id
                    )}

                  </div>

                </div>

              </motion.div>
            );
          }
        )}

        {filteredOrders.length ===
          0 && (
          <EmptyOrders />
        )}

      </div>

      {/* =====================================================
          ORDER DETAILS MODAL
      ===================================================== */}
      <AnimatePresence>
        {(selectedOrder ||
          detailLoading ||
          detailError) && (
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
            className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
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
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={closeOrderDetails}
            />

            {/* MODAL */}
            <motion.div
              initial={{
                opacity: 0,
                y: 30,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 30,
                scale: 0.98,
              }}
              transition={{
                duration: 0.25,
              }}
              className="relative bg-[#FAFAFA] w-full sm:w-[calc(100%-32px)] max-w-3xl max-h-[94vh] sm:max-h-[90vh] overflow-hidden rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl"
            >

              {/* MODAL HEADER */}
              <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 px-5 sm:px-7 py-4 sm:py-5 flex items-center justify-between">

                <div className="min-w-0">

                  <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.25em] text-[#9B4819] mb-1">
                    Order Details
                  </p>

                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#111] truncate">
                    {selectedOrder?.id
                      ? `#${String(
                          selectedOrder.id
                        ).split('-')[0]}`
                      : 'Loading Order...'}
                  </h2>

                </div>

                <button
                  type="button"
                  onClick={
                    closeOrderDetails
                  }
                  disabled={
                    detailLoading
                  }
                  className="shrink-0 w-10 h-10 bg-gray-100 hover:bg-black hover:text-white disabled:opacity-50 rounded-full flex items-center justify-center transition-all"
                >
                  <X size={18} />
                </button>

              </div>

              {/* MODAL BODY */}
              <div className="overflow-y-auto max-h-[calc(94vh-78px)] sm:max-h-[calc(90vh-86px)] p-4 sm:p-7">

                {/* LOADING */}
                {detailLoading && (
                  <div className="min-h-[350px] flex flex-col items-center justify-center">

                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                      <RefreshCw
                        size={24}
                        className="animate-spin text-[#9B4819]"
                      />
                    </div>

                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-4">
                      Loading Order
                    </p>

                  </div>
                )}

                {/* ERROR */}
                {detailError &&
                  !detailLoading && (
                    <div className="py-16">

                      <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center">
                        <X
                          size={22}
                          className="text-red-500"
                        />
                      </div>

                      <div className="bg-red-50 text-red-600 border border-red-100 rounded-2xl p-5 mt-5 text-[10px] font-bold uppercase text-center">
                        {detailError}
                      </div>

                    </div>
                  )}

                {/* DETAILS */}
                {selectedOrder &&
                  !detailLoading &&
                  !detailError && (
                    <div className="space-y-5">

                      {/* STATUS HERO */}
                      <div className="bg-[#111] rounded-2xl p-5 text-white">

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                          <div>
                            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/40">
                              Current Status
                            </p>

                            <div className="flex items-center gap-3 mt-2">

                              {React.createElement(
                                getStatusIcon(
                                  selectedOrder.status
                                ),
                                {
                                  size: 18,
                                  className:
                                    'text-[#9B4819]',
                                }
                              )}

                              <span className="text-base sm:text-lg font-black uppercase">
                                {getStatusLabel(
                                  selectedOrder.status
                                )}
                              </span>

                            </div>
                          </div>

                          <div className="text-left sm:text-right">

                            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/40">
                              Grand Total
                            </p>

                            <p className="text-xl sm:text-2xl font-black mt-1">
                              ₹
                              {Number(
                                selectedOrder.totalAmount ||
                                  0
                              ).toFixed(2)}
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* ORDER STATS */}
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

                        <DetailStat
                          icon={Hash}
                          label="Order ID"
                          value={
                            selectedOrder.id
                              ? `#${String(
                                  selectedOrder.id
                                ).split('-')[0]}`
                              : 'N/A'
                          }
                        />

                        <DetailStat
                          icon={CalendarDays}
                          label="Order Date"
                          value={
                            selectedOrder.createdAt
                              ? new Date(
                                  selectedOrder.createdAt
                                ).toLocaleDateString()
                              : 'N/A'
                          }
                        />

                        <DetailStat
                          icon={Package}
                          label="Items"
                          value={
                            selectedOrder
                              .items
                              ?.length ||
                            0
                          }
                        />

                        <DetailStat
                          icon={CreditCard}
                          label="Payment"
                          value={
                            selectedOrder.paymentMethod ||
                            selectedOrder.payment?.method ||
                            'N/A'
                          }
                        />

                      </div>

                      {/* ORDER ITEMS */}
                      <section>

                        <SectionTitle>
                          Order Items
                        </SectionTitle>

                        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">

                          {selectedOrder.items
                            ?.length > 0 ? (
                            selectedOrder.items.map(
                              (
                                item,
                                index
                              ) => (
                                <div
                                  key={
                                    item.id ||
                                    index
                                  }
                                  className="p-4 sm:p-5 border-b border-gray-100 last:border-b-0"
                                >

                                  <div className="flex items-start justify-between gap-4">

                                    <div className="flex gap-3 min-w-0">

                                      <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-gray-100 flex items-center justify-center">
                                        <Package
                                          size={
                                            17
                                          }
                                          className="text-gray-400"
                                        />
                                      </div>

                                      <div className="min-w-0">

                                        <p className="text-[10px] sm:text-xs font-black uppercase text-[#111] break-words">
                                          {item
                                            .product
                                            ?.name ||
                                            item.productName ||
                                            'Unknown Product'}
                                        </p>

                                        <p className="text-[9px] font-bold text-gray-500 mt-1">
                                          {item
                                            .variant
                                            ?.color ||
                                            'No Color'}

                                          {item
                                            .variant
                                            ?.size
                                            ? ` • ${item.variant.size}`
                                            : ''}
                                        </p>

                                        <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase">
                                          Quantity:{' '}
                                          {item.quantity}
                                        </p>

                                      </div>

                                    </div>

                                    <div className="text-right shrink-0">

                                      <p className="text-xs sm:text-sm font-black">
                                        ₹
                                        {Number(
                                          item.price ||
                                            0
                                        ).toFixed(2)}
                                      </p>

                                      <p className="text-[8px] font-bold text-gray-400 uppercase mt-1">
                                        ×{' '}
                                        {item.quantity ||
                                          1}
                                      </p>

                                    </div>

                                  </div>

                                </div>
                              )
                            )
                          ) : (
                            <div className="p-10 text-center text-[10px] font-bold uppercase text-gray-400">
                              No order items found
                            </div>
                          )}

                        </div>

                      </section>

                      {/* CUSTOMER */}
                      <section>

                        <SectionTitle>
                          Customer
                        </SectionTitle>

                        <div className="bg-white border border-gray-100 rounded-2xl p-5">

                          <div className="flex items-center gap-3">

                            <div className="w-11 h-11 rounded-full bg-[#111] text-white flex items-center justify-center">
                              <User
                                size={16}
                              />
                            </div>

                            <div className="min-w-0">

                              <p className="text-xs font-black uppercase">
                                {selectedOrder.customer
                                  ?.name ||
                                  selectedOrder.shippingAddress
                                    ?.fullName ||
                                  'Unknown Customer'}
                              </p>

                              <p className="text-[9px] font-bold text-gray-400 mt-1 break-all">
                                {selectedOrder.customer
                                  ?.email ||
                                  ''}
                              </p>

                            </div>

                          </div>

                          {(selectedOrder.customer
                            ?.phone ||
                            selectedOrder.shippingAddress
                              ?.phone) && (
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                              <Phone
                                size={13}
                                className="text-gray-400"
                              />

                              <span className="text-[10px] font-bold text-gray-500">
                                {selectedOrder.customer
                                  ?.phone ||
                                  selectedOrder.shippingAddress
                                    ?.phone}
                              </span>
                            </div>
                          )}

                        </div>

                      </section>

                      {/* SHIPPING ADDRESS */}
                      {selectedOrder.shippingAddress && (
                        <section>

                          <SectionTitle>
                            Shipping Address
                          </SectionTitle>

                          <div className="bg-white border border-gray-100 rounded-2xl p-5">

                            <div className="flex items-start gap-3">

                              <div className="w-9 h-9 shrink-0 rounded-xl bg-orange-50 flex items-center justify-center">
                                <MapPinned
                                  size={15}
                                  className="text-[#9B4819]"
                                />
                              </div>

                              <div className="min-w-0">

                                <p className="text-xs font-black uppercase">
                                  {selectedOrder.shippingAddress.fullName}
                                </p>

                                <div className="mt-2 space-y-1">

                                  <p className="text-[10px] font-bold text-gray-500">
                                    {selectedOrder.shippingAddress.addressLine1}
                                  </p>

                                  {selectedOrder
                                    .shippingAddress
                                    .addressLine2 && (
                                    <p className="text-[10px] font-bold text-gray-500">
                                      {
                                        selectedOrder
                                          .shippingAddress
                                          .addressLine2
                                      }
                                    </p>
                                  )}

                                  <p className="text-[10px] font-bold text-gray-500">
                                    {
                                      selectedOrder
                                        .shippingAddress
                                        .city
                                    }
                                    ,{' '}
                                    {
                                      selectedOrder
                                        .shippingAddress
                                        .state
                                    }{' '}
                                    -{' '}
                                    {
                                      selectedOrder
                                        .shippingAddress
                                        .postalCode
                                    }
                                  </p>

                                  <p className="text-[10px] font-bold text-gray-500">
                                    {
                                      selectedOrder
                                        .shippingAddress
                                        .country
                                    }
                                  </p>

                                  {selectedOrder
                                    .shippingAddress
                                    .phone && (
                                    <p className="text-[10px] font-bold text-gray-500 pt-1">
                                      Phone:{' '}
                                      {
                                        selectedOrder
                                          .shippingAddress
                                          .phone
                                      }
                                    </p>
                                  )}

                                </div>

                              </div>

                            </div>

                          </div>

                        </section>
                      )}

                      {/* TRACKING */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        {selectedOrder.trackingNumber && (
                          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">

                            <div className="flex items-center gap-2">
                              <Truck
                                size={14}
                                className="text-blue-500"
                              />

                              <p className="text-[8px] font-black uppercase tracking-widest text-blue-500">
                                Tracking Number
                              </p>
                            </div>

                            <p className="text-xs font-black mt-3 break-all">
                              {
                                selectedOrder.trackingNumber
                              }
                            </p>

                          </div>
                        )}

                        {selectedOrder.courierName && (
                          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">

                            <div className="flex items-center gap-2">
                              <Package
                                size={14}
                                className="text-gray-500"
                              />

                              <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                                Courier
                              </p>
                            </div>

                            <p className="text-xs font-black uppercase mt-3">
                              {
                                selectedOrder.courierName
                              }
                            </p>

                          </div>
                        )}

                      </div>

                      {/* GRAND TOTAL */}
                      <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between gap-4">

                        <div>
                          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">
                            Grand Total
                          </p>

                          <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase">
                            Including all items
                          </p>
                        </div>

                        <p className="text-2xl sm:text-3xl font-black text-[#111]">
                          ₹
                          {Number(
                            selectedOrder.totalAmount ||
                              0
                          ).toFixed(2)}
                        </p>

                      </div>

                    </div>
                  )}

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

// =========================================================
// EMPTY ORDERS
// =========================================================
const EmptyOrders = () => {
  return (
    <div className="p-14 sm:p-20 text-center bg-white border border-gray-100 rounded-2xl">

      <div className="w-16 h-16 mx-auto rounded-full bg-gray-50 flex items-center justify-center mb-4">
        <ShoppingCart
          size={28}
          className="text-gray-200"
        />
      </div>

      <p className="text-[9px] sm:text-[10px] font-black uppercase text-gray-400 tracking-widest">
        No orders found in terminal
      </p>

    </div>
  );
};

// =========================================================
// DETAIL STAT
// =========================================================
const DetailStat = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 min-w-0">

      <div className="flex items-center gap-2">

        <Icon
          size={13}
          className="text-gray-400 shrink-0"
        />

        <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 truncate">
          {label}
        </p>

      </div>

      <p className="text-[10px] sm:text-xs font-black uppercase mt-2 truncate">
        {value}
      </p>

    </div>
  );
};

// =========================================================
// SECTION TITLE
// =========================================================
const SectionTitle = ({
  children,
}) => {
  return (
    <div className="flex items-center gap-3 mb-3">

      <div className="w-1 h-4 bg-[#9B4819] rounded-full" />

      <h3 className="text-[9px] font-black uppercase tracking-[0.18em] text-[#111]">
        {children}
      </h3>

    </div>
  );
};

export default ClientOrders;