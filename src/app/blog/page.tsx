"use client";

import { useState, useEffect } from "react";

type Post = {
  content: string;
  scheduledAt: string;
  tags?: string[];
};

const starterPosts: Post[] = [
  {
    content: "AI is becoming part of daily life – from scheduling to writing content.",
    scheduledAt: "2025-05-21T09:00",
    tags: ["AI", "Productivity"],
  },
  {
    content: "Search is changing. People ask questions instead of typing keywords.",
    scheduledAt: "2025-05-22T10:30",
    tags: ["Search", "AI"],
  },
  {
    content: "🤖 AI-generated music is becoming more popular than ever.",
    scheduledAt: "2025-05-23T15:00",
    tags: ["Music", "Generative AI"],
  },
];

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>(starterPosts);
  const [newPost, setNewPost] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    posts.forEach((_, index) => {
      fetch(`/api/posts/view/${index}`, { method: "POST" });
    });
  }, [posts]);

  const handleAddPost = () => {
    if (newPost.trim()) {
      const tags = tagInput.split(",").map((tag) => tag.trim()).filter(Boolean);
      const newEntry: Post = {
        content: newPost,
        scheduledAt: new Date().toISOString().slice(0, 16),
        tags,
      };
      setPosts([newEntry, ...posts]);
      setNewPost("");
      setTagInput("");
    }
  };

  const handleGenerateAI = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "Write a short blog post about the latest in AI" }),
      });

      const data = await res.json();
      if (data?.reply) {
        const tags = tagInput.split(",").map((tag) => tag.trim()).filter(Boolean);
        const newAIPost: Post = {
          content: `🤖 ${data.reply}`,
          scheduledAt: new Date().toISOString().slice(0, 16),
          tags,
        };
        setPosts((prev) => [newAIPost, ...prev]);
        setTagInput("");
      }
    } catch (err) {
      console.error("Error generating AI post", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (index: number, newDate: string) => {
    const updated = [...posts];
    updated[index].scheduledAt = newDate;
    setPosts(updated);
  };

  const handleDelete = async (content: string, scheduledAt: string) => {
    try {
      const res = await fetch("/api/posts/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          scheduledAt,
          type: "scheduled",
        }),
      });

      if (res.ok) {
        setPosts((prev) =>
          prev.filter((p) => !(p.content === content && p.scheduledAt === scheduledAt))
        );
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">PlanetSham Blog</h1>

      <div className="flex flex-col gap-2 mb-4">
        <input
          className="border border-gray-300 rounded px-3 py-2"
          placeholder="Write a new post..."
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        />
        <input
          className="border border-gray-300 rounded px-3 py-2"
          placeholder="Add tags (comma separated)..."
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
        />
        <div className="flex gap-2">
          <button
            onClick={handleAddPost}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Add
          </button>
          <button
            onClick={handleGenerateAI}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Thinking..." : "Ask AI"}
          </button>
        </div>
      </div>

      <ul className="space-y-4">
        {posts.map((post, index) => {
          const content = post?.content ?? "";
          const isAI = content.startsWith("🤖");

          return (
            <li
              key={index}
              className={`p-4 rounded shadow-sm border ${isAI ? "bg-blue-50 border-blue-300" : "bg-white"}`}
            >
              {isAI && (
                <span className="text-xs text-blue-500 font-semibold block mb-1">
                  AI-Generated
                </span>
              )}
              <p className="mb-2">{content.replace(/^🤖/, "")}</p>
              <label className="block text-sm text-gray-600 mb-1">
                📅 Scheduled At:
              </label>
              <input
                type="datetime-local"
                value={post.scheduledAt}
                onChange={(e) => handleDateChange(index, e.target.value)}
                className="border px-2 py-1 rounded w-full mb-2"
              />
              {post.tags?.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-1 text-xs text-gray-600">
                  {post.tags.map((tag, i) => (
                    <span key={i} className="bg-gray-200 px-2 py-1 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={() => handleDelete(post.content, post.scheduledAt)}
                className="text-red-500 text-sm mt-2"
              >
                🗑 Delete
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
