"use client";

import { useState } from "react";
import { supabase } from "./lib/supabase";

type Story = {
  id: string;
  story: string;
  created_at: string;
  patterns: string[] | null;
};

export default function Home() {
  const [story, setStory] = useState("");
  const [status, setStatus] = useState("");
  const [patterns, setPatterns] = useState<string[]>([]);
  const [savedStories, setSavedStories] = useState<Story[]>([]);

  async function loadStories() {
    const { data } = await supabase
      .from("stories")
      .select("id, story, created_at, patterns")
      .order("created_at", { ascending: false })
      .limit(3);

    setSavedStories(data || []);
  }

  async function handleSubmit() {
    if (!story.trim()) return;

    setStatus("Saving story...");
    setPatterns([]);

    const { data: insertedStory, error } = await supabase
      .from("stories")
      .insert([{ story }])
      .select("id")
      .single();

    if (error) {
      console.error(error);
      setStatus("Error saving story");
      return;
    }

    setStatus("Finding emotional patterns...");

    const response = await fetch("/api/patterns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ story }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Patterns API error:", errorText);
      setStatus("Error finding emotional patterns");
      return;
    }

    const result = await response.json();
    const foundPatterns = result.patterns || [];

    setPatterns(foundPatterns);

    if (insertedStory?.id) {
      await supabase
        .from("stories")
        .update({ patterns: foundPatterns })
        .eq("id", insertedStory.id);
    }

    setStatus("Resonance patterns found.");
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

        {patterns.length > 0 && (
          <div className="mt-6 border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-3">
              Emotional patterns
            </h2>

            <ul className="list-disc pl-5 space-y-2">
              {patterns.map((pattern) => (
                <li key={pattern}>{pattern}</li>
              ))}
            </ul>
          </div>
        )}

        {savedStories.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold">
              Recently saved stories
            </h2>

            {savedStories.map((item) => (
              <div key={item.id} className="border rounded-lg p-4">
                <p className="text-gray-800">{item.story}</p>

                {item.patterns && item.patterns.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.patterns.map((pattern) => (
                      <span
                        key={pattern}
                        className="rounded-full border px-3 py-1 text-sm text-gray-600"
                      >
                        {pattern}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}