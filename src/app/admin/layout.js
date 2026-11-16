"use client";

import NewOrderAlert from "@/components/orders/NewOrderAlert";
import HeaderContainer from "@/components/shared/HeaderContainer/HeaderContainer";
import SidebarContainer from "@/components/shared/SidebarContainer/SidebarContainer";
import { useMediaQuery } from "@react-hook/media-query";
import { ConfigProvider, Layout } from "antd";
import enUS from "antd/locale/en_US";
import arEG from "antd/locale/ar_EG";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/features/authSlice";
import { useLanguage } from "@/context/LanguageContext";
const { Content } = Layout;

export default function AdminLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const user = useSelector(selectUser);
  const { isRtl } = useLanguage();

  // Vendor-only RTL: Arabic layout is only ever applied for the vendor role,
  // other roles always render left-to-right in English regardless of stored preference.
  const applyRtl = user?.role === "vendor" && isRtl;

  // Check if small screen
  const screenSizeLessThan1300 = useMediaQuery(
    "only screen and (max-width: 1300px)",
  );

  // Show prompt to collapse sidebar if screen size is less than 1300px
  useEffect(() => {
    if (screenSizeLessThan1300 && !sidebarCollapsed) {
      toast.success(
        "Small screen detected! If content doesn't fit better please collapse the sidebar by clicking the menu button on top-left",
        {
          duration: 2500,
        },
      );
    }
  }, [screenSizeLessThan1300, sidebarCollapsed]);

  // Vendor + Arabic: load a Google-hosted font that actually renders Arabic
  // glyphs well. Injected on demand so English/other-role sessions never pay for it.
  useEffect(() => {
    if (!applyRtl) return;
    const id = "vendor-ar-font";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap";
    document.head.appendChild(link);
  }, [applyRtl]);

  return (
    <ConfigProvider
      direction={applyRtl ? "rtl" : "ltr"}
      locale={applyRtl ? arEG : enUS}
    >
      <Layout
        dir={applyRtl ? "rtl" : "ltr"}
        style={{
          height: "100vh",
          overflow: "auto",
          fontFamily: applyRtl ? "'Tajawal', sans-serif" : undefined,
        }}
      >
        <SidebarContainer collapsed={sidebarCollapsed}></SidebarContainer>
        <NewOrderAlert />

        <Layout>
          <HeaderContainer
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
          ></HeaderContainer>

          <Content
            style={{
              height: "100vh",
              maxHeight: "100vh",
              overflow: "auto",
              backgroundColor: "#f5f5f5",
              paddingInline: "30px",
              paddingTop: "30px",
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
