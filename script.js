// १. जेमिनी एपीआई कन्फिगरेसन (तपाईंको आफ्नै API Key सेट गरिएको छ)
const API_KEY = "AIzaSyDkidNw7if6d0mcbimSMTYgqiv1ur4OUDY"; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// स्पीच रिकग्निसन सेटअप
const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

// DOM Elements
const micBtn = document.getElementById('micBtn');
const stopBtn = document.getElementById('stopBtn');
const statusText = document.getElementById('statusText');
const userTextField = document.getElementById('userText');
const aiResponseField = document.getElementById('aiResponse');

if (!recognition) {
  statusText.textContent = "❌ Speech recognition not supported in this browser.";
} else {
  recognition.continuous = false;
  recognition.interimResults = false;
  
  // 🌟 गुगललाई बहुभाषिक (Multi-language) बनाउने सेटिङ
  // यसले तपाईंको मोबाइलको डिफल्ट भाषा वा नेपाली/अंग्रेजी दुवै पहिचान गर्छ
  recognition.lang = navigator.language || 'ne-NP'; 

  // माइक क्लिक गर्दा सुन्न सुरु गर्ने
  micBtn.addEventListener('click', () => {
    userTextField.textContent = "Suntiraichhu... (Listening...)";
    aiResponseField.textContent = "";
    
    try {
      recognition.start();
      statusText.textContent = "🔊 Listening closely...";
      micBtn.style.display = 'none';
      stopBtn.style.display = 'inline-block';
    } catch (e) {
      console.log("Recognition already started");
    }
  });

  // म्यानुअल्ली रोक्नका लागि
  stopBtn.addEventListener('click', () => {
    recognition.stop();
    resetButtons();
  });

  // आवाजलाई अक्षरमा बदलेपछि चल्ने फङ्सन
  recognition.onresult = (event) => {
    const speechToText = event.results[0][0].transcript;
    
    // तपाईंले जुनसुकै भाषामा बोले पनि यहाँ प्रस्ट देखिन्छ
    userTextField.textContent = `You said: "${speechToText}"`;
    
    // सिधै इन्टरनेटको महासागर (Gemini AI) मा प्रश्न पठाउने
    askSamayaAI(speechToText);
  };

  recognition.onerror = (event) => {
    statusText.textContent = `❌ Error: ${event.error}`;
    if (event.error === 'no-speech') {
      userTextField.textContent = "⚠️ No speech detected. Please try again.";
    }
    resetButtons();
  };

  recognition.onend = () => {
    resetButtons();
  };
}

function resetButtons() {
  micBtn.style.display = 'inline-block';
  stopBtn.style.display = 'none';
  if(statusText.textContent.includes("Listening")) {
    statusText.textContent = "🎙️ Ready";
  }
}

// २. इन्टरनेट र जेमिनी एआईसँग कनेक्ट गर्ने मुख्य फङ्सन
async function askSamayaAI(question) {
  statusText.textContent = "🤖 Samaya is thinking...";
  aiResponseField.textContent = "Fetching official response...";

  // समयालाई तपाईंले जुन भाषामा सोध्नुभयो, त्यही भाषामा उत्तर दिन लगाउने प्रम्प्ट
  const prompt = `You are Samaya, an advanced digital humanoid AI assistant. 
  The user can speak or query in any language (like Nepali, English, or mixed Roman-Nepali). 
  Respond accurately, officially, and intelligently in the SAME LANGUAGE or script the user used. 
  Keep the response clear and clean, completely avoid markdown formatting like bold stars (**) or hashtags, so it can be easily read aloud.
  User Query: ${question}`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      let aiAnswer = data.candidates[0].content.parts[0].text;
      
      // स्टार (**) वा अनावश्यक चिह्नहरू हटाउने सफा फलोअप
      aiAnswer = aiAnswer.replace(/[\*#]/g, '');

      // क) स्क्रिनमा आधिकारिक उत्तर लेखेर देखाउने (Written Form)
      aiResponseField.textContent = `Samaya: ${aiAnswer}`;
      statusText.textContent = "🗣️ Speaking...";

      // ख) त्यही उत्तरलाई आवाजमा सुनाउने (Voice Output)
      speakOut(aiAnswer);
    } else {
      aiResponseField.textContent = "Samaya: Sorry, I couldn't understand the cloud data. Please try again.";
      statusText.textContent = "🎙️ Ready";
    }

  } catch (error) {
    console.error(error);
    aiResponseField.textContent = "Samaya: Connection error. Please check your internet or API setup.";
    statusText.textContent = "❌ Connection Error";
  }
}

// ३. ह्युमनाइड भ्वाइस सिन्थेसिस (Text-to-Speech)
function speakOut(text) {
  window.speechSynthesis.cancel(); // पुराना आवाजहरू रोक्ने

  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  
  // यदि उत्तर नेपालीमा छ भने नेपाली इन्जिन वा अंग्रेजी छ भने अंग्रेजी इन्जिन आफैं म्याच गराउने
  // मोबाइलमा उपलब्ध उत्कृष्ट प्राकृतिक आवाज छान्ने प्रयास
  const preferredVoice = voices.find(voice => 
    voice.name.includes('Google') || 
    voice.name.includes('Natural') ||
    voice.lang.includes('en') ||
    voice.lang.includes('ne')
  );
  
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.rate = 1.0;  // सामान्य स्पिड
  utterance.pitch = 1.0; // ह्युमनाइड टोन

  utterance.onend = () => {
    statusText.textContent = "🎙️ Ready";
  };

  window.speechSynthesis.speak(utterance);
}

// क्रोम वा एन्ड्रोइड ब्राउजरका लागि भ्वाइस लोड गर्ने ब्याकअप
if (window.speechSynthesis.onvoiceschanged !== undefined) {
  window.speechSynthesis.onvoiceschanged = window.speechSynthesis.getVoices;
}