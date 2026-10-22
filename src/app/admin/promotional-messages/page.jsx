import React from "react";
import PromotionalMessageContainer from "./_Component/PromotionalMessageContainer";

export const metadata = {
  title: "Promotional Messages",
  description: "Send promotional messages to all users",
};

export default function page() {
  return (
    <div>
      <PromotionalMessageContainer />
    </div>
  );
}
