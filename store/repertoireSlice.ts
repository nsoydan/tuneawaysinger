// store/repertoireSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Song } from '../lib/types'

interface RepertoireState {
  songs: Song[]
  loading: boolean
}

const initialState: RepertoireState = {
  songs: [],
  loading: false,
}

const repertoireSlice = createSlice({
  name: 'repertoire',
  initialState,
  reducers: {
    setSongs: (state, action: PayloadAction<Song[]>) => {
      state.songs = action.payload
    },
    addSong: (state, action: PayloadAction<Song>) => {
      const exists = state.songs.find(s => s.spotifyId === action.payload.spotifyId)
      if (!exists) {
        state.songs.push(action.payload)
      }
    },
    removeSong: (state, action: PayloadAction<string>) => {
      state.songs = state.songs.filter(s => s.spotifyId !== action.payload)
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
})

export const { setSongs, addSong, removeSong, setLoading } = repertoireSlice.actions
export default repertoireSlice.reducer