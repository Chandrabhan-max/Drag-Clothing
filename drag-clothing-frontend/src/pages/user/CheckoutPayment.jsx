import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from "../../context/CartContext";
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet,
    Banknote,
    ShieldCheck,
    Lock,
    ArrowRight,
    Loader2,
    Check,
    ShoppingBag
} from 'lucide-react';
import Confetti from 'react-confetti';
import { orderService, paymentService } from '../../api/services';


// =========================================================
// SUCCESS POPUP
// =========================================================

const SuccessModal = ({ onClose, orderId }) => {
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    useEffect(() => {
        const handleResize = () =>
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });

        window.addEventListener('resize', handleResize);

        return () =>
            window.removeEventListener(
                'resize',
                handleResize
            );
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
        >

            <div className="absolute inset-0 pointer-events-none">

                <Confetti
                    width={dimensions.width}
                    height={dimensions.height}
                    numberOfPieces={300}
                    gravity={0.2}
                    recycle={false}
                />

            </div>


            <motion.div
                initial={{
                    scale: 0.5,
                    y: 100,
                    opacity: 0,
                    rotateX: 45
                }}
                animate={{
                    scale: 1,
                    y: 0,
                    opacity: 1,
                    rotateX: 0
                }}
                exit={{
                    scale: 0.9,
                    opacity: 0
                }}
                transition={{
                    type: "spring",
                    damping: 20,
                    stiffness: 300
                }}
                className="bg-white w-full max-w-md relative overflow-hidden shadow-2xl rounded-sm"
            >

                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#1A1A1A] via-[#9B4819] to-[#1A1A1A]" />


                <div className="p-10 text-center relative z-10">

                    <div className="w-24 h-24 bg-[#25D366]/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">

                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                delay: 0.2,
                                type: "spring"
                            }}
                        >

                            <div className="absolute inset-0 bg-[#25D366]/20 rounded-full animate-ping" />

                            <Check
                                size={48}
                                className="text-[#25D366] relative z-10"
                                strokeWidth={4}
                            />

                        </motion.div>

                    </div>


                    <h2 className="text-4xl font-black uppercase tracking-tighter text-[#1A1A1A] mb-2">
                        Success!
                    </h2>


                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8 leading-relaxed">

                        Your payment was approved.
                        <br />

                        Order ID:

                        <span className="text-[#9B4819]">
                            #{orderId ? orderId.slice(0, 8) : 'DRG-0000'}
                        </span>

                    </p>


                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClose}
                        className="w-full bg-[#1A1A1A] hover:bg-[#9B4819] text-white font-bold py-4 text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group shadow-lg"
                    >

                        <span>
                            Continue Shopping
                        </span>

                        <ShoppingBag
                            size={16}
                            className="group-hover:-translate-y-1 transition-transform"
                        />

                    </motion.button>

                </div>


                <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

            </motion.div>

        </motion.div>
    );
};


// =========================================================
// RAZORPAY SCRIPT
// =========================================================

const loadRazorpayScript = () =>
    new Promise((resolve) => {

        if (window.Razorpay) {
            resolve(true);
            return;
        }


        const script =
            document.createElement('script');

        script.src =
            'https://checkout.razorpay.com/v1/checkout.js';

        script.async = true;

        script.onload = () =>
            resolve(true);

        script.onerror = () =>
            resolve(false);

        document.body.appendChild(script);

    });


// =========================================================
// CHECKOUT PAYMENT
// =========================================================

const CheckoutPayment = () => {

    const { state } = useLocation();

    const navigate = useNavigate();

    const {
        cart,
        cartTotal,
        clearCart
    } = useCart();


    // =====================================================
    // PAYMENT METHOD
    // =====================================================

    const [selectedMethod, setSelectedMethod] =
        useState('upi');


    const [isProcessing, setIsProcessing] =
        useState(false);


    const [orderSuccess, setOrderSuccess] =
        useState(false);


    const [orderId, setOrderId] =
        useState(null);


    const [orderError, setOrderError] =
        useState('');


    const [razorpayReady, setRazorpayReady] =
        useState(false);


    // =====================================================
    // ADDRESS CHECK
    // =====================================================

    useEffect(() => {

        if (
            !state?.addressData &&
            !state?.addressId
        ) {
            navigate('/checkout/address');
        }

    }, [
        state,
        navigate
    ]);


    // =====================================================
    // LOAD RAZORPAY
    // =====================================================

    useEffect(() => {

        let isMounted = true;

        loadRazorpayScript()
            .then((loaded) => {

                if (isMounted) {
                    setRazorpayReady(loaded);
                }

            });


        return () => {
            isMounted = false;
        };

    }, []);


    // =====================================================
    // PLACE ORDER
    // =====================================================

    const handlePlaceOrder = async () => {

        setIsProcessing(true);

        setOrderError('');


        let newOrderId = null;


        try {

            // =================================================
            // 1. CREATE APP ORDER
            // =================================================

            const orderRes =
                await orderService.createOrder();


            const orderData =
                orderRes.data?.data ||
                orderRes.data ||
                {};


            newOrderId =
                orderData?.orderId ||
                orderData?.id;


            if (!newOrderId) {

                throw new Error(
                    'Order was created but order ID was not returned.'
                );

            }


            setOrderId(newOrderId);


            // =================================================
            // 2. COD
            // =================================================

            if (
                selectedMethod === 'cod'
            ) {

                setOrderSuccess(true);

                return;
            }


            // =================================================
            // 3. CHECK RAZORPAY SDK
            // =================================================

            if (
                !razorpayReady ||
                !window.Razorpay
            ) {

                throw new Error(
                    'Razorpay SDK is not loaded. Please refresh the page.'
                );

            }


            // =================================================
            // 4. CREATE RAZORPAY ORDER
            // =================================================

            const gatewayRes =
                await paymentService.createGatewayOrder(
                    newOrderId
                );


            const gatewayOrder =
                gatewayRes.data?.data ||
                gatewayRes.data ||
                {};


            if (!gatewayOrder?.id) {

                throw new Error(
                    'Razorpay order could not be created.'
                );

            }


            // =================================================
            // 5. RAZORPAY PUBLIC KEY
            // =================================================

            const razorpayKey =
                import.meta.env.VITE_RAZORPAY_KEY_ID;


            if (!razorpayKey) {

                throw new Error(
                    'Razorpay key is missing from frontend environment.'
                );

            }


            // =================================================
            // 6. OPEN RAZORPAY
            // =================================================

            await new Promise(
                (resolve, reject) => {

                    let settled = false;


                    // =============================================
                    // FAIL PAYMENT
                    // =============================================

                    const failPayment =
                        async (message) => {

                            if (settled) {
                                return;
                            }


                            settled = true;


                            try {

                                await orderService.cancelOrder(
                                    newOrderId
                                );

                            } catch (cancelError) {

                                console.error(
                                    'Failed to cancel failed-payment order:',
                                    cancelError?.response?.data ||
                                    cancelError
                                );

                            }


                            reject(
                                new Error(message)
                            );

                        };


                    // =============================================
                    // RAZORPAY INSTANCE
                    // =============================================

                    const rzp =
                        new window.Razorpay({

                            key:
                                razorpayKey,


                            amount:
                                gatewayOrder.amount,


                            currency:
                                gatewayOrder.currency ||
                                'INR',


                            order_id:
                                gatewayOrder.id,


                            name:
                                'Drag Clothing',


                            description:
                                'Order Payment',


                            // =====================================
                            // SUCCESS
                            // =====================================

                            handler:
                                async (
                                    response
                                ) => {

                                    try {

                                        await paymentService
                                            .verifyGatewayPayment({

                                                orderId:
                                                    response.razorpay_order_id,

                                                paymentId:
                                                    response.razorpay_payment_id,

                                                signature:
                                                    response.razorpay_signature,

                                                appOrderId:
                                                    newOrderId

                                            });


                                        if (settled) {
                                            return;
                                        }


                                        settled = true;


                                        resolve(true);


                                    } catch (
                                        verifyError
                                    ) {

                                        await failPayment(
                                            'Payment verification failed. The order has been cancelled.'
                                        );

                                    }

                                },


                            // =====================================
                            // PREFILL
                            // =====================================

                            prefill: {

                                name:
                                    `${state?.addressData?.firstName || ''} ${state?.addressData?.lastName || ''}`.trim(),

                                email:
                                    state?.addressData?.email ||
                                    '',

                                contact:
                                    state?.addressData?.phone ||
                                    ''

                            },


                            notes: {

                                app_order_id:
                                    newOrderId

                            },


                            theme: {

                                color:
                                    '#1A1A1A'

                            },


                            modal: {

                                ondismiss:
                                    async () => {

                                        await failPayment(
                                            'Payment cancelled.'
                                        );

                                    }

                            }

                        });


                    // =============================================
                    // PAYMENT FAILED
                    // =============================================

                    rzp.on(
                        'payment.failed',
                        async (
                            response
                        ) => {

                            const reason =
                                response?.error
                                    ?.description ||
                                'Payment failed.';


                            await failPayment(
                                reason
                            );

                        }
                    );


                    rzp.open();

                }
            );


            // =================================================
            // PAYMENT SUCCESS
            // =================================================

            setOrderSuccess(true);


        } catch (err) {

            console.error(
                '❌ Order/payment failed:',
                err?.response?.data ||
                err
            );


            const msg =
                err?.response?.data?.message ||
                err?.message ||
                'Failed to complete payment. Please try again.';


            setOrderError(
                typeof msg === 'string'
                    ? msg
                    : JSON.stringify(msg)
            );


        } finally {

            setIsProcessing(false);

        }

    };


    // =========================================================
    // SUCCESS CLOSE
    // =========================================================

    const handleCloseSuccess = () => {

        navigate('/');

    };


    // =========================================================
    // ANIMATION VARIANTS
    // =========================================================

    const containerVariants = {
        hidden: {
            opacity: 0
        },

        visible: {
            opacity: 1,

            transition: {
                staggerChildren: 0.1
            }
        }
    };


    const itemVariants = {
        hidden: {
            y: 20,
            opacity: 0
        },

        visible: {
            y: 0,
            opacity: 1
        }
    };


    // =========================================================
    // CART HELPERS
    // =========================================================

    const getItemName = (item) =>
        item.product?.name ||
        item.name ||
        'Product';


    const FALLBACK_IMAGE =
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format';


    const getItemImage = (item) => {

        const raw =
            item.product?.imageUrl ||
            item.product?.image ||
            item.imageUrl ||
            item.image ||
            item.product?.images?.[0] ||
            '';


        if (!raw) {
            return FALLBACK_IMAGE;
        }


        return raw.startsWith('/')
            ? `http://localhost:3000${raw}`
            : raw;

    };


    const getItemSize = (item) =>
        item.variant?.size ||
        item.size ||
        '-';


    const getItemPrice = (item) =>
        item.discountedPrice ??
        item.price ??
        item.variant?.price ??
        item.product?.price ??
        0;


    const getItemQty = (item) =>
        item.quantity || 1;


    // =========================================================
    // RETURN
    // =========================================================

    return (
        <>
            <AnimatePresence>

                {orderSuccess && (
                    <SuccessModal
                        onClose={handleCloseSuccess}
                        orderId={orderId}
                    />
                )}

            </AnimatePresence>


            <div className="min-h-screen pt-28 pb-12 px-6 bg-[#FAFAFA] flex justify-center text-[#1A1A1A]">

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12"
                >

                    {/* ================================================= */}
                    {/* LEFT COLUMN */}
                    {/* ================================================= */}

                    <div className="lg:col-span-7 space-y-8">


                        {/* PAGE HEADER */}

                        <motion.div variants={itemVariants}>

                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">
                                Secure Pay
                            </h1>


                            <div className="flex items-center gap-2 text-[#9B4819] font-bold text-xs uppercase tracking-widest">

                                <Lock size={12} />

                                <span>
                                    Encrypted Transaction
                                </span>

                            </div>

                        </motion.div>


                        {/* ================================================= */}
                        {/* PAYMENT METHODS */}
                        {/* ================================================= */}

                        <motion.div
                            variants={itemVariants}
                            className="flex gap-3 border-b border-gray-200 pb-2"
                        >

                            {[
                                {
                                    id: 'upi',
                                    label: 'Online Payment',
                                    icon: Wallet
                                },

                                {
                                    id: 'cod',
                                    label: 'Cash on Delivery',
                                    icon: Banknote
                                }

                            ].map((method) => (

                                <button
                                    key={method.id}
                                    onClick={() =>
                                        setSelectedMethod(
                                            method.id
                                        )
                                    }
                                    className={`relative pb-3 px-3 flex items-center gap-2 transition-colors ${
                                        selectedMethod === method.id
                                            ? 'text-[#1A1A1A]'
                                            : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                >

                                    <method.icon
                                        size={18}
                                    />


                                    <span className="text-xs font-bold uppercase tracking-wider">
                                        {method.label}
                                    </span>


                                    {selectedMethod === method.id && (

                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A1A1A]"
                                        />

                                    )}

                                </button>

                            ))}

                        </motion.div>


                        {/* ================================================= */}
                        {/* ERROR */}
                        {/* ================================================= */}

                        {orderError && (

                            <div className="bg-red-50 text-red-600 text-xs font-bold uppercase p-4 rounded-xl text-center border border-red-100">

                                {orderError}

                            </div>

                        )}


                        {/* ================================================= */}
                        {/* RAZORPAY LOADING */}
                        {/* ================================================= */}

                        {selectedMethod !== 'cod' &&
                            !razorpayReady && (

                                <div className="bg-yellow-50 text-yellow-700 text-xs font-bold uppercase p-4 rounded-xl text-center border border-yellow-200">

                                    Loading payment gateway...

                                </div>

                            )}


                        {/* ================================================= */}
                        {/* PAYMENT CONTENT */}
                        {/* ================================================= */}

                        <motion.div
                            variants={itemVariants}
                            className="bg-white border border-[#E5E5E5] p-6 min-h-[400px] relative overflow-hidden"
                        >

                            <AnimatePresence mode="wait">


                                {/* ================================================= */}
                                {/* ONLINE PAYMENT */}
                                {/* ================================================= */}

                                {selectedMethod === 'upi' && (

                                    <motion.div
                                        key="upi"

                                        initial={{
                                            opacity: 0,
                                            y: 24
                                        }}

                                        animate={{
                                            opacity: 1,
                                            y: 0
                                        }}

                                        exit={{
                                            opacity: 0,
                                            y: -12
                                        }}

                                        transition={{
                                            duration: 0.45,
                                            ease: [
                                                0.22,
                                                1,
                                                0.36,
                                                1
                                            ]
                                        }}

                                        className="min-h-[400px] flex items-center justify-center p-2 md:p-6"
                                    >

                                        <div className="w-full max-w-xl">


                                            {/* MAIN PAYMENT CARD */}

                                            <div className="relative overflow-hidden rounded-[2rem] border border-[#E5E5E5] bg-[#FAFAFA] p-7 md:p-9 shadow-sm">


                                                {/* DECORATIVE BACKGROUND */}

                                                <div className="absolute -top-24 -right-24 w-52 h-52 rounded-full bg-[#9B4819]/10 blur-3xl pointer-events-none" />

                                                <div className="absolute -bottom-28 -left-20 w-48 h-48 rounded-full bg-black/5 blur-3xl pointer-events-none" />


                                                <div className="relative">


                                                    {/* ICON + STATUS */}

                                                    <div className="flex items-center justify-between mb-8">


                                                        <div className="w-14 h-14 rounded-2xl bg-[#1A1A1A] text-white flex items-center justify-center shadow-lg">

                                                            <Wallet
                                                                size={25}
                                                                strokeWidth={1.8}
                                                            />

                                                        </div>


                                                        <div className="flex items-center gap-2 bg-white border border-[#EAEAEA] rounded-full px-3 py-2">

                                                            <span className="relative flex h-2.5 w-2.5">

                                                                <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60 animate-ping" />

                                                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />

                                                            </span>


                                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500">

                                                                Gateway Ready

                                                            </span>

                                                        </div>

                                                    </div>


                                                    {/* TITLE */}

                                                    <p className="text-[9px] font-black uppercase tracking-[0.35em] text-[#9B4819] mb-3">

                                                        Secure Checkout

                                                    </p>


                                                    <h3 className="text-3xl font-black uppercase tracking-tight text-[#111]">

                                                        Pay Online

                                                    </h3>


                                                    <p className="text-sm text-gray-500 mt-3 leading-relaxed max-w-lg">

                                                        Pay securely through Razorpay. UPI, cards, net banking and other available payment options will appear in the secure gateway after you confirm your order.

                                                    </p>


                                                    {/* ================================================= */}
                                                    {/* PAYMENT FEATURES */}
                                                    {/* ================================================= */}

                                                    <div className="grid grid-cols-3 gap-3 mt-8">


                                                        {/* UPI */}

                                                        <div className="bg-white border border-[#EAEAEA] rounded-2xl p-4 text-center">

                                                            <Wallet
                                                                size={17}
                                                                className="mx-auto text-[#9B4819] mb-2"
                                                            />

                                                            <p className="text-[8px] font-black uppercase tracking-wider text-gray-500">

                                                                UPI

                                                            </p>

                                                            <p className="text-[9px] font-bold mt-1 text-[#111]">

                                                                Instant

                                                            </p>

                                                        </div>


                                                        {/* SECURITY */}

                                                        <div className="bg-white border border-[#EAEAEA] rounded-2xl p-4 text-center">

                                                            <Lock
                                                                size={17}
                                                                className="mx-auto text-[#9B4819] mb-2"
                                                            />

                                                            <p className="text-[8px] font-black uppercase tracking-wider text-gray-500">

                                                                Secure

                                                            </p>

                                                            <p className="text-[9px] font-bold mt-1 text-[#111]">

                                                                Protected

                                                            </p>

                                                        </div>


                                                        {/* RAZORPAY */}

                                                        <div className="bg-white border border-[#EAEAEA] rounded-2xl p-4 text-center">

                                                            <ShieldCheck
                                                                size={17}
                                                                className="mx-auto text-[#9B4819] mb-2"
                                                            />

                                                            <p className="text-[8px] font-black uppercase tracking-wider text-gray-500">

                                                                Gateway

                                                            </p>

                                                            <p className="text-[9px] font-bold mt-1 text-[#111]">

                                                                Razorpay

                                                            </p>

                                                        </div>


                                                    </div>


                                                    {/* ================================================= */}
                                                    {/* SECURE GATEWAY INFO */}
                                                    {/* ================================================= */}

                                                    <div className="mt-7 flex items-center gap-4 bg-[#1A1A1A] text-[#EBE9E0] rounded-2xl px-5 py-4">


                                                        <div className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center flex-shrink-0">

                                                            <Lock
                                                                size={16}
                                                            />

                                                        </div>


                                                        <div className="min-w-0">

                                                            <p className="text-[9px] font-black uppercase tracking-[0.2em]">

                                                                Secure Gateway

                                                            </p>


                                                            <p className="text-[8px] text-white/50 uppercase tracking-wider mt-1">

                                                                Razorpay opens after confirmation

                                                            </p>

                                                        </div>


                                                        <ArrowRight
                                                            size={18}
                                                            className="ml-auto text-[#9B4819] flex-shrink-0"
                                                        />

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    </motion.div>

                                )}


                                {/* ================================================= */}
                                {/* COD — KEPT */}
                                {/* ================================================= */}

                                {selectedMethod === 'cod' && (

                                    <motion.div
                                        key="cod"

                                        initial={{
                                            opacity: 0
                                        }}

                                        animate={{
                                            opacity: 1
                                        }}

                                        exit={{
                                            opacity: 0
                                        }}

                                        className="flex flex-col items-center justify-center h-full space-y-4 py-20"
                                    >

                                        <Banknote
                                            size={48}
                                            strokeWidth={1}
                                            className="text-[#9B4819]"
                                        />


                                        <div className="text-center">

                                            <p className="text-sm font-bold uppercase tracking-widest">

                                                Cash on Delivery

                                            </p>


                                            <p className="text-[10px] opacity-60 mt-2 max-w-xs mx-auto">

                                                You will pay in cash upon delivery. Please ensure you have the exact amount.

                                            </p>

                                        </div>

                                    </motion.div>

                                )}

                            </AnimatePresence>

                        </motion.div>

                    </div>


                    {/* ================================================= */}
                    {/* RIGHT COLUMN — ORDER SUMMARY */}
                    {/* ================================================= */}

                    <div className="lg:col-span-5 flex flex-col h-full">


                        <motion.div
                            variants={itemVariants}
                            className="bg-[#1A1A1A] text-[#EBE9E0] p-8 flex-1 relative flex flex-col justify-between overflow-hidden"
                        >

                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />


                            <div>


                                {/* INVOICE HEADER */}

                                <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-6">


                                    <div>

                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">

                                            Invoice To

                                        </p>


                                        <p className="text-sm font-bold uppercase mt-1 tracking-wider">

                                            {state?.addressData?.fullName ||
                                                state?.addressData?.firstName ||
                                                'Guest'}

                                            {' '}

                                            {state?.addressData?.lastName || ''}

                                        </p>


                                        <p className="text-xs opacity-70 mt-1">

                                            {state?.addressData?.city || ''}

                                            {state?.addressData?.zip
                                                ? `, ${state.addressData.zip}`
                                                : ''}

                                        </p>

                                    </div>


                                    <div className="text-right">

                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">

                                            Order Total

                                        </p>


                                        <p className="text-2xl font-black tracking-tighter mt-1">

                                            ₹{cartTotal}

                                        </p>

                                    </div>

                                </div>


                                {/* ================================================= */}
                                {/* ITEMS LIST */}
                                {/* ================================================= */}

                                <div className="space-y-4 mb-8">

                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">

                                        Your Selection

                                    </p>


                                    <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar space-y-3">

                                        {cart.map(
                                            (item, idx) => (

                                                <div
                                                    key={idx}
                                                    className="flex gap-4 items-center bg-white/5 p-3"
                                                >


                                                    <div className="w-10 h-12 bg-white/10 overflow-hidden">

                                                        <img
                                                            src={getItemImage(item)}
                                                            alt=""
                                                            className="w-full h-full object-cover opacity-80"

                                                            onError={(e) => {
                                                                e.currentTarget.src =
                                                                    FALLBACK_IMAGE;
                                                            }}
                                                        />

                                                    </div>


                                                    <div className="flex-1">

                                                        <p className="text-xs font-bold uppercase tracking-wider">

                                                            {getItemName(item)}

                                                        </p>


                                                        <p className="text-[10px] opacity-50">

                                                            Size: {getItemSize(item)}
                                                            {' / '}
                                                            Qty: {getItemQty(item)}

                                                        </p>

                                                    </div>


                                                    <div className="text-right">


                                                        {/* ORIGINAL PRICE */}

                                                        {item.hasFlashSale && (

                                                            <p className="text-[9px] opacity-40 line-through">

                                                                ₹
                                                                {(
                                                                    Number(
                                                                        item.originalPrice
                                                                    ) *
                                                                    getItemQty(item)
                                                                ).toLocaleString('en-IN')}

                                                            </p>

                                                        )}


                                                        {/* DISCOUNTED PRICE */}

                                                        <p className="text-xs font-bold opacity-80">

                                                            ₹
                                                            {(
                                                                Number(
                                                                    getItemPrice(item)
                                                                ) *
                                                                getItemQty(item)
                                                            ).toLocaleString('en-IN')}

                                                        </p>


                                                        {/* DISCOUNT */}

                                                        {item.hasFlashSale && (

                                                            <p className="text-[8px] font-black text-green-400">

                                                                {item.discountPercentage}% OFF

                                                            </p>

                                                        )}

                                                    </div>

                                                </div>

                                            )
                                        )}

                                    </div>

                                </div>

                            </div>


                            {/* ================================================= */}
                            {/* PAY BUTTON */}
                            {/* ================================================= */}

                            <div className="space-y-4 z-10">


                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest opacity-60">

                                    <span>
                                        Subtotal
                                    </span>

                                    <span>
                                        ₹{cartTotal}
                                    </span>

                                </div>


                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest opacity-60">

                                    <span>
                                        Shipping
                                    </span>

                                    <span>
                                        Free
                                    </span>

                                </div>


                                <div className="h-px bg-white/20 my-4" />


                                <button
                                    onClick={handlePlaceOrder}

                                    disabled={
                                        isProcessing ||
                                        cart.length === 0 ||
                                        (
                                            selectedMethod !== 'cod' &&
                                            !razorpayReady
                                        )
                                    }

                                    className="group relative w-full h-16 bg-white text-black font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center overflow-hidden hover:bg-[#9B4819] hover:text-white transition-colors duration-500 disabled:opacity-80 disabled:cursor-not-allowed"
                                >


                                    {/* NORMAL */}

                                    <span
                                        className={`absolute transition-transform duration-500 flex items-center gap-2 ${
                                            isProcessing
                                                ? '-translate-y-10'
                                                : 'translate-y-0'
                                        }`}
                                    >

                                        Confirm Order

                                        <ArrowRight
                                            size={16}
                                        />

                                    </span>


                                    {/* PROCESSING */}

                                    <span
                                        className={`absolute transition-transform duration-500 flex items-center gap-2 ${
                                            isProcessing
                                                ? 'translate-y-0'
                                                : 'translate-y-10'
                                        }`}
                                    >

                                        <Loader2
                                            size={18}
                                            className="animate-spin"
                                        />

                                        Processing

                                    </span>

                                </button>

                            </div>

                        </motion.div>

                    </div>

                </motion.div>

            </div>

        </>
    );
};


export default CheckoutPayment;