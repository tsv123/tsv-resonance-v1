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

        <p className="text-gray-600 mb-6">What&apos;s your story?</p>

        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          className="w-full h-64 border rounded-lg p-4"
          placeholder="Share your story..."
        />

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-white"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            Write
          </button>
        </div>

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