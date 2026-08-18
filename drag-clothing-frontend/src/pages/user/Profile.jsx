import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  MapPin,
  LogOut,
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  Shield,
  Phone,
  Save,
  X,
  Loader2,
  AlertCircle,
  Camera,
  User,
  Mail,
  CalendarDays,
  CreditCard,
  ShoppingBag,
  MapPinned,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { addressService } from '../../api/services';
import api from '../../api/axios';

/* =========================================================
   ANIMATION CONFIG
========================================================= */

const transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

const fadeIn = {
  hidden: {
    opacity: 0,
    x: 20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2,
    },
  },
};

/* =========================================================
   HELPERS
========================================================= */

const formatCurrency = (amount) => {
  const value = Number(amount || 0);

  return `₹${value.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (date) => {
  if (!date) return 'Unknown Date';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Unknown Date';
  }

  return parsedDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getStatusColor = (status) => {
  const s = String(status || '').toUpperCase();

  if (s === 'DELIVERED' || s === 'COMPLETED') {
    return 'bg-green-100 text-green-800';
  }

  if (
    s === 'CANCELLED' ||
    s === 'CANCELED' ||
    s === 'FAILED' ||
    s === 'REJECTED'
  ) {
    return 'bg-red-100 text-red-800';
  }

  if (
    s === 'PROCESSING' ||
    s === 'IN_TRANSIT' ||
    s === 'SHIPPED' ||
    s === 'OUT_FOR_DELIVERY'
  ) {
    return 'bg-blue-100 text-blue-800';
  }

  return 'bg-yellow-100 text-yellow-800';
};

const getStatusLabel = (status) => {
  if (!status) return 'Pending';

  return String(status)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getInitial = (name) => {
  if (!name) return 'U';

  return String(name).trim().charAt(0).toUpperCase();
};

/* =========================================================
   REUSABLE INPUT
========================================================= */

const InputField = ({
  label,
  value,
  onChange,
  type = 'text',
  isEditing = false,
  disabled = false,
  icon: Icon,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        {label}
      </label>

      <div className="relative">
        <input
          type={type}
          value={value || ''}
          onChange={onChange}
          disabled={!isEditing || disabled}
          className={`w-full rounded-xl px-4 py-3 text-sm font-medium transition-all outline-none ${isEditing && !disabled
            ? 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-black focus:bg-white'
            : 'bg-transparent border border-transparent text-gray-600 cursor-default p-0'
            }`}
        />

        {Icon && isEditing && (
          <Icon
            size={14}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        )}
      </div>
    </div>
  );
};

/* =========================================================
   1. PROFILE TAB
========================================================= */

const ProfileTab = ({ userData, refreshProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState('');

  const getInitialFormData = (data) => {
    const fullName = data?.name || '';

    const splitName = fullName.trim().split(/\s+/);

    const firstName = splitName[0] || '';
    const lastName = splitName.slice(1).join(' ') || '';

    return {
      firstName,
      lastName,
      email: data?.email || '',
      phone: data?.phone || '',
    };
  };

  const [formData, setFormData] = useState(
    getInitialFormData(userData)
  );

  useEffect(() => {
    if (userData && !isEditing) {
      setFormData(getInitialFormData(userData));
    }
  }, [userData, isEditing]);

  const handleSave = async () => {
    if (!userData?.id) {
      setSaveError('User ID is missing.');
      return;
    }

    setLoading(true);
    setSaveError('');

    try {
      const name = `${formData.firstName} ${formData.lastName}`.trim();

      if (!name) {
        setSaveError('Name is required.');
        setLoading(false);
        return;
      }

      await api.put(`/customers/${userData.id}`, {
        name,
        phone: formData.phone,
      });

      setIsEditing(false);

      if (refreshProfile) {
        await refreshProfile();
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Failed to update profile';

      setSaveError(
        typeof msg === 'string'
          ? msg
          : JSON.stringify(msg)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(getInitialFormData(userData));
    setSaveError('');
    setIsEditing(false);
  };

  return (
    <div className="max-w-3xl">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Personal Information
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Manage your account details.
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={() => {
              setSaveError('');
              setIsEditing(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-bold uppercase tracking-widest rounded-lg transition-all"
          >
            <Edit2 size={14} />
            Edit
          </button>
        )}
      </div>

      {/* FORM */}
      <div className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <InputField
            label="First Name"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({
                ...formData,
                firstName: e.target.value,
              })
            }
            isEditing={isEditing}
          />

          <InputField
            label="Last Name"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({
                ...formData,
                lastName: e.target.value,
              })
            }
            isEditing={isEditing}
          />

          <InputField
            label="Email Address"
            value={formData.email}
            isEditing={false}
            disabled
            icon={Shield}
          />

          <InputField
            label="Phone Number"
            value={formData.phone}
            onChange={(e) =>
              setFormData({
                ...formData,
                phone: e.target.value,
              })
            }
            isEditing={isEditing}
            icon={Phone}
          />
        </div>

        {saveError && (
          <div className="flex items-center gap-2 text-red-500 text-xs font-bold">
            <AlertCircle size={14} />
            {saveError}
          </div>
        )}

        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: 10,
              }}
              className="flex gap-4 pt-4 border-t border-gray-100"
            >
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={16} />
                )}

                Save Changes
              </button>

              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* =========================================================
   ADDRESS INPUT
========================================================= */

const AddressFormInput = ({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
}) => {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        {label}{' '}
        {required && (
          <span className="text-red-500">*</span>
        )}
      </label>

      <input
        type={type}
        value={value || ''}
        onChange={onChange}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-black focus:ring-0 outline-none transition-all"
      />
    </div>
  );
};

/* =========================================================
   2. ADDRESS TAB
========================================================= */

const AddressTab = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [editingAddressId, setEditingAddressId] = useState(null);

  const initialFormState = {
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  };

  const [formData, setFormData] = useState(
    initialFormState
  );

  const fetchAddresses = async () => {
    setFetchLoading(true);
    setErrorMsg('');

    try {
      const res = await addressService.getAddresses();

      const data =
        res?.data?.data?.data ||
        res?.data?.data ||
        res?.data ||
        [];

      setAddresses(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        'Failed to fetch addresses:',
        err
      );

      setAddresses([]);

      const msg =
        err?.response?.data?.message ||
        'Failed to load addresses';

      setErrorMsg(
        typeof msg === 'string'
          ? msg
          : JSON.stringify(msg)
      );
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddNew = () => {
    setFormData(initialFormState);
    setEditingAddressId(null);
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const handleSaveAddress = async () => {
    setErrorMsg('');

    const requiredFields = [
      'fullName',
      'phone',
      'addressLine1',
      'city',
      'state',
      'postalCode',
      'country',
    ];

    const hasMissingField = requiredFields.some(
      (field) =>
        !String(formData[field] || '').trim()
    );

    if (hasMissingField) {
      setErrorMsg(
        'Please fill in all required fields.'
      );
      return;
    }

    setLoading(true);

    try {
      const addressData = {
        ...formData,
        phone: String(formData.phone).trim(),
        postalCode: String(formData.postalCode).trim(),
      };

      if (editingAddressId) {
        await addressService.updateAddress(
          editingAddressId,
          addressData
        );
      } else {
        await addressService.addAddress(addressData);
      }

      setIsFormOpen(false);
      setFormData(initialFormState);
      setEditingAddressId(null);

      await fetchAddresses();
    } catch (err) {
      console.error(
        'Failed to save address:',
        err
      );

      const msg =
        err?.response?.data?.message ||
        'Failed to save address';

      setErrorMsg(
        typeof msg === 'string'
          ? msg
          : JSON.stringify(msg)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;

    const confirmed = window.confirm(
      'Delete this address?'
    );

    if (!confirmed) return;

    try {
      await addressService.deleteAddress(id);

      await fetchAddresses();
    } catch (err) {
      console.error(
        'Failed to delete address:',
        err
      );

      const msg =
        err?.response?.data?.message ||
        'Failed to delete address';

      setErrorMsg(
        typeof msg === 'string'
          ? msg
          : JSON.stringify(msg)
      );
    }
  };

  const handleEdit = (address) => {
    setFormData({
      fullName: address.fullName || address.name || '',
      phone: address.phone || '',
      addressLine1: address.addressLine1 || '',
      addressLine2: address.addressLine2 || '',
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || '',
      country: address.country || 'India',
    });

    setEditingAddressId(address.id);
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const handleCancelAddress = () => {
    setFormData(initialFormState);
    setEditingAddressId(null);
    setErrorMsg('');
    setIsFormOpen(false);
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            Address Book
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Manage shipping locations.
          </p>
        </div>

        {!isFormOpen && (
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-black/20"
          >
            <Plus size={14} />
            Add New
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* =================================================
            FORM
        ================================================= */}
        {isFormOpen ? (
          <motion.div
            key="form"
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -20,
            }}
          >
            <div className="bg-white p-1 rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  {editingAddressId ? 'Edit Address' : 'New Address'}
                </h4>

                <button
                  onClick={handleCancelAddress}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  type="button"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <AddressFormInput
                    required
                    label="Full Name"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fullName: e.target.value,
                      })
                    }
                  />

                  <AddressFormInput
                    required
                    label="Phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: e.target.value,
                      })
                    }
                    type="tel"
                  />
                </div>

                <AddressFormInput
                  required
                  label="Address Line 1"
                  value={formData.addressLine1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      addressLine1: e.target.value,
                    })
                  }
                />

                <AddressFormInput
                  label="Address Line 2 (Optional)"
                  value={formData.addressLine2}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      addressLine2: e.target.value,
                    })
                  }
                />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <AddressFormInput
                    required
                    label="City"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        city: e.target.value,
                      })
                    }
                  />

                  <AddressFormInput
                    required
                    label="State"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        state: e.target.value,
                      })
                    }
                  />

                  <AddressFormInput
                    required
                    label="Postal Code"
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        postalCode: e.target.value,
                      })
                    }
                    type="text"
                  />

                  <AddressFormInput
                    required
                    label="Country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        country: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="mt-4 flex items-start gap-2 text-red-500 text-xs font-bold">
                  <AlertCircle
                    size={14}
                    className="mt-0.5 shrink-0"
                  />

                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleSaveAddress}
                  disabled={loading}
                  className="px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Save size={16} />
                  )}

                  Save
                </button>

                <button
                  onClick={handleCancelAddress}
                  disabled={loading}
                  className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        ) : fetchLoading ? (
          /* =================================================
             LOADING
          ================================================= */
          <div
            key="loader"
            className="flex justify-center py-20"
          >
            <Loader2 className="animate-spin text-gray-300" />
          </div>
        ) : addresses.length === 0 ? (
          /* =================================================
             EMPTY
          ================================================= */
          <div
            key="empty"
            className="py-16 text-center"
          >
            <MapPin
              size={32}
              className="mx-auto text-gray-200 mb-4"
            />

            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              No addresses yet
            </p>

            <p className="text-xs text-gray-400 mt-2">
              Add your first shipping address to get started.
            </p>

            {errorMsg && (
              <p className="text-xs text-red-500 mt-4">
                {errorMsg}
              </p>
            )}
          </div>
        ) : (
          /* =================================================
             ADDRESS LIST
          ================================================= */
          <div
            key="list"
            className="grid md:grid-cols-2 gap-6"
          >
            {addresses.map((addr) => (
              <motion.div
                layout
                key={addr.id}
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                className="p-6 rounded-2xl border transition-all relative group bg-white border-gray-200 hover:border-black/20 hover:shadow-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="font-bold text-gray-900">
                      {addr.fullName ||
                        addr.name ||
                        'Address'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(addr)}
                      className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors"
                      title="Edit address"
                      type="button"
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete address"
                      type="button"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-500 space-y-1">
                  {addr.addressLine1 && (
                    <p>{addr.addressLine1}</p>
                  )}

                  {addr.addressLine2 && (
                    <p>{addr.addressLine2}</p>
                  )}

                  {(addr.city ||
                    addr.state ||
                    addr.postalCode) && (
                      <p>
                        {addr.city}
                        {addr.city && addr.state
                          ? ', '
                          : ''}
                        {addr.state}
                        {(addr.city || addr.state) &&
                          addr.postalCode
                          ? ' - '
                          : ''}
                        {addr.postalCode}
                      </p>
                    )}

                  {addr.country && (
                    <p>{addr.country}</p>
                  )}

                  {addr.phone && (
                    <p className="font-medium text-gray-900 pt-2 flex items-center gap-2">
                      <Phone size={12} />
                      {addr.phone}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* =========================================================
   ORDER DETAIL ROW
========================================================= */

const DetailRow = ({
  label,
  value,
  icon: Icon,
}) => {
  return (
    <div className="flex items-start gap-3">
      {Icon && (
        <div className="mt-0.5 text-gray-400">
          <Icon size={15} />
        </div>
      )}

      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
          {label}
        </p>

        <p className="text-sm font-medium text-gray-900 mt-1 break-words">
          {value || 'Not available'}
        </p>
      </div>
    </div>
  );
};

/* =========================================================
   ORDER DETAIL MODAL
========================================================= */

const OrderDetailModal = ({
  order,
  loading,
  onClose,
}) => {
  if (!order && !loading) {
    return null;
  }

  const shippingAddress =
    order?.shippingAddress ||
    order?.address ||
    null;

  const items = Array.isArray(order?.items)
    ? order.items
    : [];

  const totalAmount =
    order?.totalAmount ??
    order?.total ??
    items.reduce(
      (sum, item) =>
        sum +
        Number(
          item?.total ??
          Number(item?.price || 0) *
          Number(item?.quantity || 0)
        ),
      0
    );

  const orderNumber =
    order?.id
      ?.toString()
      .slice(0, 8)
      .toUpperCase() || 'ORDER';

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        exit={{
          opacity: 0,
        }}
      >
        {/* BACKDROP */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={loading ? undefined : onClose}
        />

        {/* MODAL */}
        <motion.div
          initial={{
            opacity: 0,
            y: 30,
            scale: 0.97,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: 30,
            scale: 0.97,
          }}
          transition={transition}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-[2rem] shadow-2xl"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-gray-100">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Order Details
              </p>

              <h3 className="text-xl md:text-2xl font-black text-gray-900 mt-1">
                #{orderNumber}
              </h3>
            </div>

            <button
              onClick={onClose}
              disabled={loading}
              className="p-2.5 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
              type="button"
            >
              <X size={20} />
            </button>
          </div>

          {/* CONTENT */}
          <div className="overflow-y-auto max-h-[calc(90vh-90px)]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2
                  size={36}
                  className="animate-spin text-gray-400"
                />

                <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mt-4">
                  Loading order...
                </p>
              </div>
            ) : (
              <div className="p-6 md:p-8 space-y-8">
                {/* TOP INFO */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                      Status
                    </p>

                    <span
                      className={`inline-flex mt-2 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${getStatusColor(
                        order?.status
                      )}`}
                    >
                      {getStatusLabel(
                        order?.status
                      )}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                      Order Date
                    </p>

                    <p className="text-sm font-bold text-gray-900 mt-2">
                      {formatDate(
                        order?.createdAt
                      )}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                      Items
                    </p>

                    <p className="text-sm font-bold text-gray-900 mt-2">
                      {items.length}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-black text-white border border-black">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                      Total
                    </p>

                    <p className="text-lg font-black mt-1">
                      {formatCurrency(
                        totalAmount
                      )}
                    </p>
                  </div>
                </div>

                {/* ORDER ITEMS */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <ShoppingBag
                      size={18}
                      className="text-gray-500"
                    />

                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-900">
                      Order Items
                    </h4>
                  </div>

                  {items.length === 0 ? (
                    <div className="py-10 text-center rounded-2xl border border-dashed border-gray-200">
                      <Package
                        size={28}
                        className="mx-auto text-gray-300 mb-3"
                      />

                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        No items found
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {items.map(
                        (item, index) => {
                          const variant =
                            item?.variant ||
                            null;

                          const productName =
                            item?.productName ??
                            item?.product?.name ??
                            null;

                          const quantity =
                            Number(
                              item?.quantity || 0
                            );

                          const price =
                            Number(
                              item?.price || 0
                            );

                          const itemTotal =
                            Number(
                              item?.total ??
                              price *
                              quantity
                            );

                          const imageUrl =
                            item?.product
                              ?.imageUrl ||
                            item?.imageUrl ||
                            null;

                          return (
                            <div
                              key={
                                item?.id ||
                                `${item?.productId}-${item?.variantId}-${index}`
                              }
                              className="flex gap-4 p-4 rounded-2xl border border-gray-100 bg-white"
                            >
                              {/* IMAGE */}
                              <div className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={
                                      productName
                                    }
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package
                                    size={25}
                                    className="text-gray-300"
                                  />
                                )}
                              </div>

                              {/* DETAILS */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                  <div>
                                    <h5 className="font-bold text-gray-900 text-sm">
                                      {
                                        productName
                                      }
                                    </h5>

                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {variant?.color && (
                                        <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-[10px] font-bold uppercase tracking-wide text-gray-600">
                                          Color:{' '}
                                          {
                                            variant.color
                                          }
                                        </span>
                                      )}

                                      {variant?.size && (
                                        <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-[10px] font-bold uppercase tracking-wide text-gray-600">
                                          Size:{' '}
                                          {
                                            variant.size
                                          }
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <p className="font-black text-gray-900">
                                    {formatCurrency(
                                      itemTotal
                                    )}
                                  </p>
                                </div>

                                <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
                                  <span>
                                    Qty:{' '}
                                    <strong className="text-gray-900">
                                      {quantity}
                                    </strong>
                                  </span>

                                  <span>
                                    Unit:{' '}
                                    <strong className="text-gray-900">
                                      {formatCurrency(
                                        price
                                      )}
                                    </strong>
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                </section>

                {/* SHIPPING ADDRESS + GRAND TOTAL */}
                <div className="grid md:grid-cols-2 gap-6 items-start">

                  {/* SHIPPING ADDRESS */}
                  <section className="rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center gap-2 mb-5">
                      <MapPinned
                        size={18}
                        className="text-gray-500"
                      />

                      <h4 className="text-sm font-black uppercase tracking-widest text-gray-900">
                        Shipping Address
                      </h4>
                    </div>

                    {shippingAddress ? (
                      <div className="space-y-3 text-sm text-gray-600">
                        <p className="font-bold text-gray-900">
                          {shippingAddress.fullName ||
                            shippingAddress.name ||
                            'Customer'}
                        </p>

                        {shippingAddress.phone && (
                          <p className="flex items-center gap-2">
                            <Phone size={13} />
                            {shippingAddress.phone}
                          </p>
                        )}

                        {shippingAddress.addressLine1 && (
                          <p>{shippingAddress.addressLine1}</p>
                        )}

                        {shippingAddress.addressLine2 && (
                          <p>{shippingAddress.addressLine2}</p>
                        )}

                        <p>
                          {shippingAddress.city}
                          {shippingAddress.city &&
                            shippingAddress.state
                            ? ', '
                            : ''}
                          {shippingAddress.state}
                        </p>

                        <p>
                          {shippingAddress.postalCode}
                        </p>

                        <p>
                          {shippingAddress.country}
                        </p>
                      </div>
                    ) : (
                      <div className="py-6 text-center">
                        <MapPin
                          size={25}
                          className="mx-auto text-gray-300 mb-3"
                        />

                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                          No shipping address
                        </p>
                      </div>
                    )}
                  </section>

                  {/* GRAND TOTAL */}
                  <div className="border-t border-gray-100 pt-6 md:pt-0 md:border-t-0">
                    <div className="space-y-3">

                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Subtotal</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(totalAmount)}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Shipping</span>
                        <span className="font-medium text-gray-900">
                          Free
                        </span>
                      </div>

                      <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                        <span className="text-sm font-black uppercase tracking-widest text-gray-900">
                          Grand Total
                        </span>

                        <span className="text-xl font-black text-gray-900">
                          {formatCurrency(totalAmount)}
                        </span>
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* =========================================================
   3. ORDERS TAB
========================================================= */

const OrdersTab = () => {
  const [loading, setLoading] =
    useState(true);

  const [orders, setOrders] =
    useState([]);

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [detailLoading, setDetailLoading] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState('');

  /* -------------------------------------------------------
     FETCH ORDERS
  ------------------------------------------------------- */

  useEffect(() => {
    let mounted = true;

    const fetchOrders = async () => {
      setLoading(true);
      setErrorMsg('');

      try {
        const res = await api.get('/orders');

        /*
          Supported response shapes:

          1.
          {
            data: {
              total: 2,
              data: [...]
            }
          }

          2.
          {
            data: [...]
          }

          3.
          [...]
        */

        const responseData =
          res?.data?.data;

        let fetchedOrders = [];

        if (
          responseData?.data &&
          Array.isArray(
            responseData.data
          )
        ) {
          fetchedOrders =
            responseData.data;
        } else if (
          Array.isArray(responseData)
        ) {
          fetchedOrders =
            responseData;
        } else if (
          Array.isArray(res?.data)
        ) {
          fetchedOrders =
            res.data;
        }

        if (mounted) {
          setOrders(fetchedOrders);
        }
      } catch (err) {
        console.error(
          'Failed to fetch orders:',
          err
        );

        if (mounted) {
          setOrders([]);

          const msg =
            err?.response?.data?.message ||
            'Failed to load orders';

          setErrorMsg(
            typeof msg === 'string'
              ? msg
              : JSON.stringify(msg)
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      mounted = false;
    };
  }, []);

  /* -------------------------------------------------------
     OPEN ORDER DETAILS
  ------------------------------------------------------- */

  const openOrderDetails = async (
    orderId
  ) => {
    if (!orderId) return;

    setSelectedOrder(null);
    setDetailLoading(true);
    setErrorMsg('');

    try {
      const res = await api.get(
        `/orders/${orderId}`
      );

      /*
        Expected:

        {
          data: {
            id,
            customer,
            shippingAddress,
            items
          }
        }
      */

      const responseData =
        res?.data?.data;

      const data =
        responseData?.data &&
          !Array.isArray(responseData.data)
          ? responseData.data
          : responseData;

      setSelectedOrder(data);
    } catch (err) {
      console.error(
        'Failed to load order details:',
        err
      );

      const msg =
        err?.response?.data?.message ||
        'Failed to load order details';

      setErrorMsg(
        typeof msg === 'string'
          ? msg
          : JSON.stringify(msg)
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const closeOrderDetails = () => {
    if (detailLoading) return;

    setSelectedOrder(null);
  };

  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */

  if (loading) {
    return (
      <div>
        <div className="mb-8 border-b border-gray-100 pb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            Order History
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Track your recent orders.
          </p>
        </div>

        <div className="flex justify-center py-20">
          <Loader2
            className="animate-spin text-gray-300"
            size={32}
          />
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */

  return (
    <div>
      {/* HEADER */}
      <div className="mb-8 border-b border-gray-100 pb-6">
        <h3 className="text-2xl font-bold text-gray-900">
          Order History
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          Track your recent orders.
        </p>
      </div>

      {/* ERROR */}
      {errorMsg && (
        <div className="mb-6 flex items-start gap-2 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold">
          <AlertCircle
            size={15}
            className="mt-0.5 shrink-0"
          />

          <span>{errorMsg}</span>
        </div>
      )}

      {/* EMPTY */}
      {orders.length === 0 ? (
        <div className="py-16 text-center">
          <Package
            size={32}
            className="mx-auto text-gray-200 mb-4"
          />

          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            No orders yet
          </p>

          <p className="text-xs text-gray-400 mt-2">
            Your order history will appear here.
          </p>
        </div>
      ) : (
        /* ORDER LIST */
        <div className="space-y-4">
          {orders.map((order) => {
            const orderId =
              order?.id || '';

            const orderNumber =
              orderId
                ?.toString()
                .slice(0, 8)
                .toUpperCase() ||
              'ORDER';

            const firstItem =
              Array.isArray(order?.items) &&
                order.items.length > 0
                ? order.items[0]
                : null;

            const productImage =
              firstItem?.product
                ?.imageUrl ||
              firstItem?.imageUrl ||
              null;

            const total =
              order?.totalAmount ??
              order?.total ??
              0;

            return (
              <motion.button
                key={orderId}
                type="button"
                whileHover={{
                  y: -1,
                }}
                onClick={() =>
                  openOrderDetails(
                    orderId
                  )
                }
                className="w-full text-left flex items-center gap-4 md:gap-5 p-4 rounded-2xl border border-gray-100 hover:border-gray-300 transition-all cursor-pointer group bg-white shadow-sm hover:shadow-md"
              >
                {/* PRODUCT IMAGE */}
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-gray-100">
                  {productImage ? (
                    <img
                      src={productImage}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                      alt="Product"
                    />
                  ) : (
                    <Package
                      size={22}
                      className="text-gray-400 group-hover:text-black transition-colors"
                    />
                  )}
                </div>

                {/* ORDER DETAILS */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-900">
                      Order #
                      {orderNumber}
                    </span>

                    <span
                      className={`w-fit text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${getStatusColor(
                        order?.status
                      )}`}
                    >
                      {getStatusLabel(
                        order?.status
                      )}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs text-gray-500 mt-2">
                    <span className="flex items-center gap-1">
                      <CalendarDays
                        size={12}
                      />

                      {formatDate(
                        order?.createdAt
                      )}
                    </span>

                    <span className="font-black text-gray-900 text-sm">
                      {formatCurrency(
                        total
                      )}
                    </span>
                  </div>
                </div>

                <ChevronRight
                  size={18}
                  className="text-gray-300 group-hover:text-[#9B4819] transition-colors shrink-0"
                />
              </motion.button>
            );
          })}
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {(selectedOrder ||
        detailLoading) && (
          <OrderDetailModal
            order={selectedOrder}
            loading={detailLoading}
            onClose={closeOrderDetails}
          />
        )}
    </div>
  );
};

/* =========================================================
   MAIN PROFILE PAGE
========================================================= */

const Profile = () => {
  const {
    user,
    logout,
  } = useAuth();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [
    activeTab,
    setActiveTab,
  ] = useState('profile');

  const [
    profileData,
    setProfileData,
  ] = useState(null);

  const [
    loadingProfile,
    setLoadingProfile,
  ] = useState(true);

  /* -------------------------------------------------------
     ACTIVE TAB FROM ROUTER STATE
  ------------------------------------------------------- */

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(
        location.state.activeTab
      );
    }
  }, [location.state]);

  /* -------------------------------------------------------
     FETCH FRESH PROFILE
  ------------------------------------------------------- */

  const fetchUserProfile = async () => {
    try {
      const res =
        await api.get('/auth/me');

      /*
        Handles:

        res.data
        OR
        res.data.data
      */

      const data =
        res?.data?.data ||
        res?.data;

      setProfileData(data);
    } catch (err) {
      console.error(
        'Failed to load profile:',
        err
      );

      setProfileData(user);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setLoadingProfile(false);
    }
  }, [user]);

  /* -------------------------------------------------------
     LOGOUT
  ------------------------------------------------------- */

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */

  if (
    !user ||
    loadingProfile
  ) {
    return (
      <div className="min-h-screen bg-[#F2F2F2] flex items-center justify-center">
        <Loader2
          className="animate-spin"
          size={28}
        />
      </div>
    );
  }

  /* -------------------------------------------------------
     DISPLAY USER
  ------------------------------------------------------- */

  const displayUser =
    profileData || user;

  /* -------------------------------------------------------
     TABS
  ------------------------------------------------------- */

  const tabs = [
    {
      id: 'profile',
      label: 'My Profile',
      icon: User,
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: Package,
    },
    {
      id: 'addresses',
      label: 'Addresses',
      icon: MapPin,
    },
  ];

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-[#F2F2F2] pt-24 pb-20 px-4 md:px-8 font-sans flex justify-center items-start md:items-center">
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.35,
        }}
        className="w-full max-w-5xl bg-white rounded-[2rem] shadow-xl border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]"
      >
        {/* =================================================
            LEFT SIDEBAR
        ================================================= */}

        <aside className="w-full md:w-72 bg-gray-50/50 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col relative">
          {/* BACK BUTTON */}

          <button
            onClick={() =>
              navigate(-1)
            }
            className="absolute top-6 left-6 p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-100 transition-all z-10 text-gray-500 hover:text-black shadow-sm flex items-center justify-center"
            title="Go Back"
            type="button"
          >
            <ArrowLeft size={16} />
          </button>

          {/* USER INFO */}

          <div className="p-8 pt-20 border-b border-gray-100 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-white border-2 border-gray-200 p-1 mb-4 shadow-sm relative group cursor-pointer">
              <div className="w-full h-full rounded-full bg-gray-900 text-white flex items-center justify-center text-3xl font-bold uppercase overflow-hidden">
                {getInitial(
                  displayUser?.name
                )}
              </div>

              <div className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full border border-gray-200 shadow-sm text-gray-600 group-hover:text-black transition-colors">
                <Camera size={14} />
              </div>
            </div>

            <h2 className="text-lg font-bold text-gray-900">
              {displayUser?.name ||
                'User'}
            </h2>

            <p className="text-xs text-gray-500 font-medium mt-1 break-all">
              {displayUser?.email ||
                'No email'}
            </p>
          </div>

          {/* NAVIGATION */}

          <nav className="flex-1 p-4 space-y-1">
            {tabs.map((tab) => {
              const TabIcon =
                tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(
                      tab.id
                    )
                  }
                  type="button"
                  className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab ===
                    tab.id
                    ? 'bg-white text-black shadow-md shadow-gray-100 border border-gray-100'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'
                    }`}
                >
                  <TabIcon size={16} />

                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* LOGOUT */}

          <div className="p-6 border-t border-gray-100">
            <button
              onClick={handleLogout}
              type="button"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />

              Log Out
            </button>
          </div>
        </aside>

        {/* =================================================
            RIGHT CONTENT
        ================================================= */}

        <main className="flex-1 p-6 md:p-12 overflow-y-auto min-w-0">
          <AnimatePresence
            mode="wait"
          >
            <motion.div
              key={activeTab}
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="h-full"
            >
              {/* PROFILE */}

              {activeTab ===
                'profile' && (
                  <ProfileTab
                    userData={
                      displayUser
                    }
                    refreshProfile={
                      fetchUserProfile
                    }
                  />
                )}

              {/* ORDERS */}

              {activeTab ===
                'orders' && (
                  <OrdersTab />
                )}

              {/* ADDRESSES */}

              {activeTab ===
                'addresses' && (
                  <AddressTab />
                )}
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>
    </div>
  );
};

export default Profile;