import { AppDispatch, RootState } from "@/lib/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useParams } from "react-router";
import { cn } from "@/lib/utils";
import {
  Check,
  Eye,
  LoaderCircle,
  Send,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  UserRoundPlus,
  X,
} from "lucide-react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "@/components/atoms/Button";
import {
  createComment,
  deleteComment,
  fetchPost,
  react,
  toggleMeToo,
  toggleWatchlist,
} from "@/lib/slices/postSlice";
import { Textarea } from "@/components/atoms/Textarea";

const formatContentWithCodeBlocks = (content: string) => {
  const codeBlockRegex = /```([\w]*)\n([\s\S]*?)```/g;
  const formattedContent: (string | JSX.Element)[] = [];
  let lastIndex = 0;

  content.replace(codeBlockRegex, (match, lang, code, offset) => {
    // Add text before the code block
    formattedContent.push(content.substring(lastIndex, offset));

    // Add the code block with syntax highlighting
    formattedContent.push(
      <SyntaxHighlighter
        key={offset}
        language={lang || "javascript"}
        style={oneDark}
        customStyle={{
          padding: "1rem",
          backgroundColor: "rgba(20, 21, 21, 0.5)",
          border: "1px solid rgba(55, 56, 56, 0.75)",
          fontSize: "1rem",
          margin: "0",
        }}
      >
        {code.trim()}
      </SyntaxHighlighter>,
    );

    lastIndex = offset + match.length;
    return "";
  });

  // Add any remaining text
  formattedContent.push(content.substring(lastIndex));

  return formattedContent;
};

const OpenedPost = () => {
  const { post_id: postIdParam } = useParams();
  const post_id = postIdParam ? parseInt(postIdParam) : NaN;
  const dispatch = useDispatch<AppDispatch>();
  const { id, role, token, profile_picture_url } = useSelector(
    (state: RootState) => state.user,
  );
  const { posts, loading } = useSelector((state: RootState) => state.post);
  const [newComment, setNewComment] = useState({ content: "" });
  const [isCommenting, setIsCommenting] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  if (isNaN(post_id)) {
    return <Navigate to="/feed" />;
  }

  const handleToggleMetoo = () => {
    dispatch(toggleMeToo({ token, post_id: post_id }));
  };

  const handleToggleWatchlist = () => {
    dispatch(toggleWatchlist({ token, post_id: post_id }));
  };

  const handleLikeComment = (comment_id: number) => {
    dispatch(react({ token, post_id, comment_id, reaction: "like" }));
  };

  const handleDislikeComment = (comment_id: number) => {
    dispatch(react({ token, post_id, comment_id, reaction: "dislike" }));
  };

  const handleDeleteComment = (comment_id: number) => {
    dispatch(deleteComment({ token, post_id, comment_id }));
  };

  const handleSubmitComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(
      createComment({
        token,
        post_id: post_id,
        content: newComment.content,
      }),
    ).then(() => {
      setNewComment({ content: "" });
      setIsCommenting(false);
    });
  };

  useEffect(() => {
    const loadPost = async () => {
      await dispatch(fetchPost({ token, post_id: post_id }));
      setInitialLoadComplete(true);
    };

    loadPost();
  }, [dispatch, post_id, token]);

  if (loading || !initialLoadComplete) {
    return (
      <div
        className={cn(
          "z-[771] grid size-full flex-1 place-items-center bg-background-950",
        )}
      >
        <LoaderCircle size={64} className={cn("animate-spin")} />
      </div>
    );
  }

  const formattedPostContent = formatContentWithCodeBlocks(posts[0].content);
  const formattedSolutionContent = posts[0].solution
    ? formatContentWithCodeBlocks(posts[0].solution.content)
    : null;

  return (
    <div
      className={cn(
        "my-4 grid flex-1 grid-flow-row grid-cols-1 gap-4 lg:my-0 lg:grid-flow-col lg:grid-cols-4",
      )}
    >
      <aside
        className={cn(
          "top-[5.5rem] z-10 flex h-fit w-full flex-col gap-4 rounded-lg border border-background-600/75 bg-background-900 p-4 lg:sticky",
        )}
      >
        <div className={cn("flex items-center gap-4")}>
          <img
            src={
              posts[0].user.profile_picture_url
                ? `${import.meta.env.VITE_SERVICE_URL}${posts[0].user.profile_picture_url}`
                : "https://www.gravatar.com/avatar/?d=identicon&s=400"
            }
            alt="profile_pic"
            className={cn("size-16 rounded-full border")}
          />
          <Link
            to={`/profile/${posts[0].user.username}`}
            className={cn("text-xl")}
          >
            {posts[0].user.username}
          </Link>
        </div>
        <hr className={cn("border-t-background-600")} />
        <div className={cn("flex flex-wrap items-center gap-1")}>
          <p>Posted at</p>
          <p>{new Date(posts[0].created_at).toLocaleString("en-US")}</p>
        </div>
        <hr className={cn("border-t-background-600")} />
        <Button
          variant="neutral"
          className={cn(
            "hover:border-primary-600 hover:bg-primary-600 hover:text-text-100 focus-visible:ring-primary-500 active:border-primary-700 active:bg-primary-700",
            posts[0].is_metoo && "bg-primary-500",
          )}
          title="Me Too"
          onClick={handleToggleMetoo}
        >
          <UserRoundPlus size={20} />
          Me Too
        </Button>
        <Button
          variant="neutral"
          name="Comments"
          className={cn(
            "hover:border-secondary-600 hover:bg-secondary-600 hover:text-text-100 focus-visible:ring-secondary-500 active:border-secondary-700 active:bg-secondary-700",
            posts[0].is_watchlisted && "bg-secondary-500",
          )}
          title={
            posts[0].is_watchlisted
              ? "Remove from watchlist"
              : "Add to watchlist"
          }
          onClick={handleToggleWatchlist}
        >
          {posts[0].is_watchlisted ? (
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
      </aside>
      <div
        className={cn(
          "flex h-fit flex-col gap-4 rounded-lg border border-background-600/75 bg-background-900 p-4 lg:col-span-3 lg:my-8",
        )}
      >
        <h1 className={cn("text-2xl")}>{posts[0].title}</h1>
        {formattedPostContent}
        <hr className={cn("border-t-background-600")} />
        {posts[0].solution && (
          <>
            <div
              className={cn(
                "flex flex-col gap-4 rounded-md border border-success/25 bg-success/15 p-4",
              )}
            >
              <h2 className={cn("text-xl font-medium text-success")}>
                Solution
              </h2>
              <div
                className={cn(
                  "flex flex-col gap-4 rounded-md border border-background-600 bg-background-900 p-4",
                )}
              >
                <div className={cn("flex items-center gap-3")}>
                  <img
                    src={
                      posts[0].solution.user.profile_picture_url
                        ? `${import.meta.env.VITE_SERVICE_URL}${posts[0].solution.user.profile_picture_url}`
                        : "https://www.gravatar.com/avatar/?d=identicon&s=400"
                    }
                    alt="profile_pic"
                    className={cn("size-12 rounded-full border sm:size-12")}
                  />
                  <h1 className={cn("font-medium sm:text-base")}>
                    {posts[0].solution.user.username}
                  </h1>
                </div>
                {formattedSolutionContent}
                <div className={cn("flex items-center gap-1 text-text-500")}>
                  <p>Posted at</p>
                  <p>
                    {new Date(posts[0].solution.created_at).toLocaleString(
                      "en-US",
                    )}
                  </p>
                  <p className={cn("mx-1")}>|</p>
                  <p>
                    By{" "}
                    <Link
                      to={`/profile/${posts[0].solution.user.username}`}
                      className={cn(
                        "rounded-sm px-0.5 underline decoration-transparent underline-offset-2 outline-none hover:decoration-text-500 focus-visible:ring-2 focus-visible:ring-text-500",
                      )}
                    >
                      {posts[0].solution.user.username}
                    </Link>
                  </p>
                </div>
              </div>
            </div>
            <hr className={cn("border-t-background-600")} />
          </>
        )}
        <div className={cn("flex flex-col gap-4")}>
          <h2 className={cn("text-xl")}>{posts[0].comment_count} Comments</h2>
          <div className={cn("grid grid-cols-[auto_1fr] gap-4")}>
            <img
              src={
                profile_picture_url
                  ? `${import.meta.env.VITE_SERVICE_URL}${profile_picture_url}`
                  : "https://www.gravatar.com/avatar/?d=identicon&s=400"
              }
              alt="profile_pic"
              className={cn("size-12 rounded-full border")}
            />
            <form
              onSubmit={handleSubmitComment}
              className={cn("flex flex-col gap-2")}
            >
              <Textarea
                placeholder={"Write a comment..."}
                onChange={(e) =>
                  setNewComment({ ...newComment, content: e.target.value })
                }
                onClick={() => setIsCommenting(true)}
                value={newComment.content}
                className={cn("min-h-0")}
              />
              {isCommenting && (
                <div className={cn("flex items-center gap-2 self-end")}>
                  <Button
                    size="sm"
                    type="button"
                    variant="ghost"
                    onClick={() => setIsCommenting(false)}
                  >
                    <X size={16} />
                    Cancel
                  </Button>
                  <Button size="sm" type="submit">
                    <Send size={14} />
                    Post
                  </Button>
                </div>
              )}
            </form>
          </div>
          {posts[0].comments?.map((comment) => (
            <div
              key={comment.id}
              className={cn("grid grid-cols-[auto_1fr_auto] gap-4")}
            >
              <img
                src={
                  comment.user.profile_picture_url
                    ? `${import.meta.env.VITE_SERVICE_URL}${comment.user.profile_picture_url}`
                    : "https://www.gravatar.com/avatar/?d=identicon&s=400"
                }
                alt="profile_pic"
                className={cn("size-12 rounded-full border")}
              />
              <div className={cn("flex flex-col")}>
                <div className={cn("flex items-center gap-2")}>
                  <Link
                    to={`/profile/${comment.user.username}`}
                    className={cn("flex items-center gap-2")}
                  >
                    <p className={cn("font-medium")}>{comment.user.username}</p>
                  </Link>
                  <p className={cn("text-sm font-light text-text-400")}>
                    {new Date(comment.created_at).toLocaleString("en-US")}
                  </p>
                </div>
                <p>{comment.content}</p>
                <div className={cn("mt-2 flex items-center gap-2")}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "px-2 text-sm",
                      comment.is_liked &&
                        "bg-success/50 hover:bg-success/40 active:bg-success/60",
                    )}
                    onClick={() => handleLikeComment(comment.id)}
                  >
                    <ThumbsUp size={16} />
                    {comment.like_count}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "px-2 text-sm",
                      comment.is_disliked &&
                        "bg-error/50 hover:bg-error/40 active:bg-error/60",
                    )}
                    onClick={() => handleDislikeComment(comment.id)}
                  >
                    <ThumbsDown size={16} />
                    {comment.dislike_count}
                  </Button>
                </div>
              </div>
              {(id === comment.user.id ||
                role === "admin" ||
                role === "moderator") && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteComment(comment.id)}
                  className={cn(
                    "text-error hover:bg-error/25 active:bg-error/40",
                  )}
                >
                  <Trash2 size={18} />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OpenedPost;
