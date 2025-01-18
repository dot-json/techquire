import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { cn } from "@/lib/utils";
import { Navigate, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { register } from "@/lib/slices/userSlice";
import { AppDispatch, RootState } from "@/lib/store";

type RegisterForm = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useSelector((state: RootState) => state.user);

  const [form, setForm] = useState<RegisterForm>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(
      register({
        email: form.email,
        username: form.username,
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
        "sm:bg-background-900 sm:border-background-800 flex w-full flex-col gap-4 rounded-xl sm:shadow-md sm:m-auto sm:max-w-96 sm:border sm:p-4",
      )}
    >
      <h1 className={cn("py-1 text-2xl font-light")}>Register</h1>
      <form onSubmit={handleSubmit} className={cn("flex flex-col gap-4")}>
        <Input
          type="text"
          placeholder="Username"
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          value={form.username}
        />
        <Input
          type="email"
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
        <Input
          type="password"
          placeholder="Confirm Password"
          onChange={(e) =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
          value={form.confirmPassword}
        />
        <Button type="submit">Sign Up</Button>
        <div className={cn("flex items-center gap-2 font-light")}>
          <p>Already have an account?</p>
          <button
            className={cn("text-primary-500 underline")}
            type="button"
            onClick={() => navigate("/login", { replace: true })}
          >
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
