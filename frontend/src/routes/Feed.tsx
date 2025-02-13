import { Checkbox } from "@/components/atoms/Checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select";
import useScroll from "@/lib/useScrollFeed";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

const Feed = () => {
  const [active, setActive] = useState<number>(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const { scrollInitiated, scrollDirection } = useScroll(carouselRef);

  useEffect(() => {
    if (scrollInitiated && scrollDirection === "down") {
      setActive((prev) => (prev === 9 ? 9 : prev + 1));
    } else if (scrollInitiated && scrollDirection === "up") {
      setActive((prev) => (prev === 0 ? 0 : prev - 1));
    }
  }, [scrollInitiated, scrollDirection]);

  return (
    <div className={cn("grid flex-1 grid-cols-4 gap-4 overflow-hidden")}>
      <aside
        className={cn(
          "my-8 hidden h-fit flex-col gap-2 rounded-md border border-background-600/75 bg-background-900 p-4 lg:flex",
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
      <div
        className={cn(
          "col-span-full max-h-[calc(100dvh-3.5rem-1px)] overflow-y-hidden py-4 sm:px-4 sm:py-8 lg:col-span-3",
        )}
      >
        <div
          className={cn(
            "no-momentum-scrolling scroll flex flex-col transition-all duration-300 ease-in-out",
          )}
          style={{
            transform: `translateY(calc(-${active} * 80dvh + ${active > 0 && active !== 9 ? 2 : 0}rem))`,
          }}
          ref={carouselRef}
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex h-[80dvh] flex-col gap-4 rounded-xl border border-background-600/75 bg-background-900 p-4 transition-all",
                active === i ? "scale-100" : "scale-[0.94] opacity-50",
              )}
              onClick={() => setActive(i)}
            >
              <h1 className={cn("text-2xl")}>{i + 1}. Question of the post</h1>
              <p>
                Description of the post. Description of the post. Description of
                the post. Description of the post. Description of the post.{" "}
              </p>
              <div
                className={cn(
                  "rounded-md border border-background-600/75 bg-background-950/50 p-4 text-text-300",
                )}
              >
                Random code example
              </div>
              <hr className={cn("border-t-background-600")} />
            </div>
          ))}
          <div
            className={cn(
              "mt-4 rounded-xl border border-background-600/75 bg-background-900 p-2 text-center",
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
