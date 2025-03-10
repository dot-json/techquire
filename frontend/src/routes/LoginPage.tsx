import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { cn } from "@/lib/utils";
import { Navigate, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/lib/slices/userSlice";
import { AppDispatch, RootState } from "@/lib/store";
import { useState } from "react";
import { toast } from "react-toastify";

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Please fill all the fields");
      return;
    }
    const resultAction = await dispatch(
      login({
        email: form.email,
        password: form.password,
      }),
    );

    if (login.fulfilled.match(resultAction)) {
      navigate("/feed", { replace: true });
    }
  };

  if (id !== -1) {
    return <Navigate to="/feed" replace />;
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4 rounded-xl from-background-800 to-background-900 py-4 sm:m-auto sm:max-w-96 sm:border sm:border-background-600/75 sm:bg-gradient-to-br sm:p-4 sm:shadow-md",
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
        <div className={cn("flex items-center gap-1 font-light")}>
          <p>Don't have an account?</p>
          <button
            className={cn(
              "rounded-sm px-0.5 text-primary-500 underline underline-offset-2 outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-background-900",
            )}
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
