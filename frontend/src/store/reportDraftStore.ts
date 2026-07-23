import { create } from 'zustand';

type ReportDraftState = {
  draftHtml: string;
  setDraftHtml: (html: string) => void;
  clearDraft: () => void;
};

export const useReportDraftStore = create<ReportDraftState>((set) => ({
  draftHtml: '',
  setDraftHtml: (html) => set({ draftHtml: html }),
  clearDraft: () => set({ draftHtml: '' }),
}));
