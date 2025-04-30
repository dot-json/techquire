import { AppDispatch, RootState } from "@/lib/store";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import { cn } from "@/lib/utils";
import {
  Check,
  Eye,
  LoaderCircle,
  Paperclip,
  Pencil,
  Save,
  Send,
  Trash2,
  UserRoundPlus,
  X,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import {
  createComment,
  deleteCommentPicture,
  deletePost,
  editComment,
  fetchPost,
  toggleMarkAsSolution,
  toggleMeToo,
  toggleWatchlist,
} from "@/lib/slices/postSlice";
import { Textarea } from "@/components/atoms/Textarea";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/atoms/Dialog";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import CreatePost from "@/components/CreatePost";
import Dropzone from "react-dropzone";
import Comment from "@/components/Comment";
import MarkdownRenderer from "@/components/atoms/MarkdownRenderer";
import { toast } from "react-toastify";

const OpenedPost = () => {
  const { post_id: postIdParam } = useParams();
  const navigate = useNavigate();
  const post_id = postIdParam ? parseInt(postIdParam) : NaN;
  const dispatch = useDispatch<AppDispatch>();
  const { id, role, token, profile_picture_url } = useSelector(
    (state: RootState) => state.user,
  );
  const { posts, loading } = useSelector((state: RootState) => state.post);
  const [newComment, setNewComment] = useState({ content: "" });
  const [isCommenting, setIsCommenting] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [newCommentPictures, setNewCommentPictures] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<{
    url: string;
    open: Boolean;
  }>({
    url: "",
    open: false,
  });
  const [editPostOpen, setEditPostOpen] = useState(false);
  const [editCommentOpen, setEditCommentOpen] = useState(false);
  const [commentToEdit, setCommentToEdit] = useState<number>(-1);
  const [editedComment, setEditedComment] = useState<{
    content: string;
    pictures: File[];
  } | null>(null);

  if (isNaN(post_id)) {
    return <Navigate to="/feed" />;
  }

  const handleToggleMetoo = () => {
    dispatch(toggleMeToo({ token, post_id: post_id }));
  };

  const handleToggleWatchlist = () => {
    dispatch(toggleWatchlist({ token, post_id: post_id }));
  };

  const handleDeletePost = () => {
    dispatch(deletePost({ token, post_id: post_id })).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        setDeleteConfirmationOpen(false);
        navigate("/feed");
      }
    });
  };

  const handleSubmitComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(
      createComment({
        token,
        post_id: post_id,
        content: newComment.content,
        pictures: newCommentPictures,
      }),
    ).then(() => {
      setNewComment({ content: "" });
      setNewCommentPictures([]);
      setIsCommenting(false);
    });
  };

  const handleSubmitCommentEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (posts[0].comments === undefined) {
      return;
    }
    dispatch(
      editComment({
        token,
        post_id: post_id,
        comment_id: posts[0].comments[commentToEdit].id,
        content: editedComment?.content || "",
        pictures: newCommentPictures,
      }),
    ).then(() => {
      setEditCommentOpen(false);
      setEditedComment(null);
      setCommentToEdit(-1);
      setNewCommentPictures([]);
    });
  };

  const handleToggleSolution = (comment_id: number) => {
    dispatch(toggleMarkAsSolution({ token, post_id, comment_id }));
  };

  const handleDeleteCommentPicture = (comment_id: number, picture: string) => {
    dispatch(
      deleteCommentPicture({
        token,
        post_id,
        comment_id,
        picture_url: picture,
      }),
    );
  };

  const onPictureAdd = useCallback(
    (acceptedFiles: File[]) => {
      // If more than 5 pictures are selected, toast error
      if (newCommentPictures.length + acceptedFiles.length > 5) {
        toast.error("You can only upload a maximum of 5 pictures at a time.");
        return;
      }
      // If file size is more than 5MB, toast error
      if (acceptedFiles.some((file) => file.size > 5 * 1024 * 1024)) {
        toast.error("File size should be less than 5MB.");
        return;
      }
      // If file type is not jpeg, png, jpg or webp, toast error
      if (
        acceptedFiles.some(
          (file) =>
            !["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(
              file.type,
            ),
        )
      ) {
        toast.error("Only JPEG, PNG, JPG and WEBP files are allowed.");
        return;
      }
      // Handle same name files, add a number to the end of the file name if duplicate
      const newFiles = acceptedFiles.map((file) => {
        const fileName = file.name.split(".")[0];
        const fileExtension = file.name.split(".")[1];
        const fileExists = newCommentPictures.find((f) => f.name === file.name);
        if (fileExists) {
          let i = 1;
          while (
            newCommentPictures.find(
              (f) => f.name === `${fileName}(${i}).${fileExtension}`,
            )
          ) {
            i++;
          }
          return new File([file], `${fileName}(${i}).${fileExtension}`, {
            type: file.type,
          });
        }
        return file;
      });
      setNewCommentPictures((prev) => [...prev, ...newFiles]);
    },
    [newCommentPictures],
  );

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

  if (posts.length === 0) {
    return (
      <div
        className={cn(
          "z-[771] grid size-full flex-1 place-items-center bg-background-950",
        )}
      >
        <p className={cn("text-text-200")}>No posts found</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "my-4 grid grid-flow-row grid-cols-1 gap-4 lg:my-0 lg:flex-1 lg:grid-flow-col lg:grid-cols-4",
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
        <div className={cn("flex items-start justify-between gap-4")}>
          <h1 className={cn("text-2xl font-semibold")}>{posts[0].title}</h1>
          {(role === "moderator" ||
            role === "admin" ||
            id === posts[0].user.id) && (
            <div className={cn("flex items-center gap-1")}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditPostOpen(true)}
              >
                <Pencil size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteConfirmationOpen(true)}
                className={cn(
                  "text-error hover:bg-error/25 active:bg-error/40",
                )}
              >
                <Trash2 size={18} />
              </Button>
              <div
                className={cn(
                  "fixed left-0 top-0 z-50 grid h-[100dvh] w-full place-items-center bg-background-950/80 backdrop-blur-sm transition-opacity",
                  editPostOpen
                    ? "opacity-100"
                    : "pointer-events-none opacity-0",
                )}
              >
                <div
                  className={cn(
                    "fixed left-0 top-0 hidden h-[100dvh] w-full sm:block",
                  )}
                  onClick={() => setEditPostOpen(false)}
                ></div>
                <CreatePost
                  isModal={true}
                  onClose={() => setEditPostOpen(false)}
                  oldPostData={posts[0]}
                  editMode={true}
                  className={cn(
                    "z-50 h-full w-full max-w-[50rem] sm:h-fit sm:border",
                  )}
                />
              </div>
            </div>
          )}
        </div>
        <MarkdownRenderer content={posts[0].content} />
        {posts[0].pictures && posts[0].pictures.length > 0 && (
          <div className={cn("flex flex-col gap-2")}>
            <h3 className={cn("text-lg text-text-400")}>Pictures</h3>
            <div className={cn("flex flex-wrap gap-4")}>
              {posts[0].pictures.map((picture, id) => (
                <div key={id}>
                  {picture && (
                    <img
                      src={`${import.meta.env.VITE_SERVICE_URL}${picture}`}
                      alt="post_attachment"
                      className={cn("size-10 cursor-pointer rounded-md")}
                      onClick={() =>
                        setImagePreview({ url: picture, open: true })
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {posts[0].tags && posts[0].tags.length > 0 && (
          <div className={cn("flex flex-col")}>
            <h2 className={cn("text-lg text-text-400")}>Tags</h2>
            <div className={cn("mt-2 flex flex-wrap gap-2")}>
              {posts[0].tags.map((tag, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex h-8 select-none items-center gap-1 rounded-md bg-background-700 px-2 py-1 pl-3 text-sm font-medium text-text-100",
                  )}
                >
                  {`#${tag}`}
                </div>
              ))}
            </div>
          </div>
        )}
        <hr className={cn("border-t-background-600")} />
        {posts[0].solution && (
          <>
            <div
              className={cn(
                "flex flex-col gap-4 rounded-md border border-success/25 bg-success/15 p-4",
              )}
            >
              <div className={cn("flex items-center justify-between")}>
                <h2 className={cn("text-xl font-medium text-success")}>
                  Solution
                </h2>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    posts[0].solution &&
                    handleToggleSolution(posts[0].solution.id)
                  }
                  className={cn(
                    "text-text-400 hover:bg-error/25 hover:text-error active:bg-error/40",
                  )}
                >
                  <X size={16} />
                  Remove Solution
                </Button>
              </div>
              <div
                className={cn(
                  "grid grid-cols-[auto_1fr_auto] gap-4 rounded-md border border-background-600 bg-background-900 p-4",
                )}
              >
                <img
                  src={
                    posts[0].solution.user.profile_picture_url
                      ? `${import.meta.env.VITE_SERVICE_URL}${posts[0].solution.user.profile_picture_url}`
                      : "https://www.gravatar.com/avatar/?d=identicon&s=400"
                  }
                  alt="profile_pic"
                  className={cn("size-12 rounded-full border sm:size-12")}
                />
                <div className={cn("flex flex-col gap-1")}>
                  <div className={cn("flex items-center gap-2")}>
                    <Link
                      to={`/profile/${posts[0].solution.user.username}`}
                      className={cn(
                        "rounded-sm px-0.5 underline decoration-transparent underline-offset-2 outline-none transition-colors hover:decoration-text-100 focus-visible:ring-2 focus-visible:ring-text-500",
                      )}
                    >
                      <h1 className={cn("font-medium sm:text-base")}>
                        {posts[0].solution.user.username}
                      </h1>
                    </Link>
                    <p className={cn("text-sm font-light text-text-400")}>
                      {new Date(posts[0].solution.created_at).toLocaleString(
                        "en-US",
                      )}
                    </p>
                  </div>
                  <MarkdownRenderer content={posts[0].solution.content} />
                  {posts[0].solution.pictures &&
                    posts[0].solution.pictures.length > 0 && (
                      <div className={cn("mt-1 flex flex-col gap-2")}>
                        <h2 className={cn("text-sm text-text-400")}>
                          Pictures
                        </h2>
                        <div className={cn("flex flex-wrap gap-2")}>
                          {posts[0].solution.pictures.map((picture, index) => (
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
                      </div>
                    )}
                </div>
              </div>
            </div>
            <hr className={cn("border-t-background-600")} />
          </>
        )}
        <div className={cn("flex flex-col gap-4")}>
          <h2
            className={cn("text-xl")}
          >{`${posts[0].comment_count} Comment${posts[0].comment_count > 1 ? "s" : ""}`}</h2>
          {token !== "" && (
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
                  <div
                    className={cn(
                      "flex w-full items-center justify-between gap-2",
                    )}
                  >
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button type="button" size="sm" variant="neutral">
                          <Paperclip size={16} />
                          {`Add Pictures ${newCommentPictures.length > 0 ? `(${newCommentPictures.length})` : ""}`}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Pictures</DialogTitle>
                          <DialogDescription>
                            Drag and drop your files here or click to select
                            files.
                          </DialogDescription>
                        </DialogHeader>
                        <Dropzone
                          onDrop={onPictureAdd}
                          accept={{ "image/*": [".jpeg", ".png", ".jpg"] }}
                          noClick
                        >
                          {({
                            getRootProps,
                            getInputProps,
                            open,
                            isDragActive,
                          }) => (
                            <div
                              {...getRootProps()}
                              className={cn(
                                "relative flex size-full h-72 flex-col gap-2 overflow-y-auto rounded-md border border-dashed border-background-600 p-2",
                              )}
                            >
                              <input {...getInputProps()} />
                              <p
                                className={cn(
                                  "grid size-full place-items-center",
                                )}
                                onClick={open}
                              >
                                Drag & drop files here, or click to select files
                              </p>
                              <p
                                className={cn(
                                  "pointer-events-none absolute inset-0 grid size-full place-items-center bg-background-700/50 text-xl font-medium backdrop-blur-md transition-opacity ease-in-out",
                                  isDragActive ? "opacity-100" : "opacity-0",
                                )}
                              >
                                Drop the files here ...
                              </p>
                            </div>
                          )}
                        </Dropzone>
                        <div
                          className={cn(
                            "flex flex-wrap gap-2",
                            newCommentPictures.length === 0 && "hidden",
                          )}
                        >
                          {newCommentPictures.map((file, i) => (
                            <div
                              key={i}
                              className={cn(
                                "flex items-center justify-between gap-2 rounded-md bg-background-700 p-3",
                              )}
                            >
                              <div className={cn("flex items-center gap-2")}>
                                <span>{file.name}</span>
                              </div>
                              <button
                                onClick={() =>
                                  setNewCommentPictures((prev) =>
                                    prev.filter((_, index) => index !== i),
                                  )
                                }
                              >
                                <X size={20} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <DialogClose asChild>
                          <Button
                            type="button"
                            disabled={newCommentPictures.length === 0}
                          >
                            Ok
                          </Button>
                        </DialogClose>
                      </DialogContent>
                    </Dialog>
                    <div className={cn("flex items-center gap-2")}>
                      <Button
                        size="sm"
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setIsCommenting(false);
                          setNewComment({ content: "" });
                          setNewCommentPictures([]);
                        }}
                      >
                        <X size={16} />
                        Cancel
                      </Button>
                      <Button size="sm" type="submit">
                        <Send size={14} />
                        Post
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}
          {posts[0].comments?.map((comment, idx) => (
            <Comment
              key={comment.id}
              user_id={id}
              post_id={post_id}
              comment={comment}
              post={posts[0]}
              token={token}
              onEditComment={() => {
                setEditCommentOpen(true);
                setCommentToEdit(idx);
                setEditedComment({
                  content: comment.content,
                  pictures: [],
                });
              }}
              onPictureClick={(url) => setImagePreview({ url, open: true })}
            />
          ))}
          <div
            className={cn(
              "fixed left-0 top-0 z-50 grid h-[100dvh] w-full place-items-center bg-background-950/80 backdrop-blur-sm transition-opacity",
              editCommentOpen ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            <div
              className={cn(
                "fixed left-0 top-0 hidden h-[100dvh] w-full sm:block",
              )}
              onClick={() => {
                setEditCommentOpen(false);
                setCommentToEdit(-1);
                setNewCommentPictures([]);
              }}
            ></div>
            <div
              className={cn(
                "z-50 flex h-full w-full max-w-[50rem] flex-col gap-4 rounded-lg border border-background-600/75 bg-background-900 p-4 sm:h-fit sm:border",
              )}
            >
              {commentToEdit !== -1 && (
                <form
                  onSubmit={handleSubmitCommentEdit}
                  className={cn("flex flex-col gap-4")}
                >
                  <div className={cn("flex gap-2")}>
                    <Textarea
                      placeholder={"Write a comment..."}
                      onChange={(e) =>
                        setEditedComment((prev) => {
                          if (prev) {
                            return { ...prev, content: e.target.value };
                          }
                          return { content: e.target.value, pictures: [] };
                        })
                      }
                      value={editedComment?.content || ""}
                      className={cn("min-h-24")}
                    />
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => {
                        setEditCommentOpen(false);
                      }}
                      className={cn("size-fit text-text-200")}
                    >
                      <X size={32} />
                    </Button>
                  </div>
                  {posts[0].comments?.[commentToEdit].pictures &&
                    posts[0].comments?.[commentToEdit].pictures.length > 0 && (
                      <div className={cn("flex flex-col gap-2")}>
                        <h3 className={cn("text-lg text-text-400")}>
                          Pictures
                        </h3>
                        <div className={cn("flex flex-wrap gap-4")}>
                          {posts[0].comments[commentToEdit].pictures.map(
                            (picture, id) => (
                              <div
                                key={id}
                                className={cn(
                                  "flex items-center gap-2 rounded-md border border-background-600 bg-background-800 p-2",
                                )}
                              >
                                {picture && (
                                  <img
                                    src={`${import.meta.env.VITE_SERVICE_URL}${picture}`}
                                    alt="post_attachment"
                                    className={cn(
                                      "size-10 cursor-pointer rounded-md",
                                    )}
                                    onClick={() =>
                                      setImagePreview({
                                        url: picture,
                                        open: true,
                                      })
                                    }
                                  />
                                )}

                                <Button
                                  size={"icon"}
                                  type="button"
                                  variant="ghost"
                                  className={cn(
                                    "text-error hover:bg-error/25 active:bg-error/40",
                                  )}
                                  onClick={() =>
                                    handleDeleteCommentPicture(
                                      posts[0].comments?.[commentToEdit]?.id ||
                                        0,
                                      picture.split("/").pop()!,
                                    )
                                  }
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  <div
                    className={cn("flex items-center justify-between gap-2")}
                  >
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button type="button" variant="neutral">
                          <Paperclip size={16} />
                          {`Add Pictures ${newCommentPictures.length > 0 ? `(${newCommentPictures.length})` : ""}`}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Pictures</DialogTitle>
                          <DialogDescription>
                            Drag and drop your files here or click to select
                            files.
                          </DialogDescription>
                        </DialogHeader>
                        <Dropzone
                          onDrop={onPictureAdd}
                          accept={{ "image/*": [".jpeg", ".png", ".jpg"] }}
                          noClick
                        >
                          {({
                            getRootProps,
                            getInputProps,
                            open,
                            isDragActive,
                          }) => (
                            <div
                              {...getRootProps()}
                              className={cn(
                                "relative flex size-full h-72 flex-col gap-2 overflow-y-auto rounded-md border border-dashed border-background-600 p-2",
                              )}
                            >
                              <input {...getInputProps()} />
                              <p
                                className={cn(
                                  "grid size-full place-items-center",
                                )}
                                onClick={open}
                              >
                                Drag & drop files here, or click to select files
                              </p>
                              <p
                                className={cn(
                                  "pointer-events-none absolute inset-0 grid size-full place-items-center bg-background-700/50 text-xl font-medium backdrop-blur-md transition-opacity ease-in-out",
                                  isDragActive ? "opacity-100" : "opacity-0",
                                )}
                              >
                                Drop the files here ...
                              </p>
                            </div>
                          )}
                        </Dropzone>
                        {newCommentPictures && (
                          <div className={cn("flex flex-wrap gap-2")}>
                            {newCommentPictures.map((file, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "flex items-center justify-between gap-2 rounded-md bg-background-700 p-3",
                                )}
                              >
                                <div className={cn("flex items-center gap-2")}>
                                  <span>{file.name}</span>
                                </div>
                                <button
                                  onClick={() =>
                                    setNewCommentPictures((prev) =>
                                      prev.filter((_, index) => index !== i),
                                    )
                                  }
                                >
                                  <X size={20} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <DialogClose asChild>
                          <Button
                            type="button"
                            disabled={newCommentPictures.length === 0}
                          >
                            Ok
                          </Button>
                        </DialogClose>
                      </DialogContent>
                    </Dialog>
                    <Button type="submit">
                      <Save size={18} />
                      Save
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      <div
        className={cn(
          "fixed left-0 top-0 z-[771] grid size-full place-items-center bg-background-950/50 p-4 backdrop-blur-sm transition-opacity",
          imagePreview.open === false && "pointer-events-none opacity-0",
        )}
      >
        <div
          className={cn("fixed left-0 top-0 h-[100dvh] w-full")}
          onClick={() => setImagePreview((prev) => ({ ...prev, open: false }))}
        ></div>
        {imagePreview.url && (
          <img
            src={`${import.meta.env.VITE_SERVICE_URL}${imagePreview.url}`}
            alt="post attachment"
            className={cn(
              "z-[771] max-h-[90vh] max-w-[90vw] object-cover object-center [grid-area:1/1]",
            )}
          />
        )}
        <button
          onClick={() => setImagePreview((prev) => ({ ...prev, open: false }))}
          className={cn("z-[771] self-start justify-self-end [grid-area:1/1]")}
        >
          <X size={32} />
        </button>
      </div>
      <Dialog
        open={deleteConfirmationOpen}
        onOpenChange={setDeleteConfirmationOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription className={cn("text-sm text-text-200")}>
              Do you really want to delete this post?
            </DialogDescription>
          </DialogHeader>
          <div className={cn("flex flex-col gap-4 sm:flex-row")}>
            <div className={cn("mt-4 flex w-full items-center gap-4")}>
              <Button
                variant="destructive"
                className={cn("w-full")}
                onClick={handleDeletePost}
              >
                Delete
              </Button>
              <Button
                variant="ghost"
                className={cn("w-full")}
                onClick={() => setDeleteConfirmationOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OpenedPost;
