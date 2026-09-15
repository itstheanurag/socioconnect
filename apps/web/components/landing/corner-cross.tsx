import React from "react";

export function CornerCross(_props: {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
}) {
  return null;
}

export function TrappedBorderFrame({
  children,
  className = "",
  dashed = false,
}: {
  children: React.ReactNode;
  className?: string;
  dashed?: boolean;
}) {
  return (
    <div
      className={`relative border ${
        dashed ? "border-dashed border-[#d3cdc0]" : "border-[#e7e3da]"
      } bg-white p-6 sm:p-8 ${className}`}
    >
      {children}
    </div>
  );
}
