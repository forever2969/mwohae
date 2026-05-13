import { create } from 'zustand'

interface DateStore {
  isDrawing: boolean
  drawnValue: string | null
  setDrawing: (drawing: boolean) => void
  setDrawnValue: (value: string | null) => void
  resetDraw: () => void
}

export const useDateStore = create<DateStore>((set) => ({
  isDrawing: false,
  drawnValue: null,
  setDrawing: (isDrawing) => set({ isDrawing }),
  setDrawnValue: (drawnValue) => set({ drawnValue }),
  resetDraw: () => set({ isDrawing: false, drawnValue: null }),
}))
