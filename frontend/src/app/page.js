"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';


const DAYS = 7;
const TIME_SLOTS = 10;
const ACTIVE_DAYS = 5;
const ACTIVE_SLOTS = 8;


const generateRandomTimetableData = () => {
  const data = [];
  for (let i = 0; i < DAYS; i++) {
    for (let j = 0; j < TIME_SLOTS; j++) {
      if (i < ACTIVE_DAYS && j < ACTIVE_SLOTS) {
        data.push(Math.random() > 0.5);
      } else {
        data.push(false);
      }
    }
  }
  return data;
};


export default function VoxNoteLanding() {
  const dashboardRef = useRef(null);
  const notesRef = useRef(null);
  const audioRef = useRef(null);
  const interviewRef = useRef(null);

  const isDashboardInView = useInView(dashboardRef, { once: true, amount: 0.3 });
  const isNotesInView = useInView(notesRef, { once: true, amount: 0.3 });
  const isAudioInView = useInView(audioRef, { once: true, amount: 0.3 });
  const isInterviewInView = useInView(interviewRef, { once: true, amount: 0.3 });

  const [timetableData, setTimetableData] = useState([]);
  
  useEffect(() => {
    setTimetableData(generateRandomTimetableData());
  }, []);
  
  return (
    <div className="bg-black min-h-screen text-white relative overflow-hidden">
      {/* Subtle background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/5 blur-3xl" />
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-50 px-6 md:px-12 py-6 flex justify-between items-center border-b border-gray-900"
      >
        <div className="text-2xl font-bold">VoxNote</div>
        <div className="flex gap-4 items-center">
          <a href="/sign-in" className="text-sm text-gray-400 hover:text-white transition-colors">Sign In</a>
          <a href="/sign-up" className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium rounded-lg transition-all">
            Get Started
          </a>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative px-6 md:px-12 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] mb-6">
            Your complete
            <br />
            productivity workspace
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Capture ideas, manage time, and remember everything with notes, voice, and AI-powered insights.
          </p>
          <a href="/sign-up" className="inline-block px-10 py-4 bg-orange-600 hover:bg-orange-500 text-white text-lg font-medium rounded-lg transition-all hover:scale-105">
            Start for Free
          </a>
        </motion.div>
      </section>

      {/* Dashboard Screenshot */}
      <section ref={dashboardRef} className="relative px-6 md:px-12 py-20">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isDashboardInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2 }}
          className="max-w-7xl mx-auto"
        >
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-b from-orange-600/10 via-transparent to-transparent blur-3xl" />
            
            <div className="relative bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-800/50 rounded-2xl overflow-hidden backdrop-blur-sm">
              <div className="bg-gray-950/90 border-b border-gray-800/50 px-6 py-4 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
              </div>
              
              <div className="p-8 md:p-12">
                <div className="mb-10">
                  <h2 className="text-3xl font-bold mb-2">Hello, Alex 👋</h2>
                  <p className="text-gray-500">Monday, December 15, 2025</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="md:col-span-2 bg-gray-900/40 border border-gray-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-6">Weekly Timetable</h3>
                    <div className="grid grid-cols-7 gap-3">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                        <div key={i}>
                          <div className="text-xs text-gray-500 mb-3 text-center">{day}</div>
                          <div className="space-y-2">
                            {[...Array(TIME_SLOTS)].map((_, j) => {
                              const index = i * TIME_SLOTS + j;
                              const isRandomOrange = timetableData[index];
                              
                              let className = 'h-2 rounded bg-gray-800/30';
                              
                              if (i < ACTIVE_DAYS && j < ACTIVE_SLOTS) {
                                  className = `h-2 rounded ${isRandomOrange ? 'bg-orange-600/60' : 'bg-gray-800/60'}`;
                              }
                              return (
                                <div key={j} className={className} />
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-900/40 border border-gray-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-6">Focus Timer</h3>
                    <div className="flex flex-col items-center py-4">
                      <div className="relative w-32 h-32 mb-6">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="#1f2937" strokeWidth="3" />
                          <circle cx="50" cy="50" r="45" fill="none" stroke="#ea580c" strokeWidth="3" strokeDasharray="283" strokeDashoffset="70" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="text-3xl font-bold text-orange-500">25:00</div>
                        </div>
                      </div>
                      <button className="w-full py-2 bg-orange-600 rounded-lg text-sm font-medium">Start</button>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/40 border border-gray-800/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Today's Tasks</h3>
                  <div className="space-y-3">
                    {['Review project proposal', 'Team sync at 2 PM', 'Update docs', 'Research AI tools', 'Presentation prep'].map((task, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 ${i < 2 ? 'border-orange-600 bg-orange-600/20' : 'border-gray-700'}`} />
                        <span className={`text-sm ${i < 2 ? 'line-through text-gray-600' : 'text-gray-300'}`}>{task}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-800/50 flex justify-center gap-12">
                  {[{i:'🏠',l:'Home',a:1},{i:'📝',l:'Notes',a:0},{i:'🎙',l:'Audio',a:0},{i:'🤖',l:'Interview',a:0}].map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className={`text-2xl ${item.a ? 'scale-110' : 'opacity-40'}`}>{item.i}</div>
                      <span className={`text-xs ${item.a ? 'text-orange-500' : 'text-gray-600'}`}>{item.l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative px-6 md:px-12 py-20 border-t border-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-20"
          >
            Four powerful tools. One workspace.
          </motion.h2>

          {/* Notes */}
          <motion.div
            ref={notesRef}
            initial={{ opacity: 0, y: 50 }}
            animate={isNotesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1 }}
            className="grid md:grid-cols-2 gap-12 items-center mb-32"
          >
            <div>
              <div className="inline-block px-4 py-1 bg-orange-600/10 border border-orange-600/20 rounded-full text-orange-500 text-sm mb-6">📝 Notes</div>
              <h3 className="text-4xl font-bold mb-4">Everything in one place</h3>
              <p className="text-xl text-gray-400 mb-6">Create notes with text, PDFs, audio, and AI summaries.</p>
              <div className="space-y-2">
                {['Text with formatting','PDF attachments','Audio recordings','AI summaries','Smart search'].map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-orange-600 rounded-full" />
                    <span className="text-gray-300">{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-900/40 border border-gray-800/50 rounded-xl p-6">
              {[{t:'Product Strategy 2025',ty:'PDF + Text',tm:'2h'},{t:'Meeting Recording',ty:'Audio',tm:'5h'},{t:'Research: AI Tools',ty:'Text + Summary',tm:'1d'}].map((n, i) => (
                <div key={i} className="p-4 mb-3 bg-black/40 border border-gray-800/50 rounded-lg hover:border-gray-700 transition-all cursor-pointer">
                  <h4 className="font-semibold mb-1">{n.t}</h4>
                  <div className="text-sm text-gray-600">{n.ty} · {n.tm}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Audio */}
          <motion.div
            ref={audioRef}
            initial={{ opacity: 0, y: 50 }}
            animate={isAudioInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1 }}
            className="grid md:grid-cols-2 gap-12 items-center mb-32"
          >
            <div className="order-2 md:order-1 bg-gray-900/40 border border-gray-800/50 rounded-xl p-8">
              <div className="flex flex-col items-center">
                <div className="flex items-end justify-center gap-1 h-32 mb-6">
                  {[...Array(40)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={isAudioInView ? { height: [8, Math.random() * 80 + 20, 8] } : {}}
                      transition={{ duration: 1, delay: i * 0.02, repeat: Infinity, repeatType: "reverse" }}
                      className="w-1 bg-gradient-to-t from-red-600 to-orange-600 rounded-full"
                    />
                  ))}
                </div>
                <div className="text-4xl font-bold mb-6 text-red-500">02:47</div>
                <div className="flex gap-4 mb-6">
                  <button className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center">
                    <div className="w-4 h-4 bg-gray-500 rounded" />
                  </button>
                  <button className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-500 transition-all hover:scale-105">
                    <div className="w-6 h-6 bg-white rounded-full mx-auto" />
                  </button>
                  <button className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-gray-500" />
                  </button>
                </div>
                <div className="w-full p-4 bg-black/40 border border-gray-800/50 rounded-lg">
                  <p className="text-sm text-gray-400">"Q4 goals include expanding user base by 30%, improving features, and establishing partnerships..."</p>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-block px-4 py-1 bg-red-600/10 border border-red-600/20 rounded-full text-red-500 text-sm mb-6">🎙 Audio</div>
              <h3 className="text-4xl font-bold mb-4">Speak, we'll write</h3>
              <p className="text-xl text-gray-400 mb-6">Voice notes transcribed and saved instantly.</p>
              <div className="space-y-2">
                {['Real-time transcription','Auto note creation','Audio storage','Sync playback','Search audio'].map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                    <span className="text-gray-300">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Interview */}
          <motion.div
            ref={interviewRef}
            initial={{ opacity: 0, y: 50 }}
            animate={isInterviewInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1 }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <div className="inline-block px-4 py-1 bg-orange-600/10 border border-orange-600/20 rounded-full text-orange-500 text-sm mb-6">🤖 Interview</div>
              <h3 className="text-4xl font-bold mb-4">AI-guided conversations</h3>
              <p className="text-xl text-gray-400 mb-6">Structured interviews with transcripts and summaries.</p>
              <div className="space-y-2">
                {['AI questions','Q&A transcription','Auto summaries','Key insights','Export reports'].map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-orange-600 rounded-full" />
                    <span className="text-gray-300">{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-900/40 border border-gray-800/50 rounded-xl p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-600/20 flex items-center justify-center text-xs text-orange-500">AI</div>
                <div className="text-sm font-semibold">Interview Assistant</div>
              </div>
              <div className="space-y-3 mb-4">
                {[{t:'ai',txt:'What are your Q4 goals?'},{t:'user',txt:'Focus on retention and features.'},{t:'ai',txt:'Which features?'},{t:'user',txt:'Mobile app and analytics.'}].map((m, i) => (
                  <div key={i} className={`flex ${m.t === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 rounded-lg text-sm ${m.t === 'user' ? 'bg-orange-600/20 border border-orange-600/30' : 'bg-black/40 border border-gray-800/50'}`}>
                      {m.txt}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-gray-800 rounded-lg text-sm">End & Save</button>
                <button className="px-4 py-2 bg-orange-600 rounded-lg text-sm">Summary</button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative px-6 md:px-12 py-20 border-t border-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Trusted by teams</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[{q:"AI summaries save hours weekly.",a:"Sarah Chen",r:"PM"},{q:"Voice-to-text is incredibly accurate.",a:"Mike Rodriguez",r:"Designer"},{q:"Interview mode is a game-changer.",a:"Emily Watson",r:"Research"}].map((t, i) => (
              <div key={i} className="bg-gray-900/40 border border-gray-800/50 rounded-xl p-6">
                <p className="text-gray-300 mb-4">"{t.q}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-600 to-red-600" />
                  <div>
                    <div className="font-semibold text-sm">{t.a}</div>
                    <div className="text-xs text-gray-600">{t.r}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-6 py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">Ready to start?</h2>
          <p className="text-xl text-gray-400 mb-10">Transform your productivity with VoxNote.</p>
          <a href="/sign-up" className="inline-block px-10 py-4 bg-orange-600 hover:bg-orange-500 text-white text-lg font-medium rounded-lg transition-all hover:scale-105">
            Start for Free
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-gray-900/50 py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xl font-bold">VoxNote</div>
          <div className="flex gap-8 text-sm text-gray-600">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}