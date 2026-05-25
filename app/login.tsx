// app/login.tsx
import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useAppDispatch } from '../store/hooks'
import { setSinger } from '../store/authSlice'

export default function LoginScreen({ navigation }: any) {
  const dispatch = useAppDispatch()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Email ve şifre gerekli')
      return
    }

    setLoading(true)
    try {
      if (isLogin) {
        const { user } = await signInWithEmailAndPassword(auth, email, password)
        dispatch(setSinger({
          uid: user.uid,
          displayName: user.displayName ?? '',
          email: user.email ?? '',
        }))
      } else {
        if (!displayName) {
          Alert.alert('Hata', 'İsim gerekli')
          setLoading(false)
          return
        }
        const { user } = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(user, { displayName })
        dispatch(setSinger({
          uid: user.uid,
          displayName,
          email: user.email ?? '',
        }))
      }
      navigation.replace('Dashboard')
    } catch (error: any) {
      Alert.alert('Hata', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TuneAway</Text>
      <Text style={styles.subtitle}>
        {isLogin ? 'Şarkıcı Girişi' : 'Şarkıcı Kaydı'}
      </Text>

      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Adınız"
          placeholderTextColor="#555"
          value={displayName}
          onChangeText={setDisplayName}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#555"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Şifre"
        placeholderTextColor="#555"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.switchText}>
          {isLogin ? 'Hesabın yok mu? Kayıt ol' : 'Hesabın var mı? Giriş yap'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0f0f0f',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#1DB954',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchText: {
    color: '#888',
    textAlign: 'center',
    fontSize: 14,
  },
})