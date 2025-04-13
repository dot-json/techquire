import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Cookie from "js-cookie";
import { toast } from "react-toastify";

interface User {
  id: number;
  email: string;
  username: string;
  profile_picture_url: string;
  role: string;
  token: string;
  error: string | null;
  loading: boolean;
}

const initialState: User = {
  id: -1,
  email: "",
  username: "",
  profile_picture_url: "",
  role: "",
  token: "",
  error: null,
  loading: true,
};

export const login = createAsyncThunk(
  "user/login",
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVICE_URL}/auth`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
          responseType: "json",
        },
      );
      const userData = response.data;
      Cookie.set("auth_token", userData.token, {
        expires: 1,
        sameSite: "strict",
      });

      return userData;
    } catch (error: any) {
      if (!error.response) {
        return rejectWithValue("Service is not available");
      }
      return rejectWithValue(error.response.data);
    }
  },
);

export const register = createAsyncThunk(
  "user/register",
  async (
    data: { email: string; username: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVICE_URL}/register`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
          responseType: "json",
        },
      );
      return response.data;
    } catch (error: any) {
      if (!error.response) {
        return rejectWithValue("Service is not available");
      }
      return rejectWithValue(error.response.data);
    }
  },
);

export const checkAuth = createAsyncThunk(
  "user/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const token = Cookie.get("auth_token");
      if (!token) {
        return {
          id: -1,
          email: "",
          username: "",
          profile_picture_url: "",
          role: "",
          token: "",
        };
      }

      const response = await axios.post(
        `${import.meta.env.VITE_SERVICE_URL}/check-auth`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          responseType: "json",
        },
      );
      const userData = { ...response.data, token };
      Cookie.set("auth_token", userData.token, {
        expires: 1,
        sameSite: "strict",
      });

      return userData;
    } catch (error: any) {
      if (!error.response) {
        return rejectWithValue("Service is not available");
      }
      return rejectWithValue(error.response.data);
    }
  },
);

export const updateUsername = createAsyncThunk(
  "user/updateUsername",
  async (
    { token, username }: { token: string; username: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_SERVICE_URL}/users/update-username`,
        { username },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          responseType: "json",
        },
      );
      const newUsername = response.data.username;
      return newUsername;
    } catch (error: any) {
      if (!error.response) {
        return rejectWithValue("Service is not available");
      }
      return rejectWithValue(error.response.data);
    }
  },
);

export const updatePassword = createAsyncThunk(
  "user/updatePassword",
  async (
    {
      token,
      password,
      new_password,
    }: { token: string; password: string; new_password: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_SERVICE_URL}/users/update-password`,
        { password, new_password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          responseType: "json",
        },
      );
      const message = response.data.message;
      return message;
    } catch (error: any) {
      if (!error.response) {
        return rejectWithValue("Service is not available");
      }
      return rejectWithValue(error.response.data);
    }
  },
);

export const updateProfilePicture = createAsyncThunk(
  "user/updateProfilePicture",
  async (
    { token, file }: { token: string; file: File },
    { rejectWithValue },
  ) => {
    try {
      const formData = new FormData();
      formData.append("profile_picture", file);
      console.log(formData);

      const response = await axios.put(
        `${import.meta.env.VITE_SERVICE_URL}/users/update-profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "json",
        },
      );
      return response.data.profile_picture_url;
    } catch (error: any) {
      if (!error.response) {
        return rejectWithValue("Service is not available");
      }
      return rejectWithValue(error.response.data);
    }
  },
);

export const updateUserRole = createAsyncThunk(
  "user/updateUserRole",
  async (
    { token, user_id, role }: { token: string; user_id: number; role: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_SERVICE_URL}/users/update-role`,
        { user_id, role },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          responseType: "json",
        },
      );
      return response.data;
    } catch (error: any) {
      if (!error.response) {
        return rejectWithValue("Service is not available");
      }
      return rejectWithValue(error.response.data);
    }
  },
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.id = -1;
      state.email = "";
      state.username = "";
      state.token = "";
      Cookie.remove("auth_token");
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.id = action.payload.id;
      state.email = action.payload.email;
      state.username = action.payload.username;
      state.profile_picture_url = action.payload.profile_picture_url;
      state.role = action.payload.role;
      state.token = action.payload.token;
      state.error = null;
      state.loading = false;
    });
    builder.addCase(login.rejected, (state, action) => {
      const error = (action.payload as { error: string }).error;
      state.error = error;
      state.loading = false;
      toast.error(error);
    });
    builder.addCase(register.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      const message = (action.payload as { message: string }).message;
      state.error = null;
      state.loading = false;
      toast.success(message);
    });
    builder.addCase(register.rejected, (state, action) => {
      const error = (action.payload as { error: string }).error;
      state.error = error;
      state.loading = false;
      toast.error(error);
    });
    builder.addCase(checkAuth.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      state.id = action.payload.id;
      state.email = action.payload.email;
      state.username = action.payload.username;
      state.profile_picture_url = action.payload.profile_picture_url;
      state.role = action.payload.role;
      state.token = action.payload.token;
      state.error = null;
      state.loading = false;
    });
    builder.addCase(checkAuth.rejected, (state, action) => {
      state.id = -1;
      state.email = "";
      state.username = "";
      state.token = "";
      const error = (action.payload as { error: string }).error;
      state.error = error;
      state.loading = false;
      toast.error(error);
    });
    builder.addCase(updateUsername.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateUsername.fulfilled, (state, action) => {
      state.username = action.payload;
      state.error = null;
      state.loading = false;
      toast.success("Username updated successfully");
    });
    builder.addCase(updateUsername.rejected, (state, action) => {
      const error = (action.payload as { error: string }).error;
      state.error = error;
      state.loading = false;
      toast.error(error);
    });
    builder.addCase(updatePassword.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updatePassword.fulfilled, (state, action) => {
      const message = action.payload;
      state.error = null;
      state.loading = false;
      toast.success(message);
    });
    builder.addCase(updatePassword.rejected, (state, action) => {
      const error = (action.payload as { error: string }).error;
      state.error = error;
      state.loading = false;
      toast.error(error);
    });
    builder.addCase(updateProfilePicture.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateProfilePicture.fulfilled, (state, action) => {
      state.profile_picture_url = action.payload;
      state.error = null;
      state.loading = false;
      toast.success("Profile picture updated successfully");
    });
    builder.addCase(updateProfilePicture.rejected, (state, action) => {
      const error = (action.payload as { error: string }).error;
      state.error = error;
      state.loading = false;
      toast.error(error);
    });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
