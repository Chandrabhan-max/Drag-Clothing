import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  BarChart3,
  TrendingUp,
  Package,
  Box,
  RefreshCcw,
  Activity,
  IndianRupee,
  ShoppingBag,
  AlertTriangle,
} from 'lucide-react';

import api from '../../api/axios';

const ManagerReports = () => {
  const [data, setData] = useState({
    products: null,
    inventory: null,
    sales: null,
    revenue: null,
  });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const fetchReports = async () => {
    setLoading(true);
    setError('');

    try {
      const [
        productsResponse,
        inventoryResponse,
        salesResponse,
        revenueResponse,
      ] = await Promise.all([
        api.get(
          '/manager/reports/products'
        ),

        api.get(
          '/manager/reports/inventory'
        ),

        api.get(
          '/manager/reports/sales'
        ),

        api.get(
          '/manager/reports/revenue'
        ),
      ]);

      setData({
        products:
          productsResponse?.data?.data ||
          null,

        inventory:
          inventoryResponse?.data?.data ||
          null,

        sales:
          salesResponse?.data?.data ||
          null,

        revenue:
          revenueResponse?.data?.data ||
          null,
      });
    } catch (error) {
      console.error(
        'Manager reports failed:',
        error
      );

      const message =
        error?.response?.data?.message;

      setError(
        Array.isArray(message)
          ? message[0]
          : message ||
              'Unable to load reports.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const revenue = Number(
    data?.revenue?.total || 0
  );

  const productCount = Number(
    data?.products?.count || 0
  );

  const inventoryValue = Number(
    data?.inventory?.value || 0
  );

  const salesCount = Number(
    data?.sales?.count || 0
  );

  const summaryCards = useMemo(
    () => [
      {
        title: 'Total Revenue',
        value: `₹${revenue.toFixed(2)}`,
        icon: <IndianRupee size={20} />,
        background: 'bg-[#1A1A1A]',
        text: 'text-white',
        muted: 'text-white/40',
      },

      {
        title: 'Products Logged',
        value: productCount,
        icon: <Package size={20} />,
        background: 'bg-[#EBE9E0]',
        text: 'text-[#111]',
        muted: 'text-black/40',
      },

      {
        title: 'Inventory Value',
        value: `₹${inventoryValue.toFixed(2)}`,
        icon: <Box size={20} />,
        background: 'bg-[#D9E2D5]',
        text: 'text-[#111]',
        muted: 'text-black/40',
      },

      {
        title: 'Sales Count',
        value: salesCount,
        icon: <ShoppingBag size={20} />,
        background: 'bg-[#D4DFE6]',
        text: 'text-[#111]',
        muted: 'text-black/40',
      },
    ],
    [
      revenue,
      productCount,
      inventoryValue,
      salesCount,
    ]
  );

  return (
    <div className="
      max-w-[1400px]
      mx-auto
      space-y-10
      animate-fade-in
      pb-10
    ">

      {/* HEADER */}
      <div className="
        flex
        flex-col
        md:flex-row
        justify-between
        items-start
        md:items-end
        gap-6
        border-b
        border-gray-200
        pb-8
      ">

        <div>

          <div className="
            inline-flex
            items-center
            gap-2
            bg-[#1A1A1A]
            text-white
            text-[10px]
            font-bold
            uppercase
            tracking-[0.3em]
            px-3
            py-1
            rounded-full
            mb-5
          ">
            <Activity size={11} />
            Business Intelligence
          </div>

          <h1 className="
            text-5xl
            md:text-6xl
            font-black
            uppercase
            tracking-tighter
            text-[#111]
            leading-none
          ">
            Business
            <br />
            <span className="
              text-transparent
              bg-clip-text
              bg-gradient-to-r
              from-[#111]
              to-[#999]
            ">
              Reports.
            </span>
          </h1>

          <p className="
            text-[10px]
            font-bold
            uppercase
            tracking-[0.25em]
            text-gray-400
            mt-5
          ">
            Store performance and operational analytics
          </p>

        </div>

        <button
          type="button"
          onClick={fetchReports}
          className="
            p-4
            bg-white
            border
            border-gray-100
            rounded-2xl
            hover:bg-gray-50
            shadow-sm
          "
          title="Refresh Reports"
        >
          <RefreshCcw
            size={18}
            className={
              loading
                ? 'animate-spin'
                : 'text-gray-500'
            }
          />
        </button>

      </div>

      {/* ERROR */}
      {error && (
        <div className="
          bg-red-50
          border
          border-red-100
          rounded-2xl
          p-5
          text-red-600
          text-[10px]
          font-black
          uppercase
          tracking-widest
        ">
          {error}
        </div>
      )}

      {/* SUMMARY */}
      <div className="
        grid
        grid-cols-1
        sm:grid-cols-2
        xl:grid-cols-4
        gap-5
      ">

        {summaryCards.map(
          (card) => (
            <div
              key={card.title}
              className={`
                ${card.background}
                ${card.text}
                rounded-[2rem]
                p-7
                min-h-[190px]
                flex
                flex-col
                justify-between
                relative
                overflow-hidden
              `}
            >

              <div className="
                flex
                justify-between
                items-start
              ">

                <div className="
                  w-11
                  h-11
                  rounded-2xl
                  bg-white/20
                  flex
                  items-center
                  justify-center
                ">
                  {card.icon}
                </div>

                <TrendingUp
                  size={18}
                  className={`
                    ${card.muted}
                  `}
                />

              </div>

              <div>

                <p className={`
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.2em]
                  ${card.muted}
                `}>
                  {card.title}
                </p>

                <p className="
                  text-4xl
                  font-black
                  tracking-tighter
                  mt-2
                ">
                  {loading
                    ? '—'
                    : card.value}
                </p>

              </div>

            </div>
          )
        )}

      </div>

      {/* OPERATIONS */}
      <div className="
        grid
        grid-cols-1
        lg:grid-cols-2
        gap-6
      ">

        {/* REVENUE */}
        <div className="
          bg-[#1A1A1A]
          rounded-[2.5rem]
          p-8
          md:p-10
          text-white
          relative
          overflow-hidden
        ">

          <TrendingUp
            size={180}
            className="
              absolute
              -right-10
              -bottom-10
              text-white/5
            "
          />

          <div className="relative z-10">

            <p className="
              text-[9px]
              font-black
              uppercase
              tracking-[0.3em]
              text-white/40
            ">
              Revenue Performance
            </p>

            <h2 className="
              text-4xl
              md:text-5xl
              font-black
              tracking-tighter
              mt-4
            ">
              ₹{loading
                ? '—'
                : revenue.toFixed(2)}
            </h2>

            <p className="
              text-[9px]
              font-bold
              uppercase
              tracking-widest
              text-white/30
              mt-4
            ">
              Total revenue recorded through your operational scope.
            </p>

          </div>

        </div>

        {/* OPERATIONS */}
        <div className="
          bg-white
          border
          border-gray-100
          rounded-[2.5rem]
          p-8
          md:p-10
          shadow-sm
        ">

          <div className="
            flex
            items-center
            gap-3
            mb-7
          ">

            <div className="
              w-10
              h-10
              bg-gray-100
              rounded-xl
              flex
              items-center
              justify-center
            ">
              <BarChart3 size={18} />
            </div>

            <div>

              <h2 className="
                text-lg
                font-black
                uppercase
                tracking-tight
              ">
                Operations Sync
              </h2>

              <p className="
                text-[8px]
                font-bold
                uppercase
                tracking-widest
                text-gray-400
              ">
                Current store metrics
              </p>

            </div>

          </div>

          <div className="space-y-1">

            <div className="
              flex
              justify-between
              items-center
              py-4
              border-b
              border-gray-50
            ">

              <span className="
                flex
                items-center
                gap-3
                text-xs
                font-bold
                uppercase
              ">
                <Package size={15} />
                Products Logged
              </span>

              <span className="
                text-lg
                font-black
              ">
                {loading
                  ? '—'
                  : productCount}
              </span>

            </div>

            <div className="
              flex
              justify-between
              items-center
              py-4
              border-b
              border-gray-50
            ">

              <span className="
                flex
                items-center
                gap-3
                text-xs
                font-bold
                uppercase
              ">
                <Box size={15} />
                Inventory Value
              </span>

              <span className="
                text-lg
                font-black
              ">
                {loading
                  ? '—'
                  : `₹${inventoryValue.toFixed(
                      2
                    )}`}
              </span>

            </div>

            <div className="
              flex
              justify-between
              items-center
              py-4
            ">

              <span className="
                flex
                items-center
                gap-3
                text-xs
                font-bold
                uppercase
              ">
                <BarChart3 size={15} />
                Sales Count
              </span>

              <span className="
                text-lg
                font-black
              ">
                {loading
                  ? '—'
                  : salesCount}
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* REPORT DETAILS */}
      <div className="
        bg-white
        border
        border-gray-100
        rounded-[2.5rem]
        p-8
        md:p-10
        shadow-sm
      ">

        <div className="
          flex
          items-center
          gap-3
          mb-8
        ">

          <div className="
            w-11
            h-11
            rounded-2xl
            bg-[#EBE9E0]
            flex
            items-center
            justify-center
            text-[#9B4819]
          ">
            <Activity size={19} />
          </div>

          <div>

            <h2 className="
              text-xl
              font-black
              uppercase
              tracking-tighter
            ">
              Operational Snapshot
            </h2>

            <p className="
              text-[9px]
              font-bold
              uppercase
              tracking-widest
              text-gray-400
              mt-1
            ">
              Manager scope
            </p>

          </div>

        </div>

        <div className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-5
        ">

          <div className="
            bg-[#FAFAFA]
            rounded-2xl
            p-6
          ">

            <Package
              size={18}
              className="text-[#9B4819]"
            />

            <p className="
              text-[9px]
              font-black
              uppercase
              tracking-widest
              text-gray-400
              mt-5
            ">
              Catalog
            </p>

            <p className="
              text-3xl
              font-black
              tracking-tighter
              mt-1
            ">
              {loading
                ? '—'
                : productCount}
            </p>

          </div>

          <div className="
            bg-[#FAFAFA]
            rounded-2xl
            p-6
          ">

            <Box
              size={18}
              className="text-[#9B4819]"
            />

            <p className="
              text-[9px]
              font-black
              uppercase
              tracking-widest
              text-gray-400
              mt-5
            ">
              Stock Value
            </p>

            <p className="
              text-3xl
              font-black
              tracking-tighter
              mt-1
            ">
              {loading
                ? '—'
                : `₹${inventoryValue.toFixed(
                    0
                  )}`}
            </p>

          </div>

          <div className="
            bg-[#FAFAFA]
            rounded-2xl
            p-6
          ">

            {salesCount === 0 ? (
              <AlertTriangle
                size={18}
                className="text-orange-500"
              />
            ) : (
              <ShoppingBag
                size={18}
                className="text-green-600"
              />
            )}

            <p className="
              text-[9px]
              font-black
              uppercase
              tracking-widest
              text-gray-400
              mt-5
            ">
              Sales Activity
            </p>

            <p className="
              text-3xl
              font-black
              tracking-tighter
              mt-1
            ">
              {loading
                ? '—'
                : salesCount}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ManagerReports;