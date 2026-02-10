import { configureStore } from '@reduxjs/toolkit'
import toggleSliceReducer from './slices/toggleSlice'

export const store = configureStore({
  reducer: {
    toggleSlice: toggleSliceReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
