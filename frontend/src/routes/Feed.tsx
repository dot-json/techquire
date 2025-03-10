import { Checkbox } from "@/components/atoms/Checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select";
import Post from "@/components/Post";
import { PostData } from "@/lib/interfaces";
import { RootState } from "@/lib/store";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Feed = () => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const { token } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const fetchPosts = async () => {
      axios
        .get(`${import.meta.env.VITE_SERVICE_URL}/posts`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          setPosts(res.data);
        });
    };
    if (token) fetchPosts();
  }, [token]);

  return (
    <div className={cn("grid flex-1 grid-cols-4 gap-4")}>
      <aside
        className={cn(
          "sticky top-[5.5rem] hidden h-fit flex-col gap-2 rounded-md border border-background-600/75 bg-background-900 p-4 lg:flex",
        )}
      >
        <h2 className={cn("text-lg text-text-200")}>Filters</h2>
        <div className={cn("flex flex-col gap-2 px-2")}>
          <Checkbox label="Filter 1" />
          <Checkbox label="Filter 2" />
          <Checkbox label="Filter 3" />
        </div>
        <div className={cn("flex flex-col gap-2")}>
          <h2 className={cn("text-lg text-text-200")}>Sorting</h2>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="blueberry">Blueberry</SelectItem>
                <SelectItem value="grapes">Grapes</SelectItem>
                <SelectItem value="pineapple">Pineapple</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </aside>
      <div className={cn("col-span-full py-4 sm:py-8 lg:col-span-3")}>
        <div className={cn("flex flex-col gap-4")}>
          {posts.map((post, i) => (
            <Post
              key={i}
              id={post.id}
              title={post.title}
              content={post.content}
              solution={post.solution}
              user={post.user}
              comment_count={post.comment_count}
              metoo={i % 3 == 0}
              watched={i % 2 === 0}
              created_at={post.created_at}
            />
          ))}
          <div
            className={cn(
              "rounded-xl border border-background-600/75 bg-background-900 p-2 text-center",
            )}
          >
            END OF POSTS
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
