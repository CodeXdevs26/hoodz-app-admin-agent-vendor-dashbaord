import { ConfigProvider } from "antd";
import PageSkeleton from "@/components/Skeletons/PageSkeleton";

// Route-level fallback shown by Next.js while a segment's data is loading.
// A shaped skeleton communicates progress far better than a bare spinner
// and avoids layout shift once the real content mounts.
export default function loading() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1b71a7",
        },
      }}
    >
      <div className="px-2 py-4">
        <PageSkeleton />
      </div>
    </ConfigProvider>
  );
}
