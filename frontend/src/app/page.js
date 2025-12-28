"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const [timetableData, setTimetableData] = useState([]);

  useEffect(() => {
    const data = [];
    for (let i = 0; i < 70; i++) {
      data.push(Math.random() > 0.5);
    }
    setTimetableData(data);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="fixed inset-0 bg-gradient-radial from-orange-500/5 via-transparent to-transparent pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-50 px-4 md:px-12 py-6 flex justify-between items-center border-b border-white/10">
        <div className="text-xl font-light">VoxNote</div>
        <div className="flex gap-3 md:gap-4 items-center">
          <a href="/sign-in" className="text-sm text-slate-400 hover:text-white transition-colors hover:cursor-pointer">Sign In</a>
          <a href="/sign-up" className="px-4 md:px-6 py-2 bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 text-orange-400 text-sm font-light rounded-xl transition-all hover:cursor-pointer">
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-4 md:px-12 py-16 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-4xl md:text-6xl font-light leading-tight mb-6">
            Your productivity workspace
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto font-light">
            Notes, tasks, schedule, and AI insights in one place
          </p>
          <a href="/sign-up" className="inline-block px-8 py-3 bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 text-orange-400 font-light rounded-xl transition-all hover:cursor-pointer">
            Start Free
          </a>
        </motion.div>
      </section>

      {/* Dashboard Preview */}
      <section className="relative px-4 md:px-12 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-6xl mx-auto"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <div className="bg-slate-800/90 border-b border-white/10 px-4 md:px-6 py-3 flex items-center gap-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
            </div>

            <div className="p-6 md:p-12">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-light mb-2">Good evening</h2>
                <p className="text-xs text-slate-500 uppercase tracking-wider">VoxNote Dashboard</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-sm font-light text-slate-400 mb-4 uppercase tracking-wider">Weekly Schedule</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                      <div key={i}>
                        <div className="text-[10px] text-slate-500 mb-2 text-center">{day}</div>
                        <div className="space-y-1.5">
                          {[...Array(10)].map((_, j) => {
                            const index = i * 10 + j;
                            const isActive = timetableData[index];
                            return (
                              <div
                                key={j}
                                className={`h-1.5 rounded ${isActive ? 'bg-orange-500/60' : 'bg-white/5'}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-sm font-light text-slate-400 mb-4 uppercase tracking-wider">Focus Timer</h3>
                  <div className="flex flex-col items-center py-4">
                    <div className="text-4xl font-light text-orange-400 mb-6">25:00</div>
                    <button className="w-full py-2 bg-orange-500/10 border border-orange-500/30 rounded-xl text-sm text-orange-400 font-light">
                      Start
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-sm font-light text-slate-400 mb-4 uppercase tracking-wider">Today's Tasks</h3>
                <div className="space-y-3">
                  {['Review project proposal', 'Team sync at 2 PM', 'Update documentation'].map((task, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded border border-slate-600" />
                      <span className="text-sm text-slate-300 font-light">{task}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative px-4 md:px-12 py-12 md:py-20 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light text-center mb-16">Everything you need</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Smart Notes', desc: 'Text, PDFs, audio with AI summaries' },
              { title: 'Time Management', desc: 'Focus timer and weekly schedule' },
              { title: 'Task Tracking', desc: 'Simple todo lists and reminders' }
            ].map((feature, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-light mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 font-light">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-4 md:px-12 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-light mb-6">Ready to start?</h2>
          <p className="text-lg text-slate-400 mb-10 font-light">Get organized today</p>
          <a href="/sign-up" className="inline-block px-8 py-3 bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 text-orange-400 font-light rounded-xl transition-all">
            Start Free
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10 py-8 px-4 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-lg font-light">VoxNote</div>
          <div className="flex gap-6 text-sm text-slate-500">
            Made with ♥ by Navneet Yadav
          </div>
        </div>
      </footer>
    </div>
  );
}