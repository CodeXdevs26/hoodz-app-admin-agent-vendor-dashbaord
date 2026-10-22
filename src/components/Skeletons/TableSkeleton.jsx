"use client";

import { Skeleton } from "antd";

/**
 * A lightweight skeleton table. Used as a drop-in replacement for a bare
 * <Spin /> while the first page of a table's data is loading, so the user
 * sees the shape of the content (header + rows) instead of a blank spinner.
 */
export default function TableSkeleton({ rows = 6, columns = 5 }) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-slate-100">
      {/* header */}
      <div className="flex gap-4 border-b border-slate-100 bg-slate-50 px-4 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton.Input
            key={i}
            active
            size="small"
            style={{ width: `${100 / columns}%`, minWidth: 60 }}
          />
        ))}
      </div>

      {/* rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="flex items-center gap-4 border-b border-slate-50 px-4 py-4 last:border-b-0"
        >
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton.Input
              key={c}
              active
              size="small"
              style={{ width: `${100 / columns}%`, minWidth: 60 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
