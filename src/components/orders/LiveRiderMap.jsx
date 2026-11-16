"use client";

import { useSocket } from "@/context/SocketContextApi";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useState } from "react";

const containerStyle = { width: "100%", height: "280px" };

/** Joins an order tracking room and shows the rider GPS the backend relays. */
export default function LiveRiderMap({ orderId }) {
  const { socket } = useSocket();
  const [point, setPoint] = useState(null);
  const { isLoaded } = useJsApiLoader({
    id: "hoodz-live-rider-map",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  useEffect(() => {
    if (!socket || !orderId) return;

    socket.emit("track_order", { orderId }, (ack) => {
      const location = ack?.data?.location;
      if (Number.isFinite(location?.lat) && Number.isFinite(location?.lng)) {
        setPoint({ lat: location.lat, lng: location.lng });
      }
    });

    const onLocation = (payload) => {
      const lat = Number(payload?.lat);
      const lng = Number(payload?.lng);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        setPoint({ lat, lng });
      }
    };

    socket.on("order:location", onLocation);
    return () => socket.off("order:location", onLocation);
  }, [socket, orderId]);

  if (!orderId) return null;

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3 text-sm font-medium">
        Live rider location
        {point ? ` · ${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}` : " · waiting for GPS"}
      </div>
      {isLoaded && point ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={point}
          zoom={15}
          options={{ disableDefaultUI: true, zoomControl: true }}
        >
          <Marker position={point} />
        </GoogleMap>
      ) : (
        <div className="px-4 py-8 text-sm text-slate-500">
          {point
            ? `Rider is at ${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`
            : "Select Track on an order to follow the assigned rider."}
        </div>
      )}
    </div>
  );
}
