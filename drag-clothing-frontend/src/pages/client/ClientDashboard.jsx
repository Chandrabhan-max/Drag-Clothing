import React, {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  motion,
} from 'framer-motion';

import {
  Package,
  Users,
  Tags,
  ArrowUpRight,
  Activity,
  ShoppingBag,
  Clock,
  RefreshCcw,
} from 'lucide-react';

import api from '../../api/axios';


const ClientDashboard = () => {

  const navigate =
    useNavigate();


  const [data, setData] =
    useState({

      totalProducts: 0,

      activeManagers: 0,

      activeDiscounts: 0,

      totalOrders: 0,

      recentProducts: [],

    });


  const [isLoading, setIsLoading] =
    useState(true);


  const [error, setError] =
    useState('');


  // =====================================================
  // FETCH DASHBOARD
  // =====================================================

  const fetchDashboardData =
    async () => {

      try {

        setIsLoading(true);

        setError('');


        // ===============================================
        // DASHBOARD
        // ===============================================

        const dashRes =
          await api.get(
            '/client/dashboard',
          );


        const apiData =
          dashRes?.data?.data ||
          {};


        // ===============================================
        // DISCOUNTS
        // ===============================================

        let manualDiscountCount =
          0;


        try {

          const discRes =
            await api.get(
              '/client/discounts',
            );


          const discountsList =
            discRes?.data?.data ||
            [];


          manualDiscountCount =
            Array.isArray(
              discountsList,
            )

              ? discountsList.filter(
                  (discount) =>
                    discount?.isActive == 1 ||
                    discount?.isActive === true,
                ).length

              : 0;

        } catch (discError) {

          console.error(
            'Could not fetch discounts:',
            discError,
          );

        }


        // ===============================================
        // SET DATA
        // ===============================================

        setData({

          totalProducts:
            Number(
              apiData.totalProducts ||
              0,
            ),

          activeManagers:
            Number(
              apiData.totalManagers ||
              0,
            ),

          activeDiscounts:
            manualDiscountCount,

          totalOrders:
            Number(
              apiData.totalOrders ||
              0,
            ),

          recentProducts:
            Array.isArray(
              apiData.recentProducts,
            )
              ? apiData.recentProducts
              : [],

        });


      } catch (error) {

        console.error(
          'Dashboard fetch failed:',
          error?.response?.data ||
          error,
        );


        const message =
          error?.response?.data?.message;


        setError(
          Array.isArray(message)
            ? message[0]
            : message ||
              'Could not load dashboard data.',
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

  const formatCurrency =
    (value) => {

      return Number(
        value || 0,
      ).toLocaleString(
        'en-IN',
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      );

    };


  const formatDate =
    (value) => {

      if (!value) {
        return 'Recently';
      }


      const date =
        new Date(value);


      if (
        Number.isNaN(
          date.getTime(),
        )
      ) {
        return 'Recently';
      }


      return date.toLocaleDateString(
        'en-IN',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        },
      );

    };


  const formatStatus =
    (status) => {

      if (!status) {
        return 'ORDER';
      }


      return String(
        status,
      )
        .replaceAll(
          '_',
          ' ',
        )
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
        ease: [
          0.16,
          1,
          0.3,
          1,
        ],
      },

    },

  };


  // =====================================================
  // STATS
  // =====================================================

  const stats = [

    {
      label: 'My Products',

      value:
        data.totalProducts,

      icon:
        <Package size={20} />,

      color:
        'bg-[#EBE9E0]',

      path:
        '/client/products',
    },


    {
      label: 'Store Managers',

      value:
        data.activeManagers,

      icon:
        <Users size={20} />,

      color:
        'bg-[#D4DFE6]',

      path:
        '/client/managers',
    },


    {
      label: 'Active Promos',

      value:
        data.activeDiscounts,

      icon:
        <Tags size={20} />,

      color:
        'bg-[#D9E2D5]',

      path:
        '/client/discounts',
    },

  ];


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

            Terminal Access

          </div>


          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-[#111] leading-none">

            Brand <br />

            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#111] to-[#999]">

              Command.

            </span>

          </h1>

        </div>


        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
        >

          <RefreshCcw
            size={14}
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

        {stats.map(
          (stat, index) => (

            <motion.div
              key={index}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{
                delay:
                  index * 0.1,
              }}
              onClick={() =>
                navigate(
                  stat.path,
                )
              }
              className={`${stat.color} rounded-[2rem] p-8 flex flex-col justify-between min-h-[200px] group cursor-pointer relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1`}
            >

              <div className="absolute -right-4 -bottom-4 text-black/5 group-hover:text-black/10 transition-colors">

                {React.cloneElement(
                  stat.icon,
                  {
                    size: 120,
                  },
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


                <h3 className="text-5xl font-black tracking-tighter">

                  {stat.value}

                </h3>

              </div>

            </motion.div>

          ),
        )}

      </div>


      {/* ================================================= */}
      {/* RECENT SALES */}
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

              Recent Sales Activity

            </h2>


            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mt-2">

              Latest product transactions

            </p>

          </div>


          <div className="flex items-center gap-2">

            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>

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

              Loading sales activity...

            </p>

          </div>

        ) : data.recentProducts.length > 0 ? (

          <div className="divide-y divide-[#F5F5F5]">

            {data.recentProducts.map(
              (product, index) => (

                <div
                  key={
                    `${product.orderId}-${product.productId}-${index}`
                  }
                  className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:bg-[#FAFAFA] transition-colors"
                >

                  {/* PRODUCT */}

                  <div className="flex items-center gap-4">

                    <div className="w-12 h-12 rounded-2xl bg-[#F5F5F5] flex items-center justify-center flex-shrink-0">

                      <ShoppingBag
                        size={20}
                        className="text-gray-400"
                      />

                    </div>


                    <div>

                      <p className="text-xs font-black uppercase tracking-wide text-[#111]">

                        {product.productName ||
                          'Unnamed Product'}

                      </p>


                      <div className="flex items-center gap-3 mt-2">

                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">

                          Order #
                          {String(
                            product.orderId ||
                              '',
                          ).slice(
                            0,
                            8,
                          )}

                        </span>


                        <span className="text-gray-200">

                          •

                        </span>


                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">

                          {formatDate(
                            product.orderDate,
                          )}

                        </span>

                      </div>

                    </div>

                  </div>


                  {/* QUANTITY */}

                  <div className="flex items-center gap-8 md:ml-auto">

                    <div>

                      <p className="text-[8px] font-black uppercase tracking-widest text-gray-300">

                        Qty

                      </p>


                      <p className="text-sm font-black text-[#111] mt-1">

                        ×
                        {product.quantity}

                      </p>

                    </div>


                    {/* STATUS */}

                    <div>

                      <p className="text-[8px] font-black uppercase tracking-widest text-gray-300">

                        Status

                      </p>


                      <p className="text-[9px] font-black uppercase tracking-widest text-[#9B4819] mt-2">

                        {formatStatus(
                          product.orderStatus,
                        )}

                      </p>

                    </div>


                    {/* TOTAL */}

                    <div className="text-right min-w-[100px]">

                      <p className="text-[8px] font-black uppercase tracking-widest text-gray-300">

                        Sale

                      </p>


                      <p className="text-sm font-black text-[#111] mt-1">

                        ₹
                        {formatCurrency(
                          product.total,
                        )}

                      </p>

                    </div>

                  </div>

                </div>

              ),
            )}

          </div>

        ) : (

          /* ================================================= */
          /* EMPTY STATE */
          /* ================================================= */

          <div className="p-16 flex flex-col items-center justify-center text-center">

            <div className="w-20 h-20 bg-[#F5F5F5] rounded-full flex items-center justify-center mb-6">

              <Activity
                size={32}
                className="text-gray-300"
              />

            </div>


            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">

              No recent sales yet

            </p>


            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-300 mt-2">

              Product transactions will appear here

            </p>

          </div>

        )}

      </motion.div>


    </div>

  );

};


export default ClientDashboard;