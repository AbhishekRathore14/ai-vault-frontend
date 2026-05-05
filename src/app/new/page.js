"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewNote() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending to AI...");

    try {
      const res = await fetch("https://ai-vault-backend-2hx1.onrender.com/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      if (res.ok) {
        router.push("/"); // Redirect back to home immediately
      } else {
        setStatus("❌ Failed to send note.");
      }
    } catch (error) {
      setStatus("❌ Error connecting to backend.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 text-black">
      <main className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold">New Note</h1>
          <Link href="/" className="text-blue-600 hover:underline font-medium">← Back to Vault</Link>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
            required
          />
          <textarea
            placeholder="Paste your text here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="p-3 border rounded-lg h-40 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
            required
          />
          <button type="submit" className="bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">
            Submit to AI
          </button>
        </form>
        {status && <p className="mt-4 text-center text-blue-800 font-medium">{status}</p>}
      </main>
    </div>
  );
}