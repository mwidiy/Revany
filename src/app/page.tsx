'use client';

import React from 'react';
import HeroBanner from '@/components/dashboard/HeroBanner';
import KpiGrid from '@/components/dashboard/KpiGrid';
import TrendChart from '@/components/dashboard/TrendChart';
import TodaySchedule from '@/components/dashboard/TodaySchedule';
import JenjangDonut from '@/components/dashboard/JenjangDonut';
import Leaderboard from '@/components/dashboard/Leaderboard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';

export default function DashboardPage() {
  return (
    <main className="content-area">
      {/* 1. Hero Greeting & Quick Action Triggers */}
      <HeroBanner />

      {/* 2. 4 KPI Metric Cards with Animated Counters */}
      <KpiGrid />

      {/* 3. Middle Section: Dynamic Area Chart & Live Today's Schedule */}
      <section className="middle-grid">
        <TrendChart />
        <TodaySchedule />
      </section>

      {/* 4. Bottom Section: Donut Distribution, Top Tentors & Recent Feed */}
      <section className="bottom-grid">
        <JenjangDonut />
        <Leaderboard />
        <ActivityFeed />
      </section>
    </main>
  );
}
