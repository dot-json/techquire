import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "./atoms/Input";
import { Textarea } from "./atoms/Textarea";
import { Button } from "./atoms/Button";
import { Send, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { createPost } from "@/lib/slices/postSlice";
import { ClassValue } from "clsx";

interface CreatePostData {
  title: string;
  content: string;
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

  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.user);
  const [formData, setFormData] = useState<CreatePostData>({
    title: "",
    content: "",
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(createPost({ token, formData }));
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-background-600/75 bg-background-900 p-4",
        className,
      )}
    >
      <form onSubmit={handleSubmit} className={cn("flex flex-col gap-4")}>
        <div className={cn("flex items-center gap-2")}>
          <Input
            placeholder="Summarize the problem briefly"
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            value={formData.title}
            className={cn("h-12 md:text-lg")}
          />
          {isModal && (
            <Button
              variant="ghost"
              type="button"
              onClick={onClose}
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
            setFormData({ ...formData, content: e.target.value })
          }
          value={formData.content}
        />
        <Button className={cn("self-end")} type="submit">
          <Send size={16} />
          Post
        </Button>
      </form>
    </div>
  );
};

export default CreatePost;
