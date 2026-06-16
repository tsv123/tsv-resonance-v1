export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">
          The Story Vine
        </h1>

        <p className="text-gray-600 mb-6">
          What's your story?
        </p>

        <textarea
          className="w-full h-64 border rounded-lg p-4"
          placeholder="Share your story..."
        />

        <button className="mt-4 px-6 py-3 bg-black text-white rounded-lg">
          Find Resonance
        </button>
      </div>
    </main>
  );
}