import { configureStore } from "@reduxjs/toolkit";
import userRededucer from "./slices/userSlice";
import postReducer from "./slices/postSlice";

export const store = configureStore({
  reducer: {
    user: userRededucer,
    post: postReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
