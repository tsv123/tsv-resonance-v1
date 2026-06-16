"use client";

import { useState } from "react";
import { supabase } from "./lib/supabase";

type Story = {
  id: string;
  story: string;
  created_at: string;
};

export default function Home() {
  const [story, setStory] = useState("");
  const [status, setStatus] = useState("");
  const [savedStories, setSavedStories] = useState<Story[]>([]);

  async function loadStories() {
    const { data, error } = await supabase
      .from("stories")
      .select("id, story, created_at")
      .order("created_at", { ascending: false })
      .limit(3);

    if (error) {
      console.error(error);
      setStatus("Error loading stories");
      return;
    }

    setSavedStories(data || []);
  }

  async function handleSubmit() {
    if (!story.trim()) return;

    setStatus("Saving...");

    const { error } = await supabase
      .from("stories")
      .insert([{ story }]);

    if (error) {
      console.error(error);
      setStatus("Error saving story");
      return;
    }

    setStatus("Story saved!");
    setStory("");
    await loadStories();
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">The Story Vine</h1>

        <p className="text-gray-600 mb-6">What's your story?</p>

        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          className="w-full h-64 border rounded-lg p-4"
          placeholder="Share your story..."
        />

        <button
          onClick={handleSubmit}
          className="mt-4 px-6 py-3 bg-black text-white rounded-lg"
        >
          Find Resonance
        </button>

        {status && <p className="mt-4 text-gray-600">{status}</p>}

        {savedStories.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold">
              Recently saved stories
            </h2>

            {savedStories.map((item) => (
              <div key={item.id} className="border rounded-lg p-4">
                <p className="text-gray-800">{item.story}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}