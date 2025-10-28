import React from 'react';
import { useQuery } from '@tanstack/react-query'

import { apiFetch } from '../lib/utils';

type DashboardPreferences = {
  theme: string
  refresh_interval: number
  currency: string
  timezone: string
}

type DashboardLayout = {
  economic_indicators?: { enabled: boolean }
  top_stocks?: { enabled: boolean }
  watchlist?: { enabled: boolean }
  news_feed?: { enabled: boolean }
}

type DashboardApiResponse = {
  status: string
  data: {
    user_id: string
    dashboard_layout: DashboardLayout
    preferences: DashboardPreferences
  }
  timestamp: string
}

async function fetchDashboardConfig(): Promise<DashboardApiResponse> {

  const response = await apiFetch('/api/dashboard/')

  return response;
}

export default function DashboardHome(): React.JSX.Element {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<DashboardApiResponse>({
    queryKey: ['dashboard-config'],
    queryFn: fetchDashboardConfig,
    staleTime: 30_000,
  })

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-sm text-zinc-400">Loading dashboard...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-6 space-y-3">
        <p className="text-red-400">Failed to load dashboard.</p>
        <p className="text-zinc-400 text-sm">{(error as Error).message}</p>
        <button
          className="inline-flex items-center rounded-md bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700"
          onClick={() => refetch()}
        >
          Retry
        </button>
      </div>
    )
  }

  if (data) {
    console.log(data);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between space-x-4">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <button
          className="inline-flex items-center rounded-md bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700 disabled:opacity-50"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>


    </div>
  )
}


