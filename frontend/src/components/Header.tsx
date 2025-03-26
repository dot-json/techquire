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
import { LogOutIcon, Pencil } from "lucide-react";
import { useState } from "react";
import CreatePost from "./CreatePost";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { id, username, profile_picture_url } = useSelector(
    (state: RootState) => state.user,
  );
  const [newPostOpen, setNewPostOpen] = useState<boolean>(false);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 flex h-14 w-full items-center border-b border-b-background-700 bg-background-900 shadow-sm backdrop-blur-lg",
        )}
      >
        <div
          className={cn("container flex h-full items-center justify-between")}
        >
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
                <Button size="sm" onClick={() => setNewPostOpen(true)}>
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
                  <img
                    src={
                      profile_picture_url
                        ? `${import.meta.env.VITE_SERVICE_URL}${profile_picture_url}`
                        : "https://www.gravatar.com/avatar/?d=identicon&s=400"
                    }
                    alt="header_profile_picture"
                    className={cn("size-8 rounded-full")}
                  />
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
                  <DropdownMenuItem
                    onClick={() => navigate(`/settings`)}
                    className={cn("cursor-pointer")}
                  >
                    Settings
                  </DropdownMenuItem>
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
      <div
        className={cn(
          "fixed left-0 top-0 z-50 grid h-[100dvh] w-full place-items-center bg-background-950/80 backdrop-blur-sm transition-opacity",
          newPostOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div
          className={cn(
            "fixed left-0 top-0 hidden h-[100dvh] w-full sm:static",
          )}
          onClick={() => setNewPostOpen(false)}
        ></div>
        <CreatePost
          isModal={true}
          onClose={() => setNewPostOpen(false)}
          className={cn("z-50 h-full w-full max-w-[50rem] sm:h-fit sm:border")}
        />
      </div>
    </>
  );
};

export default Header;
