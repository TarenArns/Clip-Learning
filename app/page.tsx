'use client';

import { Tabs, Tab, Button, Card, Modal, ModalContent } from "@heroui/react";
import { useState, useRef, useEffect } from "react";
import ClipModalCard from "../components/ClipModal";

export default function Home() {
  const [isClipping, setIsClipping] = useState(false);
  const [clipStart, setClipStart] = useState(0);
  const [clipEnd, setClipEnd] = useState(5);
  const [clips, setClips] = useState<{ start: number, end: number, type: string, title: string, tags: string, description: string, thumbnail: string }[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const seekBarRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [thumbnail, setThumbnail] = useState("");

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, []);

  const handleClip = () => {
    if (videoRef.current) {
      setClipStart(0);
      setClipEnd(Math.min(30, duration));
      setIsClipping(true);
    }
  };

  const handleSave = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      const currentTime = videoRef.current.currentTime;
      videoRef.current.currentTime = clipStart;
      videoRef.current.onseeked = () => {
        ctx?.drawImage(videoRef.current!, 0, 0, canvas.width, canvas.height);
        setThumbnail(canvas.toDataURL());
        videoRef.current!.currentTime = currentTime;
        videoRef.current!.onseeked = null;
        setShowModal(true);
      };
    }
  };

  const handleModalSave = (title: string, tags: string, description: string) => {
    setClips([...clips, { start: clipStart, end: clipEnd, type: 'clip', title, tags, description, thumbnail }]);
    setIsClipping(false);
    setShowModal(false);
    setThumbnail("");
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

              {clips.map((clip, i) => (
                <div
                  key={i}
                  className="absolute h-4 -top-1 bg-blue-500/40 pointer-events-none rounded"
                  style={{
                    left: `${(clip.start / duration) * 100}%`,
                    width: `${((clip.end - clip.start) / duration) * 100}%`
                  }}
                />
              ))}

              {isClipping && (
                <div
                  className="absolute h-3 -top-0.5 border-2 border-blue-500 rounded hover:h-4 hover:-top-1 transition-all cursor-move pointer-events-auto"
                  style={{
                    left: `${(clipStart / duration) * 100}%`,
                    width: `${((clipEnd - clipStart) / duration) * 100}%`
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const startX = e.clientX;
                    const startClipStart = clipStart;
                    const clipDuration = clipEnd - clipStart;
                    const onMove = (me: MouseEvent) => {
                      if (seekBarRef.current) {
                        const rect = seekBarRef.current.getBoundingClientRect();
                        const delta = ((me.clientX - startX) / rect.width) * duration;
                        const newStart = Math.max(0, Math.min(startClipStart + delta, duration - clipDuration));
                        setClipStart(newStart);
                        setClipEnd(newStart + clipDuration);
                      }
                    };
                    const onUp = () => {
                      document.removeEventListener('mousemove', onMove);
                      document.removeEventListener('mouseup', onUp);
                    };
                    document.addEventListener('mousemove', onMove);
                    document.addEventListener('mouseup', onUp);
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
                  <div key={i} className="flex gap-3 p-3 bg-gray-800 rounded text-gray-200">
                    <img src={clip.thumbnail} alt="Clip thumbnail" className="w-48 h-32 object-cover rounded" />
                    <div className="flex-col col-gap-1">
                      <h4 className="font-semibold">{clip.title}</h4>
                      <p className="text-sm text-gray-400">{clip.tags}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatTime(clip.start)} - {formatTime(clip.end)}</p>
                    </div>
                    <p className="text-sm text-gray-300">{clip.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="md" className="bg-gray-900 p-0">
        <ModalContent>
          <ClipModalCard
            thumbnail={thumbnail}
            clipStart={clipStart}
            clipEnd={clipEnd}
            formatTime={formatTime}
            onSave={handleModalSave}
            onCancel={() => setShowModal(false)}
          />
        </ModalContent>
      </Modal>
    </div>
  );
}
