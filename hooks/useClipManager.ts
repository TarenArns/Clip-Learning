import { useState } from 'react';

export type Clip = {
  start: number;
  end: number;
  type: string;
};

export const useClipManager = (duration: number, currentTime: number) => {
  const [isClipping, setIsClipping] = useState(false);
  const [clipStart, setClipStart] = useState(0);
  const [clipEnd, setClipEnd] = useState(5);
  const [clips, setClips] = useState<Clip[]>([]);

  const handleClip = () => {
    setClipStart(currentTime);
    setClipEnd(Math.min(currentTime + 5, duration));
    setIsClipping(true);
  };

  const handleSave = () => {
    setClips([...clips, { start: clipStart, end: clipEnd, type: 'clip' }]);
    setIsClipping(false);
  };

  const handleCancel = () => {
    setIsClipping(false);
  };

  return {
    isClipping,
    clipStart,
    setClipStart,
    clipEnd,
    setClipEnd,
    clips,
    handleClip,
    handleSave,
    handleCancel,
  };
};
