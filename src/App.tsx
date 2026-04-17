import { useState, useEffect, useRef } from "react";
import "./App.css";

// @ts-ignore
import musicFile from "./music.mp3";

declare global {
  interface Window {
    emailjs?: any;
  }
}

/* ─────────────────────────────────────────────
   EMAILJS CONFIG — fill these in after setup
   ───────────────────────────────────────────── */
const EMAILJS_SERVICE_ID  = "service_malqsvn";
const EMAILJS_TEMPLATE_ID = "template_0bddydl";
const EMAILJS_PUBLIC_KEY  = "v-juzKs4gA3BvSCJ0";
const YOUR_EMAIL          = "graypoints@gmail.com"; 

/* ─────────────────────────────────────── */

const questions = [
  {
    q: "Thinking about our coffee date ☕… what was your favorite part?",
    opts: [
      "The conversation 😄",
      "The laughs 😂",
      "The vibe 😌",
      "Everything honestly ❤️",
    ],
  },
  {
    q: "Be honest Hanuuu 💜… was I how you expected?",
    opts: ["Better 👀", "About the same 😄", "A little different 😅", "Still deciding 😉"],
  },
  {
    q: "If we had another coffee date… what should we change?",
    opts: [
      "Nothing, it was perfect 😌",
      "Try somewhere new 🌆",
      "Stay longer this time ⏳",
      "Add more laughter 😂",
    ],
  },
  {
    q: "Who was more shy that day? 😄",
    opts: ["You 😌", "Me 😅", "Both of us 😂", "No one, we were cool 😎"],
  },
  {
    q: "If we met again soon… what would you prefer?",
    opts: ["Coffee again ☕", "A walk somewhere nice 🌿", "Food + talking 🍽️", "Surprise me 👀"],
  },
  {
    q: "What do you enjoy most when talking to me?",
    opts: [
      "Your humor 😄",
      "Your vibe 😌",
      "The way you listen 👀",
      "Everything a little ❤️",
    ],
  },
  {
    q: "When you see my message now 📱… what happens?",
    opts: [
      "I smile 😊",
      "I reply fast 😄",
      "I act calm but I'm not 😅",
      "I actually look forward to it ❤️",
    ],
  },
  {
    q: "If we got stuck talking for hours again… 😄",
    opts: [
      "I wouldn't mind at all 😌",
      "I'd lose track of time 😂",
      "I'd blame you 😄",
      "I'd enjoy every second ❤️",
    ],
  },
  {
    q: "Right now… what am I to you?",
    opts: [
      "Someone interesting 🙂",
      "A good vibe 😌",
      "Someone I like talking to ❤️",
      "Let's see where it goes 👀",
    ],
  },
  {
    q: "Final question Hanuuu 💜… should we do this again soon? 😉",
    opts: [
      "Yes, definitely ❤️",
      "Maybe… but I want to 😄",
      "Convince me 😏",
      "I'm already waiting 👀",
    ],
  },
];

/* ── floating hearts data ── */
const HEARTS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 12}s`,
  duration: `${8 + Math.random() * 10}s`,
  size: `${14 + Math.random() * 22}px`,
  opacity: 0.12 + Math.random() * 0.25,
  char: ["❤️", "💜", "💛", "✨", "🌸"][Math.floor(Math.random() * 5)],
}));



/* ── inject EmailJS SDK ── */
function injectEmailJS() {
  if (document.getElementById("emailjs-sdk")) return;
  const s = document.createElement("script");
  s.id = "emailjs-sdk";
  s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
  s.onload = () => window.emailjs?.init(EMAILJS_PUBLIC_KEY);
  document.head.appendChild(s);
}

/* ════════════════════════════════════════
   MAIN APP
   ════════════════════════════════════════ */
export default function HananApp() {
  const [phase, setPhase]     = useState("landing");   // landing | declined | quiz | result | sent
  const [qIndex, setQIndex]   = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [sending, setSending]   = useState(false);
  const cardKey = useRef(0); // force re-mount for animation
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    injectEmailJS();
  }, []);

  function startMusic() {
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.log("Audio play prevented", err));
    }
  }

  function handleYes() {
    startMusic();
    setPhase("quiz");
    setQIndex(0);
    setAnswers([]);
    setSelected(null);
  }

  function handleOptionClick(opt: string) {
    setSelected(opt);
    setTimeout(() => {
      const newAnswers = [...answers, opt];
      if (qIndex < questions.length - 1) {
        setAnswers(newAnswers);
        cardKey.current += 1;
        setQIndex(qIndex + 1);
        setSelected(null);
      } else {
        setAnswers(newAnswers);
        setPhase("result");
      }
    }, 420);
  }

  async function sendResults() {
    if (!window.emailjs) return;
    setSending(true);
    const htmlText = questions
      .map((q, i) => `<div style="margin-bottom: 16px; padding: 12px; background: #fff8f2; border-left: 4px solid #e8637a; border-radius: 4px;">
        <div style="font-weight: bold; color: #2a1a2e; margin-bottom: 6px;">Q${i + 1}: ${q.q}</div>
        <div style="color: #c04b67; font-size: 1.1em;">A: ${answers[i]}</div>
      </div>`)
      .join("");

    try {
      await window.emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        { to_email: YOUR_EMAIL, answers: htmlText, from_name: "Hanuuu 💜" }
      );
      setPhase("sent");
    } catch (e) {
      alert("Couldn't send — check your EmailJS config 😅");
    } finally {
      setSending(false);
    }
  }

  const progress = phase === "quiz" ? ((qIndex) / questions.length) * 100 : 0;

  return (
    <>
      <audio ref={audioRef} src={musicFile} loop autoPlay />
      {/* floating hearts */}
      {HEARTS.map(h => (
        <span
          key={h.id}
          className="heart-float"
          style={{
            left: h.left,
            bottom: "-20px",
            fontSize: h.size,
            opacity: h.opacity,
            animationDuration: h.duration,
            animationDelay: h.delay,
          }}
        >
          {h.char}
        </span>
      ))}

      <div className="scene">
        {/* ── LANDING ── */}
        {phase === "landing" && (
          <div className="card" key="landing">
            <p className="landing-title">
              <em></em> Hanuuu 💜💜💜,<br />
              would you like to see<br />
              what I prepared for you? ❤️
            </p>
            <div className="btn-row">
              <button className="btn-yes" onClick={handleYes}>Yes 💖</button>
              <button className="btn-no"  onClick={() => { startMusic(); setPhase("declined"); }}>No 😅</button>
            </div>
          </div>
        )}

        {/* ── DECLINED ── */}
        {phase === "declined" && (
          <div className="card" key="declined">
            <p className="declined-msg">
              Alright…<br />
              maybe another time<br />
              <span>Hanuuu 💜</span> 😊
            </p>
          </div>
        )}

        {/* ── QUIZ ── */}
        {phase === "quiz" && (
          <div className="card" key={`q-${qIndex}-${cardKey.current}`}>
            <div className="progress-wrap">
              <div className="progress-label">
                <span className="shimmer-text">Question {qIndex + 1} of {questions.length}</span>
                <span style={{ color: "#c9a8e0" }}>{Math.round(progress)}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <p className="question-text">{questions[qIndex].q}</p>

            <div className="options-grid">
              {questions[qIndex].opts.map(opt => (
                <button
                  key={opt}
                  className={`opt-btn${selected === opt ? " selected" : ""}`}
                  onClick={() => handleOptionClick(opt)}
                  disabled={selected !== null}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── RESULT ── */}
        {(phase === "result" || phase === "sent") && (
          <div className="card" key="result">
            <span className="result-icon">💜</span>
            <h2 className="result-title">You made it, Hanuuu! 🎉</h2>
            <p className="result-subtitle">
              Thank you for answering honestly 😊<br />
              Every answer made me smile a little more 💛
            </p>

            <div className="answers-list">
              {questions.map((q, i) => (
                <div className="answer-row" key={i}>
                  <span className="answer-q">Q{i + 1}</span>
                  <span style={{ color: "#555" }}>{answers[i]}</span>
                </div>
              ))}
            </div>

            {phase === "result" && (
              <button className="send-btn" onClick={sendResults} disabled={sending}>
                {sending ? "Sending… 💌" : "Send my answers to you 💌"}
              </button>
            )}

            {phase === "sent" && (
              <p className="sent-msg">✅ Sent! Now you have all her answers 💜😊</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}