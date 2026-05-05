export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="flex flex-col items-center gap-4">
        {/* A simple spinning circle */}
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg font-semibold text-gray-300">Decrypting Vault...</p>
      </div>
    </div>
  );
}