import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import {
  Package,
  ShoppingCart,
  Tags,
  ArrowUpRight,
  Activity,
  RefreshCcw,
} from 'lucide-react';

import api from '../../api/axios';

const ManagerDashboard = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    totalProducts: 0,
    totalOrders: 0,
    activePromos: 0,
    recentOrders: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // =====================================================
  // FETCH DASHBOARD DATA
  // =====================================================

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [
        dashboardResponse,
        ordersResponse,
        discountsResponse,
      ] = await Promise.all([
        api.get('/manager/dashboard'),
        api.get('/orders/manager/my-orders'),
        api.get('/manager/discounts'),
      ]);

      // =====================================================
      // DASHBOARD
      // =====================================================

      const dashboardData =
        dashboardResponse?.data?.data || {};

      // =====================================================
      // ORDERS
      // =====================================================

      let orders = [];

      const ordersData =
        ordersResponse?.data?.data;

      if (Array.isArray(ordersData?.data)) {
        orders = ordersData.data;
      } else if (Array.isArray(ordersData)) {
        orders = ordersData;
      } else if (
        Array.isArray(ordersResponse?.data)
      ) {
        orders = ordersResponse.data;
      }

      // =====================================================
      // INCOMING ORDERS
      // ONLY ORDERS WHICH ARE NOT DELIVERED
      // =====================================================

      const incomingOrders = orders.filter((order) => {
        const status = String(
          order?.status ||
          order?.orderStatus ||
          ''
        )
          .trim()
          .toLowerCase()
          .replace(/[\s-]+/g, '_');

        return status !== 'delivered';
      });

      // =====================================================
      // ACTIVE PROMOS
      // SAME LOGIC AS CLIENT DASHBOARD
      // =====================================================

      let discounts = [];

      const discountsData =
        discountsResponse?.data?.data;

      if (Array.isArray(discountsData)) {
        discounts = discountsData;
      } else if (
        Array.isArray(discountsData?.data)
      ) {
        discounts = discountsData.data;
      }

      const activePromos = discounts.filter(
        (discount) => {
          const isActive =
            discount?.isActive == 1 ||
            discount?.isActive === true ||
            discount?.is_active == 1 ||
            discount?.is_active === true;

          if (!isActive) {
            return false;
          }

          const now = new Date();

          const start = discount?.startDate
            ? new Date(discount.startDate)
            : null;

          const end = discount?.endDate
            ? new Date(discount.endDate)
            : null;

          if (
            start &&
            !Number.isNaN(start.getTime()) &&
            now < start
          ) {
            return false;
          }

          if (
            end &&
            !Number.isNaN(end.getTime()) &&
            now > end
          ) {
            return false;
          }

          return true;
        }
      );

      // =====================================================
      // RECENT INCOMING ORDERS
      // DELIVERED ORDERS ARE EXCLUDED
      // =====================================================

      const recentOrders = [...incomingOrders]
        .sort((a, b) => {
          const first = new Date(
            a?.createdAt ||
            a?.orderDate ||
            a?.updatedAt ||
            0
          ).getTime();

          const second = new Date(
            b?.createdAt ||
            b?.orderDate ||
            b?.updatedAt ||
            0
          ).getTime();

          return second - first;
        })
        .slice(0, 5);

      // =====================================================
      // SET DATA
      // =====================================================

      setData({
        totalProducts: Number(
          dashboardData?.totalProducts || 0
        ),

        // IMPORTANT:
        // Only NOT DELIVERED orders count here.
        totalOrders: incomingOrders.length,

        // Client-style naming:
        activePromos: activePromos.length,

        recentOrders,
      });
    } catch (err) {
      console.error(
        'Manager dashboard error:',
        err
      );

      const message =
        err?.response?.data?.message;

      setError(
        Array.isArray(message)
          ? message[0]
          : message ||
              'Could not load dashboard data.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // =====================================================
  // HELPERS
  // =====================================================

  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString(
      'en-IN',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  const formatDate = (value) => {
    if (!value) {
      return 'Recently';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Recently';
    }

    return date.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    );
  };

  const formatStatus = (value) => {
    if (!value) {
      return 'ORDER';
    }

    return String(value)
      .replaceAll('_', ' ')
      .toUpperCase();
  };

  // =====================================================
  // ANIMATION
  // =====================================================

  const fadeUp = {
    hidden: {
      opacity: 0,
      y: 20,
    },

    visible: {
      opacity: 1,
      y: 0,

      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  // =====================================================
  // STATS
  // =====================================================

  const stats = [
    {
      label: 'Incoming Orders',
      value: data.totalOrders,
      icon: <ShoppingCart size={20} />,
      color: 'bg-[#EBE9E0]',
      path: '/manager/orders',
      valueClass: 'text-[#111]',
    },

    {
      label: 'My Products',
      value: data.totalProducts,
      icon: <Package size={20} />,
      color: 'bg-[#D4DFE6]',
      path: '/manager/products',
      valueClass: 'text-[#111]',
    },

    {
      // SAME NAME AS CLIENT
      label: 'Active Promos',
      value: data.activePromos,
      icon: <Tags size={20} />,
      color: 'bg-[#D9E2D5]',
      path: '/manager/discounts',
      valueClass: 'text-[#111]',
    },
  ];

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 pb-20 animate-fade-in">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="flex flex-col md:flex-row justify-between items-end border-b border-[#E5E5E5] pb-10 gap-6"
      >
        <div>

          <div className="inline-block bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-[0.3em] px-3 py-1 mb-6 rounded-full">
            Operations Access
          </div>

          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-[#111] leading-none">
            Store
            <br />

            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#111] to-[#999]">
              Command.
            </span>
          </h1>

        </div>

        <button
          type="button"
          onClick={fetchDashboardData}
          className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
        >
          <RefreshCcw
            size={14}
            className={
              isLoading
                ? 'animate-spin'
                : ''
            }
          />

          Refresh
        </button>
      </motion.div>

      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-6 py-4">

          <p className="text-[9px] font-black uppercase tracking-widest text-red-500">
            Dashboard Error
          </p>

          <p className="text-xs font-bold text-red-700 mt-1">
            {error}
          </p>

        </div>
      )}

      {/* ================================================= */}
      {/* STATS */}
      {/* ================================================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{
              delay: index * 0.1,
            }}
            onClick={() =>
              navigate(stat.path)
            }
            className={`${stat.color} rounded-[2rem] p-8 flex flex-col justify-between min-h-[200px] group cursor-pointer relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1`}
          >

            <div className="absolute -right-4 -bottom-4 text-black/5 group-hover:text-black/10 transition-colors">
              {React.cloneElement(
                stat.icon,
                {
                  size: 120,
                }
              )}
            </div>

            <div className="flex justify-between items-start relative z-10">

              <div className="p-3 bg-white/40 backdrop-blur-md rounded-2xl border border-white/20">
                {stat.icon}
              </div>

              <ArrowUpRight
                size={20}
                className="text-black/30 group-hover:text-black group-hover:scale-110 transition-all"
              />

            </div>

            <div className="relative z-10 mt-8">

              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/50 mb-1">
                {stat.label}
              </p>

              <h3
                className={`text-5xl font-black tracking-tighter ${stat.valueClass}`}
              >
                {isLoading
                  ? '—'
                  : stat.value}
              </h3>

            </div>

          </motion.div>
        ))}

      </div>

      {/* ================================================= */}
      {/* RECENT INCOMING ORDERS */}
      {/* ================================================= */}

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{
          delay: 0.4,
        }}
        className="bg-white rounded-[2.5rem] border border-[#E5E5E5] overflow-hidden shadow-sm"
      >

        {/* HEADER */}

        <div className="p-8 border-b border-[#F5F5F5] flex justify-between items-center">

          <div>

            <h2 className="text-sm font-black uppercase tracking-widest">
              Recent Incoming Orders
            </h2>

            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mt-2">
              Latest orders assigned to you
            </p>

          </div>

          <div className="flex items-center gap-2">

            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />

            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Live Status
            </span>

          </div>

        </div>

        {/* LOADING */}

        {isLoading ? (
          <div className="p-16 text-center">

            <Activity
              size={30}
              className="mx-auto text-gray-200 animate-pulse mb-4"
            />

            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Loading incoming orders...
            </p>

          </div>
        ) : null}

        {/* ORDERS */}

        {!isLoading &&
        data.recentOrders.length > 0 ? (
          <div className="divide-y divide-[#F5F5F5]">

            {data.recentOrders.map(
              (order, index) => (
                <div
                  key={
                    order?.id ||
                    order?.orderId ||
                    index
                  }
                  className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-[#FAFAFA] transition-colors"
                >

                  {/* ORDER */}

                  <div className="flex items-center gap-4">

                    <div className="w-12 h-12 rounded-2xl bg-[#F5F5F5] flex items-center justify-center shrink-0">

                      <ShoppingCart
                        size={20}
                        className="text-gray-400"
                      />

                    </div>

                    <div>

                      <p className="text-xs font-black uppercase tracking-wide text-[#111]">
                        Order #
                        {String(
                          order?.id ||
                          order?.orderId ||
                          ''
                        ).slice(0, 8)}
                      </p>

                      <div className="flex items-center gap-3 mt-2">

                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                          {formatDate(
                            order?.createdAt ||
                            order?.orderDate ||
                            order?.updatedAt
                          )}
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* DETAILS */}

                  <div className="flex items-center gap-8 md:ml-auto">

                    {/* STATUS */}

                    <div>

                      <p className="text-[8px] font-black uppercase tracking-widest text-gray-300">
                        Status
                      </p>

                      <p className="text-[9px] font-black uppercase tracking-widest text-[#9B4819] mt-2">
                        {formatStatus(
                          order?.status ||
                          order?.orderStatus
                        )}
                      </p>

                    </div>

                    {/* ITEMS */}

                    <div>

                      <p className="text-[8px] font-black uppercase tracking-widest text-gray-300">
                        Items
                      </p>

                      <p className="text-sm font-black text-[#111] mt-1">
                        {Number(
                          order?.itemsCount ||
                          order?.itemCount ||
                          order?.items?.length ||
                          0
                        )}
                      </p>

                    </div>

                    {/* TOTAL */}

                    <div className="text-right min-w-[100px]">

                      <p className="text-[8px] font-black uppercase tracking-widest text-gray-300">
                        Total
                      </p>

                      <p className="text-sm font-black text-[#111] mt-1">
                        ₹
                        {formatCurrency(
                          order?.total ||
                          order?.totalAmount ||
                          order?.grandTotal ||
                          0
                        )}
                      </p>

                    </div>

                  </div>

                </div>
              )
            )}

          </div>
        ) : null}

        {/* EMPTY */}

        {!isLoading &&
        data.recentOrders.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">

            <div className="w-20 h-20 bg-[#F5F5F5] rounded-full flex items-center justify-center mb-6">

              <Activity
                size={32}
                className="text-gray-300"
              />

            </div>

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
              No incoming orders yet
            </p>

            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-300 mt-2">
              New orders will appear here
            </p>

          </div>
        ) : null}

      </motion.div>

    </div>
  );
};

export default ManagerDashboard;