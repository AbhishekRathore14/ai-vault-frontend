# AI Knowledge Vault

A full-stack, AI-powered knowledge management system built for the NineXGroup technical assessment. Users can create long-form notes, have them asynchronously summarized and tagged by AI, and query their specific notes using a context-aware chat interface.

🚀 Live Demo & Links

Live Frontend URL: https://ai-vault-frontend-liard.vercel.app/

Live Backend API: https://ai-vault-backend-2hx1.onrender.com/

Frontend Repo: https://github.com/AbhishekRathore14/ai-vault-frontend

Backend Repo: https://github.com/AbhishekRathore14/ai-vault-backend

🛠️ Tech Stack

Frontend: Next.js, Tailwind CSS, React Hooks

Backend: Node.js, Express.js

Database: MongoDB (Mongoose)

AI Provider: OpenRouter API

⚙️ Setup Instructions

1. Clone the repositories

git clone [INSERT_YOUR_GITHUB_FRONTEND_REPO_LINK]

git clone [INSERT_YOUR_GITHUB_BACKEND_REPO_LINK]

2. Backend Setup
 
Navigate to the backend directory:

cd ai-vault-backend

npm install

Start the backend server:

npm run dev

3. Frontend Setup

Navigate to the frontend directory:

cd ai-vault-frontend

npm install

Create a .env.local file in the frontend root:

Code snippet

NEXT_PUBLIC_API_URL=http://localhost:5000/api

Start the frontend development server:

npm run dev

The app will be running at http://localhost:3000.

# Architecture & AI Strategy

Asynchronous Background Processing

To ensure a snappy user experience, AI processing does not block the HTTP request cycle.

When a user creates a note via POST /notes, it is immediately saved to MongoDB with a status: "processing".

A 201 response is instantly returned to the client, allowing the UI to update.

A background Node.js worker then calls the OpenRouter API.

Once the AI generates the summary and tags, the database record is updated to status: "ready". If the AI call fails, it gracefully degrades to status: "failed" to prevent infinite loading states.

AI Prompt Strategy & Smart Query

JSON Strictness: The system prompt explicitly commands the OpenRouter model to return only valid JSON, strictly forbidding markdown fences or conversational prose. By using explicit formatting constraints, we guarantee predictable parsing on the backend.

Context-Aware Querying (RAG): For the Smart Query feature (POST /notes/:id/query), the system does not just blindly send the raw note content. It combines the original text with the AI-generated summary and key points to provide the LLM with a highly structured context anchor, resulting in faster and more accurate answers.

Trade-Offs Made

Given the 24-hour time constraint, I prioritized building a rock-solid, non-blocking asynchronous data pipeline and robust UI error handling over complex styling libraries. Because of this, I opted out of implementing real-time WebSocket streaming for the chat interface, choosing instead to deliver a highly stable, rate-limited REST architecture that safely handles LLM latency.

Optional Extensions Implemented

Tag-based search / filtering: Added a live search bar on the frontend to instantly filter notes by title or generated tags.

Rate limiting on AI endpoints: Implemented express-rate-limit on the backend to protect the OpenRouter API from spam and control potential API costs in a production environment.
