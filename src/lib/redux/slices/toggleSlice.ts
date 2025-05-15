import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

interface ToggleState {
  [x: string]: boolean
}

const initialState: ToggleState = {}

const toggleSlice = createSlice({
  name: 'toggle-state',
  initialState,
  reducers: {
    setToggle: (state, action: PayloadAction<{ key: string; value: boolean }>) => {
      state[action.payload.key] = action.payload.value
    }
  }
})

export const { setToggle } = toggleSlice.actions
export default toggleSlice.reducer

export const useSettingReduxToggle = (state: RootState) => state.toggleSlice
