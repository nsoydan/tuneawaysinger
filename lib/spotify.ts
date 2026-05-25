// lib/spotify.ts - Using Spotify API (now with premium account)

const SPOTIFY_CLIENT_ID = "383f43d02d7a4c1386ad21ead9c78e93";
const SPOTIFY_CLIENT_SECRET = "3fbe8df10d3c412b8167aa56bcfedd43";

let accessToken: string | null = null;
let tokenExpiry: number = 0;

const getAccessToken = async (): Promise<string> => {
  if (accessToken && Date.now() < tokenExpiry) {
    console.log("Using cached token");
    return accessToken;
  }

  const credentials = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);
  console.log("Requesting new Spotify token...");

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    console.log("Token response status:", response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Token error response:", errorData);
      throw new Error(
        `Token request failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    if (!data.access_token) {
      console.error("Token response data:", data);
      throw new Error("No access token in response");
    }

    accessToken = data.access_token;
    tokenExpiry = Date.now() + data.expires_in * 1000;
    console.log(
      "Token obtained successfully, expires in:",
      data.expires_in,
      "seconds",
    );

    return accessToken as string;
  } catch (error) {
    console.error("Spotify token error:", error);
    throw error;
  }
};

export const searchSongs = async (query: string) => {
  try {
    console.log("Searching Spotify for:", query);
    const token = await getAccessToken();

    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      query,
    )}&type=track&limit=10`;
    console.log("Search URL:", searchUrl);

    const response = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Search response status:", response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error(
        "Search error response:",
        response.status,
        response.statusText,
        errorData,
      );
      throw new Error(
        `Search failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    if (!data.tracks || !data.tracks.items) {
      console.warn("No tracks in response:", data);
      return [];
    }

    console.log("Found", data.tracks.items.length, "tracks from Spotify");

    return data.tracks.items.map((item: any) => ({
      spotifyId: item.id,
      title: item.name,
      artist: item.artists[0]?.name || "Unknown",
      coverUrl: item.album.images[1]?.url ?? item.album.images[0]?.url ?? "",
      durationMs: item.duration_ms,
    }));
  } catch (error) {
    console.error("Spotify search error:", error);
    throw error;
  }
};
