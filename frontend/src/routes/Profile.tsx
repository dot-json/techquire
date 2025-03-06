import Post from "@/components/Post";
import { cn } from "@/lib/utils";
import { ArrowDownUp, CircleCheckBig, Pencil } from "lucide-react";
import React from "react";
import { useParams } from "react-router";

const Profile = () => {
  const { handle } = useParams();
  return (
    <div className={cn("flex flex-col gap-4 py-4 sm:gap-8 sm:py-8")}>
      <div
        className={cn(
          "sticky top-[calc(3.5rem-1px)] flex flex-col gap-4 rounded-xl rounded-t-none border border-background-600 bg-background-900 p-4 sm:top-[calc(3.5rem-1px)] sm:gap-8 sm:p-8",
        )}
      >
        <div className={cn("flex items-center gap-4")}>
          <img
            src="https://placehold.co/400x400"
            alt="profile_pic"
            className={cn("size-16 rounded-full border sm:size-24")}
          />
          <h1 className={cn("text-xl font-semibold sm:text-3xl")}>{handle}</h1>
        </div>
        <hr className={cn("border-t-background-600")} />
        <div className={cn("grid w-fit grid-flow-col gap-12")}>
          <div className={cn("flex flex-col items-center gap-2")}>
            <h2 className={cn("text-xl")}>Reputation</h2>
            <div className={cn("grid w-fit gap-4")}>
              <p className={cn("flex items-center gap-1 text-xl font-medium")}>
                <ArrowDownUp size={28} />
                112
              </p>
            </div>
          </div>
          <div className={cn("flex flex-col items-center gap-2")}>
            <h2 className={cn("text-xl")}>Posts</h2>
            <div className={cn("grid gap-4")}>
              <p className={cn("flex items-center gap-1 text-xl font-medium")}>
                <Pencil size={22} />
                21
              </p>
            </div>
          </div>
          <div className={cn("flex flex-col items-center gap-2")}>
            <h2 className={cn("text-xl")}>Solutions</h2>
            <div className={cn("grid gap-4")}>
              <p className={cn("flex items-center gap-1 text-xl font-medium")}>
                <CircleCheckBig />
                21
              </p>
            </div>
          </div>
        </div>
      </div>
      {Array.from({ length: 10 }).map((_, i) => (
        <Post key={i} id={i} metoo={i % 3 == 0} watched={i % 2 === 0} />
      ))}
    </div>
  );
};

export default Profile;
