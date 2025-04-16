import { cn } from "@/lib/utils";
import { ArrowUpToLine } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./Button";

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Scroll to top handler
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Smooth scrolling animation
    });
  };

  return (
    <Button
      type="button"
      variant="neutral"
      size={"icon"}
      className={cn(
        "fixed bottom-4 right-4 transition-opacity",
        !isVisible && "pointer-events-none opacity-0",
      )}
      onClick={scrollToTop}
    >
      <ArrowUpToLine />
    </Button>
  );
};

export default BackToTop;
