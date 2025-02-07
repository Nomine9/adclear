import { useState, useCallback, useRef, useEffect } from "react";
import { Composer } from "@liveblocks/react-ui";
import { useCreateThread } from "@liveblocks/react/suspense";
import { useSelf } from "@liveblocks/react";
import { useMaxZIndex, useNearEdge } from "../hooks";
import styles from "./Toolbar.module.css";
import avatarStyles from "./ImageCanvas.module.css";

export function Toolbar({ imageRef, zoom }) {
  const [state, setState] = useState<"initial" | "placing" | "placed">("initial");
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const reset = useCallback(() => {
    setState("initial");
    setCoords({ x: 0, y: 0 });
  }, []);

  const maxZIndex = useMaxZIndex();
  const ref = useRef(null);
  const { nearRightEdge, nearBottomEdge } = useNearEdge(ref);

  const handlePlaceComment = (e) => {
    if (!imageRef.current) return;

    const imageRect = imageRef.current.getBoundingClientRect();

    // Check if the click is within the image boundaries
    const isInsideImage =
      e.clientX >= imageRect.left &&
      e.clientX <= imageRect.right &&
      e.clientY >= imageRect.top &&
      e.clientY <= imageRect.bottom;

    if (isInsideImage) {
      // Adjust click coordinates relative to the **original (unzoomed) image**
      const relativeX = (e.clientX - imageRect.left) / zoom;
      const relativeY = (e.clientY - imageRect.top) / zoom;

      setCoords({ x: relativeX, y: relativeY });
      setState("placed");
    }
  };

  return (
    <>
      {/* Toolbar with Add Comment Button */}
      <div className={styles.toolbar}>
        <button
          className={styles.button}
          onClick={() => setState("placing")}
          style={{ cursor: state === "placing" ? "none" : undefined }}
        >
          Add a comment
        </button>
      </div>

      {/* Overlay that lets you click and cancel placing */}
      <div
        className={styles.cancelPlacing}
        onClick={reset}
        onContextMenu={(e) => {
          e.preventDefault();
          reset();
        }}
        data-enabled={state !== "initial" ? true : undefined}
      />

      {/* The visible cursor when you're placing */}
      {state === "placing" ? (
        <div
          className={styles.newThreadClick}
          onClick={handlePlaceComment} 
          onContextMenu={(e) => {
            e.preventDefault();
            reset();
          }}
        >
          <NewThreadCursor />
        </div>
      ) : null}

      {/* Show a composer for thread creation once the cursor is placed */}
      {state === "placed" ? (
        <ThreadComposer
          imageRef={imageRef}
          coords={coords}
          zoom={zoom}  // Pass zoom here
          maxZIndex={maxZIndex}
          nearRightEdge={nearRightEdge}
          nearBottomEdge={nearBottomEdge}
          onSubmit={() => setState("initial")}
        />
      ) : null}
    </>
  );
}

function ThreadComposer({
  imageRef,
  coords,
  zoom,  
  onSubmit,
}: {
  imageRef: React.RefObject<HTMLImageElement>;
  coords: { x: number; y: number };
  onSubmit: () => void;
}) {
  const createThread = useCreateThread();
  const creator = useSelf((me) => me.info);
  const maxZIndex = useMaxZIndex();

  // This is the reference that useNearEdge should use (NOT imageRef)
  const ref = useRef<HTMLDivElement>(null);
  const { nearRightEdge, nearBottomEdge } = useNearEdge(ref);

  // Convert stored relative coordinates back to **absolute screen position**
  const imageRect = imageRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
  const adjustedX = imageRect.left + coords.x * zoom; // Reapply zoom
  const adjustedY = imageRect.top + coords.y * zoom;

  return (
    <div
      ref={ref}
      className={styles.composerWrapper}
      style={{
        transform: `translate(${adjustedX}px, ${adjustedY}px)`,
      }}
    >
      <div className={avatarStyles.avatar} style={{ cursor: "default" }}>
        {creator ? (
          <img
            src={creator.avatar}
            alt={creator.name}
            width="28px"
            height="28px"
            draggable={false}
          />
        ) : (
          <div />
        )}
      </div>
      <Composer
        className="composer"
        onComposerSubmit={({ body }, e) => {
          e.preventDefault();
          createThread({
            body,
            metadata: {
              x: coords.x, 
              y: coords.y,
              zIndex: maxZIndex + 1,
            },
          });
          onSubmit();
        }}
        autoFocus={true}
        data-flip-vertical={nearBottomEdge || undefined}
        data-flip-horizontal={nearRightEdge || undefined}
      />
    </div>
  );
}

// Render the new thread component over the current user's cursor
function NewThreadCursor() {
  const [coords, setCoords] = useState({
    x: -10000,
    y: -10000,
  });

  useEffect(() => {
    const updatePosition = (e) => {
      setCoords({
        x: e.clientX,
        y: e.clientY,
      });
    };

    document.addEventListener("mousemove", updatePosition, false);
    document.addEventListener("mouseenter", updatePosition, false);

    return () => {
      document.removeEventListener("mousemove", updatePosition);
      document.removeEventListener("mouseenter", updatePosition);
    };
  }, []);

  return (
    <div
      className={styles.newThreadCursor}
      style={{
        transform: `translate(${coords.x}px, ${coords.y}px)`,
        zIndex: 99999999999,
      }}
    />
  );
}
