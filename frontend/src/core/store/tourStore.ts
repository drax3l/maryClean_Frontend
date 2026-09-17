import { create } from 'zustand';

interface TourState {
  run: boolean;
  tourKey: number;
  startTour: () => void;
  stopTour: () => void;
}

export const useTourStore = create<TourState>((set) => ({
  run: false,
  tourKey: 0,
  startTour: () => set((state) => ({ run: true, tourKey: state.tourKey + 1 })),
  stopTour: () => set({ run: false }),
}));
