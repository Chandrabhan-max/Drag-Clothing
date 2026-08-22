import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Package,
  Zap,
  BarChart3,
  Box,
  LogOut,
  ShoppingCart,
  Menu,
  X,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import AdminProfileDrawer from '../../components/AdminProfileDrawer';

const ClientLayout = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/client/dashboard',
      icon: <LayoutDashboard size={18} />,
    },
    {
      name: 'Incoming Orders',
      path: '/client/orders',
      icon: <ShoppingCart size={18} />,
    },
    {
      name: 'Product Stock',
      path: '/client/inventory',
      icon: <Box size={18} />,
    },
    {
      name: 'My Products',
      path: '/client/products',
      icon: <Package size={18} />,
    },
    {
      name: 'Store Manager',
      path: '/client/managers',
      icon: <Users size={18} />,
    },
    {
      name: 'Flash Sale',
      path: '/client/discounts',
      icon: <Zap size={18} />,
    },
    {
      name: 'Business Reports',
      path: '/client/reports',
      icon: <BarChart3 size={18} />,
    },
  ];

  const isActive = (path) => location.pathname.includes(path);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Close mobile sidebar whenever route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Prevent background scrolling while mobile sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#FAFAFA] font-sans text-[#1A1A1A] selection:bg-[#9B4819] selection:text-white relative">

      {/* =========================================================
          MOBILE OVERLAY
      ========================================================= */}

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* =========================================================
          SIDEBAR
      ========================================================= */}

      <motion.aside
        initial={false}
        animate={{
          x: isSidebarOpen ? 0 : '-100%',
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
        className="
          fixed
          md:relative
          inset-y-0
          left-0
          z-50
          md:z-30
          w-[280px]
          md:w-72
          max-w-[85vw]
          bg-[#0A0A0A]
          text-white
          flex
          flex-col
          overflow-hidden
          shadow-2xl
          md:shadow-none
        "
      >

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden">
          <svg
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
          >
            <pattern
              id="tireTrack"
              x="0"
              y="0"
              width="40"
              height="100"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(-15)"
            >
              <path
                d="M10 0 L10 100 M30 0 L30 100"
                stroke="white"
                strokeWidth="8"
                strokeDasharray="15 10"
              />
              <path
                d="M0 20 L40 40 M0 60 L40 80"
                stroke="white"
                strokeWidth="2"
              />
            </pattern>

            <rect
              width="100%"
              height="100%"
              fill="url(#tireTrack)"
            />
          </svg>
        </div>

        {/* =====================================================
            SIDEBAR HEADER
        ===================================================== */}

        <div className="p-6 md:p-8 border-b border-white/5 relative z-10 flex items-start justify-between">

          <Link
            to="/client/dashboard"
            onClick={() => setIsSidebarOpen(false)}
            className="text-2xl font-black tracking-tighter text-white group"
          >
            {user?.brandName || 'BRAND'}
            <span className="text-[#9B4819] group-hover:animate-pulse">
              .
            </span>

            <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.5em] mt-3 italic">
              Brand Control Unit
            </p>
          </Link>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsSidebarOpen(false);
            }}
            className="
    md:hidden
    absolute
    top-5
    right-5
    z-[100]
    flex
    items-center
    justify-center
    w-10
    h-10
    rounded-xl
    bg-white/10
    border
    border-white/20
    text-white
    hover:bg-white/20
    active:scale-95
    transition-all
    cursor-pointer
    touch-manipulation
  "
            aria-label="Close sidebar"
          >
            <X size={20} strokeWidth={2.5} />
          </button>

        </div>

        {/* =====================================================
            NAVIGATION
        ===================================================== */}

        <nav className="flex-1 p-4 md:p-6 space-y-1 overflow-y-auto relative z-10 custom-scrollbar">

          {navItems.map((item) => {
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex
                  items-center
                  gap-4
                  px-4
                  md:px-5
                  py-4
                  rounded-xl
                  transition-all
                  duration-500
                  group
                  relative
                  overflow-hidden
                  ${active
                    ? 'text-white'
                    : 'text-white/30 hover:text-white'
                  }
                `}
              >

                {active && (
                  <motion.div
                    layoutId="activeGlow"
                    className="
                      absolute
                      inset-0
                      bg-gradient-to-r
                      from-[#9B4819]/20
                      to-transparent
                      border-l-2
                      border-[#9B4819]
                      z-0
                    "
                  />
                )}

                <span
                  className={`
                    relative
                    z-10
                    transition-all
                    duration-300
                    ${active
                      ? 'text-[#9B4819]'
                      : 'group-hover:rotate-12 group-hover:scale-110'
                    }
                  `}
                >
                  {item.icon}
                </span>

                <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.25em]">
                  {item.name}
                </span>

              </Link>
            );
          })}

        </nav>

      </motion.aside>

      {/* =========================================================
          MAIN AREA
      ========================================================= */}

      <main className="flex-1 min-w-0 flex flex-col h-full relative overflow-hidden">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header
          className="
            h-16
            min-h-16
            border-b
            border-gray-100
            flex
            items-center
            justify-between
            px-4
            sm:px-6
            md:px-10
            bg-white/80
            backdrop-blur-md
            z-30
          "
        >

          {/* MOBILE MENU BUTTON */}

          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="
              md:hidden
              w-10
              h-10
              rounded-xl
              border
              border-gray-200
              bg-white
              flex
              items-center
              justify-center
              text-[#111]
              hover:bg-[#F5F5F5]
              transition-colors
              shadow-sm
            "
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          {/* Empty spacer on desktop */}
          <div className="hidden md:block" />

          {/* PROFILE + LOGOUT */}

          <div className="flex items-center gap-3 sm:gap-5">

            <button
              onClick={() => setIsProfileOpen(true)}
              className="
                flex
                items-center
                gap-2
                sm:gap-3
                text-left
                hover:opacity-80
                transition-opacity
                group
              "
            >

              {/* User Information */}

              <div className="text-right hidden xs:block sm:block">
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight leading-none text-[#111] max-w-[120px] sm:max-w-none truncate">
                  {user?.name || 'Client Admin'}
                </p>

                <p className="text-[7px] sm:text-[8px] font-bold text-[#9B4819] uppercase tracking-widest mt-1 max-w-[120px] sm:max-w-none truncate">
                  {user?.brandName || 'Brand Manager'}
                </p>
              </div>

              {/* Avatar */}

              <div
                className="
                  w-9
                  h-9
                  sm:w-10
                  sm:h-10
                  rounded-xl
                  bg-[#111]
                  flex
                  items-center
                  justify-center
                  font-black
                  text-[10px]
                  text-white
                  border
                  border-white/10
                  shadow-lg
                  rotate-3
                  group-hover:rotate-0
                  transition-transform
                  shrink-0
                "
              >
                {user?.name?.charAt(0) || 'B'}
              </div>

            </button>

            {/* Separator */}

            <div className="w-px h-6 bg-gray-200" />

            {/* Logout */}

            <button
              onClick={handleLogout}
              className="
                text-gray-400
                hover:text-red-500
                transition-colors
                p-2
                rounded-lg
                hover:bg-red-50
              "
              title="Logout"
            >
              <LogOut size={16} />
            </button>

          </div>

        </header>

        {/* =====================================================
            PAGE CONTENT
        ===================================================== */}

        <div className="flex-1 overflow-y-auto relative bg-[#FAFAFA]">

          <div className="p-4 sm:p-6 md:p-10 lg:p-12 xl:p-16 w-full min-w-0">
            <Outlet />
          </div>

        </div>

      </main>

      {/* =========================================================
          PROFILE DRAWER
      ========================================================= */}

      <AdminProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

    </div>
  );
};

export default ClientLayout;