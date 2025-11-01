import React from 'react';

export function Toast({ message }) {
  if (!message) return null;
  
  return (
    <div className="fixed right-4 bottom-6 z-50">
      <div className="rounded-md bg-slate-800 text-white px-4 py-2 shadow">
        {message}
      </div>
    </div>
  );
}