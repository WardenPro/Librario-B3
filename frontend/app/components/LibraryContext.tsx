"use client";

import { createContext, useContext, useState, useEffect } from "react";

const LibraryContext = createContext<{
  libraryName: string;
  setLibraryName: (name: string) => void;
}>({
  libraryName: "WardenPro Librario",
  setLibraryName: () => {},
});

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [libraryName, setLibraryName] = useState("WardenPro Librario");

  useEffect(() => {
    const fetchLibraryName = async () => {
      try {
        const response = await fetch("/api/library/name");
        if (response.ok) {
          const data = await response.json();
          setLibraryName(data.name);
        }
      } catch (error) {
        console.error("⚠️ Erreur lors de la récupération du nom :", error);
      }
    };

    fetchLibraryName();
  }, []);

  useEffect(() => {
    document.title = libraryName;
  }, [libraryName]);

  return (
    <LibraryContext.Provider value={{ libraryName, setLibraryName }}>
      {children}
    </LibraryContext.Provider>
  );
}

// Hook personnalisé
export function useLibrary() {
  return useContext(LibraryContext);
}
