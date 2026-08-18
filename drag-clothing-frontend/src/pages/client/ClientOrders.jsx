import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Search, Eye, RefreshCw, CheckCircle, Package, Truck, MapPin, PackageCheck, X } from 'lucide-react';
import api from '../../api/axios';

const ClientOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/client/my-orders');
      const fetchedOrders = res.data?.data?.data || res.data?.data || [];
      setOrders(Array.isArray(fetchedOrders) ? fetchedOrders : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (err) { alert(err.response?.data?.message || "Update failed"); }
  };

  const openOrderDetails = async (orderId) => {
    setDetailLoading(true);
    setDetailError('');
    setSelectedOrder(null);

    try {
      const res = await api.get(`/orders/${orderId}`);
      const orderData = res.data?.data || res.data;

      setSelectedOrder(orderData);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      setDetailError(
        error.response?.data?.message || 'Failed to load order details.'
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-orange-50 text-orange-600 border-orange-100',
      confirmed: 'bg-blue-50 text-blue-600 border-blue-100',
      processing: 'bg-purple-50 text-purple-600 border-purple-100',
      shipped: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      delivered: 'bg-green-50 text-green-600 border-green-100',
      cancelled: 'bg-red-50 text-red-600 border-red-100',
    };
    return colors[status] || 'bg-gray-50 text-gray-600';
  };

  const getNextAction = (status, orderId) => {
    switch (status) {
      case 'pending':
        return <button onClick={() => updateStatus(orderId, 'confirmed')} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all" title="Confirm"><CheckCircle size={14} /></button>;
      case 'confirmed':
        return <button onClick={() => updateStatus(orderId, 'processing')} className="p-2 bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white rounded-lg transition-all" title="Processing"><Package size={14} /></button>;
      case 'processing':
        return <button onClick={() => updateStatus(orderId, 'shipped')} className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-all" title="Shipped"><Truck size={14} /></button>;
      case 'shipped':
        return <button onClick={() => updateStatus(orderId, 'in_transit')} className="p-2 bg-cyan-50 text-cyan-600 hover:bg-cyan-600 hover:text-white rounded-lg transition-all" title="In Transit"><MapPin size={14} /></button>;
      case 'in_transit':
        return <button onClick={() => updateStatus(orderId, 'out_for_delivery')} className="p-2 bg-yellow-50 text-yellow-600 hover:bg-yellow-600 hover:text-white rounded-lg transition-all" title="Out for Delivery"><Truck size={14} /></button>;
      case 'out_for_delivery':
        return <button onClick={() => updateStatus(orderId, 'delivered')} className="p-2 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-all" title="Delivered"><PackageCheck size={14} /></button>;
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter(o =>
    (filterStatus === 'all' || o.status === filterStatus) &&
    (o.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-[#111]">Incoming Orders</h1>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Brand Fulfillment Terminal</p>
        </div>
        <button onClick={fetchOrders} className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <input
            type="text"
            placeholder="SEARCH BY ORDER ID..."
            className="w-full bg-white border border-[#EEE] rounded-2xl py-4 pl-12 pr-6 text-[10px] font-bold uppercase outline-none focus:border-[#1A1A1A]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="bg-white border border-[#EEE] rounded-2xl px-6 text-[10px] font-bold uppercase outline-none cursor-pointer"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">ALL STATUSES</option>
          <option value="pending">PENDING</option>
          <option value="processing">PROCESSING</option>
          <option value="shipped">SHIPPED</option>
          <option value="delivered">DELIVERED</option>
        </select>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-[#EEE] overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="p-6 text-[10px] font-black uppercase text-gray-400">Order ID</th>
              <th className="p-6 text-[10px] font-black uppercase text-gray-400">Customer</th>
              <th className="p-6 text-[10px] font-black uppercase text-gray-400">Total</th>
              <th className="p-6 text-[10px] font-black uppercase text-gray-400">Status</th>
              <th className="p-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F9F9F9]">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-[#FAFAFA] transition-colors group">
                <td className="p-6">
                  <span className="text-[10px] font-black font-mono text-gray-400 group-hover:text-[#111]">#{order.id.split('-')[0]}</span>
                </td>
                <td className="p-6">
                  <p className="text-[11px] font-black uppercase">
                    {order.customer?.name || 'Unknown Customer'}
                  </p>
                  <p className="text-[9px] text-gray-400 font-bold">
                    {order.customer?.phone || order.customer?.email || ''}
                  </p>
                  <p className="text-[9px] text-gray-400 font-bold">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </td>
                <td className="p-6">
                  <span className="text-sm font-black">₹{order.totalAmount}</span>
                </td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${getStatusColor(order.status)}`}>
                    {order.status?.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openOrderDetails(order.id)}
                      className="p-2 bg-gray-100 text-gray-500 hover:bg-black hover:text-white rounded-lg transition-all"
                      title="View Order Details"
                    >
                      <Eye size={14} />
                    </button>
                    {getNextAction(order.status, order.id)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="p-20 text-center">
            <ShoppingCart size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">No orders found in terminal</p>
          </div>
        )}
      </div>
      {(selectedOrder || detailLoading || detailError) && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              if (!detailLoading) {
                setSelectedOrder(null);
                setDetailError('');
              }
            }}
          />

          <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">
                  Order Details
                </p>

                <h2 className="text-2xl font-black uppercase tracking-tight text-[#111]">
                  {selectedOrder?.id
                    ? `#${selectedOrder.id.split('-')[0]}`
                    : 'Loading Order...'}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedOrder(null);
                  setDetailError('');
                }}
                className="p-2 bg-gray-100 hover:bg-black hover:text-white rounded-full transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {detailLoading && (
              <div className="py-20 flex justify-center">
                <RefreshCw size={28} className="animate-spin text-gray-300" />
              </div>
            )}

            {detailError && !detailLoading && (
              <div className="bg-red-50 text-red-600 border border-red-100 rounded-2xl p-5 text-xs font-bold uppercase text-center">
                {detailError}
              </div>
            )}

            {selectedOrder && !detailLoading && !detailError && (
              <div className="space-y-6">

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                      Status
                    </p>
                    <p className="text-xs font-black uppercase mt-2">
                      {selectedOrder.status?.replace(/_/g, ' ')}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                      Total
                    </p>
                    <p className="text-xs font-black mt-2">
                      ₹{Number(selectedOrder.totalAmount || 0).toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                      Order Date
                    </p>
                    <p className="text-xs font-black mt-2">
                      {selectedOrder.createdAt
                        ? new Date(selectedOrder.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                      Items
                    </p>
                    <p className="text-xs font-black mt-2">
                      {selectedOrder.items?.length || 0}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#111] mb-4">
                    Order Items
                  </h3>

                  <div className="border border-gray-100 rounded-2xl overflow-hidden">
                    {selectedOrder.items?.length > 0 ? (
                      selectedOrder.items.map((item, index) => (
                        <div
                          key={item.id || index}
                          className="flex items-center justify-between gap-4 p-5 border-b border-gray-50 last:border-b-0"
                        >
                          <div>
                            <p className="text-xs font-black uppercase text-[#111]">
                              {item.product?.name ||
                              item.productName ||
                              'Unknown Product'}
                            </p>

                            <p className="text-[9px] font-bold text-gray-500 mt-1">
                              {item.variant?.color || 'No Color'}
                              {item.variant?.size ? ` • ${item.variant.size}` : ''}
                            </p>

                            <p className="text-[9px] font-bold text-gray-400 mt-1">
                              Qty: {item.quantity}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-xs font-black">
                              ₹{Number(item.price || 0).toFixed(2)}
                            </p>

                            <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-[10px] font-bold uppercase text-gray-400">
                        No order items found
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">

                  {selectedOrder.shippingAddress && (
                    <div className="bg-gray-50 rounded-2xl p-5">
                      <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                        Shipping Address
                      </p>

                      <p className="text-sm font-black mt-2">
                        {selectedOrder.shippingAddress.fullName}
                      </p>

                      <p className="text-[10px] font-bold text-gray-500 mt-1">
                        {selectedOrder.shippingAddress.addressLine1}
                      </p>

                      {selectedOrder.shippingAddress.addressLine2 && (
                        <p className="text-[10px] font-bold text-gray-500">
                          {selectedOrder.shippingAddress.addressLine2}
                        </p>
                      )}

                      <p className="text-[10px] font-bold text-gray-500">
                        {selectedOrder.shippingAddress.city},{' '}
                        {selectedOrder.shippingAddress.state} -{' '}
                        {selectedOrder.shippingAddress.postalCode}
                      </p>

                      <p className="text-[10px] font-bold text-gray-500">
                        {selectedOrder.shippingAddress.country}
                      </p>

                      <p className="text-[10px] font-bold text-gray-500 mt-1">
                        Phone: {selectedOrder.shippingAddress.phone}
                      </p>
                    </div>
                  )}

                </div>

                {selectedOrder.trackingNumber && (
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-blue-500">
                      Tracking Number
                    </p>
                    <p className="text-xs font-black mt-2">
                      {selectedOrder.trackingNumber}
                    </p>
                  </div>
                )}

                {selectedOrder.courierName && (
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                      Courier
                    </p>
                    <p className="text-xs font-black uppercase mt-2">
                      {selectedOrder.courierName}
                    </p>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-6 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Grand Total
                  </span>

                  <span className="text-2xl font-black">
                    ₹{Number(selectedOrder.totalAmount || 0).toFixed(2)}
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

export default ClientOrders;
