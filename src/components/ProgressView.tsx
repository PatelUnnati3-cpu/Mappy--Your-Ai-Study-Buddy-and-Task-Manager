import React from 'react';
import { 
  Flame, Clock, Award, CheckCircle, BarChart2, Zap
} from 'lucide-react';
import { Task, Theme, TrackType, TRACK_MACRO_DOMAINS } from '../types';

interface ProgressViewProps {
  tasks: Task[];
  streak: number;
  level: number;
  xp: number;
  theme: Theme;
  currentTrack: TrackType;
  customCategories: string[];
}

export default function ProgressView({
  tasks,
  streak,
  level,
  xp,
  theme,
  currentTrack,
  customCategories
}: ProgressViewProps) {
  
  // High-level Calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Historical study minutes representation for last 7 days (Mon - Sun)
  const studyMinutes = [
    { day: 'Mon', minutes: 45 },
    { day: 'Tue', minutes: 90 },
    { day: 'Wed', minutes: 30 },
    { day: 'Thu', minutes: 120 },
    { day: 'Fri', minutes: 60 },
    { day: 'Sat', minutes: 50 },
    { day: 'Sun', minutes: 0 },
  ];

  const maxMinutes = Math.max(...studyMinutes.map(d => d.minutes));

  // Dynamic Project Progress Calculations
  const getProjectStats = (projectName: string) => {
    const projectTasks = tasks.filter(t => t.project === projectName);
    if (projectTasks.length === 0) {
      return { percentage: 0, total: 0, completed: 0 };
    }
    const completed = projectTasks.filter(t => t.completed).length;
    const percentage = Math.round((completed / projectTasks.length) * 100);
    return {
      percentage,
      total: projectTasks.length,
      completed
    };
  };

  // Get dynamic categories list
  const getActiveCategories = () => {
    const fromTasks = Array.from(new Set(tasks.map(t => t.project).filter(Boolean))) as string[];
    const currentTrackDomains = TRACK_MACRO_DOMAINS[currentTrack] || [];
    const combined = Array.from(new Set([...fromTasks, ...currentTrackDomains, ...customCategories]));
    return combined.slice(0, 4); // Fetch top 4 to fit progress ring layout perfectly
  };

  const activeCategories = getActiveCategories();

  const getCategoryColorGradients = (index: number) => {
    if (index === 0) return { start: '#F97316', end: '#EF4444', text: 'text-orange-600', sub: 'Primary domain' };
    if (index === 1) return { start: '#EC4899', end: '#D946EF', text: 'text-rose-600', sub: 'Secondary domain' };
    if (index === 2) return { start: '#06B6D4', end: '#3B82F6', text: 'text-cyan-600', sub: 'Focus domain' };
    return { start: '#8B5CF6', end: '#EC4899', text: 'text-purple-600', sub: 'Specialized track' };
  };

  // Circular progress ring helper
  const renderProgressRing = (percentage: number, colorStart: string, colorEnd: string) => {
    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
          {/* Track Circle */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="transparent"
            stroke="#F1F5F9"
            strokeWidth="7"
          />
          {/* Progress Circle with Gradient */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="transparent"
            stroke={`url(#gradient-${colorStart.replace('#', '')})`}
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          {/* SVG Gradient definitions */}
          <defs>
            <linearGradient id={`gradient-${colorStart.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colorStart} />
              <stop offset="100%" stopColor={colorEnd} />
            </linearGradient>
          </defs>
        </svg>
        <span className="absolute text-xs font-mono font-bold text-[#0A1128]">
          {percentage}%
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6 tab-transition-content p-4 lg:p-6" id="progress-analytics-view">
      
      {/* ========================================== */}
      {/* 1. HIGH-LEVEL HORIZONTAL OVERVIEW BANNER */}
      {/* ========================================== */}
      <div className="bg-gradient-to-r from-orange-50 via-rose-50 to-sky-100/50 border border-stone-100 shadow-xl rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-2xl transform translate-x-12 -translate-y-12 pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="text-[10px] font-space font-extrabold tracking-widest text-[#6366F1] uppercase bg-white/80 border border-purple-100/40 px-3 py-1 rounded-full shadow-xs">
              Weekly summary metrics
            </span>
            <h1 className="text-2xl font-space font-black text-[#0A1128] mt-2.5 tracking-tight">
              Academic Progress Hub
            </h1>
            <p className="text-xs text-stone-600 font-medium mt-1">
              You are completing checkpoints ahead of schedule! Maintain this momentum, beta.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-4 w-full sm:w-auto">
            {/* Stat Box 1 */}
            <div className="bg-white/80 border border-white/60 p-3 rounded-xl flex items-center gap-2.5 min-w-[120px] shadow-sm">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500 flex-shrink-0 animate-bounce" />
              <div>
                <span className="text-[9px] font-bold text-stone-400 block tracking-wider uppercase">Streak</span>
                <span className="text-sm font-space font-extrabold text-[#0A1128]">{streak} Days</span>
              </div>
            </div>

            {/* Stat Box 2 */}
            <div className="bg-white/80 border border-white/60 p-3 rounded-xl flex items-center gap-2.5 min-w-[120px] shadow-sm">
              <Clock className="w-5 h-5 text-[#6366F1] flex-shrink-0" />
              <div>
                <span className="text-[9px] font-bold text-stone-400 block tracking-wider uppercase">Study Hrs</span>
                <span className="text-sm font-space font-extrabold text-[#0A1128]">12.5 hrs</span>
              </div>
            </div>

            {/* Stat Box 3 */}
            <div className="bg-white/80 border border-white/60 p-3 rounded-xl flex items-center gap-2.5 min-w-[120px] shadow-sm">
              <Award className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              <div>
                <span className="text-[9px] font-bold text-stone-400 block tracking-wider uppercase">Level</span>
                <span className="text-sm font-space font-extrabold text-yellow-600">Lvl {level}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 2. HORIZONTAL DAILY STUDY STREAK TRACKING ROW */}
      {/* ========================================== */}
      <div className="bg-white border border-stone-100 shadow-sm rounded-2xl p-5">
        <h2 className="text-xs font-space font-extrabold uppercase tracking-wider text-[#0A1128] mb-3.5 flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-orange-500 fill-orange-500" /> Daily study compliance logs (M-S)
        </h2>
        
        <div className="grid grid-cols-7 gap-3 sm:flex sm:items-center sm:justify-between">
          {[
            { day: 'Monday', label: 'Mon', checked: true },
            { day: 'Tuesday', label: 'Tue', checked: true },
            { day: 'Wednesday', label: 'Wed', checked: true },
            { day: 'Thursday', label: 'Thu', checked: true },
            { day: 'Friday', label: 'Fri', checked: true },
            { day: 'Saturday', label: 'Sat', checked: true, isActive: true },
            { day: 'Sunday', label: 'Sun', checked: false }
          ].map((item, idx) => (
            <div 
              key={idx} 
              className={`flex-1 flex flex-col items-center p-3 rounded-xl border text-center relative ${
                item.isActive 
                  ? 'bg-purple-50/50 border-[#6366F1] ring-1 ring-[#6366F1]' 
                  : item.checked 
                    ? 'bg-orange-50/30 border-orange-100'
                    : 'bg-[#FAFAFA] border-stone-150'
              }`}
            >
              <span className="text-[10px] font-space font-bold text-stone-500 mb-2">
                {item.label}
              </span>
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all shadow-xs ${
                item.checked 
                  ? 'bg-gradient-to-r from-orange-400 to-rose-400 border-transparent text-white' 
                  : item.isActive 
                    ? 'bg-white border-[#6366F1] text-[#6366F1] font-bold animate-pulse'
                    : 'bg-white border-stone-300 text-stone-400'
              }`}>
                {item.checked ? (
                  <CheckCircle className="w-5 h-5 fill-white text-orange-500" />
                ) : (
                  <span className="text-[10px] font-mono font-bold">{item.isActive ? '⚡' : '○'}</span>
                )}
              </div>
              
              {item.isActive && (
                <span className="text-[7px] font-bold text-[#6366F1] uppercase tracking-wider mt-1 font-mono animate-bounce block">
                  Today
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ========================================== */}
      {/* 3. BOTTOM SECTION: RING MATRIX + BAR CHART */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT SIDE: GRID MATRIX OF COURSE PERCENTAGE COMPLETION RINGS (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-stone-100 shadow-xl rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-space font-extrabold uppercase tracking-wider text-[#0A1128] pb-3 border-b border-stone-100 mb-4 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-yellow-500" /> Course syllabus progress rings
            </h2>
            <p className="text-xs text-stone-500 leading-relaxed mb-6 font-medium">
              Real-time circular progress tracking derived from finished roadmap items across active semesters.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {activeCategories.map((category, idx) => {
              const stats = getProjectStats(category);
              const grad = getCategoryColorGradients(idx);
              return (
                <div key={category} className="bg-[#FAFAFA] border border-stone-100/80 rounded-xl p-4 flex flex-col items-center text-center">
                  {renderProgressRing(stats.percentage, grad.start, grad.end)}
                  <h3 className="text-xs font-bold text-[#0A1128] mt-2.5 truncate w-full" title={category}>{category}</h3>
                  <span className={`text-[9px] ${grad.text} font-bold mt-0.5`}>
                    {stats.total > 0 ? `${stats.completed}/${stats.total} cleared` : grad.sub}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDE: VERTICAL BAR CHART PANEL (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-stone-100 shadow-xl rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-space font-extrabold uppercase tracking-wider text-[#0A1128] pb-3 border-b border-stone-100 mb-4 flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-purple-500" /> Historical study trends (Minutes)
            </h2>
            <p className="text-xs text-stone-500 leading-relaxed mb-6 font-medium">
              Visualization of study sprint duration mapping across the current week. Target: 60 minutes/day.
            </p>
          </div>

          {/* Custom SVG Bar Chart */}
          <div className="flex-1 flex flex-col justify-end">
            <div className="h-44 w-full flex items-end justify-between px-2 gap-3 relative pb-1">
              
              {/* Horizontal Grid lines inside bar chart */}
              <div className="absolute top-0 left-0 right-0 border-t border-stone-100/60 w-full"></div>
              <div className="absolute top-1/3 left-0 right-0 border-t border-stone-100/60 w-full"></div>
              <div className="absolute top-2/3 left-0 right-0 border-t border-stone-100/60 w-full"></div>
              
              {studyMinutes.map((data, idx) => {
                // Height calculation as percentage of maxMinutes
                const barHeightPercentage = maxMinutes > 0 ? (data.minutes / maxMinutes) * 100 : 0;
                
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative z-10 h-full justify-end">
                    
                    {/* Tooltip on Hover */}
                    <div className="absolute -top-7 bg-stone-900 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      {data.minutes} min
                    </div>

                    {/* Bar Pillar with Gradient background and rounded top */}
                    <div 
                      className="w-full bg-gradient-to-t from-[#7C3AED] via-[#6366F1] to-[#0EA5E9] rounded-t-lg transition-all duration-1000 ease-out origin-bottom"
                      style={{ height: `${barHeightPercentage}%` }}
                    ></div>

                    {/* Mini Badge on top of Bar */}
                    {data.minutes >= 60 && (
                      <span className="absolute bottom-2 text-[8px] animate-pulse">⭐</span>
                    )}

                  </div>
                );
              })}
            </div>

            {/* Days row label */}
            <div className="flex items-center justify-between px-2 pt-2 border-t border-stone-150 text-[10px] font-mono font-bold text-stone-500">
              {studyMinutes.map((data, idx) => (
                <span key={idx} className="flex-1 text-center">{data.day}</span>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
