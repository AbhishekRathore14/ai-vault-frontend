"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function NoteDetail() {
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { id } = useParams();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chat States
  const [question, setQuestion] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await fetch(`https://ai-vault-backend-2hx1.onrender.com/api/notes/${id}`);
        if (!res.ok) throw new Error("Note not found");
        setNote(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id]);

  const handleGetSummary = async () => {
  setIsSummarizing(true);
  try {
    const res = await fetch(`https://ai-vault-backend-2hx1.onrender.com/api/notes/${id}/summary`);
    const data = await res.json();
    setSummary(data.summary);
  } catch (err) {
    console.error("Could not get summary", err);
  } finally {
    setIsSummarizing(false);
  }
};

  // 1. LOCAL SEARCH HANDLER
  const handleQuery = (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userQ = question;
    setQuestion(""); // clear input

    // Add user question to UI immediately
    setChatHistory((prev) => [...prev, { role: 'user', content: userQ }]);

    // Scan local text for matching keywords (longer than 3 letters)
    const searchTerms = userQ.toLowerCase().split(' ').filter(w => w.length > 3);
    let localMatches = [];

    if (searchTerms.length > 0 && note.content) {
      const sentences = note.content.split('. ');
      localMatches = sentences.filter(sentence => 
        searchTerms.some(term => sentence.toLowerCase().includes(term))
      ).slice(0, 2); 
    }

    // Format the local response
    const systemReply = localMatches.length > 0 
      ? "🔍 **Fast Local Search:**\n\n" + localMatches.map(m => `• "...${m.trim()}..."`).join('\n\n')
      : "🔍 *No direct keyword matches found in the local text.*";

    // Add local result to chat AND show the AI button
    setChatHistory((prev) => [...prev, { 
      role: 'system-local', 
      content: systemReply, 
      originalQuestion: userQ, 
      showAiButton: true 
    }]);
  };

  // 2. THE AI FALLBACK (Triggered by the button)
  const triggerAiAgent = async (qToAsk, messageIndex) => {
    setIsQuerying(true);
    
    // Hide the button so they can't click it twice
    setChatHistory((prev) => {
      const newHistory = [...prev];
      newHistory[messageIndex].showAiButton = false;
      return newHistory;
    });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/${note._id}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: qToAsk }),
      });

      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      
      setChatHistory((prev) => [...prev, { role: 'ai', content: data.answer }]);
    } catch (error) {
      setChatHistory((prev) => [...prev, { role: 'error', content: "AI Agent failed." }]);
    } finally {
      setIsQuerying(false);
    }
  };

  if (loading || !note) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-gray-300">Decrypting Vault...</p>
        </div>
      </div>
    );
  }

  const isProcessing = note.status === "processing";

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 text-black">
      <main className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation */}
        <Link href="/" className="text-blue-600 hover:underline font-medium mb-4 inline-block">
          ← Back to Vault
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* LEFT SIDE: Note Details */}
           <div className="bg-white p-6 rounded-xl shadow border space-y-4">
           <div className="flex justify-between items-start border-b pb-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold">{note.title}</h1>
            {note.createdAt && (
              <p className="text-sm text-gray-500 mt-1">
                {new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString()}
              </p>
            )}
          </div>
          <span className={`px-3 py-1 text-xs font-bold rounded-full ${isProcessing ? 'bg-yellow-100 text-yellow-800' : note.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {note.status.toUpperCase()}
          </span>
          </div>

            {isProcessing ? (
              <div className="p-4 bg-blue-50 text-blue-800 rounded border border-blue-200">
                <p>The AI is currently analyzing this note. Refresh the page in a few seconds.</p>
              </div>
            ) : note.status === 'failed' ? (
               <div className="p-4 bg-red-50 text-red-800 rounded border border-red-200">
                <p>The AI failed to process this note. Please try creating it again.</p>
              </div>
            ) : (
              <>
            {/* NEW AI SUMMARY GENERATOR BOX */}
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
             <div className="flex justify-between items-center mb-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600">AI Instant Overview</h3>
              <button 
                onClick={handleGetSummary}
                disabled={isSummarizing}
                className="text-[10px] font-bold bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                {isSummarizing ? "Analyzing..." : "Generate AI Summary"}
              </button>
            </div>
            {summary ? (
             <p className="text-sm text-slate-700 leading-relaxed italic font-medium">"{summary}"</p>
             ) : (
             <p className="text-[11px] text-slate-400 italic">Click the button above to generate a concise 2-sentence summary of this note.</p>
            )}
           </div>
                <div>
                  <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider mb-1">Summary</h3>
                  <p className="text-gray-900">{note.summary}</p>
                </div>
                
                {note.keyPoints && note.keyPoints.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider mb-1">Key Points</h3>
                    <ul className="list-disc list-inside text-gray-900">
                      {note.keyPoints.map((kp, i) => <li key={i}>{kp}</li>)}
                    </ul>
                  </div>
                )}

                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {note.tags.map((tag, i) => (
                      <span key={i} className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-md border border-gray-300">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
            
            <div className="mt-6 pt-4 border-t">
               <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider mb-2">Original Content</h3>
               <p className="text-gray-600 text-sm whitespace-pre-wrap max-h-40 overflow-y-auto p-2 bg-gray-50 rounded border">{note.content}</p>
            </div>
          </div>

          {/* RIGHT SIDE: Smart Query Chat */}
          <div className="bg-white p-6 rounded-xl shadow border flex flex-col h-[600px]">
            <h2 className="text-xl font-bold border-b pb-4 mb-4">Smart Query</h2>
            
            {/* Chat History Area */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {chatHistory.length === 0 ? (
                <p className="text-gray-400 text-center text-sm italic mt-10">Ask a question about your note...</p>
              ) : (
                chatHistory.map((msg, i) => (
              <div key={i} className={`p-4 rounded-xl max-w-[85%] ${
                msg.role === 'user' ? 'bg-slate-800 text-white self-end ml-auto' : 
                msg.role === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                msg.role === 'system-local' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                'bg-blue-50 text-blue-900 border border-blue-200 shadow-sm'
              }`}>
                
                <p className="text-xs font-bold mb-2 opacity-70 uppercase tracking-widest">
                  {msg.role === 'user' ? 'You' : 
                   msg.role === 'error' ? 'Error' : 
                   msg.role === 'system-local' ? 'Local Search' : '🤖 AI Web Agent'}
                </p>
                
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>

                {/* THE COST-SAVER BUTTON */}
                {msg.showAiButton && (
                  <button 
                    onClick={() => triggerAiAgent(msg.originalQuestion, i)}
                    disabled={isQuerying}
                    className="mt-4 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isQuerying ? "Asking AI..." : "Need deeper analysis? Ask AI Web Agent"}
                  </button>
                )}
              </div>
            ))
              )}
              {isQuerying && (
                <div className="p-3 rounded-lg bg-gray-100 text-gray-900 w-fit">
                  <p className="text-sm italic text-gray-500">AI is thinking...</p>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleQuery} className="mt-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={isProcessing || isQuerying || note.status === 'failed'}
                  placeholder={isProcessing ? "Waiting for AI analysis..." : "Ask something..."}
                  className="flex-1 p-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button 
                  type="submit" 
                  disabled={isProcessing || isQuerying || !question.trim() || note.status === 'failed'}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </div>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}