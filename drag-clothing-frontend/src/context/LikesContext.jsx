import React, { createContext, useContext, useState, useEffect } from 'react';

const LikesContext = createContext();

export const LikesProvider = ({ children }) => {
  // LocalStorage se data uthana taki refresh hone par likes na hatein
  const [likedItems, setLikedItems] = useState(() => {
    const saved = localStorage.getItem('user_likes');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('user_likes', JSON.stringify(likedItems));
  }, [likedItems]);

  // Toggle Function: Like hai to hatao, nahi hai to add karo
  const toggleLike = (product) => {
    setLikedItems((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const removeFromLikes = (id) => {
    setLikedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAllLikes = () => {
    setLikedItems([]);
  };

  return (
    <LikesContext.Provider value={{ likedItems, toggleLike, removeFromLikes, clearAllLikes }}>
      {children}
    </LikesContext.Provider>
  );
};

export const useLikes = () => useContext(LikesContext);