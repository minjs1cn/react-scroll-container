import React, { useRef } from "react";

type UseDragMoveOptions = {
  onStart?: (e: React.MouseEvent) => void;
  onMove?: (diff: { startX: number, clientX: number, startY: number, clientY: number; }) => void;
};

export function useDragMove({ onStart, onMove }: UseDragMoveOptions) {
  const ref = useRef<HTMLDivElement>(null);

  const onDragMove = (e: React.MouseEvent) => {

    const { clientY: startY, clientX: startX } = e;
    onStart?.(e);

    const handleMouseMove = (e: MouseEvent) => {

      const { clientY, clientX } = e;
      onMove?.({
        startX,
        clientX,
        startY,
        clientY
      });
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return {
    ref,
    onDragMove
  };
}