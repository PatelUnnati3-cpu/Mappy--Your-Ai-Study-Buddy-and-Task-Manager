import React from 'react';
import { 
  Settings as SettingsIcon, ShieldAlert, Sparkles, RefreshCw, 
  Volume2, VolumeX, Mail, Layout, Flame, Check, HelpCircle, Languages,
  Edit3, Trash2, ClipboardList, BookOpen, X, Calendar, LogOut,
  FileText, FileSpreadsheet, Presentation, HardDrive, ExternalLink, Search, File, GraduationCap
} from 'lucide-react';
import { Theme, BreakdownMode, LanguageOption, ScratchpadNote } from '../types';
import { GoogleWorkspaceIntegrationHub, MappyDocumentLibrary } from './WorkspaceIntegrations';

interface SettingsViewProps {
  theme: Theme;
  setTheme: (t: Theme) => void;
  breakdownMode: BreakdownMode;
  setBreakdownMode: (m: BreakdownMode) => void;
  languageOption: LanguageOption;
  setLanguageOption: (lang: LanguageOption) => void;
  muteVoice: boolean;
  setMuteVoice: (v: boolean) => void;
  dailyReminders: boolean;
  setDailyReminders: (v: boolean) => void;
  compactTaskView: boolean;
  setCompactTaskView: (v: boolean) => void;
  facedownReminder: boolean;
  setFacedownReminder: (v: boolean) => void;
  hideSocialNotice: boolean;
  setHideSocialNotice: (v: boolean) => void;
  onClearHistory: () => void;
  scratchpadNotes: ScratchpadNote[];
  onDeleteNote: (id: string) => void;
  onEditNote: (id: string, newText: string) => void;
  googleUser: any;
  googleToken: string | null;
  onGoogleSignIn: () => void;
  onGoogleLogout: () => void;
  calendarEvents: any[];
  driveFiles?: any[];
  isLoadingDrive?: boolean;
  onRefreshDrive?: () => void;
}

export default function SettingsView({
  theme,
  setTheme,
  breakdownMode,
  setBreakdownMode,
  languageOption,
  setLanguageOption,
  muteVoice,
  setMuteVoice,
  dailyReminders,
  setDailyReminders,
  compactTaskView,
  setCompactTaskView,
  facedownReminder,
  setFacedownReminder,
  hideSocialNotice,
  setHideSocialNotice,
  onClearHistory,
  scratchpadNotes,
  onDeleteNote,
  onEditNote,
  googleUser,
  googleToken,
  onGoogleSignIn,
  onGoogleLogout,
  calendarEvents,
  driveFiles = [],
  isLoadingDrive = false,
  onRefreshDrive
}: SettingsViewProps) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingText, setEditingText] = React.useState<string>('');
  const [activeDriveTab, setActiveDriveTab] = React.useState<'all' | 'doc' | 'sheet' | 'slide'>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const alignments = [
    { id: 'Ghar Jaisa' as const, title: '🏠 GHAR JAISA', desc: 'Homely Comfort / Maa Mode', detail: 'Cozy and loving motherly advice, gentle stress checks, almond prompts.' },
    { id: 'Level Up' as const, title: '🎮 LEVEL UP', desc: 'Gamified Study Peer', detail: 'RPG style dungeon quests, XP bars, level rewards, high-energy feedbacks.' },
    { id: 'Clean Slate' as const, title: '⬜ CLEAN SLATE', desc: 'Minimalist Study Mentor', detail: 'Zero stress, serene whitespace, direct operational tracking, calm silent guides.' },
    { id: 'Serious' as const, title: '👔 THE DUGOUT / SERIOUS', desc: 'Papa Study Coach', detail: 'Firm deadlines, no-scrolling warnings, strict Pomodoro locks.' }
  ];

  return (
    <div className="space-y-6 tab-transition-content p-4 lg:p-6" id="settings-panel-view">
      
      {/* Header */}
      <div className="flex items-center gap-2 bg-white border border-stone-100 shadow-sm rounded-2xl p-5 mb-2">
        <SettingsIcon className="w-6 h-6 text-[#6366F1]" />
        <div>
          <h1 className="text-lg font-space font-extrabold text-[#0A1128] uppercase tracking-wider">
            Control Room Configurations
          </h1>
          <p className="text-xs text-stone-500 font-medium">
            Customize assistant breakdown logic, distraction blockers, alerts, and active alignments.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Left Column */}
        <div className="space-y-6">
          {/* Card 1: Vibe Alignments */}
          <div className="bg-white border border-stone-100 shadow-xl rounded-2xl p-5 space-y-4">
            <h2 className="text-xs font-space font-extrabold uppercase tracking-wider text-[#0A1128] pb-3 border-b border-stone-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-500" /> Choose active mentorship alignment
            </h2>
            <p className="text-xs text-stone-500 leading-relaxed font-medium">
              Toggling alignments instantly shifts Mappy's dual Maa / Papa coaching persona and feedback in the chat.
            </p>

            <div className="space-y-3">
              {alignments.map((align) => {
                const active = theme === align.id;
                return (
                  <button
                    key={align.id}
                    onClick={() => setTheme(align.id)}
                    className={`w-full text-left p-4 border rounded-xl flex items-start justify-between gap-3 transition-all cursor-pointer ${
                      active 
                        ? 'bg-purple-50/40 border-[#6366F1] ring-2 ring-[#6366F1]/20' 
                        : 'bg-white border-stone-150 hover:border-stone-200 hover:bg-stone-50/20'
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-space font-extrabold text-[#0A1128] block">
                        {align.title}
                      </span>
                      <span className="text-[10px] text-stone-500 font-bold block mt-0.5">
                        {align.desc}
                      </span>
                      <p className="text-[10px] text-stone-400 font-medium leading-snug mt-1.5">
                        {align.detail}
                      </p>
                    </div>
                    {active && (
                      <div className="w-5 h-5 rounded-full bg-[#6366F1] flex items-center justify-center text-white flex-shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Session Logs & Saved Notes Section */}
          <div className="bg-white border border-stone-100 shadow-xl rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="text-sm font-space font-extrabold uppercase tracking-wider text-[#0A1128] flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#6366F1]" /> Session Logs & Notes
              </h2>
              <span className="text-[10px] bg-purple-50 text-[#6366F1] font-mono font-bold px-2.5 py-1 rounded-full border border-purple-100/60">
                {scratchpadNotes.length} Saved {scratchpadNotes.length === 1 ? 'Entry' : 'Entries'}
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium leading-relaxed">
              These are immediate focus-session thought bursts, notes, and reminders captured during your active Pomodoro timer.
            </p>

            {scratchpadNotes.length === 0 ? (
              <div className="text-center py-10 bg-stone-50/50 rounded-2xl border border-dashed border-stone-200 p-6 flex flex-col items-center justify-center space-y-2">
                <BookOpen className="w-10 h-10 text-stone-300 stroke-[1.5]" />
                <span className="text-xs font-bold text-stone-600">No session notes logged yet!</span>
                <p className="text-[10px] text-stone-400 max-w-xs leading-relaxed font-medium">
                  Write, capture, and save sudden thoughts on the Focus Scratchpad inside the left sidebar while focusing!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 pt-1">
                {scratchpadNotes.map((note) => {
                  const isEditing = editingId === note.id;
                  return (
                    <div 
                      key={note.id} 
                      className="bg-[#FAFAFA] border border-stone-150 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-3 min-h-[140px]"
                    >
                      {isEditing ? (
                        <div className="flex-1 flex flex-col space-y-2">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full text-xs text-[#0A1128] font-medium bg-white border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-[#6366F1] resize-none flex-1 min-h-[80px]"
                          />
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditingText('');
                              }}
                              className="px-2 py-1 text-[10px] font-bold text-stone-500 hover:text-stone-700 bg-stone-100 rounded-md transition"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                if (editingText.trim()) {
                                  onEditNote(note.id, editingText);
                                  setEditingId(null);
                                  setEditingText('');
                                }
                              }}
                              className="px-2.5 py-1 text-[10px] font-bold text-white bg-[#6366F1] hover:bg-[#5558e6] rounded-md transition shadow-sm"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1">
                            <p className="text-xs text-[#0A1128] font-medium whitespace-pre-wrap leading-relaxed">
                              {note.text}
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-2.5 border-t border-stone-100/80">
                            <span className="text-[9px] text-stone-400 font-mono font-bold">
                              {note.timestamp}
                            </span>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => {
                                  setEditingId(note.id);
                                  setEditingText(note.text);
                                }}
                                className="p-1.5 hover:bg-stone-200/60 rounded-lg text-stone-500 hover:text-[#6366F1] transition"
                                title="Edit Note"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this focus note?")) {
                                    onDeleteNote(note.id);
                                  }
                                }}
                                className="p-1.5 hover:bg-red-50 rounded-lg text-stone-500 hover:text-red-600 transition"
                                title="Delete Note"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Google Workspace Integration Hub (Left Column) */}
          <GoogleWorkspaceIntegrationHub
            googleUser={googleUser}
            googleToken={googleToken}
            onGoogleSignIn={onGoogleSignIn}
            onGoogleLogout={onGoogleLogout}
            calendarEvents={calendarEvents}
          />
        </div>

        <div className="space-y-6">
          
          {/* Card 2: Breakdown Logic */}
          <div className="bg-white border-2 border-indigo-50 shadow-2xl rounded-2xl p-6 space-y-4 transition-all hover:border-indigo-100/80" id="task-breakdown-settings-card">
            <h2 className="text-xs font-space font-extrabold uppercase tracking-wider text-[#0A1128] pb-3 border-b border-stone-100 flex items-center gap-1.5">
              <Layout className="w-4 h-4 text-[#6366F1]" /> Task Breakdown Settings
            </h2>
            
            <p className="text-[11px] text-stone-500 font-medium leading-relaxed">
              Define the default syllabus parsing behavior when creating a task in the chat.
            </p>

            <div className="grid grid-cols-3 gap-1.5 bg-stone-100/70 p-1.5 rounded-xl border border-stone-200/50">
              {(['AUTO', 'COLLABORATIVE', 'MANUAL'] as BreakdownMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setBreakdownMode(mode)}
                  className={`text-[10px] font-space font-extrabold py-2 rounded-lg text-center transition cursor-pointer select-none ${
                    breakdownMode === mode 
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md font-black' 
                      : 'text-stone-500 hover:text-stone-900 hover:bg-white/50 bg-transparent'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-stone-150 text-[10px] leading-relaxed text-stone-500 font-medium flex gap-2.5">
              <HelpCircle className="w-4 h-4 text-[#6366F1] flex-shrink-0 mt-0.5 animate-pulse" />
              <div>
                {breakdownMode === 'AUTO' && 'AUTO MODE: Mappy instantly generates a 3-5 step structured syllabus breakdown for you when a task is created.'}
                {breakdownMode === 'COLLABORATIVE' && 'COLLABORATIVE MODE: Mappy proposes a few milestones and invites you to refine or expand them together.'}
                {breakdownMode === 'MANUAL' && 'MANUAL MODE: Tasks start with no steps, allowing you to add, edit, or extract checkpoints purely by hand.'}
              </div>
            </div>

            {/* Individual Task Customization Notice */}
            <div className="mt-4 p-3.5 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 border border-indigo-100/50 rounded-xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-space font-extrabold text-[#6366F1] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> 
                Individual Task Override
              </div>
              <p className="text-[10px] text-[#0A1128] font-medium leading-relaxed">
                Regardless of this default, you have full manual control! Click on <strong className="text-indigo-600">any task</strong> in your Home Dashboard to open its deep editor. You can edit/delete milestones, add custom steps by hand, or upload/paste syllabus guidelines to instantly generate a personalized study timeline!
              </p>
            </div>
          </div>

          {/* Card 2.5: Language Track Settings */}
          <div className="bg-white border border-stone-100 shadow-xl rounded-2xl p-5 space-y-4" id="language-settings-card">
            <h2 className="text-xs font-space font-extrabold uppercase tracking-wider text-[#0A1128] pb-3 border-b border-stone-100 flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-[#6366F1]" /> Language Track Settings
            </h2>
            <p className="text-xs text-stone-500 leading-relaxed font-medium">
              Select the language configuration for Mappy. The AI assistant shifts its vocabulary and tone instantly to match your active track.
            </p>

            <div className="grid grid-cols-3 gap-1.5 bg-stone-50 p-1 rounded-xl border border-stone-100">
              {(['English', 'Hindi', 'Hinglish'] as LanguageOption[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguageOption(lang)}
                  className={`text-[10px] font-space font-bold py-2 rounded-lg text-center transition cursor-pointer select-none ${
                    languageOption === lang 
                      ? 'bg-[#6366F1] text-white shadow-sm font-black' 
                      : 'text-stone-500 hover:text-stone-900 bg-white border border-stone-100/50'
                  }`}
                >
                  {lang === 'English' && '🌐 English'}
                  {lang === 'Hindi' && '💬 Hindi'}
                  {lang === 'Hinglish' && '🗣️ Hinglish'}
                </button>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-[#FAFAFA] border border-stone-100 text-[10px] leading-relaxed text-stone-500 font-medium flex gap-2">
              <HelpCircle className="w-4 h-4 text-[#6366F1] flex-shrink-0 mt-0.5" />
              <div>
                {languageOption === 'English' && 'Mappy will communicate entirely in Pure English with standard academic mentorship.'}
                {languageOption === 'Hindi' && 'Mappy will communicate in Pure Hindi (हिन्दी) using Devanagari script for warm and coaching expressions.'}
                {languageOption === 'Hinglish' && 'Mappy will communicate in friendly English-Hindi hybrid (Hinglish) with typical homely beta/trooper calls.'}
              </div>
            </div>
          </div>

          {/* Card 3: Shield alerts */}
          <div className="bg-white border border-stone-100 shadow-xl rounded-2xl p-5 space-y-4">
            <h2 className="text-xs font-space font-extrabold uppercase tracking-wider text-[#0A1128] pb-3 border-b border-stone-100 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-orange-500 animate-pulse" /> Anti-distraction shield alerts
            </h2>
            <p className="text-xs text-stone-500 font-medium leading-relaxed">
              Enable strict notifications if your mind wanders off study tracks.
            </p>

            <div className="space-y-3.5 pt-1.5">
              <label className="flex items-center justify-between text-xs font-semibold cursor-pointer select-none text-[#0A1128]">
                <span>Enable Phone Facedown Warning</span>
                <input 
                  type="checkbox" 
                  checked={facedownReminder}
                  onChange={(e) => setFacedownReminder(e.target.checked)}
                  className="rounded border-stone-300 text-[#6366F1] focus:ring-[#6366F1] w-4.5 h-4.5 cursor-pointer" 
                />
              </label>

              <label className="flex items-center justify-between text-xs font-semibold cursor-pointer select-none text-[#0A1128]">
                <span>Enable Social Tab Lock Alert</span>
                <input 
                  type="checkbox" 
                  checked={hideSocialNotice}
                  onChange={(e) => setHideSocialNotice(e.target.checked)}
                  className="rounded border-stone-300 text-[#6366F1] focus:ring-[#6366F1] w-4.5 h-4.5 cursor-pointer" 
                />
              </label>
            </div>
          </div>

          {/* Card 4: Audio and Alerts */}
          <div className="bg-white border border-stone-100 shadow-xl rounded-2xl p-5 space-y-4">
            <h2 className="text-xs font-space font-extrabold uppercase tracking-wider text-[#0A1128] pb-3 border-b border-stone-100 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-[#6366F1]" /> Audio & reminders configurations
            </h2>

            <div className="space-y-3.5">
              <label className="flex items-center justify-between text-xs font-semibold cursor-pointer select-none text-[#0A1128]">
                <span className="flex items-center gap-1.5">
                  {muteVoice ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4 text-[#6366F1]" />}
                  Mute Audio Sound Beeps
                </span>
                <input 
                  type="checkbox" 
                  checked={muteVoice}
                  onChange={(e) => setMuteVoice(e.target.checked)}
                  className="rounded border-stone-300 text-[#6366F1] focus:ring-[#6366F1] w-4.5 h-4.5 cursor-pointer" 
                />
              </label>

              <label className="flex items-center justify-between text-xs font-semibold cursor-pointer select-none text-[#0A1128]">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-[#6366F1]" />
                  Enable Daily Email Reminders
                </span>
                <input 
                  type="checkbox" 
                  checked={dailyReminders}
                  onChange={(e) => setDailyReminders(e.target.checked)}
                  className="rounded border-stone-300 text-[#6366F1] focus:ring-[#6366F1] w-4.5 h-4.5 cursor-pointer" 
                />
              </label>

              <label className="flex items-center justify-between text-xs font-semibold cursor-pointer select-none text-[#0A1128]">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500" />
                  Compact Roadmap views
                </span>
                <input 
                  type="checkbox" 
                  checked={compactTaskView}
                  onChange={(e) => setCompactTaskView(e.target.checked)}
                  className="rounded border-stone-300 text-[#6366F1] focus:ring-[#6366F1] w-4.5 h-4.5 cursor-pointer" 
                />
              </label>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if(confirm("Confirm resetting all Mappy data? This action is irreversible.")) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="w-full text-center py-2 px-3 border border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 text-[10px] font-space font-extrabold uppercase tracking-wider rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Sandbox storage
              </button>
            </div>
          </div>

          {/* Mappy Document Library (Right Column) */}
          <MappyDocumentLibrary
            googleUser={googleUser}
            driveFiles={driveFiles}
            isLoadingDrive={isLoadingDrive}
            onRefreshDrive={onRefreshDrive}
          />

        </div>

      </div>

    </div>
  );
}
