import React, { useState, useEffect, useRef } from "react";
import { Toolbar } from "./Toolbar";
import { Thread } from "@liveblocks/react-ui";
import { ThreadData } from "@liveblocks/core";
import { useThreads, useEditThreadMetadata } from "@liveblocks/react/suspense";
import { useUser } from "@liveblocks/react";
import styles from "./ImageCanvas.module.css";
import { useMaxZIndex, useNearEdge } from "../hooks";

const ImageCanvas = () => {
  const [position, setPosition] = useState({ x: 400, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const imageRef = useRef<HTMLDivElement>(null);

  const { nearRightEdge, nearBottomEdge } = useNearEdge(imageRef);
  const { threads } = useThreads();

  const startDrag = (e: React.MouseEvent) => {
    setDragging(true);
    setOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const onDrag = (e: React.MouseEvent) => {
    if (!dragging) return;
    setPosition({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const stopDrag = () => setDragging(false);

  const zoomIn = () => setZoom((prevZoom) => Math.min(prevZoom + 0.2, 4));
  const zoomOut = () => setZoom((prevZoom) => Math.max(prevZoom - 0.2, 0.1));

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) {
        event.preventDefault();
        setZoom((prevZoom) => Math.min(4, Math.max(0.1, prevZoom - event.deltaY * 0.002)));
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div className={`${styles.wrapper} lb-root`}>
      <div className={styles.controls}>
        <button className={styles.button} onClick={zoomIn}>+</button>
        <button className={styles.button} onClick={zoomOut}>-</button>
      </div>

      <div
        className={styles.imageContainer}
        ref={imageRef}
        style={{
          position: "absolute",
          top: position.y,
          left: position.x,
          transform: `scale(${zoom})`,
          transformOrigin: "top left",
          transition: "transform 0.2s ease-out",
        }}
        onMouseDown={startDrag}
        onMouseMove={onDrag}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        <img src="/assets/images/george.png" alt="Draggable Image" draggable="false" className={styles.draggableImage} />
      </div>
      <div className={styles.threads}>

      {threads.map((thread) => (
        <StaticThread key={thread.id} thread={thread} imageRef={imageRef} zoom={zoom} position={position} />
      ))}
            </div>


<Toolbar imageRef={imageRef} zoom={zoom} />
    </div>
  );
};

function StaticThread({
  thread,
  imageRef,
  zoom,
  position,
}: {
  thread: ThreadData;
  imageRef: React.RefObject<HTMLDivElement>;
  zoom: number;
  position: { x: number; y: number };
}) {
  const { user: creator } = useUser(thread.comments[0].userId);
  const [open, setOpen] = useState(false);
  const maxZIndex = useMaxZIndex();
  const imageElement = imageRef.current;
  const imageRect = imageElement?.getBoundingClientRect() ?? { width: 1, height: 1, left: 0, top: 0 };
  const editThreadMetadata = useEditThreadMetadata();

  // **Thread Size - use dynamic from global css**
  const COMMENT_WIDTH = 348; 
  const COMMENT_HEIGHT = 150; 

  // Calculate the avatar's position
  const avatarX = imageRect.left + thread.metadata.x * zoom;
  const avatarY = imageRect.top + thread.metadata.y * zoom;

  // **Edge Detection for Comment Pop-Up**
  const nearRightEdge = avatarX + COMMENT_WIDTH > window.innerWidth;
  const nearBottomEdge = avatarY + COMMENT_HEIGHT > window.innerHeight;

  return (
    <div
      className={styles.staticThread}
      onPointerDown={() =>
        editThreadMetadata({
          threadId: thread.id,
          metadata: { zIndex: maxZIndex + 1 },
        })
      }
      style={{
        position: "absolute",
        top: avatarY,
        left: avatarX,
        zIndex: thread.metadata?.zIndex || 0,
      }}
      
    >
      {/* Avatar stays in the same position */}
      <div className={styles.avatar} onClick={() => setOpen(!open)}>
        {creator ? <img src={creator.avatar} alt={creator.name} width="28px" height="28px" draggable={false} /> : <div />}
      </div>

      {/* Comment box flips only when necessary */}
      {open ? (
        <Thread
          thread={thread}
          className="thread"
          data-flip-vertical={nearBottomEdge ? "true" : undefined}
          data-flip-horizontal={nearRightEdge ? "true" : undefined}
        />
      ) : null}
    </div>
  );
}


export default ImageCanvas;
