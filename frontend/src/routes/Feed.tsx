import { Button } from "@/components/atoms/Button";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Input } from "@/components/atoms/Input";
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
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

interface FilterOptions {
  metoos: boolean;
  watchlisted: boolean;
  solved: boolean;
  unsolved: boolean;
}
type SortOption =
  | "created_at_desc"
  | "created_at_asc"
  | "metoo_count_desc"
  | "metoo_count_asc";

const Feed = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.user);
  const { posts, pagination, loading } = useSelector(
    (state: RootState) => state.post,
  );

  const [filters, setFilters] = useState<FilterOptions>({
    metoos: false,
    watchlisted: false,
    solved: false,
    unsolved: false,
  });
  const [sortBy, setSortBy] = useState<SortOption>("created_at_desc");
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [isFilterChanged, setIsFilterChanged] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  // Load posts with current filters and sort
  const loadPosts = (page = 1, append = false) => {
    // Convert filter options to API parameters
    const params: Record<string, any> = {
      token,
      page,
      append,
    };

    // Handle sort parameters
    const [sort_by1, sort_by2, direction] = sortBy.split("_");
    params.sort_by = `${sort_by1}_${sort_by2}`;
    params.sort_dir = direction;

    // Add filter parameters if selected
    if (filters.metoos) params.is_metoo = true;
    if (filters.watchlisted) params.is_watchlisted = true;
    if (filters.solved) params.has_solution = true;
    if (filters.unsolved) params.has_solution = false;
    if (tags.length > 0) params.tags = tags.join(",");

    dispatch(fetchPosts({ token, ...params }));
  };

  // Handle checkbox changes, dont let unsolved and solved be checked at the same time
  const handleFilterChange = (filterName: keyof FilterOptions) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [filterName]: !prev[filterName] };

      // If unsolved and solved are both checked, uncheck one of them
      if (prev.solved && newFilters.unsolved) {
        newFilters.unsolved = true;
        newFilters.solved = false;
      } else if (prev.unsolved && newFilters.solved) {
        newFilters.solved = true;
        newFilters.unsolved = false;
      }

      return newFilters;
    });
  };

  // Handle sort changes
  const handleSortChange = (value: string) => {
    setSortBy(value as SortOption);
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      metoos: false,
      watchlisted: false,
      solved: false,
      unsolved: false,
    });
    setSortBy("created_at_desc");
  };

  const handleLoadMore = () => {
    if (pagination.has_more) {
      loadPosts(pagination.page + 1, true);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() !== "") {
      setTags((prev) => [...prev, newTag]);
      setNewTag("");
    }
  };

  useEffect(() => {
    loadPosts(1, false);
  }, [token]);

  // Handle filter changes
  useEffect(() => {
    // Count active filters for UI
    const count = Object.values(filters).filter(Boolean).length;
    setActiveFiltersCount(count);

    // Only reload if this isn't the initial render
    if (isFilterChanged) {
      loadPosts(1, false);
    } else {
      setIsFilterChanged(true);
    }
  }, [filters, sortBy, tags]);

  // This effect will reload posts if any filtered properties change
  useEffect(() => {
    // Skip the initial render and only run on updates
    if (isFilterChanged && posts.length > 0) {
      // Check if we need to reload based on active filters
      const needsReload =
        (filters.metoos && posts.some((post) => !post.is_metoo)) ||
        (filters.watchlisted && posts.some((post) => !post.is_watchlisted)) ||
        (filters.solved && posts.some((post) => !post.solution)) ||
        (filters.unsolved && posts.some((post) => post.solution));

      if (needsReload) {
        // Reload the current page
        loadPosts(pagination.page, false);
      }
    }
  }, [posts]);

  return (
    <div
      className={cn(
        "grid flex-1 grid-cols-1 gap-4 py-4 lg:grid-cols-4 lg:py-8",
      )}
    >
      <aside
        className={cn(
          "top-[5.5rem] z-10 flex h-fit flex-col gap-4 rounded-lg border border-background-600/75 bg-background-900 p-4 lg:sticky",
        )}
      >
        <div className={cn("flex flex-col gap-2")}>
          <div className={cn("flex items-center justify-between")}>
            <h2 className={cn("text-lg text-text-200")}>Filters</h2>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-6 px-2 text-xs text-text-400 hover:text-text-100"
              >
                <X className="mr-1 h-3 w-3" />
                Reset
              </Button>
            )}
          </div>
          <div className={cn("flex flex-col gap-2 px-2")}>
            {token !== "" && (
              <>
                <Checkbox
                  label="Me toos"
                  checked={filters.metoos}
                  onCheckedChange={() => handleFilterChange("metoos")}
                />
                <Checkbox
                  label="Watchlisted"
                  checked={filters.watchlisted}
                  onCheckedChange={() => handleFilterChange("watchlisted")}
                />
              </>
            )}
            <Checkbox
              label="Solved"
              checked={filters.solved}
              onCheckedChange={() => handleFilterChange("solved")}
            />
            <Checkbox
              label="Unsolved"
              checked={filters.unsolved}
              onCheckedChange={() => handleFilterChange("unsolved")}
            />
          </div>
        </div>
        <div className={cn("flex flex-col gap-2")}>
          <h2 className={cn("text-lg text-text-200")}>Sorting</h2>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="created_at_desc">Newest first</SelectItem>
                <SelectItem value="created_at_asc">Oldest first</SelectItem>
                <SelectItem value="metoo_count_desc">Most me toos</SelectItem>
                <SelectItem value="metoo_count_asc">Least me toos</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className={cn("flex flex-col gap-2")}>
          <h2 className={cn("text-lg text-text-200")}>Tags</h2>
          <div className={cn("flex items-center gap-2")}>
            <Input
              size={12}
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag"
              className={cn("w-full")}
            />
            <Button
              variant="neutral"
              size="sm"
              onClick={handleAddTag}
              className={cn(
                "h-10 border-none bg-background-700 hover:bg-background-600 active:bg-background-500",
              )}
            >
              Add
            </Button>
          </div>
          <div
            className={cn(
              "mt-2 flex flex-wrap gap-2",
              tags.length === 0 && "hidden",
            )}
          >
            {tags.map((tag, i) => (
              <div
                key={i}
                className={cn(
                  "flex h-8 select-none items-center gap-1 rounded-md bg-background-700 px-2 py-1 pl-3 text-sm font-medium text-text-100",
                )}
              >
                {`#${tag}`}
                <button
                  onClick={() => {
                    setTags((prev) => prev.filter((_, index) => index !== i));
                  }}
                  className={cn(
                    "rounded-md outline-none focus-visible:ring-2 focus-visible:ring-background-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background-600",
                  )}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>
      <div className={cn("col-span-full lg:col-span-3")}>
        <div className={cn("flex flex-col gap-4")}>
          {token !== "" && <CreatePost />}
          {posts.map((post, i) => (
            <Post
              key={i}
              id={post.id}
              title={post.title}
              content={post.content}
              tags={post.tags}
              solution={post.solution}
              user={post.user}
              comment_count={post.comment_count}
              is_metoo={post.is_metoo}
              metoo_count={post.metoo_count}
              is_watchlisted={post.is_watchlisted}
              created_at={post.created_at}
            />
          ))}
          {pagination.has_more && (
            <Button
              variant="neutral"
              onClick={handleLoadMore}
              disabled={loading}
              className={cn(
                "w-full rounded-xl border border-background-600/75 p-2",
              )}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : (
                "Load More"
              )}
            </Button>
          )}
          {!pagination.has_more && posts.length > 0 && (
            <div className={cn("py-4 text-center text-text-400")}>
              You've reached the end of the posts!
            </div>
          )}
          {posts.length === 0 && !loading && (
            <div className={cn("py-4 text-center text-text-400")}>
              No posts available. Try adjusting your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
