"use client";

import { Card, Skeleton } from "antd";

export default function ChartCardSkeleton({ height = 320, title }) {
  return (
    <Card title={title ? <Skeleton.Input active size="small" style={{ width: 160 }} /> : undefined}>
      <div
        className="flex w-full items-end gap-3 px-2"
        style={{ height }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 animate-pulse rounded-t-md bg-slate-200"
            style={{ height: `${30 + ((i * 13) % 60)}%` }}
          />
        ))}
      </div>
    </Card>
  );
}
