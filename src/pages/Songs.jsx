import React, { useEffect, useState } from "react";
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { API_URI } from "../constant";
import axios from "axios";
import { toast } from "react-toastify";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const Songs = () => {
  const [songList, setSongList] = useState([]);
  const [searchTracks, setSearchTracks] = useState([]);
  const [query, setQuery] = useState("");
  const location = useLocation();
  const token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refreshToken");
  const urlParams = new URLSearchParams(location.search);
  const playlistId = urlParams.get("playlistId");
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  useEffect(() => {
    refreshToken && getPlaylistSongs();
  }, []);

  const getPlaylistSongs = async () => {
    const { data: response } = await axios.get(
      `${API_URI}/playlist/songs?playlistId=${playlistId}&refreshToken=${refreshToken}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setSongList(response?.tracks || []);
  };

  const handleSearch = async (e) => {
    const searchQuery = e.target.value;
    setQuery(searchQuery);

    // Clear previous timeout if it exists
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Set a new timeout
    const timeout = setTimeout(async () => {
      if (!searchQuery) {
        setSearchTracks([]);
        return;
      }

      try {
        const response = await axios.get(
          `${API_URI}/playlist/search?refreshToken=${refreshToken}`,
          {
            params: { query: searchQuery },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSearchTracks(response.data.tracks);
      } catch (error) {
        console.error("Error fetching tracks:", error);
      }
    }, 500); // Delay of 500ms before making the API call

    setDebounceTimeout(timeout);
  };

  const handleDeleteTrack = async (trackId) => {
    try {
      await axios.delete(`${API_URI}/playlist/remove-track`, {
        data: { trackId, playlistId, refreshToken },
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Track deleted successfully!");
      setSongList(songList.filter((song) => song.trackId !== trackId));
    } catch (error) {
      console.error("Error deleting track:", error);
    }
  };

  const addTrackToPlaylist = async (track, playlistId) => {
    try {
      const response = await axios.get(
        `${API_URI}/playlist/add-track?refreshToken=${refreshToken}&trackId=${track.id}&playlistId=${playlistId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        toast.success("Track added to playlist!");
        getPlaylistSongs();
      } else {
        toast.error("Failed to add track.");
      }
    } catch (error) {
      console.error("Error adding track to playlist", error);
      alert("Error adding track.");
    }
  };

  return (
    <Container>
      <div className="mt-4 mb-3" style={{ width: "400px" }}>
        <TextField
          fullWidth
          label="Search Spotify Songs"
          variant="outlined"
          value={query}
          onChange={handleSearch}
          style={{ marginBottom: "10px" }}
        />
      </div>
      <Grid container spacing={3}>
        {searchTracks.map((track) => (
          <Grid item xs={12} sm={6} md={4} key={track.id}>
            <Card
              style={{
                textDecoration: "none",
                display: "flex",
                height: "100%", // Makes the card take full height
              }}
            >
              <CardMedia
                component="img"
                className="m-3 mr-0"
                image={track.album.images[0]?.url}
                alt="Album Art"
                style={{
                  width: "80px", // Smaller image
                  height: "80px",
                  objectFit: "cover",
                }}
              />
              <CardContent
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flexGrow: 1, // Ensures content takes available space
                  padding: "10px",
                }}
              >
                <Typography variant="body1">{track.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {track.artists[0]?.name} - {track.album.name}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  style={{
                    marginTop: "10px",
                    width: "max-content",
                  }}
                  onClick={() => addTrackToPlaylist(track, playlistId)}
                >
                  Add to Playlist
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <TableContainer component={Paper} sx={{ marginTop: 3 }}>
        {songList.length === 0 ? (
          <Typography variant="h6" align="center" sx={{ padding: 3 }}>
            No data found. You can search and add a song to this playlist.
          </Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <b>Title</b>
                </TableCell>
                <TableCell>
                  <b>Artist Name</b>
                </TableCell>
                <TableCell>
                  <b>Album</b>
                </TableCell>
                <TableCell style={{ width: "350px" }}>
                  <b>Action</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {songList.map((playlist) => (
                <TableRow key={playlist?.id}>
                  <TableCell>
                    <a target="_blank" href={playlist?.spotify_url}>
                      {playlist?.title}
                    </a>
                  </TableCell>
                  <TableCell>{playlist?.artist}</TableCell>
                  <TableCell>{playlist?.album}</TableCell>
                  <TableCell className="d-flex align-items-start">
                    <SpotifyPlayer trackId={playlist?.trackId} />
                    <IconButton
                      className="ms-3"
                      onClick={() => handleDeleteTrack(playlist?.trackId)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Container>
  );
};

const SpotifyPlayer = ({ trackId }) => {
  const embedUrl = `https://open.spotify.com/embed/track/${trackId}`;

  return (
    <iframe
      src={embedUrl}
      height="80"
      frameBorder="0"
      allow="encrypted-media"
      title="Spotify Player"
    ></iframe>
  );
};

export default Songs;
