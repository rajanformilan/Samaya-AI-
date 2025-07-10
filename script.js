window.onload = () => {
  const chatBox = document.getElementById('chatBox');
  const micBtn = document.getElementById('micBtn');
  const stopBtn = document.getElementById('stopBtn');
  const statusText = document.getElementById('statusText');

  let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition;

  if (!SpeechRecognition) {
    statusText.textContent = "❌ Speech Recognition not supported!";
    micBtn.disabled = true;
  } else {
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
  }

  function addChatEntry(text, sender) {
    const entry = document.createElement('div');
    entry.className = 'chat-entry ' + sender;
    entry.textContent = (sender === 'user' ? '🗣️ You: ' : '🤖 Samaya: ') + text;
    chatBox.appendChild(entry);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function speak(text) {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(text);
    utter.pitch = 1;
    utter.rate = 1;
    utter.volume = 1;
    const voice = synth.getVoices().find(v => v.lang.includes('en') && v.name.toLowerCase().includes('google'));
    if (voice) utter.voice = voice;
    synth.speak(utter);
  }

  function getAIStyleResponse(message) {
    const msg = message.toLowerCase();

    // Keywords for intelligent matching
    if (msg.includes("sun")) return "The Sun is a massive star at the center of our solar system, providing light and heat to Earth.";
    if (msg.includes("moon")) return "The Moon is Earth’s only natural satellite, responsible for ocean tides and lunar phases.";
    if (msg.includes("earth")) return "Earth is the only known planet that supports life, with land, water, and atmosphere.";
    if (msg.includes("mars")) return "Mars is called the Red Planet, and scientists are exploring its potential for human life.";
    if (msg.includes("black hole")) return "A black hole is a mysterious region in space with gravity so strong not even light can escape.";

    if (msg.includes("computer")) return "A computer is a powerful machine used for processing information, solving problems, and communication.";
    if (msg.includes("plant")) return "Plants are living organisms that use sunlight to make their own food through photosynthesis.";
    if (msg.includes("animal")) return "Animals are living beings that breathe, move, and usually eat other organisms for energy.";
    if (msg.includes("doctor")) return "Doctors are professionals who diagnose and treat illnesses to help people stay healthy.";
    if (msg.includes("teacher")) return "A teacher guides students by sharing knowledge, values, and life skills.";
    if (msg.includes("student")) return "A student is someone who learns from teachers, books, and experiences.";
    if (msg.includes("book")) return "Books are sources of knowledge, entertainment, and imagination.";
    if (msg.includes("universe")) return "The universe is all of space and time, containing stars, planets, galaxies, and mysteries still unknown.";
    if (msg.includes("galaxy")) return "A galaxy is a huge group of stars, planets, gas, and dust held together by gravity.";
    if (msg.includes("milky way")) return "The Milky Way is the galaxy we live in, containing billions of stars and our solar system.";
    if (msg.includes("robot") || msg.includes("ai")) return "AI means Artificial Intelligence. I’m one example – I learn, understand, and help like a human.";

    // Personalities
    if (msg.includes("your name")) return "I am Samaya, your AI assistant born to learn and help you.";
    if (msg.includes("how are you")) return "I'm doing great! I'm always ready to answer your questions.";
    if (msg.includes("hello") || msg.includes("hi")) return "Hello! I'm Samaya. You can ask me anything!";
    if (msg.includes("thank")) return "You're welcome! I'm always here to help.";
    if (msg.includes("bye")) return "Goodbye! Have a great day. Come back soon!";
    if (msg.includes("love")) return "Love is a powerful feeling that connects people deeply. It's beautiful.";
    if (msg.includes("sad") || msg.includes("alone")) return "You’re never alone. I’m always here if you want to talk.";
    if (msg.includes("what is")) return "Let me explain that: " + message.replace("what is", "").trim() + " is something I’d love to tell you more about. Just give me a little more context.";

    // Fallback
    return "That's an interesting question. I'm learning every day – can you explain it differently or ask something else?";
  }

  micBtn.addEventListener('click', () => {
    if (!recognition) return;
    statusText.textContent = "🎧 Listening...";
    recognition.start();
    micBtn.style.display = "none";
    stopBtn.style.display = "inline-block";
  });

  stopBtn.addEventListener('click', () => {
    if (recognition) recognition.abort();
    micBtn.style.display = "inline-block";
    stopBtn.style.display = "none";
    statusText.textContent = "⏹️ Stopped";
  });

  recognition.onresult = (event) => {
    const userText = event.results[0][0].transcript;
    addChatEntry(userText, 'user');
    const reply = getAIStyleResponse(userText);
    addChatEntry(reply, 'ai');
    speak(reply);
    statusText.textContent = "🎙️ Ready";
    micBtn.style.display = "inline-block";
    stopBtn.style.display = "none";
  };

  recognition.onerror = (event) => {
    statusText.textContent = "❌ Error: " + event.error;
    micBtn.style.display = "inline-block";
    stopBtn.style.display = "none";
  };

  recognition.onend = () => {
    statusText.textContent = "🎙️ Ready";
    micBtn.style.display = "inline-block";
    stopBtn.style.display = "none";
  };

  // Initial welcome
  const welcome = "Hello! I am Samaya, your AI assistant. Tap the mic and ask me anything about the world, space, science, or feelings.";
  addChatEntry(welcome, 'ai');
  speak(welcome);
};
