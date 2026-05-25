// app/(singer)/dashboard.tsx
import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { ref, onValue, set, off } from "firebase/database";
import { signOut } from "firebase/auth";

import { database, auth } from "../../lib/firebase";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  setRequests,
  updateRequestStatus,
  setSession,
} from "../../store/sessionSlice";
import { setSongs } from "../../store/repertoireSlice";
import { Request } from "../../lib/types";

export default function DashboardScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { currentSession, requests } = useAppSelector((state) => state.session);
  const { singer } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!currentSession) return;

    const requestsRef = ref(database, `requests/${currentSession.id}`);

    const unsubscribe = onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list: Request[] = Object.entries(data).map(
          ([id, value]: any) => ({
            id,
            ...value,
          }),
        );
        list.sort((a, b) => b.createdAt - a.createdAt);
        dispatch(setRequests(list));
      } else {
        dispatch(setRequests([]));
      }
    });

    return () => unsubscribe();
  }, [currentSession, dispatch]);

  const handleStatus = async (
    requestId: string,
    status: "approved" | "rejected",
  ) => {
    if (!currentSession) return;
    try {
      const statusRef = ref(
        database,
        `requests/${currentSession.id}/${requestId}/status`,
      );
      await set(statusRef, status);
      dispatch(updateRequestStatus({ id: requestId, status }));
    } catch (error) {
      Alert.alert("Hata", "Durumu güncellenemedi");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(setSession(null));
      dispatch(setRequests([]));
      dispatch(setSongs([]));
      navigation.replace("Login");
    } catch (error) {
      Alert.alert("Hata", "Çıkış yapılamadı");
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");

  const renderRequest = ({ item }: { item: Request }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.songTitle}>{item.title}</Text>
        <Text style={styles.artist}>{item.artist}</Text>
        {item.note ? <Text style={styles.note}>"{item.note}"</Text> : null}
        {item.tableNumber ? (
          <Text style={styles.table}>Masa: {item.tableNumber}</Text>
        ) : null}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.approve]}
          onPress={() => handleStatus(item.id, "approved")}
        >
          <Text style={styles.actionText}>✓</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.reject]}
          onPress={() => handleStatus(item.id, "rejected")}
        >
          <Text style={styles.actionText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gelen İstekler</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate("Repertoire")}
          >
            <Text style={styles.headerBtnText}>Repertuar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate("Session")}
          >
            <Text style={styles.headerBtnText}>Oturum</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerBtn, styles.logoutBtn]}
            onPress={handleLogout}
          >
            <Text style={styles.headerBtnText}>Çıkış</Text>
          </TouchableOpacity>
        </View>
      </View>

      {!currentSession ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Aktif oturum yok</Text>
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => navigation.navigate("Session")}
          >
            <Text style={styles.startBtnText}>Oturum Başlat</Text>
          </TouchableOpacity>
        </View>
      ) : pendingRequests.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Henüz istek yok</Text>
        </View>
      ) : (
        <FlatList
          data={pendingRequests}
          keyExtractor={(item) => item.id}
          renderItem={renderRequest}
          contentContainerStyle={styles.list}
        />
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
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  headerBtn: {
    backgroundColor: "#1e1e1e",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutBtn: {
    backgroundColor: "#e74c3c",
  },
  headerBtnText: {
    color: "#fff",
    fontSize: 13,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
  },
  songTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  artist: {
    color: "#888",
    fontSize: 14,
    marginTop: 2,
  },
  note: {
    color: "#1DB954",
    fontSize: 13,
    marginTop: 4,
  },
  table: {
    color: "#555",
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  approve: {
    backgroundColor: "#1DB954",
  },
  reject: {
    backgroundColor: "#e74c3c",
  },
  actionText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#555",
    fontSize: 16,
    marginBottom: 16,
  },
  startBtn: {
    backgroundColor: "#1DB954",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  startBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
