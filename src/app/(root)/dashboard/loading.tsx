export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen bg-slate-900 animate-pulse">
      <div className="w-[270px] bg-slate-800 border-r border-slate-700 shrink-0" />
      <div className="flex-1 p-8 space-y-6">
        <div className="h-8 bg-slate-700 rounded w-1/3" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-28 bg-slate-800 rounded-lg" />
          <div className="h-28 bg-slate-800 rounded-lg" />
          <div className="h-28 bg-slate-800 rounded-lg" />
        </div>
        <div className="h-64 bg-slate-800 rounded-lg" />
        <div className="h-40 bg-slate-800 rounded-lg" />
      </div>
    </div>
  )
}
