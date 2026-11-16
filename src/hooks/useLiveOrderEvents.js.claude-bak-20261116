"use client";

import { useEffect } from "react";
import { useSocket } from "@/context/SocketContextApi";

export const LIVE_ORDER_EVENTS = [
  "order:updated",
  "job:updated",
  "job:accepted",
  "job:rejected",
  "job:matching-exhausted",
  "job:picked-up",
  "job:on-the-way",
  "job:delivered",
  "job:rider-assigned",
];

/** Refetch order lists when the backend pushes a job or order change. */
export function useLiveOrderEvents(refetch) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || typeof refetch !== "function") return;

    const onChange = () => refetch();
    LIVE_ORDER_EVENTS.forEach((event) => socket.on(event, onChange));
    return () => {
      LIVE_ORDER_EVENTS.forEach((event) => socket.off(event, onChange));
    };
  }, [socket, refetch]);
}
