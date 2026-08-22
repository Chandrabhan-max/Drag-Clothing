import React, { useEffect } from 'react';

const SidePanel = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  // =========================================================
  // CLOSE WITH ESC + LOCK BACKGROUND SCROLL
  // =========================================================

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener(
        'keydown',
        handleKeyDown
      );

      // Prevent background page from scrolling
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown
      );

      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* =====================================================
          BACKDROP
          IMPORTANT:
          Navbar has higher z-index, so logo/buttons stay clickable.
         ===================================================== */}

      <div
        className={`
          fixed
          inset-0
          bg-black/30
          backdrop-blur-sm
          z-[150]
          transition-opacity
          duration-300
          ${
            isOpen
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          }
        `}
        onClick={onClose}
        aria-hidden={!isOpen}
      />


      {/* =====================================================
          SIDE PANEL
         ===================================================== */}

      <div
        className={`
          fixed
          top-0
          right-0
          h-[100dvh]
          w-full
          sm:w-[420px]
          bg-[#FAFAFA]
          z-[210]
          shadow-2xl
          flex
          flex-col
          border-l
          border-[#E5E5E5]

          transform
          transition-transform
          duration-500
          ease-[cubic-bezier(0.4,0,0.2,1)]

          ${
            isOpen
              ? 'translate-x-0'
              : 'translate-x-full'
          }
        `}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => {
          // Don't let clicks inside the panel
          // trigger the backdrop.
          event.stopPropagation();
        }}
      >

        {/* =================================================
            HEADER
           ================================================= */}

        <div
          className="
            relative
            flex
            min-h-[76px]
            shrink-0
            items-center
            justify-between
            border-b
            border-[#E5E5E5]
            bg-white
            px-5
            py-4
            sm:px-6
          "
        >

          <div className="pr-12">

            <p className="
              text-[8px]
              font-black
              uppercase
              tracking-[0.28em]
              text-[#9B4819]
            ">
              DRAG CLOTHING
            </p>

            <h2 className="
              mt-1
              text-sm
              font-black
              uppercase
              tracking-[0.2em]
              text-[#1A1A1A]
            ">
              {title}
            </h2>

          </div>


          {/* =================================================
              CLOSE BUTTON
             ================================================= */}

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
            aria-label="Close panel"
            className="
              absolute
              right-4
              top-1/2
              -translate-y-1/2

              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center

              rounded-full
              border
              border-[#D9D9D9]
              bg-white

              text-lg
              font-medium
              leading-none
              text-[#1A1A1A]

              shadow-sm
              transition-all
              duration-200

              hover:border-[#1A1A1A]
              hover:bg-[#1A1A1A]
              hover:text-white

              active:scale-95

              focus:outline-none
              focus:ring-2
              focus:ring-[#9B4819]/30
            "
          >
            <span className="relative -top-[1px]">
              ×
            </span>
          </button>

        </div>


        {/* =================================================
            CONTENT
           ================================================= */}

        <div
          className="
            flex-1
            min-h-0
            overflow-y-auto
            overscroll-contain
            p-5
            sm:p-6

            [scrollbar-width:thin]
          "
        >
          {children}
        </div>

      </div>
    </>
  );
};

export default SidePanel;