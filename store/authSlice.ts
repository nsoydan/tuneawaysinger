// store/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Singer } from '../lib/types'

interface AuthState {
  singer: Singer | null
  loading: boolean
}

const initialState: AuthState = {
  singer: null,
  loading: true,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSinger: (state, action: PayloadAction<Singer | null>) => {
      state.singer = action.payload
      state.loading = false
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
})

export const { setSinger, setLoading } = authSlice.actions
export default authSlice.reducer