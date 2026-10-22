"use client";

import { Card, Skeleton } from "antd";

/**
 * Placeholder grid used while dashboard/summary stat cards are loading.
 * Mirrors the real card layout (icon + label + value) so there is no
 * layout shift once data arrives.
 */
export default function StatCardsSkeleton({ count = 4, columnsClassName }) {
  return (
    <div
      className={
        columnsClassName ||
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      }
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border-0 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-full space-y-2">
              <Skeleton.Input active size="small" style={{ width: 90 }} />
              <Skeleton.Input active size="default" style={{ width: 70 }} />
            </div>
            <Skeleton.Avatar active shape="square" size={44} />
          </div>
        </Card>
      ))}
    </div>
  );
}
