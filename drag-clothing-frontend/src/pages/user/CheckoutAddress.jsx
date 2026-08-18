import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Loader2, Plus, Check } from 'lucide-react';
import { addressService } from '../../api/services';

const CheckoutAddress = () => {
  const navigate = useNavigate();
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch saved addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await addressService.getAddresses();
        const data = res.data?.data?.data || res.data?.data || res.data || [];
        const addrs = Array.isArray(data) ? data : [];
        setSavedAddresses(addrs);
        if (addrs.length > 0) {
          setSelectedAddressId(addrs[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch addresses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedAddressId) {
      alert('Please select an address first');
      return;
    }
    // Use selected existing address
    const selected = savedAddresses.find(a => a.id === selectedAddressId);
    navigate('/checkout/payment', { state: { addressId: selectedAddressId, addressData: selected } });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-6 bg-[#FAFAFA] flex justify-center items-center">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-6 bg-[#FAFAFA] flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white p-8 border border-[#E5E5E5] shadow-sm"
      >
        {/* Progress Header */}
        <div className="flex items-center gap-4 mb-10 text-[10px] font-bold uppercase tracking-widest">
          <span className="text-[#9B4819]">01. Address</span>
          <span className="w-8 h-px bg-[#E5E5E5]"></span>
          <span className="text-gray-300">02. Payment</span>
        </div>

        <h1 className="text-3xl font-black uppercase tracking-tighter text-[#1A1A1A] mb-8">Shipping Details</h1>

        {/* Saved Addresses Section */}
        <div className="space-y-4 mb-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Saved Addresses</p>
          
          {savedAddresses.length > 0 ? (
            savedAddresses.map((addr) => (
              <div
                key={addr.id}
                onClick={() => setSelectedAddressId(addr.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedAddressId === addr.id
                    ? 'border-[#1A1A1A] bg-gray-50'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold">{addr.fullName || addr.full_name || addr.name || 'Address'}</p>
                    <p className="text-xs text-gray-500 mt-1">{addr.addressLine1 || addr.street || addr.address}</p>
                    <p className="text-xs text-gray-500">{addr.city}{addr.state ? `, ${addr.state}` : ''} - {addr.postalCode || addr.zip}</p>
                    {addr.phone && <p className="text-xs text-gray-600 mt-1">{addr.phone}</p>}
                  </div>
                  {selectedAddressId === addr.id && (
                    <div className="w-5 h-5 bg-[#1A1A1A] rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">No addresses found. Please add a new address.</p>
          )}

          {/* Add New Address Button (Redirects to Profile -> Addresses Tab) */}
          <button
  onClick={() => navigate('/Profile', { state: { activeTab: 'addresses' } })}
  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#9B4819] hover:text-black transition-colors pt-2"
>
  <Plus size={14} /> Add New Address
</button>
        </div>

        {/* Continue with selected saved address */}
        {savedAddresses.length > 0 && (
          <div className="pt-6 border-t border-[#EEE]">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleSubmit}
              className="w-full bg-[#1A1A1A] hover:bg-[#9B4819] text-white font-bold py-4 text-xs uppercase tracking-widest transition-all"
            >
              Continue to Payment
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CheckoutAddress;
