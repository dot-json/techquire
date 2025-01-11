import { configureStore } from "@reduxjs/toolkit";
import userRededucer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    user: userRededucer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
