export default function JobsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and track jobs for your business
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <svg
            className="h-6 w-6 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">Coming Soon</h3>
        <p className="mt-2 text-sm text-gray-500">
          This feature is currently under development.
        </p>
      </div>
    </div>
  )
}
