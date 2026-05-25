// lib/types.ts

export interface Song {
  spotifyId: string
  title: string
  artist: string
  coverUrl: string
  durationMs: number
}

export interface Request {
  id: string
  spotifyId: string
  title: string
  artist: string
  coverUrl: string
  note?: string
  tableNumber?: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: number
}

export interface Session {
  id: string
  singerId: string
  venueName: string
  active: boolean
  createdAt: number
}

export interface Singer {
  uid: string
  displayName: string
  email: string
}