'use client';

import { Card, Input, Textarea, CardFooter, Button } from "@heroui/react";
import { useState, useEffect } from "react";

interface AnnotationModalCardProps {
  clipStart: number;
  clipEnd: number;
  formatTime: (seconds: number) => string;
  onSave: (title: string, tags: string, keyTerms: string, questions: string) => void;
  onCancel: () => void;
  onDelete?: () => void;
  initialTitle?: string;
  initialTags?: string;
  initialKeyTerms?: string;
  initialQuestions?: string;
}

export default function AnnotationModalCard({ clipStart, clipEnd, formatTime, onSave, onCancel, onDelete, initialTitle = "", initialTags = "", initialKeyTerms = "", initialQuestions = "" }: AnnotationModalCardProps) {
  const [title, setTitle] = useState(initialTitle);
  const [tags, setTags] = useState(initialTags);
  const [keyTerms, setKeyTerms] = useState(initialKeyTerms);
  const [questions, setQuestions] = useState(initialQuestions);

  useEffect(() => {
    setTitle(initialTitle);
    setTags(initialTags);
    setKeyTerms(initialKeyTerms);
    setQuestions(initialQuestions);
  }, [initialTitle, initialTags, initialKeyTerms, initialQuestions]);

  const handleSave = () => {
    onSave(title, tags, keyTerms, questions);
    setTitle("");
    setTags("");
    setKeyTerms("");
    setQuestions("");
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <div className="bg-gray-800 rounded-lg p-4">
        <p className="text-gray-300 text-sm">Time Range: {formatTime(clipStart)} - {formatTime(clipEnd)}</p>
      </div>
      <Input
        label="Title"
        placeholder="Enter annotation title"
        value={title}
        onValueChange={setTitle}
        classNames={{ input: "bg-gray-800", inputWrapper: "bg-gray-800" }}
      />
      <Input
        label="Tag"
        placeholder="Enter annotation tag"
        value={tags}
        onValueChange={setTags}
        classNames={{ input: "bg-gray-800", inputWrapper: "bg-gray-800" }}
      />
      <Textarea
        label="Key Terms"
        placeholder="Enter key terms"
        value={keyTerms}
        onValueChange={setKeyTerms}
        classNames={{ input: "bg-gray-800", inputWrapper: "bg-gray-800" }}
      />
      <Textarea
        label="Questions"
        placeholder="Enter questions"
        value={questions}
        onValueChange={setQuestions}
        classNames={{ input: "bg-gray-800", inputWrapper: "bg-gray-800" }}
      />
      <CardFooter className="flex justify-end gap-2">
        {onDelete && (
          <Button color="danger" onPress={onDelete}>
            Delete
          </Button>
        )}
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
