"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ImageStatus = "loading" | "loaded" | "error";
const AvatarContext = React.createContext<{
  status: ImageStatus;
  setStatus: (s: ImageStatus) => void;
}>({ status: "loading", setStatus: () => {} });

const Avatar = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, children, ...props }, ref) => {
  const [status, setStatus] = React.useState<ImageStatus>("loading");
  return (
    <AvatarContext.Provider value={{ status, setStatus }}>
      <span
        ref={ref}
        className={cn(
          "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
          className
        )}
        {...props}
      >
        {children}
      </span>
    </AvatarContext.Provider>
  );
});
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, src, onLoad, onError, ...props }, ref) => {
  const { setStatus } = React.useContext(AvatarContext);

  React.useEffect(() => {
    if (!src) {
      setStatus("error");
      return;
    }

    const img = new window.Image();
    img.src = src;

    if (img.complete && img.naturalWidth > 0) {
      setStatus("loaded");
      return;
    }

    setStatus("loading");
    img.onload = () => setStatus("loaded");
    img.onerror = () => setStatus("error");

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, setStatus]);

  const { status } = React.useContext(AvatarContext);

  if (status !== "loaded" || !src) return null;

  return (
    <img
      ref={ref}
      src={src}
      className={cn("aspect-square h-full w-full object-cover", className)}
      onLoad={onLoad}
      onError={(e) => {
        setStatus("error");
        onError?.(e);
      }}
      {...props}
    />
  );
});
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  const { status } = React.useContext(AvatarContext);

  if (status === "loaded") return null;

  return (
    <span
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-primary-100 text-primary-700 font-medium",
        className
      )}
      {...props}
    />
  );
});
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
