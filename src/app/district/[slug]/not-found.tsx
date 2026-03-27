import Link from 'next/link'

export default function DistrictNotFound() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-indigo-400 mb-4">404</h1>
        <p className="text-xl text-slate-300 mb-8">District page not found</p>
        <Link
          href="/"
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
