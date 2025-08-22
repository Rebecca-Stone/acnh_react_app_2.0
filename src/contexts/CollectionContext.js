import React, { createContext, useContext, useState, useEffect } from "react";

const CollectionContext = createContext();

export const useCollection = () => {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error("useCollection must be used within a CollectionProvider");
  }
  return context;
};

export const CollectionProvider = ({ children }) => {
  const [haveList, setHaveList] = useState([]);
  const [wantList, setWantList] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedHaveList = localStorage.getItem("acnh-have-list");
      const savedWantList = localStorage.getItem("acnh-want-list");

      if (savedHaveList) {
        setHaveList(JSON.parse(savedHaveList));
      }
      if (savedWantList) {
        setWantList(JSON.parse(savedWantList));
      }
    } catch (error) {
      console.error("Error loading collection from localStorage:", error);
    }
  }, []);

  // Save to localStorage whenever lists change
  useEffect(() => {
    try {
      localStorage.setItem("acnh-have-list", JSON.stringify(haveList));
    } catch (error) {
      console.error("Error saving have list to localStorage:", error);
    }
  }, [haveList]);

  useEffect(() => {
    try {
      localStorage.setItem("acnh-want-list", JSON.stringify(wantList));
    } catch (error) {
      console.error("Error saving want list to localStorage:", error);
    }
  }, [wantList]);

  const addToHave = (villagerId) => {
    setHaveList((prev) => {
      if (!prev.includes(villagerId)) {
        return [...prev, villagerId];
      }
      return prev;
    });
    // Remove from want list if it's there
    setWantList((prev) => prev.filter((id) => id !== villagerId));
  };

  const removeFromHave = (villagerId) => {
    setHaveList((prev) => prev.filter((id) => id !== villagerId));
  };

  const addToWant = (villagerId) => {
    setWantList((prev) => {
      if (!prev.includes(villagerId)) {
        return [...prev, villagerId];
      }
      return prev;
    });
    // Remove from have list if it's there
    setHaveList((prev) => prev.filter((id) => id !== villagerId));
  };

  const removeFromWant = (villagerId) => {
    setWantList((prev) => prev.filter((id) => id !== villagerId));
  };

  const isInHaveList = (villagerId) => haveList.includes(villagerId);
  const isInWantList = (villagerId) => wantList.includes(villagerId);

  const toggleHave = (villagerId) => {
    if (isInHaveList(villagerId)) {
      removeFromHave(villagerId);
    } else {
      addToHave(villagerId);
    }
  };

  const toggleWant = (villagerId) => {
    if (isInWantList(villagerId)) {
      removeFromWant(villagerId);
    } else {
      addToWant(villagerId);
    }
  };

  const getCollectionStats = () => ({
    haveCount: haveList.length,
    wantCount: wantList.length,
    totalTracked: haveList.length + wantList.length,
  });

  const value = {
    haveList,
    wantList,
    addToHave,
    removeFromHave,
    addToWant,
    removeFromWant,
    isInHaveList,
    isInWantList,
    toggleHave,
    toggleWant,
    getCollectionStats,
  };

  return (
    <CollectionContext.Provider value={value}>
      {children}
    </CollectionContext.Provider>
  );
};
