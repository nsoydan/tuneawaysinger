// lib/firebase.ts
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCXP6qHIRn1RcCRPJ5osj-V5GiZ4Fq3zQI',
  authDomain: 'tuneaway-cea72.firebaseapp.com',
  databaseURL: 'https://tuneaway-cea72-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'tuneaway-cea72',
  storageBucket: 'tuneaway-cea72.firebasestorage.app',
  messagingSenderId: '249435154401',
  appId: '1:249435154401:android:aa0f66a53b89a1fd9814a0',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const database = getDatabase(app)
export const firestore = getFirestore(app)



