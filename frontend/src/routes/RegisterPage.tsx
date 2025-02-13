import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { cn } from "@/lib/utils";
import { Navigate, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { register } from "@/lib/slices/userSlice";
import { AppDispatch, RootState } from "@/lib/store";
import { toast } from "react-toastify";

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
    if (
      !form.email ||
      !form.password ||
      !form.confirmPassword ||
      !form.username
    ) {
      toast.error("Please fill all the fields");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    dispatch(
      register({
        email: form.email,
        username: form.username,
        password: form.password,
      }),
    );
    navigate("/login", { replace: true });
  };

  if (id !== -1) {
    return <Navigate to="/" replace />;
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4 rounded-xl from-background-800 to-background-900 py-4 sm:m-auto sm:max-w-96 sm:border sm:border-background-600/75 sm:bg-gradient-to-br sm:p-4 sm:shadow-md",
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
        <div className={cn("flex items-center gap-1 font-light")}>
          <p>Already have an account?</p>
          <button
            className={cn(
              "rounded-sm px-0.5 text-primary-500 underline outline-none transition-all focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background-900",
            )}
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
