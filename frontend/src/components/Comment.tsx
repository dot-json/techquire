import { cn } from "@/lib/utils";
import { Link } from "react-router";
import { Button } from "./atoms/Button";
import { Check, Pencil, ThumbsDown, ThumbsUp, Trash2 } from "lucide-react";
import { CommentData, PostData } from "@/lib/interfaces";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store";
import {
  deleteComment,
  react,
  toggleMarkAsSolution,
} from "@/lib/slices/postSlice";
import MarkdownRenderer from "./atoms/MarkdownRenderer";

const Comment = ({
  user_id,
  post_id,
  comment,
  post,
  token,
  onEditComment,
  onPictureClick,
}: {
  user_id: number;
  post_id: number;
  comment: CommentData;
  post: PostData;
  token: string;
  onEditComment: (comment: CommentData) => void;
  onPictureClick: (picture: string) => void;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const handleLikeComment = (comment_id: number) => {
    dispatch(react({ token, post_id, comment_id, reaction: "like" }));
  };

  const handleDislikeComment = (comment_id: number) => {
    dispatch(react({ token, post_id, comment_id, reaction: "dislike" }));
  };

  const handleDeleteComment = (comment_id: number) => {
    dispatch(deleteComment({ token, post_id, comment_id }));
  };

  const handleToggleSolution = (comment_id: number) => {
    dispatch(toggleMarkAsSolution({ token, post_id, comment_id }));
  };

  return (
    <div className={cn("grid grid-cols-[auto_1fr_auto] gap-4")}>
      <img
        src={
          comment.user.profile_picture_url
            ? `${import.meta.env.VITE_SERVICE_URL}${comment.user.profile_picture_url}`
            : "https://www.gravatar.com/avatar/?d=identicon&s=400"
        }
        alt="profile_pic"
        className={cn("size-12 rounded-full border")}
      />
      <div className={cn("flex flex-col gap-1")}>
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
        <MarkdownRenderer content={comment.content} />
        {comment.pictures && comment.pictures.length > 0 && (
          <div className={cn("flex flex-col gap-2")}>
            <h2 className={cn("text-text-400")}>Pictures</h2>
            <div className={cn("flex flex-wrap gap-2")}>
              {comment.pictures.map((picture, index) => (
                <img
                  key={index}
                  src={`${import.meta.env.VITE_SERVICE_URL}${picture}`}
                  alt="attachment"
                  className={cn(
                    "size-8 cursor-pointer rounded-md object-cover",
                  )}
                  onClick={() => onPictureClick(picture)}
                />
              ))}
            </div>
          </div>
        )}
        <div className={cn("mt-1 flex items-center gap-2")}>
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
          {post.solution === null &&
            token !== "" &&
            user_id === post.user.id && (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "px-2 text-sm",
                  comment.is_solution &&
                    "bg-success/50 hover:bg-success/40 active:bg-success/60",
                )}
                onClick={() => handleToggleSolution(comment.id)}
              >
                <Check size={16} />
                Mark as Solution
              </Button>
            )}
        </div>
      </div>
      {user_id === comment.user.id && (
        <div className={cn("flex gap-1")}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEditComment(comment)}
          >
            <Pencil size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteComment(comment.id)}
            className={cn("text-error hover:bg-error/25 active:bg-error/40")}
          >
            <Trash2 size={18} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Comment;
