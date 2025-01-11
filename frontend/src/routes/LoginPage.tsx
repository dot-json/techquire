import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { cn } from "@/lib/utils";
import { Navigate, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/lib/slices/userSlice";
import { AppDispatch, RootState } from "@/lib/store";
import { useState } from "react";

type LoginForm = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useSelector((state: RootState) => state.user);

  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(
      login({
        email: form.email,
        password: form.password,
      }),
    );
  };

  if (id !== -1) {
    return <Navigate to="/" replace />;
  }

  return (
    <div
      className={cn(
        "sm:bg-background-800/20 sm:border-background-800 flex w-full flex-col gap-4 rounded-xl shadow-sm sm:m-auto sm:max-w-96 sm:border sm:p-4",
      )}
    >
      <h1 className={cn("py-1 text-2xl font-light")}>Login</h1>
      <form onSubmit={handleSubmit} className={cn("flex flex-col gap-4")}>
        <Input
          type="text"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          value={form.email}
        />
        <Input
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          value={form.password}
        />
        <Button type="submit">Submit</Button>
        <div className={cn("flex items-center gap-2 font-light")}>
          <p>Don't have an account?</p>
          <button
            className={cn("text-primary-500 underline")}
            type="button"
            onClick={() => navigate("/register", { replace: true })}
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
