import { Button } from "@/components/atoms/Button";
import Post from "@/components/Post";
import { ProfileData } from "@/lib/interfaces";
import { fetchPosts } from "@/lib/slices/postSlice";
import { AppDispatch, RootState } from "@/lib/store";
import { cn } from "@/lib/utils";
import axios from "axios";
import {
  ArrowDownUp,
  CircleCheckBig,
  Loader2,
  LoaderCircle,
  Pencil,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";

const Profile = () => {
  const { handle } = useParams();
  const [profileData, setProfileData] = useState<ProfileData>();
  const dispatch = useDispatch<AppDispatch>();
  const { posts, pagination, loading } = useSelector(
    (state: RootState) => state.post,
  );
  const { token } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const fetchProfileData = async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_SERVICE_URL}/users/${handle}`,
      );
      console.log(res.data);
      setProfileData(res.data);
    };

    fetchProfileData();
    if (profileData?.id) {
      dispatch(
        fetchPosts({ token, page: 1, append: false, user_id: profileData.id }),
      );
    }
  }, [handle, profileData?.id]);

  const handleLoadMore = () => {
    if (pagination.has_more && profileData?.id) {
      dispatch(
        fetchPosts({
          token,
          page: pagination.page + 1,
          append: true,
          user_id: profileData.id,
        }),
      );
    }
  };

  if (!profileData) {
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

  return (
    <div className={cn("flex flex-col gap-4 py-4 sm:gap-8 sm:py-8")}>
      <div
        className={cn(
          "flex flex-col gap-4 rounded-xl border border-background-600 bg-background-900 p-4 sm:top-[calc(3.5rem-1px)] sm:gap-8 sm:p-6",
        )}
      >
        <div className={cn("flex items-center gap-4")}>
          <img
            src={
              profileData.profile_picture_url
                ? `${import.meta.env.VITE_SERVICE_URL}${profileData.profile_picture_url}`
                : "https://www.gravatar.com/avatar/?d=identicon&s=400"
            }
            alt="profile_pic"
            className={cn("size-16 rounded-full border sm:size-24")}
          />
          <h1 className={cn("text-xl font-semibold sm:text-3xl")}>
            {profileData.username}
          </h1>
        </div>
        <hr className={cn("border-t-background-600")} />
        <div className={cn("grid grid-flow-col gap-12 sm:w-fit")}>
          <div className={cn("flex flex-col items-center gap-2")}>
            <h2 className={cn("text-lg sm:text-xl")}>Reputation</h2>
            <div className={cn("grid w-fit gap-4")}>
              <p className={cn("flex items-center gap-2 text-xl font-medium")}>
                <ArrowDownUp size={28} />
                {profileData.reputation}
              </p>
            </div>
          </div>
          <div className={cn("flex flex-col items-center gap-2")}>
            <h2 className={cn("text-lg sm:text-xl")}>Posts</h2>
            <div className={cn("grid gap-4")}>
              <p className={cn("flex items-center gap-2 text-xl font-medium")}>
                <Pencil size={22} />
                {profileData.number_of_posts}
              </p>
            </div>
          </div>
          <div className={cn("flex flex-col items-center gap-2")}>
            <h2 className={cn("text-lg sm:text-xl")}>Solutions</h2>
            <div className={cn("grid gap-4")}>
              <p className={cn("flex items-center gap-2 text-xl font-medium")}>
                <CircleCheckBig />
                {profileData.number_of_solutions}
              </p>
            </div>
          </div>
        </div>
      </div>

      {posts.length === 0 && !loading ? (
        <div className="rounded-xl border border-background-600/75 bg-background-900 p-4 py-8 text-center">
          <p className="text-text-400">
            {profileData.username} hasn't created any posts yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <Post
              key={post.id}
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
                "Load More Posts"
              )}
            </Button>
          )}

          {!pagination.has_more && posts.length > 0 && (
            <div className="py-4 text-center text-sm text-text-400">
              No more posts to show.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
