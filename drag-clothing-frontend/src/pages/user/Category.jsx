import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

const Category = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const { categoryName } = useParams(); // Yeh 'men' ya 'women' dega
  const navigate = useNavigate();
  const genderParam = categoryName?.toLowerCase() || 'men';
  const validProductTypes = new Set([
    "T_SHIRTS",
    "POLO_T_SHIRTS",
    "CASUAL_SHIRTS",
    "FORMAL_SHIRTS",
    "HOODIES_SWEATSHIRTS",
    "JACKETS",
    "BLAZERS",
    "JEANS",
    "TROUSERS",
    "CHINOS",
    "CARGO_PANTS",
    "SHORTS",
    "TRACK_PANTS",
    "JOGGERS",
    "KURTAS",
    "KURTA_SETS",
    "NEHRU_JACKETS",
    "SHERWANIS",
    "DHOTI_PANTS",
    "GYM_T_SHIRTS",
    "TRAINING_SHORTS",
    "SPORTS_TRACKSUITS",
    "RUNNING_WEAR",
    "SWEATERS",
    "HOODED_JACKETS",
    "PUFFER_JACKETS",
    "THERMAL_WEAR",
    "VESTS",
    "BRIEFS_BOXERS",
    "SLEEPWEAR_SETS",
    "LOUNGEWEAR",
  ]);

  // Data
  const categoryData = {
    men: [
      { title: "Topwear", color: "bg-[#EBE9E0]", image: "https://i.pinimg.com/736x/00/47/42/00474217a36059b9a958638a9080ae29.jpg", items: ["T-Shirts", "Polo T-Shirts", "Casual Shirts", "Formal Shirts", "Hoodies & Sweatshirts", "Jackets", "Blazers"] },
      { title: "Bottomwear", color: "bg-[#D4DFE6]", image: "https://i.pinimg.com/736x/0f/07/17/0f0717a06cd364ab52fe5a3e6b2053bf.jpg", items: ["Jeans", "Trousers", "Chinos", "Cargo Pants", "Shorts", "Track Pants", "Joggers"] },
      { title: "Ethnic Wear", color: "bg-[#E6D4D4]", image: "https://i.pinimg.com/736x/7a/7c/81/7a7c81fe7ab062e5ea57b05f4b440892.jpg", items: ["Kurtas", "Kurta Sets", "Nehru Jackets", "Sherwanis", "Dhoti Pants"] },
      { title: "Activewear", color: "bg-[#D9E2D5]", image: "https://i.pinimg.com/1200x/4b/51/01/4b5101edb47b0a1bfbc2f91ac69de47a.jpg", items: ["Gym T-Shirts", "Training Shorts", "Sports Tracksuits", "Running Wear"] },
      { title: "Winter Wear", color: "bg-[#DFD5C9]", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop", items: ["Sweaters", "Hooded Jackets", "Puffer Jackets", "Thermal Wear"] },
      { title: "Inner & Sleep", color: "bg-[#EAE6DF]", image: "https://i.pinimg.com/736x/0a/8d/b9/0a8db998b350bc6d0c4c1e1a555ff20f.jpg", items: ["Vests", "Briefs & Boxers", "Sleepwear Sets", "Loungewear"] }
    ],
    women: [
      { title: "Topwear", color: "bg-[#EBE9E0]", image: "https://i.pinimg.com/736x/76/16/2d/76162d352429fdedff3fb78247814631.jpg", items: ["T-Shirts", "Tops", "Shirts", "Blouses", "Crop Tops", "Tunics", "Hoodies"] },
      { title: "Bottomwear", color: "bg-[#D4DFE6]", image: "https://i.pinimg.com/736x/de/72/3d/de723dd305e6a111cd21e20e5550f40b.jpg", items: ["Jeans", "Trousers", "Leggings", "Jeggings", "Palazzos", "Skirts", "Shorts"] },
      { title: "Dresses", color: "bg-[#E2DCE0]", image: "https://i.pinimg.com/736x/b1/46/52/b14652c19c15c72b94765078a2f74266.jpg", items: ["Casual Dresses", "Party Dresses", "Maxi Dresses", "Mini Dresses", "Jumpsuits"] },
      { title: "Ethnic Wear", color: "bg-[#E6D4D4]", image: "https://i.pinimg.com/736x/52/27/20/52272072d38f330090505fc1e975df8e.jpg", items: ["Sarees", "Kurtis", "Kurta Sets", "Anarkali Suits", "Lehengas"] },
      { title: "Activewear", color: "bg-[#D9E2D5]", image: "https://i.pinimg.com/1200x/2d/68/a1/2d68a167f7fc79072cebe7b67e2fd4b3.jpg", items: ["Sports Bras", "Gym Tops", "Yoga Pants", "Track Pants"] },
      { title: "Inner & Sleep", color: "bg-[#EAE6DF]", image: "https://i.pinimg.com/1200x/93/40/78/9340785905366a81f7125f2f4889677a.jpg", items: ["Bras", "Panties", "Nightwear", "Loungewear"] },
    ]
  };

  const currentData = categoryData[genderParam] || categoryData.men;

  const normalizeGenderForPath = (value) => value.trim().toUpperCase();
  const normalizeCategoryForPath = (value) =>
    value.trim().replace(/\s+/g, ' ').toUpperCase();

  const toProductTypeEnum = (label) => {
    const normalized = label
      .trim()
      .replace(/&/g, " ")
      .replace(/-/g, " ")
      .replace(/\s+/g, "_")
      .toUpperCase();

    return validProductTypes.has(normalized) ? normalized : null;
  };

  // UNIVERSAL CLICK HANDLER
  const handleProductFetch = ({ category, type }) => {
    try {
      const typeEnum = type ? toProductTypeEnum(type) : null;
      const genderPath = normalizeGenderForPath(genderParam);
      const categoryPath = category ? normalizeCategoryForPath(category) : null;

      if (category && type) {
        // Fallback to category page if no strict enum exists for this display label.
        if (!typeEnum) {
          navigate(`/products/${genderPath}/${encodeURIComponent(categoryPath)}`);
          return;
        }

        navigate(`/products/${genderPath}/${encodeURIComponent(categoryPath)}/${encodeURIComponent(typeEnum)}`);
        return;
      }

      if (category) {
        navigate(`/products/${genderPath}/${encodeURIComponent(categoryPath)}`);
        return;
      }

      navigate('/products');
    } catch (error) {
      console.error("Error during navigation:", error);
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#1A1A1A] pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#9B4819] selection:text-white">
      <div className="max-w-[1400px] mx-auto">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 border-b border-[#E5E5E5] pb-10 relative"
        >
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate('/')} className="text-[10px] font-bold uppercase tracking-widest text-[#777] hover:text-[#1A1A1A] transition-colors">Home</button>
            <span className="text-[#CCC] text-[10px]">/</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">{genderParam}</span>
          </div>
          <h1 className="text-6xl md:text-[6rem] font-black uppercase tracking-tighter text-[#111] leading-[0.85]">
            {genderParam}'s <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#111] to-[#999]">Directory.</span>
          </h1>
        </motion.div>

        {/* BENTO GRID */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {currentData.map((category, index) => (
            <motion.div
              variants={fadeUp}
              key={index}
              className="relative rounded-3xl p-8 md:p-10 flex flex-col group overflow-hidden min-h-[420px] shadow-sm hover:shadow-xl transition-shadow duration-500"
            >
              {/* FIXED: Images Warning */}
              <div className="absolute inset-0 z-0 overflow-hidden bg-[#1A1A1A]">
                {category.image && (
                  <img src={category.image} alt={category.title} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:scale-110 group-hover:opacity-100 transition-all duration-[1.5s]" />
                )}
              </div>
              <div className={`absolute inset-0 ${category.color} opacity-90 backdrop-blur-md group-hover:opacity-40 group-hover:backdrop-blur-none transition-all duration-700 z-10 mix-blend-hard-light`}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent z-10 opacity-100 group-hover:opacity-90 transition-opacity duration-500"></div>

              <div className="flex justify-between items-start mb-8 relative z-20">
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none text-[#1A1A1A]">
                  {category.title}
                </h2>

                {/* 1. CIRCLE ICON CLICK (Main Category fetch) */}
                <button
                  onClick={() => handleProductFetch({ category: category.title })}
                  className="w-10 h-10 rounded-full border border-[#1A1A1A]/20 flex items-center justify-center bg-white/50 backdrop-blur-md hover:bg-white hover:scale-110 transition-all cursor-pointer z-30"
                  aria-label={`View all ${category.title}`}
                >
                  <ArrowUpRight size={18} />
                </button>
              </div>

              {/* LIST ITEMS */}
              <ul className="flex flex-col gap-1 mt-auto relative z-20">
                {category.items.map((item, i) => {
                  return (
                    <li key={i} className="group/item overflow-hidden">
                      {/* 2. SUBCATEGORY CLICK */}
                      <button
                        onClick={() => handleProductFetch({ category: category.title, type: item })}
                        className="flex items-center py-1.5 text-sm md:text-base font-bold text-[#1A1A1A]/70 group-hover:text-[#1A1A1A] hover:!text-[#9B4819] transition-all duration-300 w-full text-left"
                      >
                        <span className="w-0 opacity-0 -translate-x-4 group-hover/item:w-5 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300 ease-out flex items-center">
                          <ArrowRight size={14} className="currentColor" />
                        </span>
                        <span className="uppercase tracking-widest group-hover/item:translate-x-1 transition-transform duration-300 ease-out">
                          {item}
                        </span>
                      </button>
                    </li>
                  );
                })}

                {/* 3. VIEW ALL CLICK */}
                <li className="group/item overflow-hidden mt-4 pt-3 border-t border-[#1A1A1A]/10">
                  <button
                    onClick={() => handleProductFetch({ category: category.title })}
                    className="flex items-center py-1.5 text-sm md:text-base font-bold text-[#9B4819] hover:text-[#1A1A1A] transition-all duration-300 w-full text-left"
                  >
                    <span className="w-0 opacity-0 -translate-x-4 group-hover/item:w-5 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300 ease-out flex items-center">
                      <ArrowRight size={14} className="currentColor" />
                    </span>
                    <span className="uppercase tracking-widest group-hover/item:translate-x-1 transition-transform duration-300 ease-out">
                      VIEW ALL {category.title}
                    </span>
                  </button>
                </li>
              </ul>

            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Category;
