import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { Input } from "./atoms/Input";
import { Textarea } from "./atoms/Textarea";
import { Button } from "./atoms/Button";
import { Paperclip, Save, Send, Trash2, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import {
  createPost,
  deletePostPicture,
  editPost,
} from "@/lib/slices/postSlice";
import { ClassValue } from "clsx";
import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./atoms/Dialog";
import Dropzone from "react-dropzone";

interface CreatePostData {
  title: string;
  content: string;
  tags?: string[];
}

const CreatePost = ({
  className,
  isModal = false,
  onClose,
  editMode = false,
  oldPostData,
}: {
  className?: ClassValue;
  isModal?: boolean;
  onClose?: () => void;
  editMode?: boolean;
  oldPostData?: {
    id: number;
    title: string;
    content: string;
    tags?: string[];
    pictures?: string[];
  };
}) => {
  const tutorialPlaceholder = `Write the details here...
You can use code blocks like this:
\`\`\`js
console.log("Hello, world!");
\`\`\``;

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.user);
  const [postData, setPostData] = useState<CreatePostData>({
    title: "",
    content: "",
    tags: [],
  });
  const [pictures, setPictures] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<{
    url: string;
    open: Boolean;
  }>({
    url: "",
    open: false,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editMode && oldPostData) {
      console.log(pictures);
      dispatch(
        editPost({
          token,
          post_id: oldPostData.id,
          title: postData.title,
          content: postData.content,
          tags: postData.tags,
          pictures,
        }),
      ).then((res) => {
        if (res.meta.requestStatus === "fulfilled") {
          onClose?.();
        }
      });
    } else {
      dispatch(
        createPost({
          token,
          title: postData.title,
          content: postData.content,
          tags: postData.tags,
          pictures,
        }),
      ).then((res) => {
        if (res.meta.requestStatus === "fulfilled") {
          onClose?.();
          navigate(`/post/${res.payload.id}`);
        }
      });
    }
  };

  const handleDeletePostImage = (picture_url: string) => {
    if (oldPostData) {
      dispatch(
        deletePostPicture({ token, post_id: oldPostData.id, picture_url }),
      );
    }
  };

  const onPictureAdd = useCallback(
    (acceptedFiles: File[]) => {
      // handle same name files, add a number to the end of the file name if duplicate
      const newFiles = acceptedFiles.map((file) => {
        const fileName = file.name.split(".")[0];
        const fileExtension = file.name.split(".")[1];
        const fileExists = pictures.find((f) => f.name === file.name);
        if (fileExists) {
          let i = 1;
          while (
            pictures.find(
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
      setPictures((prev) => [...prev, ...newFiles]);
    },
    [pictures],
  );

  useEffect(() => {
    if (editMode && oldPostData) {
      console.log("oldPostData", oldPostData);
      setPostData({
        title: oldPostData.title,
        content: oldPostData.content,
        tags: oldPostData.tags || [],
      });
    }
  }, [
    editMode,
    oldPostData?.title,
    oldPostData?.content,
    oldPostData?.tags,
    oldPostData?.id,
    oldPostData?.pictures,
  ]);

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-background-600/75 bg-background-900 p-4",
        className,
      )}
    >
      <form onSubmit={handleSubmit} className={cn("flex flex-col gap-4")}>
        <div className={cn("flex items-center gap-2")}>
          <Input
            placeholder="Summarize the problem briefly"
            onChange={(e) =>
              setPostData({ ...postData, title: e.target.value })
            }
            value={postData.title}
            className={cn("h-12 md:text-lg")}
          />
          {isModal && (
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                if (!editMode) {
                  setPostData({ title: "", content: "", tags: [] });
                  setPictures([]);
                }
                onClose?.();
              }}
              className={cn("text-text-200")}
            >
              <X size={32} />
            </Button>
          )}
        </div>
        <hr className={cn("border-t-background-600")} />
        <Textarea
          placeholder={tutorialPlaceholder}
          onChange={(e) =>
            setPostData({ ...postData, content: e.target.value })
          }
          value={postData.content}
        />
        {oldPostData?.pictures && oldPostData.pictures?.length > 0 && (
          <div className={cn("flex flex-col gap-2")}>
            <h3 className={cn("text-lg text-text-400")}>Pictures</h3>
            <div className={cn("flex flex-wrap gap-4")}>
              {oldPostData.pictures?.map((picture, id) => (
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
                      className={cn("size-10 cursor-pointer rounded-md")}
                      onClick={() =>
                        setImagePreview({ url: picture, open: true })
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
                      handleDeletePostImage(picture.split("/").pop()!)
                    }
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
            <div
              className={cn(
                "fixed left-0 top-0 z-[771] grid size-full place-items-center bg-background-950/50 p-4 backdrop-blur-sm transition-opacity",
                imagePreview.open === false && "pointer-events-none opacity-0",
              )}
            >
              {imagePreview.url && (
                <img
                  src={`${import.meta.env.VITE_SERVICE_URL}${imagePreview.url}`}
                  alt="post attachment"
                />
              )}
              <button
                type="button"
                onClick={() =>
                  setImagePreview((prev) => ({ ...prev, open: false }))
                }
                className={cn("self-start justify-self-end [grid-area:1/1]")}
              >
                <X size={32} />
              </button>
            </div>
          </div>
        )}
        <div className={cn("flex items-center justify-between")}>
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" variant="neutral">
                <Paperclip size={16} />
                {`Add Pictures ${pictures.length > 0 ? `(${pictures.length})` : ""}`}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Pictures</DialogTitle>
                <DialogDescription>
                  Drag and drop your files here or click to select files.
                </DialogDescription>
              </DialogHeader>
              <Dropzone
                onDrop={onPictureAdd}
                accept={{ "image/*": [".jpeg", ".png", ".jpg"] }}
                noClick
              >
                {({ getRootProps, getInputProps, open, isDragActive }) => (
                  <div
                    {...getRootProps()}
                    className={cn(
                      "relative flex size-full h-72 flex-col gap-2 overflow-y-auto rounded-md border border-dashed border-background-600 p-2",
                    )}
                  >
                    <input {...getInputProps()} />
                    <p
                      className={cn("grid size-full place-items-center")}
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
                  pictures.length === 0 && "hidden",
                )}
              >
                {pictures.map((file, i) => (
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
                        setPictures((prev) =>
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
                <Button type="button" disabled={pictures.length === 0}>
                  Ok
                </Button>
              </DialogClose>
            </DialogContent>
          </Dialog>
          <Button type="submit">
            {editMode ? (
              <>
                <Save size={16} />
                Save
              </>
            ) : (
              <>
                <Send size={16} />
                Post
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
