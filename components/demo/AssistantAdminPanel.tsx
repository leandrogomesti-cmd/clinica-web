'use client';
import * as React from 'react';

type AssistantAdminPanelProps = {
  onRunTest?: () => void;
  className?: string;
};

function AssistantAdminPanel({ onRunTest, className }: AssistantAdminPanelProps) {
  return (
    <div className={className ?? 'rounded-2xl border p-3 text-sm'}>
      <div className="font-medium mb-2">Assistant Admin Panel (demo)</div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onRunTest}
          className="px-2 py-1 border rounded hover:bg-gray-50"
        >
          Ping
        </button>
      </div>
    </div>
  );
}

export default AssistantAdminPanel;