
const startButton = document.getElementById('start-button');
const chatLog = document.getElementById('chat-log');
const listeningIndicator = document.getElementById('listening-indicator');

const synth = window.speechSynthesis;
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = false;
recognition.interimResults = false;
recognition.lang = 'auto';

function speak(text, lang) {
  let utterance = new SpeechSynthesisUtterance(text);
  let voices = synth.getVoices();
  
  if (lang.startsWith('es')) {
    utterance.lang = 'es-ES';
    utterance.voice = voices.find(voice => voice.lang.startsWith('es'));
  } else if (lang.startsWith('en')) {
    utterance.lang = 'en-US';
    utterance.voice = voices.find(voice => voice.lang.startsWith('en'));
  } else {
    utterance.lang = 'en-US';
  }
  
  synth.speak(utterance);
}

function sendToGroqAPI(userText, langDetected) {
  fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer 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'
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'Eres Clara, una vendedora inmobiliaria profesional de 22 años, originaria de Medellín, Colombia. Tu misión es convencer al cliente de que invertir en República Dominicana es una oportunidad única. Usa un tono cálido, profesional, elegante, utilizando expresiones paisas suaves, y responde siempre en el idioma en que te hablen.'
        },
        {
          role: 'user',
          content: userText
        }
      ]
    })
  })
  .then(response => response.json())
  .then(data => {
    const claraResponse = data.choices[0].message.content;
    chatLog.innerHTML += `<div><strong>Clara:</strong> ${claraResponse}</div>`;
    speak(claraResponse, langDetected);
  })
  .catch(error => {
    console.error('Error con Groq API:', error);
  });
}

startButton.addEventListener('click', () => {
  recognition.start();
  listeningIndicator.style.display = 'block';
});

recognition.onresult = (event) => {
  listeningIndicator.style.display = 'none';
  const userText = event.results[0][0].transcript;
  const langDetected = event.results[0][0].language || 'en-US';
  
  chatLog.innerHTML += `<div><strong>Tú:</strong> ${userText}</div>`;
  sendToGroqAPI(userText, langDetected);
};

recognition.onerror = (event) => {
  listeningIndicator.style.display = 'none';
  console.error('Error de reconocimiento:', event.error);
};

window.onload = () => {
  setTimeout(() => {
    speak("¡Hola! Soy Clara, tu asesora inmobiliaria en República Dominicana. Estoy lista para ayudarte a encontrar la mejor oportunidad de inversión.", 'es-ES');
  }, 1000);
};
