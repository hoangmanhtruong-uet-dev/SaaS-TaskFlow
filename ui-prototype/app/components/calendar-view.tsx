"use client";

import { CalendarDashboardContainer } from "./calendar/CalendarDashboardContainer";

export function CalendarView() {
  return (
    <div className="w-full h-full flex-1 p-4 sm:p-6 bg-zinc-950 text-zinc-100">
      <CalendarDashboardContainer />
    </div>
  );
}
