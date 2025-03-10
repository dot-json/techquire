import { cn } from "@/lib/utils";
import { Button } from "./atoms/Button";
import { Check, Eye, MessageSquareText, UserRoundPlus } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { PostData } from "@/lib/interfaces";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store";

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

const Post = ({
  id,
  title,
  content,
  solution,
  user,
  comment_count,
  created_at,
  metoo,
  watched,
}: PostData) => {
  const dispatch = useDispatch<AppDispatch>();

  const formattedPostContent = formatContentWithCodeBlocks(content);
  const formattedSolutionContent = solution
    ? formatContentWithCodeBlocks(solution.content)
    : null;

  return (
    <div
      key={id}
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-background-600/75 bg-background-900 p-4 transition-all",
      )}
    >
      <h1 className={cn("text-2xl")}>{title}</h1>
      {formattedPostContent}
      <div className={cn("flex items-center gap-1 text-text-500")}>
        <p>Posted at</p>
        <p>{new Date(created_at).toLocaleString("hu-HU")}</p>
        <p className={cn("mx-1")}>|</p>
        <p>By {user.username}</p>
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
                "flex flex-col gap-4 rounded-md border border-background-600 bg-background-900 p-4",
              )}
            >
              <div className={cn("flex items-center gap-3")}>
                <img
                  src="https://placehold.co/400x400"
                  alt="profile_pic"
                  className={cn("size-12 rounded-full border sm:size-12")}
                />
                <h1 className={cn("font-medium sm:text-base")}>
                  {solution.user.username}
                </h1>
              </div>
              {formattedSolutionContent}
              <div className={cn("flex items-center gap-1 text-text-500")}>
                <p>Posted at</p>
                <p>{new Date(solution.created_at).toLocaleString("hu-HU")}</p>
                <p className={cn("mx-1")}>|</p>
                <p>By {solution.user.username}</p>
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
            metoo &&
              "bg-primary-500 hover:bg-primary-600 hover:text-text-100 focus-visible:ring-primary-500 active:bg-primary-700",
          )}
          title="Me Too"
        >
          <UserRoundPlus size={20} />
          23
        </Button>
        <Button variant="ghost" title="Comments">
          <MessageSquareText size={20} />
          {comment_count}
        </Button>
        <Button
          variant="ghost"
          name="Comments"
          className={cn(
            watched &&
              "bg-secondary-500 hover:bg-secondary-600 hover:text-text-100 focus-visible:ring-secondary-500 active:bg-secondary-700",
          )}
          title={watched ? "Remove from watchlist" : "Add to watchlist"}
        >
          {watched ? (
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
