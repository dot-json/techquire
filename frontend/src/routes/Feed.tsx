import { Checkbox } from "@/components/atoms/Checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select";
import CreatePost from "@/components/CreatePost";
import Post from "@/components/Post";
import { fetchPosts } from "@/lib/slices/postSlice";
import { AppDispatch, RootState } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const Feed = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.user);
  const { posts } = useSelector((state: RootState) => state.post);

  useEffect(() => {
    dispatch(fetchPosts(token));
  }, [token]);

  return (
    <div className={cn("grid flex-1 grid-cols-4 gap-4")}>
      <aside
        className={cn(
          "sticky top-[5.5rem] z-10 hidden h-fit flex-col gap-2 rounded-md border border-background-600/75 bg-background-900 p-4 lg:flex",
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
          <CreatePost />
          {posts.map((post, i) => (
            <Post
              key={i}
              id={post.id}
              title={post.title}
              content={post.content}
              solution={post.solution}
              user={post.user}
              comment_count={post.comment_count}
              is_metoo={post.is_metoo}
              metoo_count={post.metoo_count}
              is_watchlisted={post.is_watchlisted}
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
