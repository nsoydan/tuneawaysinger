// App.tsx
import React, { useEffect } from 'react'
import { Provider } from 'react-redux'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './lib/firebase'
import { store } from './store'
import { useAppDispatch } from './store/hooks'
import { setSinger } from './store/authSlice'

import LoginScreen from './app/login'
import DashboardScreen from './app/(singer)/dashboard'
import RepertoireScreen from './app/(singer)/repertoire'
import SessionScreen from './app/(singer)/session'

const Stack = createNativeStackNavigator()

const AppNavigator = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        dispatch(setSinger({
          uid: user.uid,
          displayName: user.displayName ?? '',
          email: user.email ?? '',
        }))
      } else {
        dispatch(setSinger(null))
      }
    })
    return unsubscribe
  }, [])

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Repertoire" component={RepertoireScreen} />
        <Stack.Screen name="Session" component={SessionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  )
}