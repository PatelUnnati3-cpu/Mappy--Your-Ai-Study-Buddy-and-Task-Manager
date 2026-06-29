import React from 'react';
import { 
  Smile, Home, BarChart2, MessageSquare, Settings as SettingsIcon,
  Clock, Play, Pause, RotateCcw, Flame, ShieldAlert, Sparkles, User as UserIcon
} from 'lucide-react';
import { Theme } from '../types';

interface SidebarProps {
  activeTab: 'home' | 'progress' | 'chat' | 'settings' | 'account';
  setActiveTab: (tab: 'home' | 'progress' | 'chat' | 'settings' | 'account') => void;
  streak: number;
  level: number;
  xp: number;
  completionPercentage: number;
  theme: Theme;
  pomodoroMinutes: number;
  pomodoroSeconds: number;
  pomodoroIsRunning: boolean;
  setPomodoroIsRunning: (running: boolean) => void;
  pomodoroMode: 'Work' | 'Break';
  resetPomodoro: () => void;
  confessDistraction: () => void;
  customFocusDuration: number;
  setCustomFocusDuration: (val: number) => void;
  customFocusUnit: 'Minutes' | 'Hours';
  setCustomFocusUnit: (val: 'Minutes' | 'Hours') => void;
  enableMiddleBreaks: boolean;
  setEnableMiddleBreaks: (val: boolean) => void;
  breakInterval: number;
  setBreakInterval: (val: number) => void;
  breakDuration: number;
  setBreakDuration: (val: number) => void;
  onAddNote: (text: string) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  streak,
  level,
  xp,
  completionPercentage,
  theme,
  pomodoroMinutes,
  pomodoroSeconds,
  pomodoroIsRunning,
  setPomodoroIsRunning,
  pomodoroMode,
  resetPomodoro,
  confessDistraction,
  customFocusDuration,
  setCustomFocusDuration,
  customFocusUnit,
  setCustomFocusUnit,
  enableMiddleBreaks,
  setEnableMiddleBreaks,
  breakInterval,
  setBreakInterval,
  breakDuration,
  setBreakDuration,
  onAddNote
}: SidebarProps) {
  const [showConfig, setShowConfig] = React.useState(false);
  const [noteText, setNoteText] = React.useState('');
  const [showSaveSuccess, setShowSaveSuccess] = React.useState(false);
  const tabs = [
    { id: 'home' as const, label: 'Home Dashboard', icon: Home },
    { id: 'progress' as const, label: 'Progress Analytics', icon: BarChart2 },
    { id: 'chat' as const, label: 'Mappy Chat Room', icon: MessageSquare },
    { id: 'settings' as const, label: 'Vibe & Settings', icon: SettingsIcon },
    { id: 'account' as const, label: 'Account & Profile', icon: UserIcon },
  ];

  return (
    <aside className="w-72 h-full bg-gradient-to-b from-[#7C3AED] via-[#6366F1] to-[#0EA5E9] text-white flex flex-col justify-between select-none shadow-2xl overflow-y-auto">
      <div className="flex flex-col pt-8">
        {/* Logo Section */}
        <div className="px-6 mb-8 flex items-center gap-2.5">
          <Smile className="w-8 h-8 text-yellow-300 animate-bounce flex-shrink-0" />
          <div className="flex flex-col">
            <span className="font-space font-black tracking-widest text-2xl text-white">MAPPY</span>
            <span className="text-[10px] text-purple-100 font-mono tracking-tight uppercase">AI Study Buddy</span>
          </div>
        </div>

        {/* Navigation Track */}
        <nav className="flex flex-col gap-2.5 pl-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3.5 py-3.5 px-4 font-space text-sm font-semibold transition-all duration-200 cursor-pointer w-full text-white/85 hover:text-white ${
                  isActive 
                    ? 'carved-out-active-tab' 
                    : 'hover:bg-white/10 rounded-2xl mr-4'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${isActive ? 'text-[#6366F1]' : 'text-white'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Embedded Widgets section in Sidebar */}
      <div className="p-6 space-y-5 border-t border-white/10 mt-auto">
        {/* Streak counter badge */}
        <div className="flex items-center gap-2 px-3 py-2 bg-white/10 border border-white/10 rounded-xl text-xs font-bold font-space">
          <Flame className="w-4 h-4 text-orange-400 fill-orange-400 animate-pulse" />
          <span>{streak} DAY STUDY STREAK</span>
        </div>

        {/* Level details */}
        <div className="space-y-1 font-mono text-[11px] text-purple-100">
          <div className="flex justify-between font-bold">
            <span>STUDENT RANK</span>
            <span className="text-yellow-300">LVL {level}</span>
          </div>
          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
            <div className="bg-yellow-300 h-full rounded-full transition-all duration-300" style={{ width: `${xp}%` }}></div>
          </div>
          <div className="text-right text-[9px] opacity-75">{xp}/100 XP TO LEVEL UP</div>
        </div>

        {/* Embedded Pomodoro Timer */}
        <div className="bg-white/10 border border-white/15 rounded-2xl p-4 text-center">
          <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-purple-100 mb-2">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> POMODORO</span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setShowConfig(!showConfig)}
                className="p-1 hover:bg-white/10 rounded transition text-purple-200 hover:text-white"
                title="Configure Focus Timer"
              >
                <SettingsIcon className="w-3.5 h-3.5 text-purple-200 hover:text-yellow-300" />
              </button>
              <span className={`px-1.5 py-0.5 text-[8px] rounded font-bold ${pomodoroMode === 'Work' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                {pomodoroMode}
              </span>
            </div>
          </div>

          {!showConfig ? (
            <>
              <div className="font-mono text-2xl font-black tracking-widest my-1 text-white">
                {String(pomodoroMinutes).padStart(2, '0')}:{String(pomodoroSeconds).padStart(2, '0')}
              </div>
              <div className="flex justify-center gap-1.5 mt-2.5">
                <button
                  onClick={() => setPomodoroIsRunning(!pomodoroIsRunning)}
                  className="p-1.5 bg-white hover:bg-stone-100 text-[#6366F1] rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition active:scale-95"
                >
                  {pomodoroIsRunning ? <Pause className="w-3 h-3 text-[#6366F1]" /> : <Play className="w-3 h-3 text-[#6366F1]" />}
                  {pomodoroIsRunning ? 'Pause' : 'Start'}
                </button>
                <button
                  onClick={resetPomodoro}
                  className="p-1.5 border border-white/20 hover:bg-white/10 text-white rounded-lg text-[10px] cursor-pointer transition"
                  title="Reset Pomodoro"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </>
          ) : (
            <div className="text-left space-y-2.5 pt-1 border-t border-white/10 mt-1">
              {/* Focus Duration */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-purple-200 block">SET FOCUS TIME</label>
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                  <input
                    type="number"
                    min="1"
                    value={customFocusDuration || ''}
                    onChange={(e) => {
                      const val = Math.max(1, Number(e.target.value));
                      setCustomFocusDuration(val);
                      // Auto-disable break if calculated minutes is < 25
                      const calcMins = customFocusUnit === 'Hours' ? val * 60 : val;
                      if (calcMins < 25) {
                        setEnableMiddleBreaks(false);
                      }
                    }}
                    className="bg-transparent text-white font-mono text-xs w-full text-center focus:outline-none"
                  />
                  <button 
                    onClick={() => {
                      setCustomFocusUnit('Minutes');
                      const calcMins = customFocusDuration;
                      if (calcMins < 25) setEnableMiddleBreaks(false);
                    }}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition ${customFocusUnit === 'Minutes' ? 'bg-white text-[#6366F1]' : 'text-white/60 hover:text-white'}`}
                  >
                    Mins
                  </button>
                  <button 
                    onClick={() => {
                      setCustomFocusUnit('Hours');
                      const calcMins = customFocusDuration * 60;
                      if (calcMins < 25) setEnableMiddleBreaks(false);
                    }}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition ${customFocusUnit === 'Hours' ? 'bg-white text-[#6366F1]' : 'text-white/60 hover:text-white'}`}
                  >
                    Hrs
                  </button>
                </div>
                {/* Validation Warnings */}
                {((customFocusUnit === 'Hours' ? customFocusDuration * 60 : customFocusDuration) < 10) && (
                  <p className="text-[8px] text-yellow-300 font-bold">⚠️ Min is 10 minutes</p>
                )}
              </div>

              {/* Breaks Option */}
              <div className="space-y-1">
                {(() => {
                  const totalMinutes = customFocusUnit === 'Hours' ? customFocusDuration * 60 : customFocusDuration;
                  const isBreakAllowed = totalMinutes >= 25;

                  return (
                    <>
                      <label className={`flex items-center gap-1.5 text-[9px] font-bold cursor-pointer ${isBreakAllowed ? 'text-purple-200' : 'text-purple-300/30'}`}>
                        <input 
                          type="checkbox"
                          disabled={!isBreakAllowed}
                          checked={enableMiddleBreaks && isBreakAllowed}
                          onChange={(e) => setEnableMiddleBreaks(e.target.checked)}
                          className="rounded text-[#6366F1] bg-white/15 border-white/20"
                        />
                        Take breaks in middle
                      </label>
                      
                      {!isBreakAllowed ? (
                        <p className="text-[8px] text-purple-300/70 italic leading-tight">Breaks not possible (&lt; 25m focus)</p>
                      ) : enableMiddleBreaks ? (
                        <div className="bg-white/5 p-2 rounded-lg space-y-1.5 border border-white/10 mt-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[8px] text-purple-200">Interval (min):</span>
                            <input 
                              type="number"
                              min="25"
                              value={breakInterval || ''}
                              onChange={(e) => setBreakInterval(Math.max(25, Number(e.target.value)))}
                              className="bg-white/10 text-white font-mono text-[10px] w-12 text-center rounded focus:outline-none border border-white/10"
                            />
                          </div>
                          {breakInterval < 25 && (
                            <p className="text-[7px] text-yellow-300 font-bold">⚠️ Min break interval is 25m</p>
                          )}
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[8px] text-purple-200">Break len (min):</span>
                            <input 
                              type="number"
                              min="1"
                              value={breakDuration || ''}
                              onChange={(e) => setBreakDuration(Math.max(1, Number(e.target.value)))}
                              className="bg-white/10 text-white font-mono text-[10px] w-12 text-center rounded focus:outline-none border border-white/10"
                            />
                          </div>
                        </div>
                      ) : null}
                    </>
                  );
                })()}
              </div>

              {/* Action row */}
              <div className="flex gap-1.5 pt-1">
                <button
                  onClick={() => {
                    const totalMins = customFocusUnit === 'Hours' ? customFocusDuration * 60 : customFocusDuration;
                    if (totalMins < 10) {
                      alert("Focus session must be at least 10 minutes!");
                      return;
                    }
                    if (enableMiddleBreaks && breakInterval < 25) {
                      alert("Smallest unit of break interval allowed is 25 minutes!");
                      return;
                    }
                    resetPomodoro();
                    setShowConfig(false);
                  }}
                  className="flex-1 py-1 bg-white hover:bg-stone-100 text-[#6366F1] font-bold text-[9px] rounded-md transition select-none cursor-pointer"
                >
                  Apply & Reset
                </button>
                <button
                  onClick={() => setShowConfig(false)}
                  className="px-2 py-1 border border-white/20 hover:bg-white/10 text-white text-[9px] font-bold rounded-md"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick-add Scratchpad */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-purple-100 uppercase">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            <span>Focus Scratchpad</span>
          </div>
          <p className="text-[9px] text-purple-200/90 leading-snug">
            Capture immediate study notes & thought-bursts during focus sessions:
          </p>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Type a thought or focus note..."
            rows={2}
            className="w-full text-xs bg-white/10 hover:bg-white/15 focus:bg-white/25 text-white placeholder-purple-300/60 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-white/30 resize-none border border-white/10 transition-colors"
          />
          <div className="flex items-center justify-between">
            {showSaveSuccess ? (
              <span className="text-[9px] text-green-300 font-bold flex items-center gap-1">
                ✓ Saved to Session Logs!
              </span>
            ) : (
              <span className="text-[8px] text-purple-300 italic">Press Save to log</span>
            )}
            <button
              onClick={() => {
                if (noteText.trim()) {
                  onAddNote(noteText);
                  setNoteText('');
                  setShowSaveSuccess(true);
                  setTimeout(() => setShowSaveSuccess(false), 2000);
                }
              }}
              disabled={!noteText.trim()}
              className="py-1 px-3 bg-white hover:bg-stone-100 text-[#6366F1] font-bold text-[9px] rounded-lg cursor-pointer transition select-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Note
            </button>
          </div>
        </div>

        {/* Anti-Distraction warning link */}
        <button
          onClick={confessDistraction}
          className="w-full text-left py-2 px-3 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-200 text-[10px] font-bold rounded-xl border border-yellow-400/20 flex items-center justify-between transition cursor-pointer"
        >
          <span className="flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
            Scrolled phone? Confess
          </span>
          <span>→</span>
        </button>
      </div>
    </aside>
  );
}
