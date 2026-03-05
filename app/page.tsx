'use client';

import { Tabs, Tab } from "@heroui/react";
import { useRef } from "react";
import { useVideoPlayer } from "@/hooks/useVideoPlayer";
import { useClipManager } from "@/hooks/useClipManager";
import { VideoPlayer } from "@/components/VideoPlayer";
import { ClipControls } from "@/components/ClipControls";
import { ClipList } from "@/components/ClipList";

export default function Home() {
  const seekBarRef = useRef<HTMLDivElement>(null);
  const {
    videoRef,
    duration,
    setDuration,
    currentTime,
    setCurrentTime,
    isPlaying,
    playbackRate,
    togglePlay,
    handleSeek,
    cycleSpeed,
  } = useVideoPlayer();

  const {
    isClipping,
    clipStart,
    setClipStart,
    clipEnd,
    setClipEnd,
    clips,
    handleClip,
    handleSave,
    handleCancel,
  } = useClipManager(duration, videoRef.current?.currentTime || 0);

  const onSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    handleSeek(pos);
  };

  const createDragHandler = (isStart: boolean) => (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startVal = isStart ? clipStart : clipEnd;
    const onMove = (me: MouseEvent) => {
      if (seekBarRef.current) {
        const rect = seekBarRef.current.getBoundingClientRect();
        const delta = ((me.clientX - startX) / rect.width) * duration;
        if (isStart) {
          setClipStart(Math.max(0, Math.min(startVal + delta, clipEnd - 1)));
        } else {
          setClipEnd(Math.max(clipStart + 1, Math.min(startVal + delta, duration)));
        }
      }
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  return (
    <div className="p-8">
      <Tabs className="flex justify-center mb-8" radius="full" size="lg">
        <Tab key="clip" title="Clip" />
        <Tab key="review" title="Review" />
      </Tabs>

      <div className="max-w-6xl mx-auto">
        <VideoPlayer
          videoRef={videoRef}
          seekBarRef={seekBarRef}
          duration={duration}
          currentTime={currentTime}
          isPlaying={isPlaying}
          playbackRate={playbackRate}
          isClipping={isClipping}
          clipStart={clipStart}
          clipEnd={clipEnd}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onSeek={onSeek}
          onTogglePlay={togglePlay}
          onCycleSpeed={cycleSpeed}
          onClipStartDrag={createDragHandler(true)}
          onClipEndDrag={createDragHandler(false)}
        />

        <ClipControls
          isClipping={isClipping}
          onClip={handleClip}
          onSave={handleSave}
          onCancel={handleCancel}
        />

        <ClipList clips={clips} />
      </div>
    </div>
  );
}
