import React from "react";
import { Card } from "./ui/card";

export function EmptyState({ message, description }) {
  return (
    <Card className="p-8 text-center">
      <p className="font-semibold text-slate-700 mb-1">{message}</p>
      {description && <p className="text-sm text-slate-500">{description}</p>}
    </Card>
  );
}
