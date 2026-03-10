'use client';

import { Tabs, Tab, Button, Card, Modal, ModalContent, Accordion, AccordionItem } from "@heroui/react";
import { useState, useRef, useEffect } from "react";
import ClipModalCard from "../components/ClipModal";
import AnnotationModalCard from "../components/AnnotationModal";
import ClipPlayer from "../components/ClipPlayer";

export default function Home() {
  const [isClipping, setIsClipping] = useState(false);
  const [clipStart, setClipStart] = useState(0);
  const [clipEnd, setClipEnd] = useState(5);
  const [clipType, setClipType] = useState<'clip' | 'annotation'>('clip');
  const [clips, setClips] = useState<{ start: number, end: number, type: string, title: string, tags: string, description: string, thumbnail: string }[]>([]);
  const [annotations, setAnnotations] = useState<{ start: number, end: number, type: string, title: string, tags: string, keyTerms: string, questions: string }[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const seekBarRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [thumbnail, setThumbnail] = useState("");
  const [editingIndex, setEditingIndex] = useState<{type: 'clip' | 'annotation', index: number} | null>(null);
  const [hoveredAnnotation, setHoveredAnnotation] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('clip');
  const [cardIndices, setCardIndices] = useState<{[key: string]: number}>({});
  const [seekPreview, setSeekPreview] = useState<{time: number, x: number} | null>(null);
  const [previewThumbnail, setPreviewThumbnail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const clipColors = ['bg-blue-500/40', 'bg-green-500/40', 'bg-purple-500/40', 'bg-yellow-500/40', 'bg-red-500/40', 'bg-cyan-500/40', 'bg-orange-500/40', 'bg-indigo-500/40'];
  const annotationColors = ['bg-pink-500/40', 'bg-rose-500/40', 'bg-fuchsia-500/40', 'bg-violet-500/40', 'bg-amber-500/40', 'bg-lime-500/40', 'bg-teal-500/40', 'bg-emerald-500/40'];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, []);

  const handleClip = (type: 'clip' | 'annotation') => {
    if (videoRef.current) {
      setClipStart(0);
      setClipEnd(Math.min(30, duration));
      setClipType(type);
      setIsClipping(true);
    }
  };

  const handleSave = () => {
    if (clipType === 'annotation') {
      setShowModal(true);
    } else if (videoRef.current) {
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

  const handleModalSave = (title: string, tags: string, descriptionOrKeyTerms: string, questions?: string) => {
    if (clipType === 'clip') {
      const item = { start: clipStart, end: clipEnd, type: clipType, title, tags, description: descriptionOrKeyTerms, thumbnail };
      if (editingIndex !== null && editingIndex.type === 'clip') {
        const newClips = [...clips];
        newClips[editingIndex.index] = item;
        setClips(newClips);
        setEditingIndex(null);
      } else {
        setClips([...clips, item]);
      }
    } else {
      const item = { start: clipStart, end: clipEnd, type: clipType, title, tags, keyTerms: descriptionOrKeyTerms, questions: questions || "" };
      if (editingIndex !== null && editingIndex.type === 'annotation') {
        const newAnnotations = [...annotations];
        newAnnotations[editingIndex.index] = item;
        setAnnotations(newAnnotations);
        setEditingIndex(null);
      } else {
        setAnnotations([...annotations, item]);
      }
    }
    setIsClipping(false);
    setShowModal(false);
    setThumbnail("");
  };

  const handleDelete = () => {
    if (editingIndex !== null) {
      if (editingIndex.type === 'clip') {
        setClips(clips.filter((_, i) => i !== editingIndex.index));
      } else {
        setAnnotations(annotations.filter((_, i) => i !== editingIndex.index));
      }
    }
    setEditingIndex(null);
    setShowModal(false);
    setIsClipping(false);
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

  const handleSeekBarHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!previewVideoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const time = pos * duration;
    setSeekPreview({ time, x: e.clientX - rect.left });
    
    const canvas = document.createElement('canvas');
    canvas.width = previewVideoRef.current.videoWidth;
    canvas.height = previewVideoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    previewVideoRef.current.currentTime = time;
    previewVideoRef.current.onseeked = () => {
      ctx?.drawImage(previewVideoRef.current!, 0, 0, canvas.width, canvas.height);
      setPreviewThumbnail(canvas.toDataURL());
      previewVideoRef.current!.onseeked = null;
    };
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

  const filteredClips = clips.filter(clip => {
    const query = searchQuery.toLowerCase();
    return clip.title.toLowerCase().includes(query) || clip.tags.toLowerCase().includes(query);
  });

  const groupedClips = filteredClips.reduce((acc, clip) => {
    const tag = clip.tags || 'Untagged';
    if (!acc[tag]) acc[tag] = [];
    acc[tag].push(clip);
    return acc;
  }, {} as {[key: string]: typeof clips});

  const nextCard = (tag: string) => {
    const current = cardIndices[tag] || 0;
    const max = groupedClips[tag].length - 1;
    setCardIndices({...cardIndices, [tag]: current < max ? current + 1 : 0});
  };

  const prevCard = (tag: string) => {
    const current = cardIndices[tag] || 0;
    const max = groupedClips[tag].length - 1;
    setCardIndices({...cardIndices, [tag]: current > 0 ? current - 1 : max});
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <Tabs className="flex justify-center mb-8" radius="full" size="lg" selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key as string)}>
        <Tab key="clip" title="Clip" />
        <Tab key="review" title="Review" />
      </Tabs>

      {activeTab === 'clip' ? (
      <div className="max-w-6xl mx-auto">
        <video ref={previewVideoRef} src="/01-FieldStudiesI.mp4" className="hidden" preload="metadata" />
        <div ref={videoContainerRef} className="bg-gray-900 rounded-lg overflow-hidden shadow-xl relative">
          <video
            ref={videoRef}
            className="w-full aspect-video"
            src="/01-FieldStudiesI.mp4"
            preload="metadata"
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          />
          {hoveredAnnotation !== null && (
            <div className="absolute top-4 right-4 bg-gray-900/95 p-4 rounded-lg shadow-xl max-w-sm border border-gray-700">
              <h4 className="font-semibold text-white mb-2">{annotations[hoveredAnnotation].title}</h4>
              <p className="text-sm text-gray-400 mb-2">{annotations[hoveredAnnotation].tags}</p>
              <p className="text-xs text-gray-500 mb-2">{formatTime(annotations[hoveredAnnotation].start)} - {formatTime(annotations[hoveredAnnotation].end)}</p>
              <div className="text-sm text-gray-300">
                <p className="font-semibold mb-1">Key Terms:</p>
                <p className="mb-2">{annotations[hoveredAnnotation].keyTerms}</p>
                <p className="font-semibold mb-1">Questions:</p>
                <p>{annotations[hoveredAnnotation].questions}</p>
              </div>
            </div>
          )}

          <div className="bg-gray-800 p-4">
            <div className="flex ">
              <div className="flex flex-col justify-between text-xs text-gray-400 w-16 pb-2">
                <span>Progress</span>
                <span>Clips</span>
                <span>Notes</span>
              </div>
              <div ref={seekBarRef} className="relative flex-1" onMouseMove={handleSeekBarHover} onMouseLeave={() => setSeekPreview(null)}>
              {seekPreview && previewThumbnail && (
                <div
                  className="absolute bottom-full mb-2 -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-2 pointer-events-none z-50"
                  style={{ left: `${seekPreview.x}px` }}
                >
                  <img src={previewThumbnail} alt="Preview" className="w-40 h-auto rounded" />
                  <p className="text-xs text-gray-300 text-center mt-1">{formatTime(seekPreview.time)}</p>
                </div>
              )}

              <div className="h-2 bg-gray-700 rounded cursor-pointer mb-3" onClick={handleSeek}>
                <div className="absolute h-2 bg-gray-500 rounded" style={{ width: `${(currentTime / duration) * 100}%` }} />
              </div>

              <div className="relative h-2 bg-gray-700/50 rounded mb-3">
                {clips.map((clip, i) => (
                  <div
                    key={i}
                    className={`absolute h-3 -top-0.5 ${clipColors[i % clipColors.length]} rounded cursor-pointer hover:h-4 hover:-top-1 transition-all`}
                    style={{
                      left: `${(clip.start / duration) * 100}%`,
                      width: `${((clip.end - clip.start) / duration) * 100}%`
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setClipStart(clip.start);
                      setClipEnd(clip.end);
                      setClipType('clip');
                      setThumbnail(clip.thumbnail);
                      setEditingIndex({type: 'clip', index: i});
                      setShowModal(true);
                    }}
                  />
                ))}
                {isClipping && clipType === 'clip' && (
                  <div
                    className="absolute h-3 -top-0.5 border-2 border-blue-500 rounded cursor-move hover:h-4 hover:-top-1 transition-all"
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
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-8 bg-blue-500 rounded cursor-ew-resize"
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
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-8 bg-blue-500 rounded cursor-ew-resize"
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

              <div className="relative h-2 bg-gray-700/50 rounded mb-3">
                {annotations.map((ann, i) => (
                  <div
                    key={i}
                    className={`absolute h-3 -top-0.5 ${annotationColors[i % annotationColors.length]} rounded cursor-pointer hover:h-4 hover:-top-1 transition-all`}
                    style={{
                      left: `${(ann.start / duration) * 100}%`,
                      width: `${((ann.end - ann.start) / duration) * 100}%`
                    }}
                    onMouseEnter={() => setHoveredAnnotation(i)}
                    onMouseLeave={() => setHoveredAnnotation(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setClipStart(ann.start);
                      setClipEnd(ann.end);
                      setClipType('annotation');
                      setEditingIndex({type: 'annotation', index: i});
                      setShowModal(true);
                    }}
                  />
                ))}
                {isClipping && clipType === 'annotation' && (
                  <div
                    className="absolute h-3 -top-0.5 border-2 border-pink-500 rounded cursor-move hover:h-4 hover:-top-1 transition-all"
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
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-8 bg-pink-500 rounded cursor-ew-resize"
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
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-8 bg-pink-500 rounded cursor-ew-resize"
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

              <div className="absolute top-0 bottom-3 w-0.5 bg-gray-300 pointer-events-none z-10" style={{ left: `${(currentTime / duration) * 100}%` }}>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-300 rounded-full" />
              </div>
            </div>
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
          <Button color="primary" onPress={() => handleClip('clip')} isDisabled={isClipping}>Clip</Button>
          <Button color="primary" onPress={() => handleClip('annotation')} isDisabled={isClipping}>Annotate</Button>
          {isClipping && (
            <>
              <Button color="success" onPress={handleSave}>Save</Button>
              <Button color="danger" variant="flat" onPress={() => setIsClipping(false)}>Cancel</Button>
            </>
          )}
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-100">Clips</h3>
            {clips.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No clips yet</div>
            ) : (
              <Accordion variant="splitted">
                {clips.map((clip, i) => (
                  <AccordionItem
                    key={i}
                    indicator={<div className="text-6xl cursor-pointer">&lt;</div>}
                    title={
                      <div className="flex gap-3 items-start w-full cursor-pointer">
                        <img src={clip.thumbnail} alt="Clip thumbnail" className="w-48 h-32 object-cover rounded" />
                        <div className="flex-1">
                          <h4 className="font-semibold">{clip.title}</h4>
                          <p className="text-sm text-gray-400">{clip.tags}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatTime(clip.start)} - {formatTime(clip.end)}</p>
                          <p className="text-sm text-gray-300 mt-2 text-left">{clip.description}</p>
                        </div>
                      </div>
                    }
                    className="bg-gray-800 cursor-pointer"
                  >
                    <div className="flex items-center justify-center w-full">
                      <ClipPlayer src="/01-FieldStudiesI.mp4" start={clip.start} end={clip.end} className="w-[80%] aspect-video" />
                    </div>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </Card>

        <Card className="bg-gray-900 border-gray-800 mt-6">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-100">Annotations</h3>
            {annotations.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No annotations yet</div>
            ) : (
              <div className="space-y-3">
                {annotations.map((ann, i) => (
                  <div key={i} className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-100">{ann.title}</h4>
                    <p className="text-sm text-gray-400">{ann.tags}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatTime(ann.start)} - {formatTime(ann.end)}</p>
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-gray-300">Key Terms:</p>
                      <p className="text-sm text-gray-400">{ann.keyTerms}</p>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-gray-300">Questions:</p>
                      <p className="text-sm text-gray-400">{ann.questions}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-100">Review Clips by Tag</h2>
            <input
              type="text"
              placeholder="Search by tag or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          {Object.keys(groupedClips).length === 0 ? (
            <div className="text-gray-500 text-center py-8">No clips to review</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(groupedClips).map(([tag, tagClips]) => {
                const currentIndex = cardIndices[tag] || 0;
                const currentClip = tagClips[currentIndex];
                const clipIndex = clips.findIndex(c => c === currentClip);
                return (
                  <div key={tag} className="relative">
                    <h3 className="text-lg font-semibold text-gray-100 mb-3">{tag}</h3>
                    <div className="relative">
                      {tagClips.map((clip, i) => {
                        const offset = Math.abs(i - currentIndex);
                        const isVisible = offset < 3;
                        return isVisible ? (
                          <div
                            key={i}
                            className="absolute w-full transition-all duration-300"
                            style={{
                              transform: `translateY(${offset * -20}px) scale(${1 - offset * 0.05}) translateX(${offset * 20}px)`,
                              zIndex: tagClips.length - offset,
                              opacity: i === currentIndex ? 1 : 0.5,
                              pointerEvents: i === currentIndex ? 'auto' : 'none'
                            }}
                          >
                            <Card className="bg-gray-900 border-gray-800">
                              <ClipPlayer src="/01-FieldStudiesI.mp4" start={clip.start} end={clip.end} className="w-full aspect-video rounded-t-lg" />
                              <div className="p-4 text-center">
                                <h4 className="font-semibold text-gray-100">{clip.title}</h4>
                                <p className="text-xs text-gray-500 mt-1">{formatTime(clip.start)} - {formatTime(clip.end)}</p>
                                <p className="text-sm text-gray-300 mt-2">{clip.description}</p>
                                <Button
                                  size="sm"
                                  color="primary"
                                  variant="flat"
                                  className="mt-3"
                                  onPress={() => {
                                    setClipStart(clip.start);
                                    setClipEnd(clip.end);
                                    setClipType('clip');
                                    setThumbnail(clip.thumbnail);
                                    setEditingIndex({type: 'clip', index: clipIndex});
                                    setShowModal(true);
                                  }}
                                >
                                  Edit
                                </Button>
                              </div>
                            </Card>
                          </div>
                        ) : null;
                      })}
                      <div style={{ height: '400px' }} />
                    </div>
                    <div className="flex justify-between mt-4">
                      <Button size="sm" onPress={() => prevCard(tag)} isDisabled={tagClips.length <= 1}>←</Button>
                      <span className="text-gray-400 text-sm">{currentIndex + 1} / {tagClips.length}</span>
                      <Button size="sm" onPress={() => nextCard(tag)} isDisabled={tagClips.length <= 1}>→</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingIndex(null); }} size="md" className="bg-gray-900 p-0">
        <ModalContent>
          {clipType === 'clip' ? (
            <ClipModalCard
              thumbnail={thumbnail}
              clipStart={clipStart}
              clipEnd={clipEnd}
              formatTime={formatTime}
              onSave={handleModalSave}
              onCancel={() => { setShowModal(false); setEditingIndex(null); }}
              onDelete={editingIndex !== null ? handleDelete : undefined}
              initialTitle={editingIndex !== null && editingIndex.type === 'clip' ? clips[editingIndex.index]?.title : ""}
              initialTags={editingIndex !== null && editingIndex.type === 'clip' ? clips[editingIndex.index]?.tags : ""}
              initialDescription={editingIndex !== null && editingIndex.type === 'clip' ? clips[editingIndex.index]?.description : ""}
            />
          ) : (
            <AnnotationModalCard
              clipStart={clipStart}
              clipEnd={clipEnd}
              formatTime={formatTime}
              onSave={handleModalSave}
              onCancel={() => { setShowModal(false); setEditingIndex(null); }}
              onDelete={editingIndex !== null ? handleDelete : undefined}
              initialTitle={editingIndex !== null && editingIndex.type === 'annotation' ? annotations[editingIndex.index]?.title : ""}
              initialTags={editingIndex !== null && editingIndex.type === 'annotation' ? annotations[editingIndex.index]?.tags : ""}
              initialKeyTerms={editingIndex !== null && editingIndex.type === 'annotation' ? annotations[editingIndex.index]?.keyTerms : ""}
              initialQuestions={editingIndex !== null && editingIndex.type === 'annotation' ? annotations[editingIndex.index]?.questions : ""}
            />
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
