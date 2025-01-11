import { cn } from "../lib/utils";
import { useNavigate, useLocation } from "react-router";
import { Button } from "./atoms/Button";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { logout } from "@/lib/slices/userSlice";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { id } = useSelector((state: RootState) => state.user);

  return (
    <header
      className={cn(
        "border-b-background-800 sticky top-0 z-50 flex h-14 w-full items-center border-b shadow-sm backdrop-blur-lg",
      )}
    >
      <div className={cn("container flex items-center justify-between")}>
        <span
          className={cn(
            "font-logo relative cursor-pointer select-none text-2xl",
          )}
          onClick={() => navigate("/")}
        >
          TechQuire
        </span>
        <div className={cn("flex items-center gap-2")}>
          {id === -1 &&
            location.pathname !== "/login" &&
            location.pathname !== "/register" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
                <Button size="sm" onClick={() => navigate("/register")}>
                  Register
                </Button>
              </>
            )}
          {id !== -1 && (
            <Button size="sm" onClick={() => dispatch(logout())}>
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
