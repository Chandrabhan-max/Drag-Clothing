import React, {
    useState,
    useEffect,
    useRef,
    useLayoutEffect,
} from 'react';

import {
    Link,
    useLocation,
    useNavigate,
} from 'react-router-dom';

import {
    motion,
    AnimatePresence,
} from 'framer-motion';

import SidePanel from './SidePanel';

import { useCart } from '../context/CartContext';
import { useLikes } from '../context/LikesContext';
import { useAuth } from '../context/AuthContext';


// =========================================================
// ICONS
// =========================================================

const SearchIcon = ({
    className = 'w-5 h-5',
}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={className}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
        />
    </svg>
);

const UserIcon = ({
    className = 'w-5 h-5',
}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={className}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
        />
    </svg>
);

const CartIcon = ({
    className = 'w-5 h-5',
}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={className}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
        />
    </svg>
);

const HeartIcon = ({
    className = 'w-5 h-5',
}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={className}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
    </svg>
);

const XIcon = ({
    className = 'w-5 h-5',
}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={className}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18 18 6M6 6l12 12"
        />
    </svg>
);


// =========================================================
// ANIMATED NAV BUTTON
// =========================================================

const NavButton = ({
    icon,
    onClick,
    showBadge,
    className = '',
}) => (
    <motion.button
        type="button"
        onClick={onClick}
        whileHover={{
            scale: 1.05,
        }}
        whileTap={{
            scale: 0.95,
        }}
        className={`
            w-10
            h-10
            flex
            items-center
            justify-center
            rounded-full
            bg-white
            border
            border-transparent
            hover:border-[#E5E5E5]
            hover:bg-[#FAFAFA]
            transition-colors
            text-[#1A1A1A]
            relative
            ${className}
        `}
    >
        {icon}

        {showBadge && (
            <motion.span
                initial={{
                    scale: 0,
                }}
                animate={{
                    scale: 1,
                }}
                className="
                    absolute
                    top-1
                    right-1
                    w-2
                    h-2
                    bg-[#9B4819]
                    rounded-full
                    border
                    border-white
                "
            />
        )}
    </motion.button>
);


// =========================================================
// NAVBAR
// =========================================================

const Navbar = () => {

    const navigate = useNavigate();
    const location = useLocation();

    // -----------------------------------------------------
    // AUTH / CONTEXT
    // -----------------------------------------------------

    const {
        user,
        logout,
    } = useAuth();

    const {
        isCartOpen,
        setIsCartOpen,
        cart,
        cartCount,
        removeFromCart,
        cartTotal,
    } = useCart();

    const {
        likedItems,
    } = useLikes();


    // -----------------------------------------------------
    // STATE
    // -----------------------------------------------------

    const [
        isSearchOpen,
        setIsSearchOpen,
    ] = useState(false);

    const [
        searchQuery,
        setSearchQuery,
    ] = useState('');

    const [
        isProfileMenuOpen,
        setIsProfileMenuOpen,
    ] = useState(false);


    // -----------------------------------------------------
    // REFS
    // -----------------------------------------------------

    const searchContainerRef =
        useRef(null);

    const searchInputRef =
        useRef(null);

    const profileMenuRef =
        useRef(null);


    // =====================================================
    // LOGO
    // =====================================================

    const handleLogoClick = (e) => {

        e.preventDefault();

        setIsSearchOpen(false);
        setIsProfileMenuOpen(false);

        window.scrollTo(0, 0);

        navigate('/');
    };


    // =====================================================
    // CLICK OUTSIDE
    // =====================================================

    useEffect(() => {

        const handleClickOutside = (
            event
        ) => {

            const target =
                event.target;

            // Close profile menu
            if (
                profileMenuRef.current &&
                !profileMenuRef.current.contains(
                    target
                )
            ) {
                setIsProfileMenuOpen(false);
            }

            // Close search
            if (
                isSearchOpen &&
                searchContainerRef.current &&
                !searchContainerRef.current.contains(
                    target
                )
            ) {
                setIsSearchOpen(false);
            }
        };


        document.addEventListener(
            'mousedown',
            handleClickOutside
        );


        return () => {

            document.removeEventListener(
                'mousedown',
                handleClickOutside
            );

        };

    }, [isSearchOpen]);


    // =====================================================
    // SEARCH FOCUS
    // =====================================================

    useLayoutEffect(() => {

        if (!isSearchOpen) {
            return;
        }

        const focusSearch = () => {

            if (
                searchInputRef.current
            ) {
                searchInputRef.current.focus();

                // Put cursor at end
                const length =
                    searchInputRef.current
                        .value.length;

                searchInputRef.current.setSelectionRange(
                    length,
                    length
                );
            }

        };


        requestAnimationFrame(
            focusSearch
        );


    }, [isSearchOpen]);


    // =====================================================
    // ESCAPE KEY
    // =====================================================

    useEffect(() => {

        const handleKeyDown = (event) => {

            if (
                event.key === 'Escape'
            ) {

                setIsSearchOpen(false);
                setIsProfileMenuOpen(false);

            }

        };


        document.addEventListener(
            'keydown',
            handleKeyDown
        );


        return () => {

            document.removeEventListener(
                'keydown',
                handleKeyDown
            );

        };

    }, []);


    // =====================================================
    // SEARCH SUBMIT
    // =====================================================

    const handleSearchSubmit = (
        e
    ) => {

        e.preventDefault();

        const query =
            searchQuery.trim();

        if (!query) {

            if (
                searchInputRef.current
            ) {
                searchInputRef.current.focus();
            }

            return;
        }


        setIsSearchOpen(false);

        navigate(
            `/products?search=${encodeURIComponent(
                query
            )}`
        );

        setSearchQuery('');

    };


    // =====================================================
    // CLOSE SEARCH
    // =====================================================

    const closeSearch = () => {

        setIsSearchOpen(false);

        setSearchQuery('');

    };


    // =====================================================
    // SEARCH OPEN
    // =====================================================

    const openSearch = () => {

        setIsProfileMenuOpen(false);
        setIsSearchOpen(true);

    };


    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {

        logout();

        setIsProfileMenuOpen(false);

        navigate('/');

    };


    // =====================================================
    // HELPERS
    // =====================================================

    const isActive = (path) =>
        location.pathname.includes(path);


    const FALLBACK_IMAGE =
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format';


    const toImageUrl = (url) => {

        if (!url) {
            return FALLBACK_IMAGE;
        }

        return url.startsWith('/')
            ? `${import.meta.env.VITE_API_URL}${url}`
            : url;

    };


    // =====================================================
    // RENDER
    // =====================================================

    return (
        <>
            <motion.nav
                initial={{
                    y: -100,
                }}
                animate={{
                    y: 0,
                }}
                transition={{
                    duration: 0.5,
                    ease: 'easeOut',
                }}
                className="
                    fixed
                    top-0
                    left-0
                    right-0
                    z-[100]
                    bg-white/80
                    backdrop-blur-md
                    border-b
                    border-[#E5E5E5]
                    py-3
                "
            >

                <div
                    className="
                        max-w-7xl
                        mx-auto
                        px-4
                        md:px-8
                        h-12
                        flex
                        items-center
                        justify-between
                        relative
                    "
                >

                    {/* =================================================
                        LEFT — LOGO
                       ================================================= */}

                    <Link
                        to="/"
                        onClick={handleLogoClick}
                        className="
                            text-2xl
                            font-black
                            tracking-tighter
                            text-[#1A1A1A]
                            cursor-pointer
                            z-[110]
                            shrink-0
                        "
                    >
                        DRAG
                        <span className="text-[#9B4819]">
                            .
                        </span>
                    </Link>


                    {/* =================================================
                        CENTER — DESKTOP NAV / SEARCH
                       ================================================= */}

                    <div
                        ref={searchContainerRef}
                        className="
                            absolute
                            left-1/2
                            -translate-x-1/2
                            flex
                            items-center
                            justify-center
                            hidden
                            md:flex
                            z-[105]
                        "
                    >

                        <AnimatePresence
                            mode="wait"
                            initial={false}
                        >

                            {!isSearchOpen ? (

                                <motion.div
                                    key="nav-links"
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
                                        y: -10,
                                    }}
                                    transition={{
                                        duration: 0.2,
                                    }}
                                    className="
                                        flex
                                        items-center
                                        gap-6
                                    "
                                >

                                    <Link
                                        to="/category/men"
                                        className={`
                                            text-[11px]
                                            font-bold
                                            uppercase
                                            tracking-[0.2em]
                                            transition-colors
                                            ${
                                                isActive(
                                                    '/men'
                                                )
                                                    ? 'text-[#9B4819]'
                                                    : 'text-[#777] hover:text-black'
                                            }
                                        `}
                                    >
                                        Men
                                    </Link>

                                    <Link
                                        to="/category/women"
                                        className={`
                                            text-[11px]
                                            font-bold
                                            uppercase
                                            tracking-[0.2em]
                                            transition-colors
                                            ${
                                                isActive(
                                                    '/women'
                                                )
                                                    ? 'text-[#9B4819]'
                                                    : 'text-[#777] hover:text-black'
                                            }
                                        `}
                                    >
                                        Women
                                    </Link>

                                </motion.div>

                            ) : (

                                <motion.form
                                    key="search-form"
                                    initial={{
                                        opacity: 0,
                                        scale: 0.95,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                    }}
                                    exit={{
                                        opacity: 0,
                                        scale: 0.95,
                                    }}
                                    transition={{
                                        duration: 0.2,
                                    }}
                                    onSubmit={
                                        handleSearchSubmit
                                    }
                                    className="
                                        relative
                                        w-[320px]
                                    "
                                >

                                    <input
                                        ref={
                                            searchInputRef
                                        }
                                        type="text"
                                        value={
                                            searchQuery
                                        }
                                        onChange={(e) =>
                                            setSearchQuery(
                                                e.target.value
                                            )
                                        }
                                        onKeyDown={(e) => {

                                            if (
                                                e.key ===
                                                'Escape'
                                            ) {
                                                closeSearch();
                                            }

                                        }}
                                        placeholder="SEARCH PRODUCTS..."
                                        autoComplete="off"
                                        className="
                                            w-full
                                            bg-white
                                            border-b-2
                                            border-[#1A1A1A]
                                            py-2
                                            pr-8
                                            text-sm
                                            font-bold
                                            uppercase
                                            tracking-widest
                                            text-[#1A1A1A]
                                            placeholder:text-gray-300
                                            focus:outline-none
                                        "
                                    />

                                    <button
                                        type="button"
                                        onClick={
                                            closeSearch
                                        }
                                        aria-label="Close search"
                                        className="
                                            absolute
                                            right-0
                                            top-1/2
                                            -translate-y-1/2
                                            text-gray-400
                                            hover:text-black
                                        "
                                    >
                                        <XIcon className="w-4 h-4" />
                                    </button>

                                </motion.form>

                            )}

                        </AnimatePresence>

                    </div>


                    {/* =================================================
                        MOBILE SEARCH
                       ================================================= */}

                    <AnimatePresence>

                        {isSearchOpen && (

                            <motion.div
                                initial={{
                                    opacity: 0,
                                    y: -8,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                exit={{
                                    opacity: 0,
                                    y: -8,
                                }}
                                className="
                                    md:hidden
                                    absolute
                                    left-4
                                    right-4
                                    top-full
                                    mt-2
                                    bg-white
                                    border
                                    border-[#E5E5E5]
                                    shadow-xl
                                    rounded-md
                                    p-3
                                    z-[120]
                                "
                            >

                                <form
                                    onSubmit={
                                        handleSearchSubmit
                                    }
                                    className="relative"
                                >

                                    <input
                                        ref={
                                            searchInputRef
                                        }
                                        type="text"
                                        value={
                                            searchQuery
                                        }
                                        onChange={(e) =>
                                            setSearchQuery(
                                                e.target.value
                                            )
                                        }
                                        placeholder="SEARCH PRODUCTS..."
                                        autoComplete="off"
                                        className="
                                            w-full
                                            bg-white
                                            border-b-2
                                            border-[#1A1A1A]
                                            py-3
                                            pl-1
                                            pr-10
                                            text-sm
                                            font-bold
                                            uppercase
                                            tracking-widest
                                            text-[#1A1A1A]
                                            placeholder:text-gray-300
                                            focus:outline-none
                                        "
                                    />

                                    <button
                                        type="button"
                                        onClick={
                                            closeSearch
                                        }
                                        className="
                                            absolute
                                            right-1
                                            top-1/2
                                            -translate-y-1/2
                                            text-gray-400
                                            hover:text-black
                                        "
                                        aria-label="Close search"
                                    >
                                        <XIcon className="w-5 h-5" />
                                    </button>

                                </form>

                            </motion.div>

                        )}

                    </AnimatePresence>


                    {/* =================================================
                        RIGHT — ICONS
                       ================================================= */}

                    <div className="
                        flex
                        items-center
                        gap-1
                        z-[110]
                        shrink-0
                    ">

                        {/* Search */}
                        <AnimatePresence
                            initial={false}
                        >

                            {!isSearchOpen && (

                                <motion.div
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

                                    <NavButton
                                        icon={
                                            <SearchIcon />
                                        }
                                        onClick={
                                            openSearch
                                        }
                                    />

                                </motion.div>

                            )}

                        </AnimatePresence>


                        {/* Likes */}

                        <NavButton
                            onClick={() =>
                                navigate(
                                    '/likes'
                                )
                            }
                            icon={
                                <HeartIcon />
                            }
                            showBadge={
                                likedItems &&
                                likedItems.length >
                                    0
                            }
                        />


                        {/* Profile */}

                        {user ? (

                            <div
                                className="relative"
                                ref={
                                    profileMenuRef
                                }
                            >

                                <motion.button
                                    type="button"
                                    whileHover={{
                                        scale: 1.05,
                                    }}
                                    whileTap={{
                                        scale: 0.95,
                                    }}
                                    onClick={() =>
                                        setIsProfileMenuOpen(
                                            !isProfileMenuOpen
                                        )
                                    }
                                    className="
                                        h-10
                                        px-3
                                        flex
                                        items-center
                                        justify-center
                                        rounded-full
                                        hover:bg-gray-100
                                        transition-colors
                                        gap-2
                                        border
                                        border-transparent
                                        hover:border-[#E5E5E5]
                                    "
                                >

                                    <UserIcon
                                        className="
                                            w-5
                                            h-5
                                            text-[#1A1A1A]
                                        "
                                    />

                                    <span className="
                                        hidden
                                        md:block
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-wider
                                        text-[#1A1A1A]
                                    ">
                                        {
                                            user?.firstName ||
                                            user?.name ||
                                            user?.email?.split('@')[0] ||
                                            'Account'
                                        }
                                    </span>

                                </motion.button>


                                <AnimatePresence>

                                    {isProfileMenuOpen && (

                                        <motion.div
                                            initial={{
                                                opacity: 0,
                                                y: 10,
                                                scale: 0.95,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                                scale: 1,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                y: 10,
                                                scale: 0.95,
                                            }}
                                            transition={{
                                                duration: 0.2,
                                            }}
                                            className="
                                                absolute
                                                top-full
                                                right-0
                                                mt-2
                                                w-40
                                                bg-white
                                                border
                                                border-[#E5E5E5]
                                                shadow-xl
                                                py-2
                                                rounded-lg
                                                origin-top-right
                                                overflow-hidden
                                                z-[130]
                                            "
                                        >

                                            <Link
                                                to="/profile"
                                                onClick={() =>
                                                    setIsProfileMenuOpen(
                                                        false
                                                    )
                                                }
                                                className="
                                                    block
                                                    px-4
                                                    py-2
                                                    text-[10px]
                                                    font-bold
                                                    uppercase
                                                    tracking-widest
                                                    text-gray-500
                                                    hover:text-black
                                                    hover:bg-gray-50
                                                "
                                            >
                                                Profile
                                            </Link>


                                            <Link
                                                to="/profile"
                                                state={{
                                                    activeTab:
                                                        'orders',
                                                }}
                                                onClick={() =>
                                                    setIsProfileMenuOpen(
                                                        false
                                                    )
                                                }
                                                className="
                                                    block
                                                    px-4
                                                    py-2
                                                    text-[10px]
                                                    font-bold
                                                    uppercase
                                                    tracking-widest
                                                    text-gray-500
                                                    hover:text-black
                                                    hover:bg-gray-50
                                                "
                                            >
                                                Orders
                                            </Link>


                                            <div className="
                                                h-px
                                                bg-gray-100
                                                my-1
                                            " />


                                            <button
                                                type="button"
                                                onClick={
                                                    handleLogout
                                                }
                                                className="
                                                    w-full
                                                    text-left
                                                    px-4
                                                    py-2
                                                    text-[10px]
                                                    font-bold
                                                    uppercase
                                                    tracking-widest
                                                    text-red-500
                                                    hover:bg-gray-50
                                                "
                                            >
                                                Log Out
                                            </button>

                                        </motion.div>

                                    )}

                                </AnimatePresence>

                            </div>

                        ) : (

                            <NavButton
                                onClick={() =>
                                    navigate(
                                        '/login'
                                    )
                                }
                                icon={
                                    <UserIcon />
                                }
                            />

                        )}


                        {/* Cart */}

                        <NavButton
                            onClick={() =>
                                setIsCartOpen(
                                    true
                                )
                            }
                            icon={
                                <CartIcon />
                            }
                            showBadge={
                                cartCount > 0
                            }
                        />

                    </div>

                </div>

            </motion.nav>


            {/* =========================================================
                CART SIDE PANEL
               ========================================================= */}

            <SidePanel
                isOpen={
                    isCartOpen
                }
                onClose={() =>
                    setIsCartOpen(
                        false
                    )
                }
                title={`Cart (${cartCount})`}
            >

                {cart.length === 0 ? (

                    <div className="
                        flex
                        flex-col
                        h-[50vh]
                        justify-center
                        items-center
                        text-[#777]
                        space-y-6
                    ">

                        <div className="
                            p-8
                            rounded-full
                            border
                            border-dashed
                            border-[#CCC]
                            flex
                            items-center
                            justify-center
                            bg-white
                        ">

                            <CartIcon
                                className="
                                    w-6
                                    h-6
                                    text-[#CCC]
                                "
                            />

                        </div>

                        <p className="
                            text-[10px]
                            font-bold
                            tracking-[0.2em]
                            uppercase
                            text-[#1A1A1A]
                        ">
                            Your cart is empty
                        </p>

                        <Link
                            to="/category/men"
                            onClick={() =>
                                setIsCartOpen(
                                    false
                                )
                            }
                            className="
                                text-[10px]
                                font-bold
                                text-[#9B4819]
                                uppercase
                                tracking-widest
                                border-b
                                border-[#9B4819]
                            "
                        >
                            Start Shopping
                        </Link>

                    </div>

                ) : (

                    <div className="space-y-4">

                        {cart.map(
                            (
                                item,
                                idx
                            ) => {

                                const itemName =
                                    item.product?.name ||
                                    item.name ||
                                    'Product';

                                const itemImage =
                                    toImageUrl(
                                        item.product?.imageUrl ||
                                        item.product?.image ||
                                        item.imageUrl ||
                                        item.image ||
                                        item.product?.images?.[0]
                                    );

                                const itemSize =
                                    item.variant?.size ||
                                    item.size ||
                                    '-';

                                const itemPrice =
                                    Number(
                                        item.discountedPrice ??
                                        item.price ??
                                        item.variant?.price ??
                                        item.product?.price ??
                                        0
                                    );

                                const itemQty =
                                    item.quantity ||
                                    1;

                                return (
                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                            x: 20,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            x: 0,
                                        }}
                                        transition={{
                                            delay:
                                                idx *
                                                0.05,
                                        }}
                                        key={
                                            item.cartId ||
                                            item.id ||
                                            idx
                                        }
                                        className="
                                            flex
                                            gap-4
                                            p-3
                                            bg-white
                                            border
                                            border-[#E5E5E5]
                                            group
                                        "
                                    >

                                        <div className="
                                            w-16
                                            h-20
                                            bg-[#F5F5F5]
                                            overflow-hidden
                                        ">

                                            <img
                                                src={
                                                    itemImage
                                                }
                                                alt={
                                                    itemName
                                                }
                                                className="
                                                    w-full
                                                    h-full
                                                    object-cover
                                                "
                                                onError={(
                                                    e
                                                ) => {
                                                    e.currentTarget.src =
                                                        FALLBACK_IMAGE;
                                                }}
                                            />

                                        </div>


                                        <div className="
                                            flex-1
                                            flex
                                            flex-col
                                            justify-between
                                            py-1
                                        ">

                                            <div>

                                                <h4 className="
                                                    text-xs
                                                    font-bold
                                                    text-[#1A1A1A]
                                                    uppercase
                                                ">
                                                    {
                                                        itemName
                                                    }
                                                </h4>

                                                <p className="
                                                    text-[10px]
                                                    text-[#777]
                                                    font-medium
                                                    uppercase
                                                    mt-1
                                                ">
                                                    Size:{' '}
                                                    {
                                                        itemSize
                                                    }{' '}
                                                    / Qty:{' '}
                                                    {
                                                        itemQty
                                                    }
                                                </p>

                                            </div>


                                            <div className="
                                                flex
                                                justify-between
                                                items-end
                                            ">

                                                <div className="
                                                    flex
                                                    flex-col
                                                ">

                                                    {item.hasFlashSale && (
                                                        <span className="
                                                            text-[10px]
                                                            text-gray-400
                                                            line-through
                                                        ">
                                                            ₹
                                                            {(
                                                                Number(
                                                                    item.originalPrice
                                                                ) *
                                                                itemQty
                                                            ).toLocaleString(
                                                                'en-IN'
                                                            )}
                                                        </span>
                                                    )}


                                                    <span className="
                                                        text-xs
                                                        font-bold
                                                        text-[#1A1A1A]
                                                    ">
                                                        ₹
                                                        {(
                                                            Number(
                                                                itemPrice
                                                            ) *
                                                            itemQty
                                                        ).toLocaleString(
                                                            'en-IN'
                                                        )}
                                                    </span>


                                                    {item.hasFlashSale && (
                                                        <span className="
                                                            text-[9px]
                                                            font-black
                                                            text-green-600
                                                        ">
                                                            {
                                                                item.discountPercentage
                                                            }% OFF
                                                        </span>
                                                    )}

                                                </div>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeFromCart(
                                                            item.cartId ||
                                                            item.id
                                                        )
                                                    }
                                                    className="
                                                        text-[9px]
                                                        font-bold
                                                        text-red-500
                                                        uppercase
                                                        hover:underline
                                                    "
                                                >
                                                    Remove
                                                </button>

                                            </div>

                                        </div>

                                    </motion.div>
                                );

                            }
                        )}

                    </div>

                )}


                <div className="
                    mt-auto
                    border-t
                    border-[#E5E5E5]
                    pt-6
                    sticky
                    bottom-0
                    bg-white
                    pb-4
                ">

                    <div className="
                        flex
                        justify-between
                        items-end
                        mb-4
                        px-1
                    ">

                        <span className="
                            text-[10px]
                            font-bold
                            text-[#777]
                            tracking-widest
                            uppercase
                        ">
                            Subtotal
                        </span>

                        <span className="
                            text-xl
                            font-black
                            text-[#1A1A1A]
                            tracking-tighter
                        ">
                            ₹ {cartTotal}
                        </span>

                    </div>


                    <Link
                        to="/checkout/address"
                        onClick={() =>
                            setIsCartOpen(
                                false
                            )
                        }
                    >

                        <motion.button
                            type="button"
                            whileHover={{
                                scale: 1.02,
                            }}
                            whileTap={{
                                scale: 0.98,
                            }}
                            disabled={
                                cart.length === 0
                            }
                            className="
                                w-full
                                bg-[#1A1A1A]
                                hover:bg-[#9B4819]
                                text-white
                                font-bold
                                py-3
                                text-xs
                                uppercase
                                tracking-widest
                                transition-all
                            "
                        >
                            Checkout
                        </motion.button>

                    </Link>

                </div>

            </SidePanel>
        </>
    );
};

export default Navbar;