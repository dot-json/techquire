import Post from "@/components/Post";
import { PostData, ProfileData } from "@/lib/interfaces";
import { cn } from "@/lib/utils";
import axios from "axios";
import { ArrowDownUp, CircleCheckBig, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

const Profile = () => {
  const { handle } = useParams();
  const [profileData, setProfileData] = useState<ProfileData>();
  const [posts, setPosts] = useState<PostData[]>([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      const res = await axios.get(
        `${import.meta.env.VITE_SERVICE_URL}/users/${handle}`,
      );
      setProfileData(res.data);
    };
    const fetchPosts = async () => {
      axios
        .get(
          `${import.meta.env.VITE_SERVICE_URL}/posts?user_id=${profileData?.id}`,
        )
        .then((res) => {
          if (res.data !== null) setPosts(res.data);
        });
    };

    fetchProfileData();
    if (profileData?.id) fetchPosts();
  }, [handle, profileData?.id]);

  return (
    <div className={cn("flex flex-col gap-4 py-4 sm:gap-8 sm:py-8")}>
      <div
        className={cn(
          "sticky top-[calc(3.5rem-1px)] flex flex-col gap-4 rounded-xl rounded-t-none border border-background-600 bg-background-900 p-4 sm:top-[calc(3.5rem-1px)] sm:gap-8 sm:p-6",
        )}
      >
        <div className={cn("flex items-center gap-4")}>
          <img
            src="https://placehold.co/400x400"
            alt="profile_pic"
            className={cn("size-16 rounded-full border sm:size-24")}
          />
          <h1 className={cn("text-xl font-semibold sm:text-3xl")}>
            {profileData?.username}
          </h1>
        </div>
        <hr className={cn("border-t-background-600")} />
        <div className={cn("grid w-fit grid-flow-col gap-12")}>
          <div className={cn("flex flex-col items-center gap-2")}>
            <h2 className={cn("text-xl")}>Reputation</h2>
            <div className={cn("grid w-fit gap-4")}>
              <p className={cn("flex items-center gap-2 text-xl font-medium")}>
                <ArrowDownUp size={28} />
                {profileData?.reputation}
              </p>
            </div>
          </div>
          <div className={cn("flex flex-col items-center gap-2")}>
            <h2 className={cn("text-xl")}>Posts</h2>
            <div className={cn("grid gap-4")}>
              <p className={cn("flex items-center gap-2 text-xl font-medium")}>
                <Pencil size={22} />
                {profileData?.number_of_posts}
              </p>
            </div>
          </div>
          <div className={cn("flex flex-col items-center gap-2")}>
            <h2 className={cn("text-xl")}>Solutions</h2>
            <div className={cn("grid gap-4")}>
              <p className={cn("flex items-center gap-2 text-xl font-medium")}>
                <CircleCheckBig />
                {profileData?.number_of_solutions}
              </p>
            </div>
          </div>
        </div>
      </div>
      {posts.map((post, i) => (
        <Post
          key={i}
          id={post.id}
          title={post.title}
          content={post.content}
          solution={post.solution}
          user={post.user}
          comment_count={post.comment_count}
          is_metoo={i % 3 == 0}
          metoo_count={post.metoo_count}
          is_watchlisted={i % 2 === 0}
          created_at={post.created_at}
        />
      ))}
    </div>
  );
};

export default Profile;
