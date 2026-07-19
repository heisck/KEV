import { create } from 'zustand';

type FavoritesState = {
  /** Exam ids the user has bookmarked. */
  ids: Set<string>;
  isFavorite: (examId: string) => boolean;
  toggle: (examId: string) => void;
};

/** Local favorites until a backend bookmark API exists. */
export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  ids: new Set<string>(),
  isFavorite: (examId) => get().ids.has(examId),
  toggle: (examId) =>
    set((s) => {
      const next = new Set(s.ids);
      if (next.has(examId)) next.delete(examId);
      else next.add(examId);
      return { ids: next };
    }),
}));
