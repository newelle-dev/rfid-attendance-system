"use client";

import { motion } from "framer-motion";
import { Users, UserCheck, Coffee, UserX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function HeadcountKPIGrid({ summary = {}, isLoading = false }) {
  const total = summary.totalActiveEmployees || 0;
  const present = summary.currentlyPresent || 0;
  const breakCount = summary.onBreak || 0;
  const absent = summary.notYetIn || 0;
  const attendanceRate = summary.attendanceRate || (total > 0 ? Math.round((present / total) * 100) : 0);
  const breakRate = total > 0 ? Math.round((breakCount / total) * 100) : 0;
  const absentRate = total > 0 ? Math.round((absent / total) * 100) : 0;

  const kpis = [
    {
      id: "total",
      title: "Total Active Workforce",
      value: total,
      subtext: "Enrolled active staff",
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10 border-blue-500/20",
      accentBar: "bg-blue-500",
    },
    {
      id: "present",
      title: "Currently Present",
      value: present,
      subtext: `${attendanceRate}% on site today`,
      icon: UserCheck,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10 border-emerald-500/20",
      accentBar: "bg-emerald-500",
    },
    {
      id: "break",
      title: "Out on Break",
      value: breakCount,
      subtext: `${breakRate}% currently paused`,
      icon: Coffee,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/10 border-amber-500/20",
      accentBar: "bg-amber-500",
    },
    {
      id: "absent",
      title: "Not Yet In / Absent",
      value: absent,
      subtext: `${absentRate}% awaiting punch`,
      icon: UserX,
      color: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-500/10 border-rose-500/20",
      accentBar: "bg-rose-500",
    },
  ];

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      aria-label="Attendance live headcount key performance indicators"
    >
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <motion.div key={kpi.id} variants={cardVariants}>
            <Card className="relative overflow-hidden border border-border/80 bg-card/60 shadow-sm transition-all duration-200 hover:shadow-md hover:border-border">
              {/* Subtle accent bar at top */}
              <div className={cn("absolute top-0 left-0 right-0 h-1", kpi.accentBar)} />
              
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground tracking-wider uppercase">
                      {kpi.title}
                    </p>
                    <div className="flex items-baseline gap-2">
                      {isLoading ? (
                        <div className="h-9 w-16 animate-pulse rounded bg-muted mt-1" />
                      ) : (
                        <span className="text-3xl font-extrabold tracking-tight text-foreground">
                          {kpi.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
                      kpi.bgColor,
                      kpi.color
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  {isLoading ? (
                    <div className="h-3 w-28 animate-pulse rounded bg-muted" />
                  ) : (
                    <span>{kpi.subtext}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.section>
  );
}
