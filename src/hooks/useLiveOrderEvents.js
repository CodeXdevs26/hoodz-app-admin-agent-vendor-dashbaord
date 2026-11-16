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
  "job:new-request",
  "job:request-cancelled",
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

  // SocketContextApi also re-broadcasts job lifecycle events as a window
  // CustomEvent ("hoodz:job-event"). Refetch (debounced, so a burst of job
  // events collapses into a single refresh) when one of those lands.
  useEffect(() => {
    if (typeof refetch !== "function") return;

    let timer;
    const onJobEvent = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => refetch(), 500);
    };
    window.addEventListener("hoodz:job-event", onJobEvent);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("hoodz:job-event", onJobEvent);
    };
  }, [refetch]);
}
