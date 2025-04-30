import { cn } from "@/lib/utils";
import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className,
}) => {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({
            node,
            inline,
            className,
            children,
            ...props
          }: {
            node?: any;
            inline?: boolean;
            className?: string;
            children?: React.ReactNode;
            [key: string]: any;
          }) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match && match[1] ? match[1] : "";

            return !inline && match ? (
              <SyntaxHighlighter
                style={oneDark}
                language={language}
                PreTag="div"
                className="overflow-auto rounded-md"
                showLineNumbers={true}
                wrapLines={true}
                customStyle={{
                  margin: "0.25rem 0",
                  borderRadius: "0.375rem",
                  background: "#1c1d1d",
                  border: "1px solid #262727",
                }}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code
                className="rounded-md border border-background-700 bg-background-800 px-1.5 py-0.5 font-mono text-sm"
                {...props}
              >
                {children}
              </code>
            );
          },
          // Style other markdown elements
          p: ({ children }) => <p>{children}</p>,
          h1: ({ children }) => (
            <h1 className="text-2xl font-semibold">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-medium">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium">{children}</h3>
          ),
          ul: ({ children }) => <ul className="ml-6 list-disc">{children}</ul>,
          ol: ({ children }) => (
            <ol className="ml-6 list-decimal">{children}</ol>
          ),
          li: ({ children }) => <li className="">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-background-600 pl-4 italic">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-background-700">{children}</thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => (
            <th className="border border-background-600 px-4 py-2 text-left">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-background-600 px-4 py-2">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;

// # Heading Level 1
// ## Heading Level 2
// ### Heading Level 3

// This is a **bold text** and this is an *italic text*. And here's ***bold and italic***.

// Here's a [link to Google](https://www.google.com) that you can click.

// > This is a blockquote that can be used for important notes or quotes from others.
// > It can span multiple lines and will be rendered in a distinct style.

// ## Lists

// ### Unordered List:
// - Item 1
// - Item 2
//   - Nested item 2.1
//   - Nested item 2.2
// - Item 3

// ### Ordered List:
// 1. First item
// 2. Second item
//    1. Nested item 2.1
//    2. Nested item 2.2
// 3. Third item

// ## Code Examples

// Inline code: `const greeting = "Hello World";`

// JavaScript code block:
// ```javascript
// // Function to calculate the Fibonacci sequence
// function fibonacci(n) {
//   if (n <= 1) return n;
//   return fibonacci(n - 1) + fibonacci(n - 2);
// }

// // Print the first 10 Fibonacci numbers
// for (let i = 0; i < 10; i++) {
//   console.log(fibonacci(i)); // 0, 1, 1, 2, 3, 5, 8, 13, 21, 34
// }
