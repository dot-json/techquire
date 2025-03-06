import { cn } from "../lib/utils";
import { useNavigate, useLocation } from "react-router";
import { Button } from "./atoms/Button";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { logout } from "@/lib/slices/userSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./atoms/DropdownMenu";
import { CircleUserRound, LogOutIcon, Pencil } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { id, username } = useSelector((state: RootState) => state.user);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex h-14 w-full items-center border-b border-b-background-700 bg-background-900 shadow-sm backdrop-blur-lg",
      )}
    >
      <div className={cn("container flex h-full items-center justify-between")}>
        <span
          className={cn(
            "relative cursor-pointer select-none font-logo text-2xl after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-text-100 after:transition-all after:duration-200 hover:after:w-full sm:after:absolute",
          )}
          onClick={() => {
            if (id === -1) {
              navigate("/");
            } else {
              navigate("/feed");
            }
          }}
        >
          TechQuire
        </span>
        <div className={cn("flex items-center gap-4")}>
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
            <>
              <Button size="sm">
                <Pencil size={16} />
                New Post
              </Button>
            </>
          )}
          {id !== -1 && (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  "rounded-full outline-none focus-visible:ring-2 focus-visible:ring-background-100 focus-visible:ring-offset-2 focus-visible:ring-offset-background-900",
                )}
              >
                <CircleUserRound size={28} strokeWidth={1.75} />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end" sideOffset={8}>
                <DropdownMenuLabel>{username}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate(`/profile/${username}`)}
                  className={cn("cursor-pointer")}
                >
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>Team</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => dispatch(logout())}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-2",
                  )}
                >
                  <LogOutIcon size={16} />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
