'use client';

import { formatTime } from '@/utils/time';

type VideoPlayerProps = {
  videoRef: React.RefObject<HTMLVideoElement>;
  seekBarRef: React.RefObject<HTMLDivElement>;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  playbackRate: number;
  isClipping: boolean;
  clipStart: number;
  clipEnd: number;
  onLoadedMetadata: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  onTimeUpdate: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  onSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
  onTogglePlay: () => void;
  onCycleSpeed: () => void;
  onClipStartDrag: (e: React.MouseEvent) => void;
  onClipEndDrag: (e: React.MouseEvent) => void;
};

export const VideoPlayer = ({
  videoRef,
  seekBarRef,
  duration,
  currentTime,
  isPlaying,
  playbackRate,
  isClipping,
  clipStart,
  clipEnd,
  onLoadedMetadata,
  onTimeUpdate,
  onSeek,
  onTogglePlay,
  onCycleSpeed,
  onClipStartDrag,
  onClipEndDrag,
}: VideoPlayerProps) => {
  return (
    <div className="bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full aspect-video"
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
      >
        <source src="/01-FieldStudiesI.mp4" type="video/mp4" />
      </video>

      <div className="bg-gray-900 p-4">
        <div ref={seekBarRef} className="relative h-2 bg-gray-700 rounded cursor-pointer mb-3" onClick={onSeek}>
          <div className="absolute h-full bg-gray-400 rounded" style={{ width: `${(currentTime / duration) * 100}%` }} />

          {isClipping && (
            <div
              className="absolute h-full bg-blue-500"
              style={{
                left: `${(clipStart / duration) * 100}%`,
                width: `${((clipEnd - clipStart) / duration) * 100}%`,
              }}
            >
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-6 bg-blue-700 rounded cursor-ew-resize"
                onMouseDown={onClipStartDrag}
              />
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-6 bg-blue-700 rounded cursor-ew-resize"
                onMouseDown={onClipEndDrag}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-white">
          <button onClick={onTogglePlay} className="hover:text-blue-400">
            {isPlaying ? '⏸' : '▶'}
          </button>
          <span className="text-sm">{formatTime(currentTime)} / {formatTime(duration)}</span>
          <button onClick={onCycleSpeed} className="text-sm hover:text-blue-400">{playbackRate}x</button>
        </div>
      </div>
    </div>
  );
};
