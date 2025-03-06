import { cn } from "@/lib/utils";
import React from "react";
import { Button } from "./atoms/Button";
import { Check, Eye, MessageSquareText, UserRoundPlus } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface PostProps {
  id: number;
  metoo?: boolean;
  watched?: boolean;
}

const Post = ({ id, metoo, watched }: PostProps) => {
  const content = `
This is a normal paragraph.

\`\`\`js
console.log("Hello, world!");
\`\`\`

Another paragraph after the code.

\`\`\`python
print("Hello, world!")
\`\`\`
`;
  const codeBlockRegex = /```([\w]*)\n([\s\S]*?)```/g;

  const formattedContent = [];
  let lastIndex = 0;

  content.replace(codeBlockRegex, (match, lang, code, offset) => {
    formattedContent.push(content.substring(lastIndex, offset));

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

  formattedContent.push(content.substring(lastIndex));

  return (
    <div
      key={id}
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-background-600/75 bg-background-900 p-4 transition-all",
      )}
    >
      <h1 className={cn("text-2xl")}>{id + 1}. Question of the post</h1>
      {formattedContent}
      <p className={cn("text-text-400")}>
        Posted at: {new Date().toLocaleDateString("hu-HU")}
      </p>
      <hr className={cn("border-t-background-600")} />
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
            <h1 className={cn("font-medium sm:text-base")}>username</h1>
          </div>
          {formattedContent}
        </div>
      </div>
      <hr className={cn("border-t-background-600")} />
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
          23
        </Button>
        <Button
          variant="ghost"
          name="Comments"
          className={cn(
            watched &&
              "bg-secondary-500 hover:bg-secondary-600 active:bg-secondary-700 focus-visible:ring-secondary-500 hover:text-text-100",
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
