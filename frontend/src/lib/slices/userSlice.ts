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
}

const initialState: User = {
  id: -1,
  email: "",
  username: "",
  token: "",
  error: null,
};

export const login = createAsyncThunk(
  "user/login",
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVICE_URL}/auth`,
        {
          data,
          headers: {
            "Content-Type": "application/json",
          },
          responseType: "text",
        },
      );
      const userData = response.data;
      console.log(userData);
      Cookie.set("user", JSON.stringify(userData), { expires: 1 });

      return userData;
    } catch (error: any) {
      console.log(error.response.data);
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
      await axios.post(`${import.meta.env.VITE_SERVICE_URL}/register`, {
        data,
        headers: {
          "Content-Type": "application/json",
        },
        responseType: "text",
      });
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
    builder.addCase(login.fulfilled, (state, action) => {
      state.id = action.payload.id;
      state.email = action.payload.email;
      state.username = action.payload.username;
      state.token = action.payload.token;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.error = action.payload as string;
      toast.error(action.payload as string);
    });
    builder.addCase(register.fulfilled, (_state, _action) => {
      toast.success("Successfully registered");
    });
    builder.addCase(register.rejected, (state, action) => {
      state.error = action.payload as string;
      toast.error(action.payload as string);
    });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
