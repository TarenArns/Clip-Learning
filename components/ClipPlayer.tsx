'use client';

import { useRef, useState, useEffect } from 'react';

interface ClipPlayerProps {
  src: string;
  start: number;
  end: number;
  className?: string;
}

export default function ClipPlayer({ src, start, end, className = '' }: ClipPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = start;
    }
  }, [start]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const checkTime = () => {
      if (video.currentTime >= end) {
        video.currentTime = start;
        video.pause();
        setIsPlaying(false);
      }
    };

    video.addEventListener('timeupdate', checkTime);
    return () => video.removeEventListener('timeupdate', checkTime);
  }, [start, end]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const cycleSpeed = () => {
    const speeds = [0.5, 1, 1.5, 2];
    const nextSpeed = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative group ${className}`}>
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain rounded bg-black"
        preload="metadata"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button
          onClick={togglePlay}
          className="bg-white/90 hover:bg-white text-black rounded-full w-10 h-10 flex items-center justify-center text-xl"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button
          onClick={cycleSpeed}
          className="bg-white/90 hover:bg-white text-black rounded-full px-3 h-10 flex items-center justify-center text-sm font-semibold"
        >
          {playbackRate}x
        </button>
        <button
          onClick={toggleFullscreen}
          className="bg-white/90 hover:bg-white text-black rounded-full w-10 h-10 flex items-center justify-center text-xl"
        >
          ⛶
        </button>
      </div>
    </div>
  );
}
