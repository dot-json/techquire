import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";
import { Input } from "./atoms/Input";
import { Textarea } from "./atoms/Textarea";
import { Button } from "./atoms/Button";
import { Paperclip, Send, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { createPost } from "@/lib/slices/postSlice";
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
}: {
  className?: ClassValue;
  isModal?: boolean;
  onClose?: () => void;
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
                setPostData({ title: "", content: "", tags: [] });
                setPictures([]);
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
            <Send size={16} />
            Post
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
