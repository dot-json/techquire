import { cn } from "@/lib/utils";
import { Button } from "./atoms/Button";
import { Check, Eye, MessageSquareText, UserRoundPlus, X } from "lucide-react";
import { PostData } from "@/lib/interfaces";
import { Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { toggleMeToo, toggleWatchlist } from "@/lib/slices/postSlice";
import { useState } from "react";
import MarkdownRenderer from "./atoms/MarkdownRenderer";

const Post = ({
  id,
  title,
  content,
  tags,
  solution,
  user,
  comment_count,
  created_at,
  is_metoo,
  metoo_count,
  is_watchlisted,
}: PostData) => {
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.user);
  const [imagePreview, setImagePreview] = useState<{
    url: string;
    open: Boolean;
  }>({
    url: "",
    open: false,
  });

  const handleToggleMetoo = () => {
    dispatch(toggleMeToo({ token, post_id: id }));
  };

  const handleToggleWatchlist = () => {
    dispatch(toggleWatchlist({ token, post_id: id }));
  };

  return (
    <div
      key={id}
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-background-600 bg-background-900 p-4",
      )}
    >
      <Link
        to={`/post/${id}`}
        className={cn(
          "cursor-pointer text-2xl font-semibold underline decoration-transparent underline-offset-4 transition-colors hover:decoration-text-100",
        )}
      >
        {title}
      </Link>
      <MarkdownRenderer content={content} />
      {tags && tags.length > 0 && (
        <div className={cn("-mt-4 flex flex-wrap gap-2")}>
          {tags.map((tag, i) => (
            <div
              key={i}
              className={cn(
                "flex h-8 select-none items-center gap-1 rounded-md bg-background-700 px-2 py-1 text-sm font-medium text-text-100",
              )}
            >
              {`#${tag}`}
            </div>
          ))}
        </div>
      )}
      <div className={cn("flex flex-wrap items-center gap-1 text-text-500")}>
        <p>Posted at</p>
        <p>{new Date(created_at).toLocaleString("en-US")}</p>
        <p className={cn("mx-1 hidden sm:block")}>|</p>
        <p>
          By{" "}
          <Link
            to={`/profile/${user.username}`}
            className={cn(
              "rounded-sm px-0.5 underline decoration-transparent underline-offset-2 outline-none hover:decoration-text-500 focus-visible:ring-2 focus-visible:ring-text-500",
            )}
          >
            {user.username}
          </Link>
        </p>
      </div>
      <hr className={cn("border-t-background-600")} />
      {solution && (
        <>
          <div
            className={cn(
              "flex flex-col gap-4 rounded-md border border-success/25 bg-success/15 p-4",
            )}
          >
            <h2 className={cn("text-xl font-medium text-success")}>Solution</h2>
            <div
              className={cn(
                "grid grid-cols-[auto_1fr_auto] gap-4 rounded-md border border-background-600 bg-background-900 p-4",
              )}
            >
              <img
                src={
                  solution.user.profile_picture_url
                    ? `${import.meta.env.VITE_SERVICE_URL}${solution.user.profile_picture_url}`
                    : "https://www.gravatar.com/avatar/?d=identicon&s=400"
                }
                alt="profile_pic"
                className={cn("size-12 rounded-full border sm:size-12")}
              />
              <div className={cn("flex flex-col gap-1")}>
                <div className={cn("flex items-center gap-2")}>
                  <Link
                    to={`/profile/${solution.user.username}`}
                    className={cn(
                      "rounded-sm px-0.5 underline decoration-transparent underline-offset-2 outline-none transition-colors hover:decoration-text-100 focus-visible:ring-2 focus-visible:ring-text-500",
                    )}
                  >
                    <h1 className={cn("font-medium sm:text-base")}>
                      {solution.user.username}
                    </h1>
                  </Link>
                  <p className={cn("text-sm font-light text-text-400")}>
                    {new Date(solution.created_at).toLocaleString("en-US")}
                  </p>
                </div>
                <MarkdownRenderer content={solution.content} />
                {solution.pictures && solution.pictures.length > 0 && (
                  <div className={cn("mt-1 flex flex-col gap-2")}>
                    <h2 className={cn("text-sm text-text-400")}>Pictures</h2>
                    <div className={cn("flex flex-wrap gap-2")}>
                      {solution.pictures.map((picture, index) => (
                        <img
                          key={index}
                          src={`${import.meta.env.VITE_SERVICE_URL}${picture}`}
                          alt="attachment"
                          className={cn(
                            "size-8 cursor-pointer rounded-md object-cover",
                          )}
                          onClick={() =>
                            setImagePreview({ url: picture, open: true })
                          }
                        />
                      ))}
                    </div>
                    <div
                      className={cn(
                        "fixed left-0 top-0 z-[771] grid size-full place-items-center bg-background-950/50 backdrop-blur-sm transition-opacity",
                        imagePreview.open === false &&
                          "pointer-events-none opacity-0",
                      )}
                    >
                      <div
                        className={cn(
                          "fixed left-0 top-0 h-[100dvh] w-full [grid-area:1/1]",
                        )}
                        onClick={() =>
                          setImagePreview((prev) => ({ ...prev, open: false }))
                        }
                      ></div>
                      {imagePreview.url && (
                        <img
                          src={`${import.meta.env.VITE_SERVICE_URL}${imagePreview.url}`}
                          alt="post attachment"
                          className={cn("z-[771] [grid-area:1/1]")}
                        />
                      )}
                      <button
                        onClick={() =>
                          setImagePreview((prev) => ({ ...prev, open: false }))
                        }
                        className={cn(
                          "self-start justify-self-end [grid-area:1/1]",
                        )}
                      >
                        <X size={32} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <hr className={cn("border-t-background-600")} />
        </>
      )}

      <div className={cn("flex items-center gap-4")}>
        <Button
          variant="ghost"
          className={cn(
            "hover:bg-primary-600 hover:text-text-100 focus-visible:ring-primary-500 active:bg-primary-700",
            is_metoo && "bg-primary-500",
          )}
          title="Me Too"
          onClick={handleToggleMetoo}
        >
          <UserRoundPlus size={20} />
          {metoo_count}
        </Button>
        <Link to={`/post/${id}`}>
          <Button variant="ghost" title="Comments">
            <MessageSquareText size={20} />
            {comment_count}
          </Button>
        </Link>
        <Button
          variant="ghost"
          name="Comments"
          className={cn(
            "hover:bg-secondary-600 hover:text-text-100 focus-visible:ring-secondary-500 active:bg-secondary-700",
            is_watchlisted && "bg-secondary-500",
          )}
          title={is_watchlisted ? "Remove from watchlist" : "Add to watchlist"}
          onClick={handleToggleWatchlist}
        >
          {is_watchlisted ? (
            <>
              <Check size={20} /> Watching
            </>
          ) : (
            <>
              <Eye size={20} />
              Watch
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Post;
