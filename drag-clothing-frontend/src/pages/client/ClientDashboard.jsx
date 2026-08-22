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
  RefreshCcw,
} from 'lucide-react';

import api from '../../api/axios';


const ClientDashboard = () => {

  const navigate = useNavigate();


  // =====================================================
  // STATE
  // =====================================================

  const [data, setData] = useState({
    totalProducts: 0,
    activeManagers: 0,
    activeDiscounts: 0,
    totalOrders: 0,
    recentProducts: [],
  });


  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState('');


  // =====================================================
  // FETCH DASHBOARD
  // =====================================================

  const fetchDashboardData = async () => {

    try {

      setIsLoading(true);
      setError('');


      // ===============================================
      // DASHBOARD
      // ===============================================

      const dashRes = await api.get(
        '/client/dashboard'
      );


      const apiData =
        dashRes?.data?.data || {};


      // ===============================================
      // DISCOUNTS
      // ===============================================

      let manualDiscountCount = 0;


      try {

        const discRes =
          await api.get(
            '/client/discounts'
          );


        const discountsList =
          discRes?.data?.data || [];


        manualDiscountCount =
          Array.isArray(discountsList)
            ? discountsList.filter(
                (discount) =>
                  discount?.isActive == 1 ||
                  discount?.isActive === true
              ).length
            : 0;

      } catch (discError) {

        console.error(
          'Could not fetch discounts:',
          discError
        );

      }


      // ===============================================
      // SET DATA
      // ===============================================

      setData({

        totalProducts:
          Number(
            apiData.totalProducts || 0
          ),

        activeManagers:
          Number(
            apiData.totalManagers || 0
          ),

        activeDiscounts:
          manualDiscountCount,

        totalOrders:
          Number(
            apiData.totalOrders || 0
          ),

        recentProducts:
          Array.isArray(
            apiData.recentProducts
          )
            ? apiData.recentProducts
            : [],

      });


    } catch (error) {

      console.error(
        'Dashboard fetch failed:',
        error?.response?.data ||
        error
      );


      const message =
        error?.response?.data?.message;


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

    return Number(
      value || 0
    ).toLocaleString(
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


    const date =
      new Date(value);


    if (
      Number.isNaN(
        date.getTime()
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
      }
    );

  };


  const formatStatus = (status) => {

    if (!status) {
      return 'ORDER';
    }


    return String(status)
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


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div
      className="
        w-full
        max-w-[1400px]
        mx-auto
        space-y-6
        sm:space-y-8
        lg:space-y-12
        pb-12
        sm:pb-16
        lg:pb-20
        animate-fade-in
      "
    >


      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <motion.div

        initial="hidden"

        animate="visible"

        variants={fadeUp}

        className="
          flex
          flex-col
          sm:flex-row
          sm:items-end
          sm:justify-between
          border-b
          border-[#E5E5E5]
          pb-6
          sm:pb-8
          lg:pb-10
          gap-5
        "
      >

        <div className="min-w-0">

          <div
            className="
              inline-block
              bg-[#1A1A1A]
              text-white
              text-[8px]
              sm:text-[9px]
              md:text-[10px]
              font-bold
              uppercase
              tracking-[0.2em]
              sm:tracking-[0.3em]
              px-3
              py-1
              mb-4
              sm:mb-5
              lg:mb-6
              rounded-full
            "
          >
            Terminal Access
          </div>


          <h1
            className="
              text-4xl
              sm:text-5xl
              md:text-6xl
              lg:text-7xl
              font-black
              uppercase
              tracking-tighter
              text-[#111]
              leading-[0.9]
            "
          >

            Brand
            <br />

            <span
              className="
                text-transparent
                bg-clip-text
                bg-gradient-to-r
                from-[#111]
                to-[#999]
              "
            >
              Command.
            </span>

          </h1>

        </div>


        {/* REFRESH */}

        <button
          onClick={fetchDashboardData}
          disabled={isLoading}
          className="
            self-start
            sm:self-auto
            flex
            items-center
            gap-2
            text-[9px]
            font-black
            uppercase
            tracking-widest
            text-gray-400
            hover:text-black
            transition-colors
            disabled:opacity-40
            py-2
          "
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

        <div
          className="
            bg-red-50
            border
            border-red-100
            rounded-2xl
            px-4
            sm:px-6
            py-4
          "
        >

          <p
            className="
              text-[9px]
              font-black
              uppercase
              tracking-widest
              text-red-500
            "
          >
            Dashboard Error
          </p>


          <p
            className="
              text-xs
              font-bold
              text-red-700
              mt-1
              break-words
            "
          >
            {error}
          </p>

        </div>

      )}


      {/* ================================================= */}
      {/* STATS */}
      {/* ================================================= */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          gap-4
          sm:gap-5
          lg:gap-6
        "
      >

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
                  stat.path
                )
              }

              className={`
                ${stat.color}
                rounded-[1.5rem]
                sm:rounded-[2rem]
                p-5
                sm:p-6
                lg:p-8
                flex
                flex-col
                justify-between
                min-h-[170px]
                sm:min-h-[190px]
                lg:min-h-[200px]
                group
                cursor-pointer
                relative
                overflow-hidden
                transition-all
                hover:shadow-lg
                hover:-translate-y-1
              `}
            >

              {/* BACKGROUND ICON */}

              <div
                className="
                  absolute
                  -right-5
                  -bottom-5
                  text-black/5
                  group-hover:text-black/10
                  transition-colors
                  pointer-events-none
                "
              >

                {React.cloneElement(
                  stat.icon,
                  {
                    size:
                      80,
                  }
                )}

              </div>


              {/* TOP */}

              <div
                className="
                  flex
                  justify-between
                  items-start
                  relative
                  z-10
                "
              >

                <div
                  className="
                    p-2.5
                    sm:p-3
                    bg-white/40
                    backdrop-blur-md
                    rounded-xl
                    sm:rounded-2xl
                    border
                    border-white/20
                  "
                >
                  {stat.icon}
                </div>


                <ArrowUpRight
                  size={18}
                  className="
                    sm:w-5
                    sm:h-5
                    text-black/30
                    group-hover:text-black
                    group-hover:scale-110
                    transition-all
                  "
                />

              </div>


              {/* BOTTOM */}

              <div
                className="
                  relative
                  z-10
                  mt-6
                  sm:mt-8
                "
              >

                <p
                  className="
                    text-[9px]
                    sm:text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.15em]
                    sm:tracking-[0.2em]
                    text-black/50
                    mb-1
                  "
                >
                  {stat.label}
                </p>


                <h3
                  className="
                    text-4xl
                    sm:text-5xl
                    font-black
                    tracking-tighter
                  "
                >
                  {stat.value}
                </h3>

              </div>

            </motion.div>

          )
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

        className="
          bg-white
          rounded-[1.5rem]
          sm:rounded-[2rem]
          lg:rounded-[2.5rem]
          border
          border-[#E5E5E5]
          overflow-hidden
          shadow-sm
        "
      >


        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            p-5
            sm:p-6
            lg:p-8
            border-b
            border-[#F5F5F5]
            flex
            flex-col
            sm:flex-row
            sm:justify-between
            sm:items-center
            gap-4
          "
        >

          <div className="min-w-0">

            <h2
              className="
                text-xs
                sm:text-sm
                font-black
                uppercase
                tracking-widest
              "
            >
              Recent Sales Activity
            </h2>


            <p
              className="
                text-[8px]
                sm:text-[9px]
                font-bold
                uppercase
                tracking-[0.15em]
                sm:tracking-[0.2em]
                text-gray-400
                mt-2
              "
            >
              Latest product transactions
            </p>

          </div>


          {/* LIVE STATUS */}

          <div
            className="
              flex
              items-center
              gap-2
              self-start
              sm:self-auto
            "
          >

            <span
              className="
                w-2
                h-2
                bg-green-500
                rounded-full
                animate-pulse
                shrink-0
              "
            />

            <span
              className="
                text-[9px]
                sm:text-[10px]
                font-bold
                uppercase
                tracking-widest
                text-gray-400
                whitespace-nowrap
              "
            >
              Live Status
            </span>

          </div>

        </div>


        {/* =================================================
            LOADING
        ================================================= */}

        {isLoading ? (

          <div
            className="
              p-10
              sm:p-16
              text-center
            "
          >

            <Activity
              size={30}
              className="
                mx-auto
                text-gray-200
                animate-pulse
                mb-4
              "
            />

            <p
              className="
                text-[9px]
                sm:text-[10px]
                font-black
                uppercase
                tracking-widest
                text-gray-400
              "
            >
              Loading sales activity...
            </p>

          </div>


        ) : data.recentProducts.length > 0 ? (

          <div
            className="
              divide-y
              divide-[#F5F5F5]
            "
          >

            {data.recentProducts.map(
              (product, index) => (

                <div
                  key={
                    `${product.orderId}-${product.productId}-${index}`
                  }

                  className="
                    px-5
                    sm:px-6
                    lg:px-8
                    py-5
                    sm:py-6
                    flex
                    flex-col
                    gap-5
                    hover:bg-[#FAFAFA]
                    transition-colors
                    min-w-0
                  "
                >

                  {/* =================================================
                      PRODUCT
                  ================================================= */}

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                      sm:gap-4
                      min-w-0
                    "
                  >

                    <div
                      className="
                        w-11
                        h-11
                        sm:w-12
                        sm:h-12
                        rounded-xl
                        sm:rounded-2xl
                        bg-[#F5F5F5]
                        flex
                        items-center
                        justify-center
                        flex-shrink-0
                      "
                    >

                      <ShoppingBag
                        size={19}
                        className="text-gray-400"
                      />

                    </div>


                    <div
                      className="
                        min-w-0
                        flex-1
                      "
                    >

                      <p
                        className="
                          text-xs
                          font-black
                          uppercase
                          tracking-wide
                          text-[#111]
                          truncate
                        "
                        title={
                          product.productName ||
                          'Unnamed Product'
                        }
                      >
                        {product.productName ||
                          'Unnamed Product'}
                      </p>


                      <div
                        className="
                          flex
                          flex-wrap
                          items-center
                          gap-x-3
                          gap-y-1
                          mt-2
                        "
                      >

                        <span
                          className="
                            text-[8px]
                            sm:text-[9px]
                            font-bold
                            uppercase
                            tracking-widest
                            text-gray-400
                          "
                        >
                          Order #
                          {String(
                            product.orderId || ''
                          ).slice(0, 8)}
                        </span>


                        <span
                          className="
                            text-gray-200
                            hidden
                            xs:inline
                          "
                        >
                          •
                        </span>


                        <span
                          className="
                            text-[8px]
                            sm:text-[9px]
                            font-bold
                            uppercase
                            tracking-widest
                            text-gray-400
                          "
                        >
                          {formatDate(
                            product.orderDate
                          )}
                        </span>

                      </div>

                    </div>

                  </div>


                  {/* =================================================
                      MOBILE / DESKTOP DETAILS
                  ================================================= */}

                  <div
                    className="
                      grid
                      grid-cols-3
                      gap-3
                      sm:flex
                      sm:items-center
                      sm:justify-end
                      sm:gap-8
                      md:ml-auto
                    "
                  >

                    {/* QUANTITY */}

                    <div className="min-w-0">

                      <p
                        className="
                          text-[7px]
                          sm:text-[8px]
                          font-black
                          uppercase
                          tracking-widest
                          text-gray-300
                        "
                      >
                        Qty
                      </p>


                      <p
                        className="
                          text-sm
                          font-black
                          text-[#111]
                          mt-1
                        "
                      >
                        ×
                        {product.quantity}
                      </p>

                    </div>


                    {/* STATUS */}

                    <div className="min-w-0">

                      <p
                        className="
                          text-[7px]
                          sm:text-[8px]
                          font-black
                          uppercase
                          tracking-widest
                          text-gray-300
                        "
                      >
                        Status
                      </p>


                      <p
                        className="
                          text-[8px]
                          sm:text-[9px]
                          font-black
                          uppercase
                          tracking-widest
                          text-[#9B4819]
                          mt-2
                          truncate
                        "
                        title={formatStatus(
                          product.orderStatus
                        )}
                      >
                        {formatStatus(
                          product.orderStatus
                        )}
                      </p>

                    </div>


                    {/* TOTAL */}

                    <div
                      className="
                        text-right
                        min-w-0
                      "
                    >

                      <p
                        className="
                          text-[7px]
                          sm:text-[8px]
                          font-black
                          uppercase
                          tracking-widest
                          text-gray-300
                        "
                      >
                        Sale
                      </p>


                      <p
                        className="
                          text-sm
                          font-black
                          text-[#111]
                          mt-1
                          truncate
                        "
                      >
                        ₹
                        {formatCurrency(
                          product.total
                        )}
                      </p>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>


        ) : (

          /* =================================================
             EMPTY STATE
          ================================================= */

          <div
            className="
              p-10
              sm:p-16
              flex
              flex-col
              items-center
              justify-center
              text-center
            "
          >

            <div
              className="
                w-16
                h-16
                sm:w-20
                sm:h-20
                bg-[#F5F5F5]
                rounded-full
                flex
                items-center
                justify-center
                mb-5
                sm:mb-6
              "
            >

              <Activity
                size={28}
                className="text-gray-300"
              />

            </div>


            <p
              className="
                text-[10px]
                sm:text-xs
                font-bold
                uppercase
                tracking-[0.15em]
                sm:tracking-[0.2em]
                text-gray-400
              "
            >
              No recent sales yet
            </p>


            <p
              className="
                text-[8px]
                sm:text-[9px]
                font-bold
                uppercase
                tracking-widest
                text-gray-300
                mt-2
              "
            >
              Product transactions will appear here
            </p>

          </div>

        )}

      </motion.div>

    </div>

  );

};


export default ClientDashboard;