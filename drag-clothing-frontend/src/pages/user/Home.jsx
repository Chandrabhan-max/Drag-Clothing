import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';

import { Link, useNavigate, useLocation } from 'react-router-dom';

import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useVelocity,
  useAnimationFrame,
  useMotionValue,
  useMotionValueEvent,
  useAnimation
} from 'framer-motion';

import {
  ArrowUpRight,
  MoveRight,
  Plus,
  Check,
} from 'lucide-react';

import Footer from '../../components/Footer';

const GALLERY_IMAGES = [
  {
    id: '01',
    title: 'Merch',
    subtitle: 'Structured Chaos',
    url: 'https://i.pinimg.com/1200x/e8/e4/a7/e8e4a76077891a8c514a56e2f1743321.jpg',
  },
  {
    id: '02',
    title: 'Autmn Wear',
    subtitle: 'Soft Architecture',
    url: 'https://i.pinimg.com/736x/75/0b/ed/750bed36def6786fb9490f3cb7c76090.jpg',
  },
  {
    id: '03',
    title: 'For Her',
    subtitle: 'Essential for her',
    url: 'https://i.pinimg.com/736x/99/f1/03/99f1031363b879610dc0f8713d09cc1e.jpg',
  },
  {
    id: '04',
    title: 'For Him',
    subtitle: 'Ground Control',
    url: 'https://littleboxindia.com/cdn/shop/files/Men_Brown_Button_Down_Full_Sleeve_Jacket_720x.webp?v=1769669708',
  },
];

const wrap = (min, max, v) => {
  const rangeSize = max - min;

  return (
    ((((v - min) % rangeSize) + rangeSize) %
      rangeSize) +
    min
  );
};

const ToastContainer = ({
  toasts,
  removeToast,
}) => {
  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[200] flex flex-col gap-3 pointer-events-none w-[calc(100vw-2rem)] sm:w-auto">

      <AnimatePresence>

        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{
              opacity: 0,
              x: 50,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              x: 20,
              scale: 0.9,
            }}
            className="bg-[#1A1A1A] text-[#EBE9E0] px-4 sm:px-6 py-4 border border-white/10 shadow-2xl flex items-center gap-3 sm:gap-4 w-full sm:min-w-[300px]"
          >

            <div className="bg-[#9B4819] rounded-full p-1 text-white">
              <Check
                size={14}
                strokeWidth={4}
              />
            </div>

            <div>

              <h4 className="text-xs font-black uppercase tracking-widest">
                {toast.title}
              </h4>

              <p className="text-[10px] opacity-60 font-medium uppercase tracking-wider">
                {toast.message}
              </p>

            </div>

          </motion.div>
        ))}

      </AnimatePresence>

    </div>
  );
};

const MagneticButton = ({
  children,
  className,
  onClick,
}) => {
  const ref = useRef(null);

  const [position, setPosition] =
    useState({
      x: 0,
      y: 0,
    });

  const handleMouse = (e) => {
    if (!ref.current) return;

    const {
      clientX,
      clientY,
    } = e;

    const {
      height,
      width,
      left,
      top,
    } =
      ref.current.getBoundingClientRect();

    const middleX =
      clientX -
      (left + width / 2);

    const middleY =
      clientY -
      (top + height / 2);

    setPosition({
      x: middleX,
      y: middleY,
    });
  };

  const reset = () =>
    setPosition({
      x: 0,
      y: 0,
    });

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{
        x: position.x * 0.2,
        y: position.y * 0.2,
      }}
      transition={{
        type: 'spring',
        stiffness: 150,
        damping: 15,
        mass: 0.1,
      }}
      className={className}
    >
      {children}
    </motion.button>
  );
};

const ParallaxText = ({
  children,
  baseVelocity = 100,
}) => {
  const baseX = useMotionValue(0);

  const { scrollY } =
    useScroll();

  const scrollVelocity =
    useVelocity(scrollY);

  const smoothVelocity =
    useSpring(
      scrollVelocity,
      {
        damping: 50,
        stiffness: 400,
      }
    );

  const velocityFactor =
    useTransform(
      smoothVelocity,
      [0, 1000],
      [0, 5],
      {
        clamp: false,
      }
    );

  const x = useTransform(
    baseX,
    (v) =>
      `${wrap(
        -20,
        -45,
        v
      )}%`
  );

  const directionFactor =
    useRef(1);

  useAnimationFrame(
    (t, delta) => {
      let moveBy =
        directionFactor.current *
        baseVelocity *
        (delta / 1000);

      if (
        velocityFactor.get() < 0
      ) {
        directionFactor.current =
          -1;
      } else if (
        velocityFactor.get() > 0
      ) {
        directionFactor.current =
          1;
      }

      moveBy +=
        directionFactor.current *
        moveBy *
        velocityFactor.get();

      baseX.set(
        baseX.get() + moveBy
      );
    }
  );

  return (
    <div className="overflow-hidden flex flex-nowrap m-0 select-none py-4">

      <motion.div
        style={{ x }}
        className="flex whitespace-nowrap text-5xl sm:text-6xl md:text-9xl font-black uppercase tracking-tighter"
      >

        {Array(4)
          .fill(children)
          .map((text, i) => (
            <span
              key={i}
              className="block mr-12 text-[#1A1A1A] opacity-20"
            >
              {text}
            </span>
          ))}

      </motion.div>

    </div>
  );
};

const HorizontalStory = ({
  addToast,
}) => {
  const targetRef =
    useRef(null);

  const {
    scrollYProgress,
  } = useScroll({
    target: targetRef,
  });

  const x = useTransform(
    scrollYProgress,
    [0, 1],
    ['1%', '-75%']
  );

  const navigate =
    useNavigate();

  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  return (
    <section
      ref={targetRef}
      className="relative h-[240vh] sm:h-[300vh] bg-[#1A1A1A]"
    >

      <div className="sticky top-0 flex h-screen items-center overflow-hidden">

        <motion.div
          style={{ x }}
          className="flex gap-5 sm:gap-8 md:gap-10 pl-5 sm:pl-8 md:pl-20"
        >

          <div className="flex flex-col justify-center min-w-[280px] sm:min-w-[400px] md:min-w-[600px] text-[#EBE9E0]">

            <h2 className="text-4xl sm:text-5xl md:text-8xl font-black uppercase tracking-tighter mb-4 sm:mb-6">
              The Limits
            </h2>

            <p className="text-base sm:text-xl md:text-2xl font-light opacity-70 max-w-md">
              Fashion should fit your identity, not limit it.
            </p>

          </div>

          {GALLERY_IMAGES.map(
            (img) => (
              <div
                key={img.id}
                onClick={() => {

                  if (img.id === '01') {
                    navigate('/products?merch=true');
                    return;
                  }

                  if (img.id === '02') {
                    addToast(
                      'COMING SOON',
                      'Autumn Wear collection is coming soon.'
                    );
                    return;
                  }

                  if (img.id === '03') {
                    navigate('/products?gender=WOMEN');
                    return;
                  }

                  if (img.id === '04') {
                    navigate('/products?gender=MEN');
                    return;
                  }
                }}
                className="relative group h-[62vh] sm:h-[70vh] md:h-[80vh] w-[82vw] sm:w-[70vw] md:w-[45vw] overflow-hidden bg-gray-900 cursor-pointer"
              >

                <img
                  src={img.url}
                  alt={img.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />

                <div className="absolute bottom-0 left-0 p-5 sm:p-8 w-full bg-gradient-to-t from-black/90 to-transparent">

                  <span className="text-white/50 text-xs font-bold tracking-[0.3em] uppercase mb-2 block">
                    {img.subtitle}
                  </span>

                  <h3 className="text-3xl sm:text-4xl md:text-6xl text-white font-black uppercase tracking-tighter">
                    {img.title}
                  </h3>

                </div>

              </div>
            )
          )}

          <div className="flex flex-col justify-center min-w-[240px] sm:min-w-[300px] text-[#EBE9E0] pr-8 sm:pr-20">

            <MagneticButton
              onClick={() =>
                navigate(
                  '/category/men'
                )
              }
              className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors cursor-pointer group"
            >

              <div className="flex flex-col items-center">

                <span className="text-xs uppercase tracking-widest font-bold">
                  View All
                </span>

                <ArrowUpRight className="group-hover:rotate-45 transition-transform" />

              </div>

            </MagneticButton>

          </div>

        </motion.div>

      </div>

    </section>
  );
};

const FashionManifesto = () => {
  const sectionRef = useRef(null);

  const { scrollY } = useScroll();

  const [sectionTop, setSectionTop] =
    useState(0);

  const [viewportHeight, setViewportHeight] =
    useState(
      typeof window !== 'undefined'
        ? window.innerHeight
        : 900
    );

  useLayoutEffect(() => {
    const updatePosition = () => {
      if (!sectionRef.current) return;

      const rect =
        sectionRef.current.getBoundingClientRect();

      setSectionTop(
        rect.top + window.scrollY
      );

      setViewportHeight(
        window.innerHeight
      );
    };

    updatePosition();

    window.addEventListener(
      'resize',
      updatePosition
    );

    window.addEventListener(
      'load',
      updatePosition
    );

    return () => {
      window.removeEventListener(
        'resize',
        updatePosition
      );

      window.removeEventListener(
        'load',
        updatePosition
      );
    };
  }, []);

  const animationStart =
    sectionTop -
    viewportHeight * 0.9;

  const animationEnd =
    sectionTop;

  const progress = useTransform(
    scrollY,
    [animationStart, animationEnd],
    [0, 1],
    {
      clamp: true,
    }
  );

  /* =========================
     DESKTOP ANIMATION
     ========================= */

  const imageX = useTransform(
    progress,
    [0, 0.2, 0.4, 0.6, 0.8, 1],
    [
      '-32vw',
      '-25vw',
      '-18vw',
      '-11vw',
      '-5vw',
      '0vw',
    ]
  );

  const textX = useTransform(
    progress,
    [0, 0.2, 0.4, 0.6, 0.8, 1],
    [
      '32vw',
      '25vw',
      '18vw',
      '11vw',
      '5vw',
      '0vw',
    ]
  );

  const imageRotateY = useTransform(
    progress,
    [0, 0.25, 0.5, 0.75, 1],
    [-16, -12, -6, -2, 0]
  );

  const textRotateY = useTransform(
    progress,
    [0, 0.25, 0.5, 0.75, 1],
    [16, 12, 6, 2, 0]
  );

  const imageScale = useTransform(
    progress,
    [0, 0.3, 0.6, 1],
    [0.82, 0.9, 0.96, 1]
  );

  const textScale = useTransform(
    progress,
    [0, 0.3, 0.6, 1],
    [0.84, 0.91, 0.96, 1]
  );

  const imageOpacity = useTransform(
    progress,
    [0, 0.1, 0.25, 1],
    [0.15, 0.35, 0.7, 1]
  );

  const textOpacity = useTransform(
    progress,
    [0, 0.1, 0.25, 1],
    [0.15, 0.35, 0.7, 1]
  );

  return (
    <section
      ref={sectionRef}
      className="
        relative
        overflow-hidden
        bg-[#EBE9E0]
        min-h-0
        md:min-h-screen
      "
    >

      {/* =========================================
          BACKGROUND WORD
          ========================================= */}

      <div
        className="
          absolute
          inset-0
          hidden
          md:flex
          items-center
          justify-center
          pointer-events-none
          overflow-hidden
        "
      >
        <div
          className="
            whitespace-nowrap
            text-[20vw]
            font-black
            uppercase
            tracking-[-0.08em]
            text-[#1A1A1A]
            opacity-[0.04]
          "
        >
          IDENTITY
        </div>
      </div>

      {/* =========================================
          DESKTOP VERSION
          ========================================= */}

      <div
        className="
          relative
          z-10
          hidden
          min-h-screen
          items-center
          justify-center
          px-10
          md:flex
        "
        style={{
          perspective: '1600px',
        }}
      >

        <div
          className="
            relative
            flex
            min-h-screen
            w-full
            max-w-[1500px]
            items-center
          "
        >

          {/* DESKTOP IMAGE */}

          <motion.div
            style={{
              x: imageX,
              rotateY: imageRotateY,
              scale: imageScale,
              opacity: imageOpacity,
            }}
            className="
              absolute
              left-[1%]
              top-1/2
              z-10
              h-[72vh]
              max-h-[760px]
              w-[40vw]
              max-w-[570px]
              -translate-y-1/2
              will-change-transform
            "
          >

            <div className="
              relative
              h-full
              w-full
              overflow-hidden
              bg-[#D5D3CD]
              shadow-2xl
            ">

              <img
                src="/bnw.png"
                alt="Fashion Editorial"
                className="
                  h-full
                  w-full
                  object-cover
                  grayscale
                "
              />

              <div className="
                pointer-events-none
                absolute
                inset-0
                bg-black/[0.03]
              " />

            </div>

          </motion.div>

          {/* DESKTOP TEXT */}

          <motion.div
            style={{
              x: textX,
              rotateY: textRotateY,
              scale: textScale,
              opacity: textOpacity,
            }}
            className="
              absolute
              right-[2%]
              top-1/2
              z-20
              w-[58vw]
              max-w-[820px]
              -translate-y-1/2
              will-change-transform
            "
          >

            <div className="
              mb-6
              flex
              items-center
              gap-4
            ">

              <span className="
                h-[3px]
                w-12
                bg-[#9B4819]
              " />

              <span className="
                h-px
                w-24
                bg-[#1A1A1A]/30
              " />

            </div>

            <p className="
              mb-4
              text-[9px]
              font-black
              uppercase
              tracking-[0.4em]
              text-[#9B4819]
            ">
              IDENTITY OVER TRENDS
            </p>

            <h2 className="text-[#111]">

              <span
                className="
                  block
                  whitespace-nowrap
                  text-[6.5vw]
                  leading-[0.82]
                  tracking-[-0.045em]
                "
                style={{
                  fontFamily:
                    "Georgia, 'Times New Roman', serif",
                }}
              >
                DON&apos;T WEAR
              </span>

              <span
                className="
                  mt-3
                  block
                  pl-[4vw]
                  text-[6.5vw]
                  leading-[0.78]
                  italic
                  tracking-[-0.065em]
                  text-[#9B4819]
                "
                style={{
                  fontFamily:
                    "Georgia, 'Times New Roman', serif",
                }}
              >
                THE TREND.
              </span>

              <span className="
                mt-7
                block
                text-[4.7vw]
                font-black
                uppercase
                leading-[0.82]
                tracking-[-0.06em]
              ">
                WEAR THE
              </span>

              <span className="
                block
                pl-[4vw]
                text-[4.7vw]
                font-black
                uppercase
                leading-[0.82]
                tracking-[-0.06em]
              ">
                STATEMENT.
              </span>

            </h2>

            <div className="
              mb-6
              mt-8
              flex
              items-center
              gap-4
            ">

              <span className="
                h-[3px]
                w-12
                bg-[#9B4819]
              " />

              <span className="
                h-px
                flex-1
                bg-[#1A1A1A]/25
              " />

            </div>

            <div className="
              flex
              items-end
              gap-8
            ">

              <p className="
                max-w-xl
                text-[1.22rem]
                font-medium
                leading-[1.3]
                text-[#1A1A1A]
              ">
                Fashion isn&apos;t here to define you.

                <span className="
                  font-semibold
                  text-[#9B4819]
                ">
                  {' '}You define yourself
                </span>{' '}

                through what you wear, what you stand
                for, and the life you choose to live.
              </p>

              <div className="
                flex
                shrink-0
                items-stretch
                gap-4
              ">

                <div className="
                  w-px
                  bg-[#1A1A1A]/25
                " />

                <div>

                  <p className="
                    text-[8px]
                    font-black
                    uppercase
                    tracking-[0.28em]
                    text-[#1A1A1A]/50
                  ">
                    DRESS
                  </p>

                  <p className="
                    mt-2
                    text-[8px]
                    font-black
                    uppercase
                    tracking-[0.28em]
                    text-[#1A1A1A]/50
                  ">
                    DIFFERENT
                  </p>

                  <p className="
                    mt-2
                    text-[8px]
                    font-black
                    uppercase
                    tracking-[0.28em]
                    text-[#9B4819]
                  ">
                    LIVE ORIGINAL
                  </p>

                  <div className="
                    mt-3
                    h-[2px]
                    w-9
                    bg-[#9B4819]
                  " />

                </div>

              </div>

            </div>

          </motion.div>

        </div>

      </div>

      {/* =========================================
          MOBILE VERSION
          NO ABSOLUTE OVERLAPPING
          ========================================= */}

      <div
        className="
          relative
          z-10
          flex
          w-full
          flex-col
          px-4
          py-16
          sm:px-6
          sm:py-20
          md:hidden
        "
      >

        {/* IMAGE */}

        <div className="
          relative
          mx-auto
          w-full
          max-w-[500px]
        ">

          <div className="
            relative
            aspect-[4/5]
            w-full
            overflow-hidden
            bg-[#D5D3CD]
            shadow-xl
          ">

            <img
              src="/bnw.png"
              alt="Fashion Editorial"
              className="
                h-full
                w-full
                object-cover
                grayscale
              "
            />

          </div>

        </div>

        {/* TEXT */}

        <div className="
          mx-auto
          mt-8
          w-full
          max-w-[600px]
        ">

          {/* TOP LINE */}

          <div className="
            mb-5
            flex
            items-center
            gap-4
          ">

            <span className="
              h-[3px]
              w-14
              shrink-0
              bg-[#9B4819]
            " />

            <span className="
              h-px
              flex-1
              bg-[#1A1A1A]/20
            " />

          </div>

          {/* LABEL */}

          <p className="
            mb-4
            text-[9px]
            font-black
            uppercase
            tracking-[0.3em]
            text-[#9B4819]
          ">
            IDENTITY OVER TRENDS
          </p>

          {/* MAIN HEADING */}

          <h2 className="text-[#111]">

            <span
              className="
                block
                text-[13vw]
                leading-[0.88]
                tracking-[-0.055em]
              "
              style={{
                fontFamily:
                  "Georgia, 'Times New Roman', serif",
              }}
            >
              DON&apos;T WEAR
            </span>

            <span
              className="
                mt-2
                block
                pl-[7vw]
                text-[12.5vw]
                leading-[0.88]
                italic
                tracking-[-0.06em]
                text-[#9B4819]
              "
              style={{
                fontFamily:
                  "Georgia, 'Times New Roman', serif",
              }}
            >
              THE TREND.
            </span>

            <span className="
              mt-7
              block
              text-[10.5vw]
              font-black
              uppercase
              leading-[0.88]
              tracking-[-0.065em]
            ">
              WEAR THE
            </span>

            <span className="
              block
              pl-[7vw]
              text-[10.5vw]
              font-black
              uppercase
              leading-[0.88]
              tracking-[-0.065em]
            ">
              STATEMENT.
            </span>

          </h2>

          {/* DIVIDER */}

          <div className="
            mb-6
            mt-8
            flex
            items-center
            gap-4
          ">

            <span className="
              h-[3px]
              w-14
              shrink-0
              bg-[#9B4819]
            " />

            <span className="
              h-px
              flex-1
              bg-[#1A1A1A]/25
            " />

          </div>

          {/* DESCRIPTION */}

          <p className="
            max-w-full
            text-[16px]
            font-medium
            leading-[1.45]
            text-[#1A1A1A]
            sm:text-[18px]
          ">

            Fashion isn&apos;t here to define you.

            <span className="
              font-semibold
              text-[#9B4819]
            ">
              {' '}You define yourself
            </span>{' '}

            through what you wear, what you stand for,
            and the life you choose to live.

          </p>

          {/* TAGS */}

          <div className="
            mt-8
            flex
            items-start
            gap-4
          ">

            <div className="
              mt-1
              h-12
              w-px
              shrink-0
              bg-[#1A1A1A]/25
            " />

            <div className="flex flex-wrap gap-x-5 gap-y-2">

              <span className="
                text-[8px]
                font-black
                uppercase
                tracking-[0.25em]
                text-[#1A1A1A]/50
              ">
                DRESS
              </span>

              <span className="
                text-[8px]
                font-black
                uppercase
                tracking-[0.25em]
                text-[#1A1A1A]/50
              ">
                DIFFERENT
              </span>

              <span className="
                text-[8px]
                font-black
                uppercase
                tracking-[0.25em]
                text-[#9B4819]
              ">
                LIVE ORIGINAL
              </span>

            </div>

          </div>

        </div>

        {/* MOBILE FOOTER LABELS */}

        <div className="
          mt-12
          flex
          flex-col
          gap-2
          border-t
          border-[#1A1A1A]/10
          pt-5
          sm:flex-row
          sm:items-center
          sm:justify-between
        ">

          <span className="
            text-[8px]
            font-black
            uppercase
            tracking-[0.3em]
            text-[#1A1A1A]/30
          ">
            EST. 2026 — JAIPUR
          </span>

          <span className="
            text-[8px]
            font-black
            uppercase
            tracking-[0.3em]
            text-[#9B4819]
          ">
            BUILT ON INDIVIDUALITY
          </span>

        </div>

      </div>

      {/* DESKTOP FOOTER LABELS */}

      <div className="
        absolute
        bottom-4
        left-0
        right-0
        z-30
        hidden
        items-center
        justify-between
        px-12
        md:flex
      ">

        <span className="
          text-[8px]
          font-black
          uppercase
          tracking-[0.3em]
          text-[#1A1A1A]/30
        ">
          EST. 2026 — JAIPUR
        </span>

        <span className="
          text-[8px]
          font-black
          uppercase
          tracking-[0.3em]
          text-[#9B4819]
        ">
          BUILT ON INDIVIDUALITY
        </span>

      </div>

    </section>
  );
};

const Home = () => {

  const [isLoading, setIsLoading] =
    useState(() => {

      const hasLoaded =
        sessionStorage.getItem(
          'hasLoadedBefore'
        );

      return !hasLoaded;

    });

  const [toasts, setToasts] =
    useState([]);

  const [latestProducts, setLatestProducts] =
    useState([]);

  const navigate =
    useNavigate();

  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  const addToast = (
    title,
    message
  ) => {

    const id =
      Date.now();

    setToasts((prev) => [
      ...prev,
      {
        id,
        title,
        message,
      },
    ]);

    setTimeout(() => {

      setToasts(
        (prev) =>
          prev.filter(
            (toast) =>
              toast.id !== id
          )
      );

    }, 3000);

  };

  const removeToast = (
    id
  ) => {

    setToasts(
      (prev) =>
        prev.filter(
          (toast) =>
            toast.id !== id
        )
    );

  };

  useLayoutEffect(() => {
  }, []);

  useEffect(() => {

    const fetchLatest =
      async () => {

        try {

          const response =
            await fetch(
              '`${import.meta.env.VITE_API_URL}/products?page=1&limit=4`'
            );

          const data =
            await response.json();

          const products =
            data?.data?.data ||
            data?.data ||
            [];

          setLatestProducts(
            products
          );

        } catch (err) {

          console.error(
            'Failed to fetch latest products',
            err
          );

        }

      };

    fetchLatest();

  }, []);

  useEffect(() => {

    if (isLoading) {

      document.body.style.overflow =
        'hidden';

      const exitTimer =
        setTimeout(() => {

          setIsLoading(false);

          document.body.style.overflow =
            '';

          sessionStorage.setItem(
            'hasLoadedBefore',
            'true'
          );

        }, 3500);

      return () => {

        clearTimeout(
          exitTimer
        );

        document.body.style.overflow =
          '';

      };

    }

  }, [isLoading]);

  return (
    <>
      <AnimatePresence>

        {isLoading && (

          <motion.div
            key="preloader"
            initial={{
              opacity: 1,
            }}
            exit={{
              y: '-100%',
              transition: {
                duration: 3,
                ease: [
                  0.76,
                  0,
                  0.24,
                  1,
                ],
              },
            }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
          >

            <div className="absolute inset-0 bg-black" />

            <video
              autoPlay
              muted
              playsInline
              loop
              className="absolute inset-0 w-full h-full object-cover"
            >

              <source
                src="/front.mp4"
                type="video/mp4"
              />

            </video>

          </motion.div>

        )}

      </AnimatePresence>

      <ToastContainer
        toasts={toasts}
        removeToast={
          removeToast
        }
      />

      <div className="relative w-full bg-[#EBE9E0] text-[#1A1A1A] font-sans selection:bg-[#1A1A1A] selection:text-white">

        <section className="relative w-full min-h-[calc(100svh-64px)] sm:h-[calc(100vh-72px)] mt-[64px] sm:mt-[72px] flex flex-col justify-end pb-10 sm:pb-20 px-4 sm:px-6 overflow-hidden">

          <motion.div
            initial={{
              scale: 1.2,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              duration: 1.5,
              ease: 'easeOut',
            }}
            className="absolute inset-0 z-0 pointer-events-none"
          >

            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#EBE9E0]" />

            <img
              src="live3.png"
              className="w-full h-full object-cover opacity-80"
              alt="Hero"
            />

          </motion.div>

          <div className="relative z-10 w-full max-w-[1600px] mx-auto">

            <motion.div
              initial={{
                y: 100,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              transition={{
                delay: 0.5,
                duration: 1,
              }}
            >

              <h1 className="text-[18vw] sm:text-[14vw] leading-[0.82] uppercase tracking-[-0.055em]">

                <br />

                <span className="ml-[6vw] sm:ml-[10vw] italic font-serif font-light text-[#9B4819]">
                  AESTHETIC
                </span>

              </h1>

            </motion.div>

          </div>

        </section>

        <FashionManifesto />

        <div className="bg-[#1A1A1A] py-8 border-y border-white/5">

          <ParallaxText
            baseVelocity={-3}
          >
            NEW SEASON — 2026 — URBAN NOMAD —
          </ParallaxText>

        </div>

        <HorizontalStory
          addToast={addToast}
        />

        <section className="py-20 sm:py-28 md:py-40 px-4 sm:px-6 bg-[#EBE9E0]">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-10 sm:mb-16 max-w-[1600px] mx-auto">

            <h2 className="text-4xl sm:text-5xl md:text-8xl font-black uppercase tracking-tighter">
              Latest Drop
            </h2>

            <div
              onClick={() =>
                navigate('/products')
              }
              className="flex items-center gap-3 cursor-pointer group pb-4"
            >

              <span className="text-xs font-bold uppercase tracking-[0.2em]">
                Explore Collection
              </span>

              <span className="flex items-center justify-center w-8 h-8 rounded-full border border-[#1A1A1A] group-hover:bg-[#1A1A1A] group-hover:text-white transition-all duration-300">

                <MoveRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform duration-300"
                />

              </span>

            </div>

          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6 max-w-[1600px] mx-auto">

            {latestProducts.map(
              (product, i) => (

                <motion.div
                  key={
                    product.id ||
                    i
                  }
                  initial={{
                    opacity: 0,
                    y: 30,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      i * 0.1,
                  }}
                  className="group cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/product/${product.id}`
                    )
                  }
                >

                  <div className="relative overflow-hidden mb-3 sm:mb-6 aspect-[3/4] bg-gray-200">

                    <img
                      src={
                        product.imageUrl ||
                        product.image ||
                        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format'
                      }
                      alt={
                        product.name
                      }
                      className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                      onError={(
                        e
                      ) => {

                        e.currentTarget.onerror =
                          null;

                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format';

                      }}
                    />

                    <div className="absolute top-6 right-6 bg-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 shadow-lg hover:scale-110 active:scale-95">

                      <Plus
                        size={20}
                        color="#1A1A1A"
                      />

                    </div>

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">

                      <span className="text-white text-xs font-bold uppercase tracking-[0.2em] border border-white/50 px-6 py-3 backdrop-blur-md hover:bg-white hover:text-black transition-colors">
                        View Product
                      </span>

                    </div>

                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2 px-1">

                    <div>

                      <h3 className="text-sm sm:text-lg font-bold uppercase tracking-tight group-hover:text-[#9B4819] transition-colors">
                        {product.name}
                      </h3>

                      <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mt-1 font-bold">
                        {product.type ||
                          'Collection'}
                      </p>

                    </div>

                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">

                      {product.hasFlashSale ? (

                        <>

                          <span className="text-sm sm:text-lg font-bold text-[#9B4819]">

                            ₹
                            {Number(
                              product.discountedPrice
                            ).toLocaleString(
                              'en-IN'
                            )}

                          </span>

                          <span className="text-xs text-gray-400 line-through">

                            ₹
                            {Number(
                              product.originalPrice
                            ).toLocaleString(
                              'en-IN'
                            )}

                          </span>

                        </>

                      ) : (

                        <span className="text-sm sm:text-lg font-bold">

                          ₹
                          {Number(
                            product.price
                          ).toLocaleString(
                            'en-IN'
                          )}

                        </span>

                      )}

                    </div>

                  </div>

                </motion.div>

              )
            )}

          </div>

        </section>

        <Footer />

      </div>
    </>
  );
};

export default Home;