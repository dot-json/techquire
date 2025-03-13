import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { PostData } from "../interfaces";

interface Posts {
  posts: PostData[];
}

const initialState: Posts = {
  posts: [],
};

export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVICE_URL}/posts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
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

export const createPost = createAsyncThunk(
  "posts/createPost",
  async (
    {
      token,
      formData,
    }: {
      token: string;
      formData: { title: string; content: string };
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVICE_URL}/posts`,
        { ...formData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      toast.success("Post created");
      return response.data;
    } catch (error: any) {
      if (!error.response) {
        return rejectWithValue("Service is not available");
      }
      return rejectWithValue(error.response.data);
    }
  },
);

export const toggleMeToo = createAsyncThunk(
  "posts/toggleMeToo",
  async (data: { postId: number; token: string }, { rejectWithValue }) => {
    try {
      console.log(data);
      const response = await axios.post(
        `${import.meta.env.VITE_SERVICE_URL}/posts/${data.postId}/metoo`,
        {},
        {
          headers: {
            Authorization: `Bearer ${data.token}`,
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

export const toggleWatchlist = createAsyncThunk(
  "posts/toggleWatchlist",
  async (data: { postId: number; token: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVICE_URL}/posts/${data.postId}/watchlist`,
        {},
        {
          headers: {
            Authorization: `Bearer ${data.token}`,
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

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchPosts.fulfilled, (state, action) => {
      state.posts = action.payload;
    });
    builder.addCase(fetchPosts.rejected, (state) => {
      state.posts = [];
      toast.error("Failed to fetch posts");
    });
    builder.addCase(createPost.fulfilled, (state, action) => {
      state.posts = [action.payload, ...state.posts];
    });
    builder.addCase(createPost.rejected, (_state, action) => {
      const error = (action.payload as { error: string }).error;
      toast.error(error);
    });
    builder.addCase(toggleMeToo.fulfilled, (state, action) => {
      const index = state.posts.findIndex(
        (post) => post.id === action.payload.id,
      );
      if (action.payload.is_metoo) {
        state.posts[index].metoo_count++;
        state.posts[index].is_metoo = true;
      }
      if (!action.payload.is_metoo) {
        state.posts[index].metoo_count--;
        state.posts[index].is_metoo = false;
      }
    });
    builder.addCase(toggleMeToo.rejected, (_state, action) => {
      const error = (action.payload as { error: string }).error;
      toast.error(error);
    });
    builder.addCase(toggleWatchlist.fulfilled, (state, action) => {
      const index = state.posts.findIndex(
        (post) => post.id === action.payload.id,
      );
      state.posts[index].is_watchlisted = action.payload.is_watchlisted;
    });
    builder.addCase(toggleWatchlist.rejected, (_state, action) => {
      const error = (action.payload as { error: string }).error;
      toast.error(error);
    });
  },
});

export default postSlice.reducer;
