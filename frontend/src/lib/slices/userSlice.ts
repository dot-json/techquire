import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Cookie from "js-cookie";
import { toast } from "react-toastify";

interface User {
  id: number;
  email: string;
  username: string;
  token: string;
  error: string | null;
  loading: boolean;
}

const initialState: User = {
  id: -1,
  email: "",
  username: "",
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
      await axios.post(`${import.meta.env.VITE_SERVICE_URL}/register`, data, {
        headers: {
          "Content-Type": "application/json",
        },
        responseType: "json",
      });
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

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.id = -1;
      state.email = "";
      state.username = "";
      state.token = "";
      Cookie.remove("user");
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
    builder.addCase(register.fulfilled, (state, _action) => {
      toast.success("Successfully registered");
      state.error = null;
      state.loading = false;
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
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
