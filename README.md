# Interview AI

Interview AI is a mock interview web app that helps you practice for job interviews.
Here's how it works end to end:
You start by uploading your CV, which gets automatically read and saved to your profile. Then you enter your name and the company you're interviewing for. From there, you're dropped into a live interview session where an AI interviewer greets you by name, asks behavioral questions, and responds to your answers in real time — both as text in a transcript and as spoken audio through your speakers. You respond by simply speaking, and when you're done answering you hit "Send Answer" to submit. The AI listens, gives brief feedback, and asks the next question. After five questions it wraps up the interview.
Under the hood it uses OpenAI's GPT-4 to generate the interviewer's responses and OpenAI's text-to-speech to give the interviewer a voice. Your webcam and microphone are used so it feels like a real video interview setting.

what's actually happening behind the scenes:

The Conversation Memory
GPT-4 has no memory between requests. So every single time you send an answer, the frontend packages up the entire conversation history as a JSON array of {role, content} objects and sends it to the backend. The backend then prepends the system prompt to that array and fires the whole thing at GPT-4 in one shot. GPT-4 reads everything from the beginning each time and responds as if it's been in the conversation the whole time. It's essentially stateless — the backend stores nothing.

The Audio Pipeline
Once GPT-4 returns its text reply, the backend passes that text straight to OpenAI's TTS-1 model which returns raw MP3 audio bytes. The backend can't send binary bytes cleanly through a JSON response, so it encodes those bytes into a base64 string — which is just a way of representing binary data as plain text characters. That string gets embedded in the JSON response and sent to the frontend. The frontend then decodes it back with data:audio/mpeg;base64,<string> and feeds it into a browser Audio object which plays it. So the audio never touches a file system — it lives entirely in memory as bytes, becomes a string, travels over HTTP, and gets decoded back into audio in the browser.

The Microphone Management
While the AI is speaking there's a problem — the speech recognition would pick up the AI's voice and transcribe it as if the user said it. To prevent this, the app stops the speech recognition listener the moment audio playback starts, and only restarts it again inside the audio.onended callback once the AI has finished speaking. So the mic is essentially hot-swapped on and off around the AI's speech.

The CV Extraction
When you upload a PDF, PyMuPDF opens it directly from the raw bytes in memory (no temp file saved to disk), iterates through every page, and pulls out all the text. That wall of text gets sent to GPT-4 with a system prompt telling it to return a specific JSON structure. Because GPT-4 sometimes wraps JSON in markdown code blocks like 
json the backend uses a regex to strip that wrapper out before parsing it. The parsed data then gets written to PostgreSQL via SQLAlchemy as individual columns, with arrays and objects serialized as JSON strings.

The Auth
Authentication is very basic — just a user_id value stored in a browser cookie. When the CV upload hits the backend it reads that cookie to know which database row to update. No JWT, no session tokens, just a plain cookie value.
