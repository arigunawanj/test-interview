export default function Loading() {
  return <div>
    <div className="container mx-auto p-4">
      <h1 className="text-2xl text-center uppercase font-bold mb-4">Loading...</h1>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    </div>
  </div>
}