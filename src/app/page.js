"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchNotes = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/notes");
      setNotes(await res.json());
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  useEffect(() => { fetchNotes(); }, []);

  const deleteNote = async (id) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    await fetch(`http://localhost:5000/api/notes/${id}`, { method: 'DELETE' });
    fetchNotes();
  };

  const filteredNotes = notes.filter(note => {
    const query = searchQuery.toLowerCase();
    const matchTitle = note.title.toLowerCase().includes(query);
    const matchTags = note.tags && note.tags.some(tag => tag.toLowerCase().includes(query));
    return matchTitle || matchTags;
  });

  return (
    <div className="min-h-screen bg-[#fafbfc] py-12 px-4 text-slate-900 font-sans selection:bg-blue-200">
      <main className="max-w-4xl mx-auto space-y-6">
        
        {/* PREMIUM HEADER */}
        <header className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 gap-4">
          
          {/* Typography-based Logo */}
          <div className="select-none">
            <h1 className="text-3xl font-black tracking-tighter text-slate-900">
              AI<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 ml-1">Vault</span>
            </h1>
          </div>
          
          <Link href="/new" className="group bg-slate-900 text-white px-7 py-3 rounded-2xl font-bold shadow-lg shadow-slate-200 hover:bg-blue-600 hover:shadow-blue-200 active:scale-95 transition-all duration-200 flex items-center gap-2">
            <span>Create Note</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </header>

        {/* SEARCH BAR (Floating Design) */}
        <div className="bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-slate-200/60 flex items-center gap-3 px-5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white focus-within:shadow-md transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-slate-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search by title or #tag..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-3.5 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
          />
        </div>

        {/* NOTES LIST */}
        <div className="space-y-4 pt-2">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-400 font-semibold text-lg">Your vault is empty.</p>
              <p className="text-slate-400 text-sm mt-1">Create a note to let the AI process it.</p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div key={note._id} className="group bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight">{note.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg tracking-wider uppercase ${
                      note.status === 'ready' ? 'bg-emerald-100/50 text-emerald-700' : 
                      note.status === 'failed' ? 'bg-rose-100/50 text-rose-700' : 
                      'bg-amber-100/50 text-amber-700'
                    }`}>
                      {note.status}
                    </span>
                    
                    {note.tags && note.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-xs text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link href={`/notes/${note._id}`} className="text-slate-700 bg-slate-50 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-100 active:scale-95 transition-all text-sm border border-slate-200">
                    Open Note
                  </Link>
                  <button onClick={() => deleteNote(note._id)} className="text-rose-500 p-2.5 rounded-xl hover:bg-rose-50 active:scale-95 transition-all" title="Delete Note">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}