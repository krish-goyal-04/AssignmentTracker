import { useState } from "react";

export function useToast(duration = 2000) {
  const [message, setMessage] = useState("");

  const showToast = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), duration);
  };

  return [message, showToast];
}