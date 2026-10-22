"use client";

import StatCardsSkeleton from "./StatCardsSkeleton";
import TableSkeleton from "./TableSkeleton";
import { Skeleton } from "antd";

/**
 * Generic page-level skeleton: title + optional stat row + table.
 * Good default for route `loading.js` files or any container's initial load.
 */
export default function PageSkeleton({
  showStats = true,
  showTable = true,
  statCount = 4,
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton.Input active size="large" style={{ width: 220 }} />
        <Skeleton.Button active size="large" style={{ width: 140 }} />
      </div>
      {showStats && <StatCardsSkeleton count={statCount} />}
      {showTable && <TableSkeleton />}
    </div>
  );
}
