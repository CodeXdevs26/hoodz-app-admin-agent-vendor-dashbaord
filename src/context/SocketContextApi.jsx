"use client";

import { baseApi } from "@/redux/api/baseApi";
import { selectToken } from "@/redux/features/authSlice";
import { createContext, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";

const SocketContext = createContext({ socket: null, socketLoading: false });

// Rider job lifecycle events pushed by the backend. When any of these
// arrive, open order lists should refresh right away instead of waiting
// for their next poll.
export const JOB_LIFECYCLE_EVENTS = [
  "job:updated",
  "job:accepted",
  "job:rejected",
  "job:matching-exhausted",
  "job:picked-up",
  "job:delivered",
  "job:new-request",
  "job:request-cancelled",
];

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [socketLoading, setSocketLoading] = useState(false);
  const token = useSelector(selectToken);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token) {
      setSocket((prev) => {
        prev?.disconnect();
        return null;
      });
      return;
    }

    setSocketLoading(true);
    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      auth: { token },
      autoConnect: true,
    });

    s.on("connect", () => {
      setSocketLoading(false);
    });

    s.on("disconnect", () => {
    });

    // Bridge job lifecycle events to the rest of the app: invalidate the
    // shared "Orders" RTK tag so every mounted order query refetches, and
    // broadcast a window CustomEvent for non-RTK consumers
    // (useLiveOrderEvents listens for it and refetches with a debounce).
    const onJobEvent = (event) => (payload) => {
      dispatch(baseApi.util.invalidateTags(["Orders"]));
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("hoodz:job-event", { detail: { event, payload } }),
        );
      }
    };
    JOB_LIFECYCLE_EVENTS.forEach((event) => s.on(event, onJobEvent(event)));

    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [token, dispatch]);

  return (
    <SocketContext.Provider value={{ socket, socketLoading }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
