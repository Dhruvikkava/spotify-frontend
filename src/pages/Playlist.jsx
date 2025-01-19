import React, { useState, useEffect } from "react";
import {
  Container,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { toast } from "react-toastify";
import axios from "axios";
import { API_URI } from "../constant";
import { Link, useLocation } from "react-router-dom";

const Playlist = () => {
  const location = useLocation();
  const [playlists, setPlaylists] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [errors, setErrors] = useState({ name: "", description: "" });
  const [editId, setEditId] = useState(null);
  const token = localStorage.getItem("token");
  const urlParams = new URLSearchParams(location.search);
  const code = urlParams.get("code");
  const refreshToken = localStorage.getItem("refreshToken");

  const getAuthCode = () => {
    window.location.href = "http://localhost:3008/auth/spotify";
  };

  useEffect(() => {
    if (!code && !refreshToken && token) {
      getAuthCode();
    } else {
      localStorage.setItem("code", code);
      if (refreshToken) {
        fetchPlaylists(null, refreshToken);
      } else {
        fetchPlaylists(code, null);
      }
    }
  }, []);

  const fetchPlaylists = async (codeData, refreshToken) => {
    try {
      const { data: response } = await axios.post(
        `${API_URI}/playlist/get`,
        { code: codeData, refreshToken },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPlaylists(response?.playlists || []);
      if (response?.refteshToken) {
        localStorage.setItem("refreshToken", response?.refteshToken);
      }
    } catch (error) {
      if (error?.response?.data?.errorCode == "1001") {
        window.location.href = "http://localhost:3008/auth/spotify";
      }
    }
  };

  // Open modal (Create/Edit)
  const handleOpen = (playlist = null) => {
    if (playlist) {
      setFormData({ name: playlist.name, description: playlist.description });
      setEditId(playlist._id);
    } else {
      setFormData({ name: "", description: "" });
      setEditId(null);
    }
    setErrors({ name: "", description: "" });
    setOpen(true);
  };

  // Close modal
  const handleClose = () => {
    setOpen(false);
    setEditId(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    setErrors({
      ...errors,
      [e.target.name]:
        e.target.value.trim() === "" ? "This field is required" : "",
    });
  };

  // Validate form fields
  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit (Create / Edit)
  const handleSubmit = async () => {
    if (!validateForm()) return; // Prevent submission if validation fails

    try {
      if (editId) {
        await axios.put(
          `${API_URI}/playlist/update`,
          { ...formData, code: refreshToken, playlistId: editId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success("Playlist updated successfully!");
      } else {
        await axios.post(
          `${API_URI}/playlist/add`,
          { ...formData, code: refreshToken },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success("Playlist created successfully!");
      }
      fetchPlaylists(null, refreshToken);
      handleClose();
    } catch (error) {
      console.error("Error saving playlist:", error);
      toast.error("Something went wrong!");
    }
  };

  // Delete Playlist
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this playlist?")) {
      try {
        await axios.delete(`${API_URI}/playlist/remove?playlistId=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("Playlist deleted successfully!");
        fetchPlaylists(null, refreshToken);
      } catch (error) {
        toast.error("Failed to delete playlist!");
      }
    }
  };

  return (
    <Container>
      <Button
        variant="contained"
        className="mt-5"
        color="primary"
        startIcon={<Add />}
        onClick={() => handleOpen()}
      >
        Create Playlist
      </Button>

      {/* Table to show playlists */}
      <TableContainer component={Paper} sx={{ marginTop: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <b>Name</b>
              </TableCell>
              <TableCell>
                <b>Description</b>
              </TableCell>
              <TableCell>
                <b>Actions</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {playlists.map((playlist) => (
              <TableRow key={playlist.id}>
                <TableCell>
                  <Link to={`/songs?playlistId=${playlist.playlistSpotifyId}`}>
                    {playlist.name}
                  </Link>
                </TableCell>
                <TableCell>{playlist.description}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpen(playlist)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(playlist.playlistSpotifyId)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Playlist Modal */}
      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>
          {editId ? "Edit Playlist" : "Create Playlist"}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="dense"
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            required
          />
          <TextField
            fullWidth
            margin="dense"
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={errors.description}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={!!errors.name || !!errors.description}
          >
            {editId ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Playlist;
