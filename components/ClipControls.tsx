'use client';

import { Button } from '@heroui/react';

type ClipControlsProps = {
  isClipping: boolean;
  onClip: () => void;
  onSave: () => void;
  onCancel: () => void;
};

export const ClipControls = ({ isClipping, onClip, onSave, onCancel }: ClipControlsProps) => {
  return (
    <div className="flex justify-end gap-2 mb-8">
      <Button color="primary" onPress={onClip} isDisabled={isClipping}>Clip</Button>
      <Button color="primary" onPress={onClip} isDisabled={isClipping}>Annotate</Button>
      <Button color="success" onPress={onSave} isDisabled={!isClipping}>Save</Button>
      <Button color="danger" variant="light" onPress={onCancel} isDisabled={!isClipping}>Cancel</Button>
    </div>
  );
};
