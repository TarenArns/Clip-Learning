'use client';

import { Tabs, Tab, Button, Card } from "@heroui/react";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [isClipping, setIsClipping] = useState(false);
  const [clipStart, setClipStart] = useState(0);
  const [clipEnd, setClipEnd] = useState(5);
  const [clips, setClips] = useState<{start: number, end: number, type: string}[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const seekBarRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, []);

  const handleClip = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      setClipStart(current);
      setClipEnd(Math.min(current + 5, duration));
      setIsClipping(true);
    }
  };

  const handleSave = () => {
    setClips([...clips, { start: clipStart, end: clipEnd, type: isClipping ? 'clip' : 'annotation' }]);
    setIsClipping(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = pos * duration;
      setCurrentTime(pos * duration);
    }
  };

  const cycleSpeed = () => {
    const speeds = [0.5, 1, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <Tabs className="flex justify-center mb-8" radius="full" size="lg">
        <Tab key="clip" title="Clip" />
        <Tab key="review" title="Review" />
      </Tabs>

      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-900 rounded-lg overflow-hidden shadow-xl">
          <video 
            ref={videoRef}
            className="w-full aspect-video"
            src="/01-FieldStudiesI.mp4"
            preload="metadata"
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          />
          
          <div className="bg-gray-800 p-4">
            <div ref={seekBarRef} className="relative h-2 bg-gray-700 rounded cursor-pointer mb-3" onClick={handleSeek}>
              <div className="absolute h-full bg-gray-500 rounded" style={{ width: `${(currentTime / duration) * 100}%` }} />
              
              {isClipping && (
                <div 
                  className="absolute h-full bg-blue-600 pointer-events-none"
                  style={{
                    left: `${(clipStart / duration) * 100}%`,
                    width: `${((clipEnd - clipStart) / duration) * 100}%`
                  }}
                >
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-6 bg-blue-500 rounded cursor-ew-resize pointer-events-auto"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const startX = e.clientX;
                      const startVal = clipStart;
                      const onMove = (me: MouseEvent) => {
                        if (seekBarRef.current) {
                          const rect = seekBarRef.current.getBoundingClientRect();
                          const delta = ((me.clientX - startX) / rect.width) * duration;
                          setClipStart(Math.max(0, Math.min(startVal + delta, clipEnd - 1)));
                        }
                      };
                      const onUp = () => {
                        document.removeEventListener('mousemove', onMove);
                        document.removeEventListener('mouseup', onUp);
                      };
                      document.addEventListener('mousemove', onMove);
                      document.addEventListener('mouseup', onUp);
                    }}
                  />
                  <div 
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-6 bg-blue-500 rounded cursor-ew-resize pointer-events-auto"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const startX = e.clientX;
                      const startVal = clipEnd;
                      const onMove = (me: MouseEvent) => {
                        if (seekBarRef.current) {
                          const rect = seekBarRef.current.getBoundingClientRect();
                          const delta = ((me.clientX - startX) / rect.width) * duration;
                          setClipEnd(Math.max(clipStart + 1, Math.min(startVal + delta, duration)));
                        }
                      };
                      const onUp = () => {
                        document.removeEventListener('mousemove', onMove);
                        document.removeEventListener('mouseup', onUp);
                      };
                      document.addEventListener('mousemove', onMove);
                      document.addEventListener('mouseup', onUp);
                    }}
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-gray-200">
              <button onClick={togglePlay} className="hover:text-white transition-colors">
                {isPlaying ? '⏸' : '▶'}
              </button>
              <span className="text-sm">{formatTime(currentTime)} / {formatTime(duration)}</span>
              <button onClick={cycleSpeed} className="text-sm hover:text-white transition-colors">{playbackRate}x</button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 my-6">
          <Button color="primary" onPress={handleClip} isDisabled={isClipping}>Clip</Button>
          <Button color="primary" onPress={handleClip} isDisabled={isClipping}>Annotate</Button>
          <Button color="success" onPress={handleSave} isDisabled={!isClipping}>Save</Button>
          <Button color="danger" variant="flat" onPress={() => setIsClipping(false)} isDisabled={!isClipping}>Cancel</Button>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-100">Clips</h3>
            {clips.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No clips yet</div>
            ) : (
              <div className="space-y-2">
                {clips.map((clip, i) => (
                  <div key={i} className="p-3 bg-gray-800 rounded text-gray-200">
                    {formatTime(clip.start)} - {formatTime(clip.end)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
