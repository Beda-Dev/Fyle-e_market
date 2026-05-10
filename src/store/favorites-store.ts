"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/mock-data";

// ─────────────────────────────────────────────────────────────
// Interface décrivant l'état et les actions du store favoris
// ─────────────────────────────────────────────────────────────
interface FavoritesState {
  /** Liste des produits ajoutés aux favoris */
  items: Product[];

  /** Ajouter un produit aux favoris */
  addFavorite: (product: Product) => void;

  /** Retirer un produit des favoris par son ID */
  removeFavorite: (productId: string) => void;

  /** Basculer un produit : l'ajouter s'il n'y est pas, le retirer sinon */
  toggleFavorite: (product: Product) => void;

  /** Vérifier si un produit est dans les favoris */
  isFavorite: (productId: string) => boolean;

  /** Vider tous les favoris */
  clearFavorites: () => void;
}

// ─────────────────────────────────────────────────────────────
// Création du store avec persistance dans le localStorage
// Les favoris sont conservés même après fermeture du navigateur
// ─────────────────────────────────────────────────────────────
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],

      addFavorite: (product: Product) => {
        // On vérifie que le produit n'est pas déjà dans la liste
        const alreadyExists = get().items.some((item) => item.id === product.id);
        if (alreadyExists) return;

        // On ajoute le produit à la fin de la liste
        set((state) => ({ items: [...state.items, product] }));
      },

      removeFavorite: (productId: string) => {
        // On filtre pour retirer le produit ciblé
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },

      toggleFavorite: (product: Product) => {
        const exists = get().items.some((item) => item.id === product.id);
        if (exists) {
          // Déjà en favori → on le retire
          get().removeFavorite(product.id);
        } else {
          // Pas en favori → on l'ajoute
          get().addFavorite(product);
        }
      },

      isFavorite: (productId: string) => {
        return get().items.some((item) => item.id === productId);
      },

      clearFavorites: () => {
        set({ items: [] });
      },
    }),
    {
      // Clé utilisée dans le localStorage du navigateur
      name: "eburnie-favorites",
    }
  )
);
