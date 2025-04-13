import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";
import {
  MessageCircleQuestion,
  MessageSquareReply,
  Share2,
  SwatchBook,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router";

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-8 py-8 sm:gap-12 lg:flex-1 lg:grid-cols-2 lg:items-center lg:gap-8",
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-4 rounded-lg border border-background-600/50 bg-background-900 p-4 backdrop-blur-lg sm:p-8",
        )}
      >
        <h1 className={cn("text-4xl font-semibold sm:text-5xl xl:text-6xl")}>
          Get Tech Solutions Quickly
        </h1>
        <p className={cn("text-text-300 md:text-xl")}>
          Techquire connects you with a community of tech enthusiasts and
          professionals to solve your technical problems.
        </p>
        <div className={cn("flex flex-wrap items-center gap-4")}>
          <Button
            className={cn("w-full sm:w-auto")}
            onClick={() => navigate("/register")}
          >
            Join the Community
            <Share2 size={20} />
          </Button>
          <Button
            className={cn("w-full sm:w-auto")}
            variant="neutral"
            onClick={() => navigate("/feed")}
          >
            Explore Questions
            <MessageCircleQuestion size={20} />
          </Button>
        </div>
      </div>
      <div
        className={cn("flex max-w-lg flex-col items-center place-self-center")}
      >
        <div
          className={cn(
            "grid w-full grid-cols-[auto_1fr] gap-4 rounded-xl border border-dashed border-background-600 bg-background-900 p-4 sm:p-6",
          )}
        >
          <div
            className={cn(
              "aspect-square size-fit self-center rounded-full border border-background-600 bg-background-800 p-4",
            )}
          >
            <Users />
          </div>
          <div className={cn("flex flex-col justify-center")}>
            <h2 className={cn("text-lg font-semibold")}>Active Community</h2>
            <p className={cn("text-text-400")}>
              Thousands of tech enthusiasts ready to help
            </p>
          </div>
        </div>
        <div
          className={cn(
            "h-8 w-0 border-r border-dashed border-r-background-600",
          )}
        ></div>
        <div
          className={cn(
            "grid w-full grid-cols-[auto_1fr] gap-4 rounded-xl border border-dashed border-background-600 bg-background-900 p-4 sm:p-6",
          )}
        >
          <div
            className={cn(
              "aspect-square size-fit self-center rounded-full border border-background-600 bg-background-800 p-4",
            )}
          >
            <MessageSquareReply />
          </div>
          <div className={cn("flex flex-col justify-center")}>
            <h2 className={cn("text-lg font-semibold")}>Fast responses</h2>
            <p className={cn("text-text-400")}>
              Get answers to your questions in minutes
            </p>
          </div>
        </div>
        <div
          className={cn(
            "h-8 w-0 border-r border-dashed border-r-background-600",
          )}
        ></div>
        <div
          className={cn(
            "grid w-full grid-cols-[auto_1fr] gap-4 rounded-xl border border-dashed border-background-600 bg-background-900 p-4 sm:p-6",
          )}
        >
          <div
            className={cn(
              "aspect-square size-fit self-center rounded-full border border-background-600 bg-background-800 p-4",
            )}
          >
            <SwatchBook />
          </div>
          <div className={cn("flex flex-col justify-center")}>
            <h2 className={cn("text-lg font-semibold")}>Varied topics</h2>
            <p className={cn("text-text-400")}>
              Explore a wide range of tech fields
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
