// store/sessionSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Session, Request } from '../lib/types'

interface SessionState {
  currentSession: Session | null
  requests: Request[]
}

const initialState: SessionState = {
  currentSession: null,
  requests: [],
}

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<Session | null>) => {
      state.currentSession = action.payload
    },
    setRequests: (state, action: PayloadAction<Request[]>) => {
      state.requests = action.payload
    },
    updateRequestStatus: (
      state,
      action: PayloadAction<{ id: string; status: 'approved' | 'rejected' }>
    ) => {
      const request = state.requests.find(r => r.id === action.payload.id)
      if (request) {
        request.status = action.payload.status
      }
    },
  },
})

export const { setSession, setRequests, updateRequestStatus } = sessionSlice.actions
export default sessionSlice.reducer