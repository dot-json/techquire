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
        "sticky top-0 z-50 flex h-14 w-full items-center border-b border-b-background-700 bg-background-900 shadow-sm backdrop-blur-lg",
      )}
    >
      <div className={cn("container flex items-center justify-between")}>
        <span
          className={cn(
            "relative cursor-pointer select-none font-logo text-2xl after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-text-100 after:transition-all after:duration-200 hover:after:w-full",
          )}
          onClick={() => navigate("/")}
        >
          TechQuire
        </span>
        <div className={cn("flex items-center gap-3")}>
          {id === -1 &&
            location.pathname !== "/login" &&
            location.pathname !== "/register" && (
              <>
                <Button
                  size="sm"
                  variant="link"
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
