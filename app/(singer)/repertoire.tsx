// app/(singer)/repertoire.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { firestore } from "../../lib/firebase";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setSongs, addSong, removeSong } from "../../store/repertoireSlice";
import { searchSongs } from "../../lib/spotify";
import { Song } from "../../lib/types";

export default function RepertoireScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { songs } = useAppSelector((state) => state.repertoire);
  const { singer } = useAppSelector((state) => state.auth);

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [searching, setSearching] = useState(false);
  const [tab, setTab] = useState<"repertoire" | "search">("repertoire");

  useEffect(() => {
    if (!singer) return;

    const loadSongs = async () => {
      try {
        console.log("Loading songs for singer:", singer.uid);

        const songsCollectionRef = collection(
          firestore,
          "repertoire",
          singer.uid,
          "songs",
        );

        console.log("Firebase path:", `repertoire/${singer.uid}/songs`);

        const snapshot = await getDocs(songsCollectionRef);
        const list: Song[] = snapshot.docs.map((doc) => doc.data() as Song);

        console.log("Loaded", list.length, "songs from Firebase");
        console.log(
          "Songs:",
          list.map((s) => `${s.title} by ${s.artist}`),
        );

        dispatch(setSongs(list));
      } catch (error) {
        console.error("Şarkılar yüklenemedi:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Bilinmeyen hata";
        Alert.alert("Hata", `Şarkılar yüklenemedi: ${errorMessage}`);
      }
    };

    loadSongs();
  }, [singer, dispatch]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const results = await searchSongs(query);
      setSearchResults(results);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Bilinmeyen hata";
      console.error("Search error:", error);
      Alert.alert("Spotify Araması Başarısız", errorMessage);
    } finally {
      setSearching(false);
    }
  };

  const handleAddSong = async (song: Song) => {
    if (!singer) {
      console.error("No singer logged in");
      return;
    }

    console.log("Adding song to repertoire:", song.title, "by", song.artist);
    console.log("Singer UID:", singer.uid);

    try {
      const songRef = doc(
        firestore,
        "repertoire",
        singer.uid,
        "songs",
        song.spotifyId,
      );

      console.log(
        "Firebase path:",
        `repertoire/${singer.uid}/songs/${song.spotifyId}`,
      );

      await setDoc(songRef, song);
      console.log("Song successfully added to Firebase");

      dispatch(addSong(song));
      console.log("Song added to Redux state");

      Alert.alert("Başarılı", `"${song.title}" repertuara eklendi`);
    } catch (error) {
      console.error("Error adding song to Firebase:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Bilinmeyen hata";
      Alert.alert("Hata", `Şarkı eklenemedi: ${errorMessage}`);
    }
  };

  const handleRemoveSong = async (spotifyId: string) => {
    if (!singer) return;
    Alert.alert("Sil", "Bu şarkıyı repertuardan kaldırmak istiyor musun?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            const songRef = doc(
              firestore,
              "repertoire",
              singer.uid,
              "songs",
              spotifyId,
            );
            await deleteDoc(songRef);
            dispatch(removeSong(spotifyId));
          } catch (error) {
            Alert.alert("Hata", "Şarkı silinemedi");
          }
        },
      },
    ]);
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const renderRepertoireSong = ({ item }: { item: Song }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.coverUrl }} style={styles.cover} />
      <View style={styles.cardInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.artist}>{item.artist}</Text>
        <Text style={styles.duration}>{formatDuration(item.durationMs)}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => handleRemoveSong(item.spotifyId)}
      >
        <Text style={styles.removeBtnText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchResult = ({ item }: { item: Song }) => {
    const alreadyAdded = songs.some((s) => s.spotifyId === item.spotifyId);
    return (
      <View style={styles.card}>
        <Image source={{ uri: item.coverUrl }} style={styles.cover} />
        <View style={styles.cardInfo}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.artist}>{item.artist}</Text>
          <Text style={styles.duration}>{formatDuration(item.durationMs)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, alreadyAdded && styles.addBtnDisabled]}
          onPress={() => !alreadyAdded && handleAddSong(item)}
          disabled={alreadyAdded}
        >
          <Text style={styles.addBtnText}>{alreadyAdded ? "✓" : "+"}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Repertuar</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === "repertoire" && styles.tabActive]}
          onPress={() => setTab("repertoire")}
        >
          <Text
            style={[
              styles.tabText,
              tab === "repertoire" && styles.tabTextActive,
            ]}
          >
            Listem ({songs.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "search" && styles.tabActive]}
          onPress={() => setTab("search")}
        >
          <Text
            style={[styles.tabText, tab === "search" && styles.tabTextActive]}
          >
            Spotify'dan Ekle
          </Text>
        </TouchableOpacity>
      </View>

      {tab === "search" && (
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Şarkı ara..."
            placeholderTextColor="#555"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            {searching ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.searchBtnText}>Ara</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {tab === "repertoire" ? (
        songs.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Repertuarın boş</Text>
            <Text style={styles.emptySubText}>Spotify'dan şarkı ekle</Text>
          </View>
        ) : (
          <FlatList
            data={songs}
            keyExtractor={(item) => item.spotifyId}
            renderItem={renderRepertoireSong}
            contentContainerStyle={styles.list}
          />
        )
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.spotifyId}
          renderItem={renderSearchResult}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            !searching ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>
                  Şarkı aramak için yukarıya yaz
                </Text>
              </View>
            ) : null
          }
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
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#1e1e1e",
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#1DB954",
  },
  tabText: {
    color: "#555",
    fontSize: 14,
  },
  tabTextActive: {
    color: "#1DB954",
    fontWeight: "bold",
  },
  searchBar: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    color: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  searchBtn: {
    backgroundColor: "#1DB954",
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  searchBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  cover: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  songTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  artist: {
    color: "#888",
    fontSize: 13,
    marginTop: 2,
  },
  duration: {
    color: "#555",
    fontSize: 12,
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: "#1DB954",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  addBtnDisabled: {
    backgroundColor: "#333",
  },
  addBtnText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  removeBtn: {
    backgroundColor: "#2a2a2a",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  removeBtnText: {
    color: "#e74c3c",
    fontSize: 16,
    fontWeight: "bold",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  emptyText: {
    color: "#555",
    fontSize: 16,
  },
  emptySubText: {
    color: "#333",
    fontSize: 14,
    marginTop: 8,
  },
});
