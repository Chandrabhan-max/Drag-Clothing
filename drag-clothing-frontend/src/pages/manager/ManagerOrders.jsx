import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

import api from '../../api/axios';

const ManagerOrders = () => {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');

  const [filterStatus, setFilterStatus] = useState('all');

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [detailLoading, setDetailLoading] = useState(false);

  const [detailError, setDetailError] = useState('');

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchOrders();
  }, []);

  // =====================================================
  // FETCH MANAGER ORDERS
  // =====================================================

  const fetchOrders = async () => {
    setLoading(true);

    try {
      const res = await api.get('/orders/manager/my-orders');

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
      console.error(
        'Failed to fetch manager orders:',
        err
      );

      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UPDATE ORDER STATUS
  // =====================================================

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

      // Refresh opened order details if currently open
      if (selectedOrder?.id === orderId) {
        await openOrderDetails(orderId);
      }
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          'Failed to update order status.'
      );
    }
  };

  // =====================================================
  // ORDER DETAILS
  // =====================================================

  const openOrderDetails = async (orderId) => {
    setDetailLoading(true);

    setDetailError('');

    setSelectedOrder(null);

    try {
      const res = await api.get(
        `/orders/${orderId}`
      );

      const orderData =
        res.data?.data ||
        res.data;

      setSelectedOrder(orderData);
    } catch (error) {
      console.error(
        'Failed to fetch order details:',
        error
      );

      const message =
        error?.response?.data?.message;

      setDetailError(
        Array.isArray(message)
          ? message[0]
          : message ||
              'Failed to load order details.'
      );
    } finally {
      setDetailLoading(false);
    }
  };

  // =====================================================
  // STATUS COLOR
  // =====================================================

  const getStatusColor = (status) => {
    const colors = {
      pending:
        'bg-orange-50 text-orange-600 border-orange-100',

      confirmed:
        'bg-blue-50 text-blue-600 border-blue-100',

      processing:
        'bg-purple-50 text-purple-600 border-purple-100',

      shipped:
        'bg-indigo-50 text-indigo-600 border-indigo-100',

      in_transit:
        'bg-cyan-50 text-cyan-600 border-cyan-100',

      out_for_delivery:
        'bg-yellow-50 text-yellow-600 border-yellow-100',

      delivered:
        'bg-green-50 text-green-600 border-green-100',

      cancelled:
        'bg-red-50 text-red-600 border-red-100',
    };

    return (
      colors[status] ||
      'bg-gray-50 text-gray-600 border-gray-200'
    );
  };

  // =====================================================
  // NEXT ACTION
  // =====================================================

  const getNextAction = (
    status,
    orderId
  ) => {
    switch (status) {

      case 'pending':
        return (
          <button
            type="button"
            onClick={() =>
              updateStatus(
                orderId,
                'confirmed'
              )
            }
            className="
              p-2
              bg-blue-50
              text-blue-600
              hover:bg-blue-600
              hover:text-white
              rounded-lg
              transition-all
            "
            title="Confirm Order"
          >
            <CheckCircle size={14} />
          </button>
        );

      case 'confirmed':
        return (
          <button
            type="button"
            onClick={() =>
              updateStatus(
                orderId,
                'processing'
              )
            }
            className="
              p-2
              bg-purple-50
              text-purple-600
              hover:bg-purple-600
              hover:text-white
              rounded-lg
              transition-all
            "
            title="Start Processing"
          >
            <Package size={14} />
          </button>
        );

      case 'processing':
        return (
          <button
            type="button"
            onClick={() =>
              updateStatus(
                orderId,
                'shipped'
              )
            }
            className="
              p-2
              bg-indigo-50
              text-indigo-600
              hover:bg-indigo-600
              hover:text-white
              rounded-lg
              transition-all
            "
            title="Mark Shipped"
          >
            <Truck size={14} />
          </button>
        );

      case 'shipped':
        return (
          <button
            type="button"
            onClick={() =>
              updateStatus(
                orderId,
                'in_transit'
              )
            }
            className="
              p-2
              bg-cyan-50
              text-cyan-600
              hover:bg-cyan-600
              hover:text-white
              rounded-lg
              transition-all
            "
            title="Mark In Transit"
          >
            <MapPin size={14} />
          </button>
        );

      case 'in_transit':
        return (
          <button
            type="button"
            onClick={() =>
              updateStatus(
                orderId,
                'out_for_delivery'
              )
            }
            className="
              p-2
              bg-yellow-50
              text-yellow-600
              hover:bg-yellow-600
              hover:text-white
              rounded-lg
              transition-all
            "
            title="Out for Delivery"
          >
            <Truck size={14} />
          </button>
        );

      case 'out_for_delivery':
        return (
          <button
            type="button"
            onClick={() =>
              updateStatus(
                orderId,
                'delivered'
              )
            }
            className="
              p-2
              bg-green-50
              text-green-600
              hover:bg-green-600
              hover:text-white
              rounded-lg
              transition-all
            "
            title="Mark Delivered"
          >
            <PackageCheck size={14} />
          </button>
        );

      default:
        return null;
    }
  };

  // =====================================================
  // FILTER
  // =====================================================

  const filteredOrders =
    orders.filter((order) => {

      const matchesStatus =
        filterStatus === 'all' ||
        order.status === filterStatus;

      const orderId =
        String(order.id || '')
          .toLowerCase();

      const search =
        searchTerm
          .toLowerCase()
          .trim();

      const matchesSearch =
        orderId.includes(search);

      return (
        matchesStatus &&
        matchesSearch
      );
    });

  return (
    <div className="space-y-8 animate-fade-in">

      {/* =====================================================
          HEADER
      ===================================================== */}

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
            Incoming Orders
          </h1>

          <p className="
            text-gray-500
            text-[10px]
            font-bold
            uppercase
            tracking-[0.3em]
            mt-1
          ">
            Store Fulfillment Terminal
          </p>

        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="
            p-3
            bg-white
            border
            border-gray-100
            rounded-xl
            hover:bg-gray-50
            transition-colors
            shadow-sm
          "
          title="Refresh Orders"
        >
          <RefreshCw
            size={18}
            className={
              loading
                ? 'animate-spin'
                : 'text-gray-500'
            }
          />
        </button>

      </div>

      {/* =====================================================
          SEARCH + FILTER
      ===================================================== */}

      <div className="
        flex
        flex-col
        md:flex-row
        gap-4
      ">

        <div className="
          relative
          flex-1
        ">

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
            placeholder="SEARCH BY ORDER ID..."
            className="
              w-full
              bg-white
              border
              border-[#EEE]
              rounded-2xl
              py-4
              pl-12
              pr-6
              text-[10px]
              font-bold
              uppercase
              outline-none
              focus:border-[#1A1A1A]
              shadow-sm
            "
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
          />

        </div>

        <select
          className="
            bg-white
            border
            border-[#EEE]
            rounded-2xl
            px-6
            py-4
            text-[10px]
            font-bold
            uppercase
            outline-none
            cursor-pointer
            shadow-sm
            min-w-[200px]
          "
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(
              e.target.value
            )
          }
        >

          <option value="all">
            ALL STATUSES
          </option>

          <option value="pending">
            PENDING
          </option>

          <option value="confirmed">
            CONFIRMED
          </option>

          <option value="processing">
            PROCESSING
          </option>

          <option value="shipped">
            SHIPPED
          </option>

          <option value="in_transit">
            IN TRANSIT
          </option>

          <option value="out_for_delivery">
            OUT FOR DELIVERY
          </option>

          <option value="delivered">
            DELIVERED
          </option>

          <option value="cancelled">
            CANCELLED
          </option>

        </select>

      </div>

      {/* =====================================================
          ORDERS TABLE
      ===================================================== */}

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
            border-collapse
          ">

            <thead className="bg-gray-50/50">

              <tr>

                <th className="
                  p-6
                  text-[10px]
                  font-black
                  uppercase
                  text-gray-400
                  tracking-[0.2em]
                ">
                  Order ID
                </th>

                <th className="
                  p-6
                  text-[10px]
                  font-black
                  uppercase
                  text-gray-400
                  tracking-[0.2em]
                ">
                  Customer
                </th>

                <th className="
                  p-6
                  text-[10px]
                  font-black
                  uppercase
                  text-gray-400
                  tracking-[0.2em]
                ">
                  Total
                </th>

                <th className="
                  p-6
                  text-[10px]
                  font-black
                  uppercase
                  text-gray-400
                  tracking-[0.2em]
                ">
                  Status
                </th>

                <th className="
                  p-6
                  text-[10px]
                  font-black
                  uppercase
                  text-gray-400
                  tracking-[0.2em]
                  text-right
                ">
                  Action
                </th>

              </tr>

            </thead>

            <tbody className="
              divide-y
              divide-[#F9F9F9]
            ">

              {filteredOrders.map(
                (order) => (
                  <tr
                    key={order.id}
                    className="
                      hover:bg-[#FAFAFA]
                      transition-colors
                      group
                    "
                  >

                    {/* Order ID */}
                    <td className="p-6">

                      <span className="
                        text-[10px]
                        font-black
                        font-mono
                        text-gray-400
                        group-hover:text-[#111]
                        transition-colors
                      ">
                        #
                        {String(
                          order.id || ''
                        ).split('-')[0]}
                      </span>

                    </td>

                    {/* Customer */}
                    <td className="p-6">

                      <p className="
                        text-[11px]
                        font-black
                        uppercase
                        text-[#111]
                      ">
                        {order.customer?.name ||
                          order.user?.name ||
                          'Unknown Customer'}
                      </p>

                      <p className="
                        text-[9px]
                        text-gray-400
                        font-bold
                        mt-1
                      ">
                        {order.customer?.phone ||
                          order.customer?.email ||
                          order.user?.phone ||
                          order.user?.email ||
                          ''}
                      </p>

                      <p className="
                        text-[9px]
                        text-gray-400
                        font-bold
                        mt-1
                      ">
                        {order.createdAt
                          ? new Date(
                              order.createdAt
                            ).toLocaleDateString()
                          : 'N/A'}
                      </p>

                    </td>

                    {/* Total */}
                    <td className="p-6">

                      <span className="
                        text-sm
                        font-black
                        text-[#111]
                      ">
                        ₹
                        {Number(
                          order.totalAmount || 0
                        ).toFixed(2)}
                      </span>

                    </td>

                    {/* Status */}
                    <td className="p-6">

                      <span
                        className={`
                          px-3
                          py-1.5
                          rounded-lg
                          text-[9px]
                          font-black
                          uppercase
                          border
                          tracking-widest
                          ${getStatusColor(
                            order.status
                          )}
                        `}
                      >
                        {order.status
                          ?.replace(
                            /_/g,
                            ' '
                          )}
                      </span>

                    </td>

                    {/* Actions */}
                    <td className="
                      p-6
                      text-right
                    ">

                      <div className="
                        flex
                        justify-end
                        gap-2
                      ">

                        <button
                          type="button"
                          onClick={() =>
                            openOrderDetails(
                              order.id
                            )
                          }
                          className="
                            p-2
                            bg-gray-100
                            text-gray-500
                            hover:bg-[#1A1A1A]
                            hover:text-white
                            rounded-lg
                            transition-all
                          "
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

        {/* Loading */}
        {loading &&
          orders.length === 0 && (
            <div className="
              p-20
              flex
              justify-center
            ">
              <RefreshCw
                size={28}
                className="
                  animate-spin
                  text-gray-300
                "
              />
            </div>
          )}

        {/* Empty */}
        {!loading &&
          filteredOrders.length === 0 && (
            <div className="
              p-20
              text-center
            ">

              <ShoppingCart
                size={48}
                className="
                  mx-auto
                  text-gray-200
                  mb-4
                "
              />

              <p className="
                text-[10px]
                font-black
                uppercase
                text-gray-400
                tracking-widest
              ">
                No orders found in terminal
              </p>

              <p className="
                text-[9px]
                font-bold
                uppercase
                text-gray-300
                tracking-widest
                mt-2
              ">
                Adjust your filters or check again later
              </p>

            </div>
          )}

      </div>

      {/* =====================================================
          ORDER DETAILS MODAL
      ===================================================== */}

      {(selectedOrder ||
        detailLoading ||
        detailError) && (
        <div className="
          fixed
          inset-0
          z-[9999]
          flex
          items-center
          justify-center
          p-4
        ">

          {/* Backdrop */}
          <div
            className="
              absolute
              inset-0
              bg-black/60
              backdrop-blur-sm
            "
            onClick={() => {
              if (!detailLoading) {
                setSelectedOrder(null);
                setDetailError('');
              }
            }}
          />

          {/* Modal */}
          <div className="
            relative
            bg-white
            w-full
            max-w-2xl
            max-h-[90vh]
            overflow-y-auto
            rounded-[2rem]
            shadow-2xl
            p-8
          ">

            {/* Modal Header */}
            <div className="
              flex
              justify-between
              items-start
              mb-8
            ">

              <div>

                <p className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.3em]
                  text-gray-400
                  mb-2
                ">
                  Order Details
                </p>

                <h2 className="
                  text-2xl
                  font-black
                  uppercase
                  tracking-tight
                  text-[#111]
                ">
                  {selectedOrder?.id
                    ? `#${String(
                        selectedOrder.id
                      ).split('-')[0]}`
                    : 'Loading Order...'}
                </h2>

              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedOrder(null);
                  setDetailError('');
                }}
                className="
                  p-2
                  bg-gray-100
                  hover:bg-black
                  hover:text-white
                  rounded-full
                  transition-all
                "
              >
                <X size={18} />
              </button>

            </div>

            {/* Loading */}
            {detailLoading && (
              <div className="
                py-20
                flex
                justify-center
              ">
                <RefreshCw
                  size={28}
                  className="
                    animate-spin
                    text-gray-300
                  "
                />
              </div>
            )}

            {/* Error */}
            {detailError &&
              !detailLoading && (
                <div className="
                  bg-red-50
                  text-red-600
                  border
                  border-red-100
                  rounded-2xl
                  p-5
                  text-xs
                  font-bold
                  uppercase
                  text-center
                ">
                  {detailError}
                </div>
              )}

            {/* Details */}
            {selectedOrder &&
              !detailLoading &&
              !detailError && (
                <div className="space-y-6">

                  {/* Summary */}
                  <div className="
                    grid
                    grid-cols-2
                    md:grid-cols-4
                    gap-4
                  ">

                    <div className="
                      bg-gray-50
                      rounded-2xl
                      p-4
                    ">
                      <p className="
                        text-[8px]
                        font-black
                        uppercase
                        tracking-widest
                        text-gray-400
                      ">
                        Status
                      </p>

                      <p className="
                        text-xs
                        font-black
                        uppercase
                        mt-2
                      ">
                        {selectedOrder.status
                          ?.replace(
                            /_/g,
                            ' '
                          )}
                      </p>
                    </div>

                    <div className="
                      bg-gray-50
                      rounded-2xl
                      p-4
                    ">
                      <p className="
                        text-[8px]
                        font-black
                        uppercase
                        tracking-widest
                        text-gray-400
                      ">
                        Total
                      </p>

                      <p className="
                        text-xs
                        font-black
                        mt-2
                      ">
                        ₹
                        {Number(
                          selectedOrder.totalAmount ||
                            0
                        ).toFixed(2)}
                      </p>
                    </div>

                    <div className="
                      bg-gray-50
                      rounded-2xl
                      p-4
                    ">
                      <p className="
                        text-[8px]
                        font-black
                        uppercase
                        tracking-widest
                        text-gray-400
                      ">
                        Order Date
                      </p>

                      <p className="
                        text-xs
                        font-black
                        mt-2
                      ">
                        {selectedOrder.createdAt
                          ? new Date(
                              selectedOrder.createdAt
                            ).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>

                    <div className="
                      bg-gray-50
                      rounded-2xl
                      p-4
                    ">
                      <p className="
                        text-[8px]
                        font-black
                        uppercase
                        tracking-widest
                        text-gray-400
                      ">
                        Items
                      </p>

                      <p className="
                        text-xs
                        font-black
                        mt-2
                      ">
                        {selectedOrder.items
                          ?.length || 0}
                      </p>
                    </div>

                  </div>

                  {/* Customer */}
                  {(selectedOrder.customer ||
                    selectedOrder.user) && (
                    <div className="
                      bg-gray-50
                      rounded-2xl
                      p-5
                    ">

                      <p className="
                        text-[8px]
                        font-black
                        uppercase
                        tracking-widest
                        text-gray-400
                      ">
                        Customer
                      </p>

                      <p className="
                        text-sm
                        font-black
                        uppercase
                        mt-2
                      ">
                        {selectedOrder.customer?.name ||
                          selectedOrder.user?.name ||
                          'Unknown Customer'}
                      </p>

                      <p className="
                        text-[10px]
                        font-bold
                        text-gray-500
                        mt-1
                      ">
                        {selectedOrder.customer?.phone ||
                          selectedOrder.user?.phone ||
                          ''}
                      </p>

                      <p className="
                        text-[10px]
                        font-bold
                        text-gray-500
                      ">
                        {selectedOrder.customer?.email ||
                          selectedOrder.user?.email ||
                          ''}
                      </p>

                    </div>
                  )}

                  {/* Order Items */}
                  <div>

                    <h3 className="
                      text-[10px]
                      font-black
                      uppercase
                      tracking-widest
                      text-[#111]
                      mb-4
                    ">
                      Order Items
                    </h3>

                    <div className="
                      border
                      border-gray-100
                      rounded-2xl
                      overflow-hidden
                    ">

                      {selectedOrder.items?.length >
                      0 ? (
                        selectedOrder.items.map(
                          (item, index) => (
                            <div
                              key={
                                item.id ||
                                index
                              }
                              className="
                                flex
                                items-center
                                justify-between
                                gap-4
                                p-5
                                border-b
                                border-gray-50
                                last:border-b-0
                              "
                            >

                              <div>

                                <p className="
                                  text-xs
                                  font-black
                                  uppercase
                                  text-[#111]
                                ">
                                  {item.product?.name ||
                                    item.productName ||
                                    'Unknown Product'}
                                </p>

                                <p className="
                                  text-[9px]
                                  font-bold
                                  text-gray-500
                                  mt-1
                                ">
                                  {item.variant?.color ||
                                    'No Color'}

                                  {item.variant?.size
                                    ? ` • ${item.variant.size}`
                                    : ''}
                                </p>

                                <p className="
                                  text-[9px]
                                  font-bold
                                  text-gray-400
                                  mt-1
                                ">
                                  Qty: {item.quantity}
                                </p>

                              </div>

                              <div className="text-right">

                                <p className="
                                  text-xs
                                  font-black
                                ">
                                  ₹
                                  {Number(
                                    item.price ||
                                      0
                                  ).toFixed(2)}
                                </p>

                                <p className="
                                  text-[9px]
                                  font-bold
                                  text-gray-400
                                  uppercase
                                  mt-1
                                ">
                                  Qty: {item.quantity}
                                </p>

                              </div>

                            </div>
                          )
                        )
                      ) : (
                        <div className="
                          p-8
                          text-center
                          text-[10px]
                          font-bold
                          uppercase
                          text-gray-400
                        ">
                          No order items found
                        </div>
                      )}

                    </div>

                  </div>

                  {/* Shipping */}
                  {selectedOrder.shippingAddress && (
                    <div className="
                      bg-gray-50
                      rounded-2xl
                      p-5
                    ">

                      <p className="
                        text-[8px]
                        font-black
                        uppercase
                        tracking-widest
                        text-gray-400
                      ">
                        Shipping Address
                      </p>

                      <p className="
                        text-sm
                        font-black
                        mt-2
                      ">
                        {
                          selectedOrder
                            .shippingAddress
                            .fullName
                        }
                      </p>

                      <p className="
                        text-[10px]
                        font-bold
                        text-gray-500
                        mt-1
                      ">
                        {
                          selectedOrder
                            .shippingAddress
                            .addressLine1
                        }
                      </p>

                      {selectedOrder
                        .shippingAddress
                        .addressLine2 && (
                        <p className="
                          text-[10px]
                          font-bold
                          text-gray-500
                        ">
                          {
                            selectedOrder
                              .shippingAddress
                              .addressLine2
                          }
                        </p>
                      )}

                      <p className="
                        text-[10px]
                        font-bold
                        text-gray-500
                      ">
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

                      <p className="
                        text-[10px]
                        font-bold
                        text-gray-500
                      ">
                        {
                          selectedOrder
                            .shippingAddress
                            .country
                        }
                      </p>

                      <p className="
                        text-[10px]
                        font-bold
                        text-gray-500
                        mt-1
                      ">
                        Phone:{' '}
                        {
                          selectedOrder
                            .shippingAddress
                            .phone
                        }
                      </p>

                    </div>
                  )}

                  {/* Tracking */}
                  {selectedOrder.trackingNumber && (
                    <div className="
                      bg-blue-50
                      border
                      border-blue-100
                      rounded-2xl
                      p-5
                    ">

                      <p className="
                        text-[8px]
                        font-black
                        uppercase
                        tracking-widest
                        text-blue-500
                      ">
                        Tracking Number
                      </p>

                      <p className="
                        text-xs
                        font-black
                        mt-2
                      ">
                        {
                          selectedOrder
                            .trackingNumber
                        }
                      </p>

                    </div>
                  )}

                  {/* Courier */}
                  {selectedOrder.courierName && (
                    <div className="
                      bg-gray-50
                      rounded-2xl
                      p-5
                    ">

                      <p className="
                        text-[8px]
                        font-black
                        uppercase
                        tracking-widest
                        text-gray-400
                      ">
                        Courier
                      </p>

                      <p className="
                        text-xs
                        font-black
                        uppercase
                        mt-2
                      ">
                        {
                          selectedOrder
                            .courierName
                        }
                      </p>

                    </div>
                  )}

                  {/* Grand Total */}
                  <div className="
                    border-t
                    border-gray-100
                    pt-6
                    flex
                    justify-between
                    items-center
                  ">

                    <span className="
                      text-[10px]
                      font-black
                      uppercase
                      tracking-widest
                      text-gray-400
                    ">
                      Grand Total
                    </span>

                    <span className="
                      text-2xl
                      font-black
                    ">
                      ₹
                      {Number(
                        selectedOrder.totalAmount ||
                          0
                      ).toFixed(2)}
                    </span>

                  </div>

                </div>
              )}

          </div>
        </div>
      )}

    </div>
  );
};

export default ManagerOrders;