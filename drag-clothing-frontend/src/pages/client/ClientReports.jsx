import React, {
  useEffect,
  useState,
} from 'react';

import {
  BarChart3,
  TrendingUp,
  Package,
  Users,
  DollarSign,
  ShoppingBag,
  RefreshCcw,
  AlertCircle,
  Loader2,
} from 'lucide-react';

import api from '../../api/axios';


const ClientReports = () => {

  // =====================================================
  // STATE
  // =====================================================

  const [summary, setSummary] =
    useState(null);

  const [productReport, setProductReport] =
    useState([]);

  const [managerReport, setManagerReport] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState('');


  // =====================================================
  // FETCH REPORTS
  // =====================================================

  const fetchReports = async () => {

    try {

      setIsLoading(true);
      setError('');


      const [
        summaryRes,
        productRes,
        managerRes,
      ] = await Promise.all([

        api.get(
          '/client/reports/summary',
        ),

        api.get(
          '/client/reports/products',
        ),

        api.get(
          '/client/reports/managers',
        ),

      ]);


      // =================================================
      // NORMALIZE RESPONSE
      // =================================================

      const summaryData =
        summaryRes?.data?.data ??
        summaryRes?.data ??
        null;


      const productsData =
        productRes?.data?.data ??
        productRes?.data ??
        [];


      const managersData =
        managerRes?.data?.data ??
        managerRes?.data ??
        [];


      setSummary(
        summaryData || {
          totalOrders: 0,
          totalRevenue: 0,
          totalProductsSold: 0,
          totalActiveDiscounts: 0,
        },
      );


      setProductReport(
        Array.isArray(productsData)
          ? productsData
          : [],
      );


      setManagerReport(
        Array.isArray(managersData)
          ? managersData
          : [],
      );


    } catch (error) {

      console.error(
        'Failed to fetch reports:',
        error?.response?.data ||
        error,
      );


      const backendMessage =
        error?.response?.data?.message;


      setError(
        Array.isArray(backendMessage)
          ? backendMessage[0]
          : backendMessage ||
            'Unable to load reports. Please try again.',
      );


      setSummary(null);
      setProductReport([]);
      setManagerReport([]);


    } finally {

      setIsLoading(false);

    }

  };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    fetchReports();

  }, []);


  // =====================================================
  // HELPERS
  // =====================================================

  const formatCurrency = (value) => {

    const amount =
      Number(value || 0);

    return amount.toLocaleString(
      'en-IN',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    );

  };


  const formatNumber = (value) => {

    return Number(
      value || 0,
    ).toLocaleString('en-IN');

  };


  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (isLoading) {

    return (

      <div className="min-h-[500px] flex flex-col items-center justify-center">

        <Loader2
          size={36}
          className="animate-spin text-[#9B4819] mb-4"
        />

        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">

          Loading Business Intelligence

        </p>

      </div>

    );

  }


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="space-y-8 animate-fade-in pb-10">


      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-8">

        <div>

          <h1 className="text-4xl font-black uppercase tracking-tighter text-[#111]">

            Reports

          </h1>


          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">

            Business Intelligence

          </p>

        </div>


        <button
          onClick={fetchReports}
          disabled={isLoading}
          className="flex items-center gap-2 bg-[#1A1A1A] text-white px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#9B4819] transition-all disabled:opacity-50"
        >

          <RefreshCcw
            size={14}
          />

          Refresh Reports

        </button>

      </div>


      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (

        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center gap-4">

          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">

            <AlertCircle
              size={20}
            />

          </div>


          <div className="flex-1">

            <p className="text-[9px] font-black uppercase tracking-widest text-red-500">

              Report Error

            </p>


            <p className="text-xs font-bold text-red-700 mt-1">

              {error}

            </p>

          </div>


          <button
            onClick={fetchReports}
            className="text-[9px] font-black uppercase tracking-widest text-red-600 hover:text-red-800"
          >

            Retry

          </button>

        </div>

      )}


      {/* ================================================= */}
      {/* STATS */}
      {/* ================================================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">


        {/* REVENUE */}

        <div className="bg-[#1A1A1A] text-white p-8 rounded-[2rem] relative overflow-hidden shadow-xl">

          <TrendingUp
            className="absolute -right-4 -bottom-4 text-white/5"
            size={100}
          />


          <div className="relative z-10">

            <div className="flex items-center justify-between mb-5">

              <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/50">

                Total Revenue

              </h3>


              <DollarSign
                size={18}
                className="text-[#9B4819]"
              />

            </div>


            <p className="text-4xl font-black tracking-tighter">

              ₹
              {formatCurrency(
                summary?.totalRevenue,
              )}

            </p>


            <p className="text-[8px] uppercase tracking-widest text-white/30 mt-3">

              Excluding cancelled orders

            </p>

          </div>

        </div>


        {/* ORDERS */}

        <div className="bg-white border border-gray-100 p-8 rounded-[2rem] shadow-sm">

          <div className="flex items-center justify-between mb-5">

            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">

              Total Orders

            </h3>


            <ShoppingBag
              size={18}
              className="text-gray-300"
            />

          </div>


          <p className="text-4xl font-black tracking-tighter text-[#111]">

            {formatNumber(
              summary?.totalOrders,
            )}

          </p>


          <p className="text-[8px] uppercase tracking-widest text-gray-400 mt-3">

            Orders generated

          </p>

        </div>


        {/* ITEMS SOLD */}

        <div className="bg-white border border-gray-100 p-8 rounded-[2rem] shadow-sm">

          <div className="flex items-center justify-between mb-5">

            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">

              Items Sold

            </h3>


            <Package
              size={18}
              className="text-gray-300"
            />

          </div>


          <p className="text-4xl font-black tracking-tighter text-[#111]">

            {formatNumber(
              summary?.totalProductsSold,
            )}

          </p>


          <p className="text-[8px] uppercase tracking-widest text-gray-400 mt-3">

            Total units sold

          </p>

        </div>


        {/* DISCOUNTS */}

        <div className="bg-white border border-gray-100 p-8 rounded-[2rem] shadow-sm">

          <div className="flex items-center justify-between mb-5">

            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">

              Active Promos

            </h3>


            <TrendingUp
              size={18}
              className="text-gray-300"
            />

          </div>


          <p className="text-4xl font-black tracking-tighter text-[#111]">

            {formatNumber(
              summary?.totalActiveDiscounts,
            )}

          </p>


          <p className="text-[8px] uppercase tracking-widest text-gray-400 mt-3">

            Currently active

          </p>

        </div>

      </div>


      {/* ================================================= */}
      {/* PRODUCT PERFORMANCE */}
      {/* ================================================= */}

      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">


        <div className="p-8 border-b border-gray-50 flex justify-between items-center">

          <div>

            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#111]">

              Product Sales Breakdown

            </h3>


            <p className="text-[9px] text-gray-400 uppercase tracking-wider mt-2">

              Sales performance by product

            </p>

          </div>


          <Package
            size={18}
            className="text-gray-300"
          />

        </div>


        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="bg-gray-50/50">

              <tr>

                <th className="p-6 text-[9px] font-black uppercase tracking-widest text-gray-400">

                  Product

                </th>

                <th className="p-6 text-[9px] font-black uppercase tracking-widest text-gray-400">

                  Sold

                </th>

                <th className="p-6 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">

                  Revenue

                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-gray-50">

              {productReport.length > 0 ? (

                productReport.map(
                  (prod, idx) => (

                    <tr
                      key={
                        prod.productId ||
                        idx
                      }
                      className="hover:bg-gray-50 transition-colors"
                    >

                      <td className="p-6">

                        <div className="flex items-center gap-3">

                          <div className="w-9 h-9 rounded-xl bg-[#EBE9E0] text-[#9B4819] flex items-center justify-center">

                            <Package
                              size={15}
                            />

                          </div>


                          <span className="text-xs font-black uppercase text-[#111]">

                            {prod.productName}

                          </span>

                        </div>

                      </td>


                      <td className="p-6">

                        <span className="text-xs font-bold text-gray-500">

                          {formatNumber(
                            prod.totalSold,
                          )}

                        </span>

                      </td>


                      <td className="p-6 text-right">

                        <span className="text-xs font-black text-[#111]">

                          ₹
                          {formatCurrency(
                            prod.revenue,
                          )}

                        </span>

                      </td>

                    </tr>

                  )

                )

              ) : (

                <tr>

                  <td
                    colSpan="3"
                    className="p-16 text-center"
                  >

                    <Package
                      size={32}
                      className="mx-auto text-gray-200 mb-4"
                    />


                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">

                      No product sales data found

                    </p>


                    <p className="text-[9px] text-gray-300 uppercase tracking-wider mt-2">

                      Sales will appear here after orders are recorded

                    </p>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* ================================================= */}
      {/* MANAGER PERFORMANCE */}
      {/* ================================================= */}

      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">


        <div className="p-8 border-b border-gray-50 flex justify-between items-center">

          <div>

            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#111]">

              Manager Performance

            </h3>


            <p className="text-[9px] text-gray-400 uppercase tracking-wider mt-2">

              Orders and revenue by manager

            </p>

          </div>


          <Users
            size={18}
            className="text-gray-300"
          />

        </div>


        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="bg-gray-50/50">

              <tr>

                <th className="p-6 text-[9px] font-black uppercase tracking-widest text-gray-400">

                  Manager

                </th>

                <th className="p-6 text-[9px] font-black uppercase tracking-widest text-gray-400">

                  Orders

                </th>

                <th className="p-6 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">

                  Revenue

                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-gray-50">

              {managerReport.length > 0 ? (

                managerReport.map(
                  (manager, idx) => (

                    <tr
                      key={
                        manager.managerId ||
                        idx
                      }
                      className="hover:bg-gray-50 transition-colors"
                    >

                      <td className="p-6">

                        <div className="flex items-center gap-3">

                          <div className="w-9 h-9 rounded-xl bg-[#1A1A1A] text-white flex items-center justify-center">

                            <Users
                              size={15}
                            />

                          </div>


                          <span className="text-xs font-black uppercase text-[#111]">

                            {manager.managerName ||
                              'Unassigned'}

                          </span>

                        </div>

                      </td>


                      <td className="p-6">

                        <span className="text-xs font-bold text-gray-500">

                          {formatNumber(
                            manager.totalOrders,
                          )}

                        </span>

                      </td>


                      <td className="p-6 text-right">

                        <span className="text-xs font-black text-[#111]">

                          ₹
                          {formatCurrency(
                            manager.revenue,
                          )}

                        </span>

                      </td>

                    </tr>

                  )

                )

              ) : (

                <tr>

                  <td
                    colSpan="3"
                    className="p-16 text-center"
                  >

                    <Users
                      size={32}
                      className="mx-auto text-gray-200 mb-4"
                    />


                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">

                      No manager sales data found

                    </p>


                    <p className="text-[9px] text-gray-300 uppercase tracking-wider mt-2">

                      Manager performance will appear here

                    </p>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* ================================================= */}
      {/* ANALYTICS FOOTER */}
      {/* ================================================= */}

      <div className="p-10 bg-[#F7F7F5] border border-gray-100 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6">

        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm">

          <BarChart3
            size={26}
            className="text-[#9B4819]"
          />

        </div>


        <div>

          <p className="text-[10px] font-black uppercase tracking-widest text-[#111]">

            Live Business Analytics

          </p>


          <p className="text-[9px] text-gray-400 uppercase tracking-wider mt-2">

            Reports are calculated from your current orders,
            products and manager activity.

          </p>

        </div>

      </div>

    </div>

  );

};


export default ClientReports;