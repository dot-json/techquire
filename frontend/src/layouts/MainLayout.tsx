import { ReactNode } from "react";
import Header from "../components/Header";
import { cn } from "../lib/utils";

const MainLayout = ({ children }: { children: ReactNode }) => {
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
    </>
  );
};

export default MainLayout;
