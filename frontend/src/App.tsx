import { BrowserRouter, Route, Routes } from "react-router";
import MainLayout from "./layouts/MainLayout";
import LandingPage from "./routes/LandingPage";
import LoginPage from "./routes/LoginPage";
import RegisterPage from "./routes/RegisterPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { checkAuth } from "./lib/slices/userSlice";
import { AppDispatch } from "./lib/store";
import Feed from "./routes/Feed";
import Profile from "./routes/Profile";
import AccountSettings from "./routes/AccountSettings";
import OpenedPost from "./routes/OpenedPost";

function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(checkAuth());
  }, []);

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3500} theme="dark" />
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/post/:post_id" element={<OpenedPost />} />
            <Route path="/profile/:handle" element={<Profile />} />
            <Route path="/settings" element={<AccountSettings />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </>
  );
}

export default App;
