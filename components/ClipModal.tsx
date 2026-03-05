'use client';

import { Card, Input, Textarea, CardFooter, Button } from "@heroui/react";
import { useState } from "react";

interface ClipModalCardProps {
  thumbnail: string;
  clipStart: number;
  clipEnd: number;
  formatTime: (seconds: number) => string;
  onSave: (title: string, tags: string, description: string) => void;
  onCancel: () => void;
}

export default function ClipModalCard({ thumbnail, clipStart, clipEnd, formatTime, onSave, onCancel }: ClipModalCardProps) {
  const [clipTitle, setClipTitle] = useState("");
  const [clipTags, setClipTags] = useState("");
  const [clipDescription, setClipDescription] = useState("");

  const handleSave = () => {
    onSave(clipTitle, clipTags, clipDescription);
    setClipTitle("");
    setClipTags("");
    setClipDescription("");
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      {thumbnail && (
        <div className="rounded-lg overflow-hidden">
          <img src={thumbnail} alt="Clip thumbnail" className="w-full" />
        </div>
      )}
      <div className="bg-gray-800 rounded-lg p-4">
        <p className="text-gray-300 text-sm">Time Range: {formatTime(clipStart)} - {formatTime(clipEnd)}</p>
      </div>
      <Input
        label="Title"
        placeholder="Enter clip title"
        value={clipTitle}
        onValueChange={setClipTitle}
        classNames={{ input: "bg-gray-800", inputWrapper: "bg-gray-800" }}
      />
      <Input
        label="Tag"
        placeholder="Enter clip tag"
        value={clipTags}
        onValueChange={setClipTags}
        classNames={{ input: "bg-gray-800", inputWrapper: "bg-gray-800" }}
      />
      <Textarea
        label="Description"
        placeholder="Enter clip description"
        value={clipDescription}
        onValueChange={setClipDescription}
        classNames={{ input: "bg-gray-800", inputWrapper: "bg-gray-800" }}
      />
      <CardFooter className="flex justify-end gap-2">
        <Button color="danger" variant="flat" onPress={onCancel}>
          Cancel
        </Button>
        <Button color="success" onPress={handleSave}>
          Save
        </Button>
      </CardFooter>
    </Card>
  );
}
