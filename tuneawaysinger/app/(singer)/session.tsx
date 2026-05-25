// app/(singer)/session.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
} from "react-native";
import { ref, push, set } from "firebase/database";
import QRCode from "react-native-qrcode-svg";

import { database } from "../../lib/firebase";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setSession } from "../../store/sessionSlice";

export default function SessionScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { singer } = useAppSelector((state) => state.auth);
  const { currentSession } = useAppSelector((state) => state.session);

  const [venueName, setVenueName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStartSession = async () => {
    if (!singer) return;
    if (!venueName.trim()) {
      Alert.alert("Hata", "Mekan adı gerekli");
      return;
    }

    setLoading(true);
    try {
      const sessionsRef = ref(database, "sessions");
      const newSessionRef = push(sessionsRef);
      const sessionId = newSessionRef.key!;

      const session = {
        singerId: singer.uid,
        singerName: singer.displayName,
        venueName: venueName.trim(),
        active: true,
        createdAt: Date.now(),
      };

      await set(newSessionRef, session);

      dispatch(
        setSession({
          id: sessionId,
          singerId: singer.uid,
          venueName: venueName.trim(),
          active: true,
          createdAt: Date.now(),
        }),
      );
    } catch (error) {
      Alert.alert("Hata", "Oturum başlatılamadı");
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!currentSession) return;
    Alert.alert("Oturumu Kapat", "Oturumu kapatmak istiyor musun?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Kapat",
        style: "destructive",
        onPress: async () => {
          try {
            const activeRef = ref(
              database,
              `sessions/${currentSession.id}/active`,
            );
            await set(activeRef, false);
            dispatch(setSession(null));
            setVenueName("");
          } catch (error) {
            Alert.alert("Hata", "Oturum kapatılamadı");
          }
        },
      },
    ]);
  };

  const handleShare = async () => {
    if (!currentSession) return;
    await Share.share({
      message: `TuneAway'e katıl! Kod: ${currentSession.id}`,
    });
  };

  const joinUrl = currentSession ? `tuneaway://join/${currentSession.id}` : "";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Oturum</Text>
        <View style={{ width: 60 }} />
      </View>

      {!currentSession ? (
        <View style={styles.content}>
          <Text style={styles.label}>Mekan Adı</Text>
          <TextInput
            style={styles.input}
            placeholder="örn. Cafe Roma"
            placeholderTextColor="#555"
            value={venueName}
            onChangeText={setVenueName}
          />
          <TouchableOpacity
            style={styles.startBtn}
            onPress={handleStartSession}
            disabled={loading}
          >
            <Text style={styles.startBtnText}>
              {loading ? "Başlatılıyor..." : "Oturum Başlat"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.venueName}>{currentSession.venueName}</Text>
          <Text style={styles.activeLabel}>● Oturum Aktif</Text>

          <View style={styles.qrContainer}>
            <QRCode
              value={joinUrl}
              size={200}
              backgroundColor="#fff"
              color="#000"
            />
          </View>

          <Text style={styles.sessionCode}>Kod: {currentSession.id}</Text>

          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Text style={styles.shareBtnText}>Paylaş</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.endBtn} onPress={handleEndSession}>
            <Text style={styles.endBtnText}>Oturumu Kapat</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#1e1e1e",
  },
  back: {
    color: "#1DB954",
    fontSize: 16,
    width: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    flex: 1,
    padding: 24,
  },
  label: {
    color: "#888",
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  startBtn: {
    backgroundColor: "#1DB954",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
  },
  startBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  venueName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  activeLabel: {
    color: "#1DB954",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
  },
  qrContainer: {
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    alignSelf: "center",
  },
  sessionCode: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  shareBtn: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  shareBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  endBtn: {
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e74c3c",
  },
  endBtnText: {
    color: "#e74c3c",
    fontSize: 16,
    fontWeight: "bold",
  },
});
