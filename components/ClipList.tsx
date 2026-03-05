'use client';

import { Card } from '@heroui/react';
import { formatTime } from '@/utils/time';
import { Clip } from '@/hooks/useClipManager';

type ClipListProps = {
  clips: Clip[];
};

export const ClipList = ({ clips }: ClipListProps) => {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Clips</h3>
      {clips.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No clips yet</div>
      ) : (
        <div className="space-y-2">
          {clips.map((clip, i) => (
            <div key={i} className="p-3 bg-gray-100 rounded">
              {formatTime(clip.start)} - {formatTime(clip.end)}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
