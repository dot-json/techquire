import { ReactNode } from "react";
import Header from "../components/Header";
import { cn } from "../lib/utils";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { LoaderCircle } from "lucide-react";
import BackToTop from "@/components/atoms/BackToTop";

const MainLayout = ({ children }: { children: ReactNode }) => {
  const { loading } = useSelector((state: RootState) => state.user);

  return (
    <>
      <Header />
      <main
        className={cn(
          "container flex min-h-[calc(100dvh-3.5rem-1px)] flex-col",
        )}
      >
        {children}
      </main>
      <div
        className={cn(
          "pointer-events-none fixed left-0 top-0 z-[771] grid h-[100dvh] w-full place-items-center bg-background-950 opacity-0 transition-opacity",
          loading && "pointer-events-auto opacity-100",
        )}
      >
        <LoaderCircle size={64} className={cn("animate-spin")} />
      </div>
      <BackToTop />
    </>
  );
};

export default MainLayout;
