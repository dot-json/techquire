import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { PostData } from "../interfaces";

interface Posts {
  posts: PostData[];
  pagination: {
    page: number;
    limit: number;
    total_posts: number;
    total_pages: number;
    has_more: boolean;
  };
  loading: boolean;
}

const initialState: Posts = {
  posts: [],
  pagination: {
    page: 1,
    limit: 10,
    total_posts: 0,
    total_pages: 0,
    has_more: false,
  },
  loading: false,
};

export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (
    {
      token,
      page = 1,
      limit = 10,
      user_id = undefined,
      search = "",
      tags = "",
      is_metoo = false,
      is_watchlisted = false,
      has_solution = undefined,
      sort_by = "created_at",
      sort_dir = "desc",
      append = false,
    }: {
      token: string;
      user_id?: number;
      page?: number;
      limit?: number;
      search?: string;
      tags?: string;
      is_metoo?: boolean;
      is_watchlisted?: boolean;
      has_solution?: boolean;
      sort_by?: string;
      sort_dir?: string;
      append?: boolean;
    },
    { rejectWithValue },
  ) => {
    try {
      // Build params object with only defined values
      const params: Record<string, any> = { page, limit };
      if (user_id !== undefined) params.user_id = user_id;
      if (sort_by !== undefined) params.sort_by = sort_by;
      if (sort_dir !== undefined) params.sort_dir = sort_dir;
      if (is_metoo !== undefined) params.is_metoo = is_metoo;
      if (is_watchlisted !== undefined) params.is_watchlisted = is_watchlisted;
      if (has_solution !== undefined) params.has_solution = has_solution;
      if (search !== undefined) params.search = search;
      if (tags !== undefined) params.tags = tags;

      const response = await axios.get(
        `${import.meta.env.VITE_SERVICE_URL}/posts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params,
        },
      );
      return {
        data: response.data,
        append: append,
      };
    } catch (error: any) {
      if (!error.response) {
        return rejectWithValue({
          error: { error: "Service is not available" },
        });
      }
      return rejectWithValue(error.response.data);
    }
  },
);

export const fetchPost = createAsyncThunk(
  "posts/fetchPost",
  async (
    { token, post_id }: { token: string; post_id: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVICE_URL}/posts/${post_id}`,
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
        return rejectWithValue({ error: "Service is not available" });
      }
      return rejectWithValue(error.response.data);
    }
  },
);

export const fetchUserPosts = createAsyncThunk(
  "posts/fetchUserPosts",
  async (
    {
      token,
      user_id,
      page = 1,
      limit = 10,
    }: {
      token: string;
      user_id: number;
      page?: number;
      limit?: number;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVICE_URL}/users/${user_id}/posts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params: {
            page,
            limit,
          },
        },
      );
      return {
        data: response.data,
        append: false,
      };
    } catch (error: any) {
      if (!error.response) {
        return rejectWithValue({ error: "Service is not available" });
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
      title,
      content,
      tags = [],
      pictures = [],
    }: {
      token: string;
      title: string;
      content: string;
      tags?: string[];
      pictures?: File[];
    },
    { rejectWithValue },
  ) => {
    if (token === "") {
      return rejectWithValue({
        error: "You need to be logged in to create a post",
      });
    }
    try {
      const postFormData = new FormData();

      postFormData.append("title", title);
      postFormData.append("content", content);

      if (tags && tags.length > 0) {
        tags.forEach((tag) => {
          postFormData.append("tags", tag);
        });
      }

      if (pictures && pictures.length > 0) {
        pictures.forEach((picture) => {
          postFormData.append("pictures", picture);
        });
      }

      const response = await axios.post(
        `${import.meta.env.VITE_SERVICE_URL}/posts`,
        postFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (error: any) {
      if (!error.response) {
        return rejectWithValue({ error: "Service is not available" });
      }
      return rejectWithValue(error.response.data);
    }
  },
);

export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (
    { post_id, token }: { post_id: number; token: string },
    { rejectWithValue },
  ) => {
    if (token === "") {
      return rejectWithValue({
        error: "You need to be logged in to delete a post",
      });
    }
    try {
      await axios.delete(
        `${import.meta.env.VITE_SERVICE_URL}/posts/${post_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      return post_id;
    } catch (error: any) {
      if (!error.response) {
        return rejectWithValue({ error: "Service is not available" });
      }
      return rejectWithValue(error.response.data);
    }
  },
);

export const deletePostPicture = createAsyncThunk(
  "posts/deletePostPicture",
  async (
    {
      post_id,
      picture_url,
      token,
    }: { post_id: number; picture_url: string; token: string },
    { rejectWithValue },
  ) => {
    if (token === "") {
      return rejectWithValue({
        error: "You need to be logged in to delete a post picture",
      });
    }
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_SERVICE_URL}/posts/${post_id}/picture/${picture_url}`,
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
        return rejectWithValue({ error: "Service is not available" });
      }
      return rejectWithValue(error.response.data);
    }
  },
);

export const toggleMeToo = createAsyncThunk(
  "posts/toggleMeToo",
  async (
    { post_id, token }: { post_id: number; token: string },
    { rejectWithValue },
  ) => {
    if (token === "") {
      return rejectWithValue({
        error: "You need to be logged in to Me Too a post",
      });
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVICE_URL}/posts/${post_id}/metoo`,
        {},
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
        return rejectWithValue({ error: "Service is not available" });
      }
      return rejectWithValue(error.response.data);
    }
  },
);

export const toggleWatchlist = createAsyncThunk(
  "posts/toggleWatchlist",
  async (
    { post_id, token }: { post_id: number; token: string },
    { rejectWithValue },
  ) => {
    if (token === "") {
      return rejectWithValue({
        error: "You need to be logged in to watchlist a post",
      });
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVICE_URL}/posts/${post_id}/watchlist`,
        {},
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
        return rejectWithValue({ error: "Service is not available" });
      }
      return rejectWithValue(error.response.data);
    }
  },
);

export const createComment = createAsyncThunk(
  "posts/createComment",
  async (
    {
      token,
      post_id,
      content,
    }: { token: string; post_id: number; content: string },
    { rejectWithValue },
  ) => {
    if (token === "") {
      return rejectWithValue({
        error: "You need to be logged in to post a comment",
      });
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVICE_URL}/posts/${post_id}/comment`,
        { content },
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
        return rejectWithValue({ error: "Service is not available" });
      }
      return rejectWithValue(error.response.data);
    }
  },
);

export const deleteComment = createAsyncThunk(
  "posts/deleteComment",
  async (
    {
      post_id,
      comment_id,
      token,
    }: { post_id: number; comment_id: number; token: string },
    { rejectWithValue },
  ) => {
    if (token === "") {
      return rejectWithValue({
        error: "You need to be logged in to delete a comment",
      });
    }
    try {
      await axios.delete(
        `${import.meta.env.VITE_SERVICE_URL}/posts/comment/${comment_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      return { comment_id, post_id };
    } catch (error: any) {
      if (!error.response) {
        return rejectWithValue({ error: "Service is not available" });
      }
      return rejectWithValue(error.response.data);
    }
  },
);

export const react = createAsyncThunk(
  "posts/react",
  async (
    {
      post_id,
      comment_id,
      reaction,
      token,
    }: {
      post_id: number;
      comment_id: number;
      reaction: "like" | "dislike";
      token: string;
    },
    { rejectWithValue },
  ) => {
    if (token === "") {
      return rejectWithValue({
        error: "You need to be logged in to react to a comment",
      });
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVICE_URL}/posts/comment/${comment_id}/react`,
        { reaction },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      return { ...response.data, post_id };
    } catch (error: any) {
      if (!error.response) {
        return rejectWithValue({ error: "Service is not available" });
      }
      return rejectWithValue(error.response.data);
    }
  },
);

export const toggleMarkAsSolution = createAsyncThunk(
  "posts/toggleMarkAsSolution",
  async (
    {
      post_id,
      comment_id,
      token,
    }: { post_id: number; comment_id: number; token: string },
    { rejectWithValue },
  ) => {
    if (token === "") {
      return rejectWithValue({
        error: "You need to be logged in to mark a comment as solution",
      });
    }
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_SERVICE_URL}/posts/comment/${comment_id}/solution`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      return { ...response.data, post_id };
    } catch (error: any) {
      if (!error.response) {
        return rejectWithValue({ error: "Service is not available" });
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
    builder.addCase(fetchPosts.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchPosts.fulfilled, (state, action) => {
      const { data, append } = action.payload;
      if (append) {
        state.posts = [...state.posts, ...data.posts];
      } else {
        state.posts = data.posts;
      }
      state.pagination = data.pagination;
      state.loading = false;
    });
    builder.addCase(fetchPosts.rejected, (state) => {
      state.posts = [];
      state.loading = false;
      toast.error("Failed to fetch posts");
    });
    builder.addCase(fetchPost.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchPost.fulfilled, (state, action) => {
      state.posts = [action.payload];
      state.loading = false;
    });
    builder.addCase(fetchPost.rejected, (state) => {
      state.posts = [];
      state.loading = false;
      toast.error("Failed to fetch post");
    });
    builder.addCase(fetchUserPosts.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchUserPosts.fulfilled, (state, action) => {
      const { data, append } = action.payload;
      if (append) {
        state.posts = [...state.posts, ...data.posts];
      } else {
        state.posts = data.posts;
      }
      state.pagination = data.pagination;
      state.loading = false;
    });
    builder.addCase(fetchUserPosts.rejected, (state) => {
      state.posts = [];
      state.loading = false;
      toast.error("Failed to fetch user posts");
    });
    builder.addCase(createPost.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createPost.fulfilled, (state, action) => {
      state.posts = [action.payload, ...state.posts];
      state.loading = false;
      toast.success("Post created");
    });
    builder.addCase(createPost.rejected, (state, action) => {
      const error = (action.payload as { error: string }).error;
      state.loading = false;
      toast.error(error);
    });
    builder.addCase(deletePost.fulfilled, (state, action) => {
      state.posts = state.posts.filter((post) => post.id !== action.payload);
      toast.success("Post deleted");
    });
    builder.addCase(deletePost.rejected, (_state, action) => {
      const error = (action.payload as { error: string }).error;
      toast.error(error);
    });
    builder.addCase(deletePostPicture.fulfilled, (state, action) => {
      const index = state.posts.findIndex(
        (post) => post.id === action.payload.id,
      );
      state.posts[index].pictures = action.payload.pictures;
      toast.success("Picture deleted");
    });
    builder.addCase(deletePostPicture.rejected, (_state, action) => {
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
    builder.addCase(createComment.fulfilled, (state, action) => {
      const index = state.posts.findIndex(
        (post) => post.id === action.payload.post_id,
      );
      state.posts[index].comments = [
        action.payload,
        ...(state.posts[index].comments || []),
      ];
      state.posts[index].comment_count++;
      toast.success("Comment posted");
    });
    builder.addCase(createComment.rejected, (_state, action) => {
      const error = (action.payload as { error: string }).error;
      toast.error(error);
    });
    builder.addCase(deleteComment.fulfilled, (state, action) => {
      const postIndex = state.posts.findIndex(
        (post) => post.id === action.payload.post_id,
      );
      state.posts[postIndex].comments =
        state.posts[postIndex].comments?.filter(
          (comment) => comment.id !== action.payload.comment_id,
        ) || [];
      // if solution is deleted, set solution to null
      if (state.posts[postIndex].solution?.id === action.payload.comment_id) {
        state.posts[postIndex].solution = null;
      }
      state.posts[postIndex].comment_count--;
      toast.success("Comment deleted");
    });
    builder.addCase(deleteComment.rejected, (_state, action) => {
      const error = (action.payload as { error: string }).error;
      toast.error(error);
    });
    builder.addCase(react.fulfilled, (state, action) => {
      console.log(action.payload);
      const postIndex = state.posts.findIndex((post) =>
        post.comments?.some((comment) => comment.id === action.payload.id),
      );
      const commentIndex = state.posts[postIndex].comments?.findIndex(
        (comment) => comment.id === action.payload.id,
      );
      state.posts[postIndex].comments![commentIndex!].like_count =
        action.payload.like_count;
      state.posts[postIndex].comments![commentIndex!].dislike_count =
        action.payload.dislike_count;
      state.posts[postIndex].comments![commentIndex!].is_liked =
        action.payload.is_liked;
      state.posts[postIndex].comments![commentIndex!].is_disliked =
        action.payload.is_disliked;
    });
    builder.addCase(react.rejected, (_state, action) => {
      const error = (action.payload as { error: string }).error;
      toast.error(error);
    });
    builder.addCase(toggleMarkAsSolution.fulfilled, (state, action) => {
      const postIndex = state.posts.findIndex(
        (post) => post.id === action.payload.post_id,
      );
      const commentIndex = state.posts[postIndex].comments?.findIndex(
        (comment) => comment.id === action.payload.id,
      );
      state.posts[postIndex].comments![commentIndex!].is_solution =
        action.payload.is_solution;
      if (action.payload.is_solution) {
        state.posts[postIndex].solution = action.payload.solution;
      } else {
        state.posts[postIndex].solution = null;
      }
    });
    builder.addCase(toggleMarkAsSolution.rejected, (_state, action) => {
      const error = (action.payload as { error: string }).error;
      toast.error(error);
    });
  },
});

export default postSlice.reducer;
