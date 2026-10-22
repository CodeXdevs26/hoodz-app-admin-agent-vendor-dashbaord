"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import { mainTheme } from "../theme/mainTheme";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";
import { SocketProvider } from "@/context/SocketContextApi";
import { LanguageProvider } from "@/context/LanguageContext";

export default function Providers({ children }) {
  return (
    <AntdRegistry>
      <LanguageProvider>
        <SocketProvider>
          <ConfigProvider theme={mainTheme}>{children}</ConfigProvider>
        </SocketProvider>
      </LanguageProvider>
      <NextTopLoader />
      <Toaster />
    </AntdRegistry>
  );
}
