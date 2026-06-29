import React from 'react';
import { X, Plus, Calendar, AlertCircle } from 'lucide-react';
import { Seriousness, TrackType, TRACK_MACRO_DOMAINS } from '../types';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSeriousness: Seriousness;
  setActiveSeriousness: (s: Seriousness) => void;
  handleAddTaskWithParams: (text: string, project: string, seriousness: Seriousness) => void;
  currentTrack: TrackType;
  setCurrentTrack: (track: TrackType) => void;
  customCategories: string[];
  onAddCustomCategory: (category: string) => void;
}

export default function NewTaskModal({
  isOpen,
  onClose,
  activeSeriousness,
  setActiveSeriousness,
  handleAddTaskWithParams,
  currentTrack,
  setCurrentTrack,
  customCategories,
  onAddCustomCategory
}: NewTaskModalProps) {
  
  const [text, setText] = React.useState('');
  const [project, setProject] = React.useState(() => {
    const domains = TRACK_MACRO_DOMAINS[currentTrack] || [];
    return domains[0] || 'General';
  });
  const [isCreatingCustomField, setIsCreatingCustomField] = React.useState(false);
  const [customFieldValue, setCustomFieldValue] = React.useState('');

  React.useEffect(() => {
    const domains = TRACK_MACRO_DOMAINS[currentTrack] || [];
    if (domains.length > 0) {
      setProject(domains[0]);
    }
  }, [currentTrack]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    handleAddTaskWithParams(text.trim(), project, activeSeriousness);
    setText('');
    onClose();
  };

  const getCategoryEmoji = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('math')) return '📐';
    if (lower.includes('biolo') || lower.includes('medic') || lower.includes('anatomy') || lower.includes('health') || lower.includes('life') || lower.includes('science')) return '🧬';
    if (lower.includes('histor') || lower.includes('humanities') || lower.includes('law') || lower.includes('world') || lower.includes('social')) return '📜';
    if (lower.includes('comp') || lower.includes('eng') || lower.includes('cs') || lower.includes('tech') || lower.includes('soft') || lower.includes('data')) return '💻';
    if (lower.includes('busin') || lower.includes('finan') || lower.includes('econ') || lower.includes('mba') || lower.includes('corp') || lower.includes('invest')) return '📊';
    if (lower.includes('lang') || lower.includes('french') || lower.includes('engli') || lower.includes('hind')) return '🗣️';
    if (lower.includes('art') || lower.includes('design') || lower.includes('draw')) return '🎨';
    if (lower.includes('physics') || lower.includes('chem') || lower.includes('applied')) return '🧪';
    if (lower.includes('upskill') || lower.includes('learn') || lower.includes('lead') || lower.includes('skill')) return '⚡';
    if (lower.includes('teach') || lower.includes('pedagogy') || lower.includes('school')) return '🏫';
    if (lower.includes('research') || lower.includes('grant') || lower.includes('phd') || lower.includes('theory') || lower.includes('academia')) return '🔍';
    return '📚';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="bg-white border border-stone-100 rounded-2xl shadow-2xl p-6 max-w-md w-full relative z-10 animate-fade-in text-[#0A1128]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-stone-100 text-stone-400 hover:text-stone-900 rounded-full cursor-pointer transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#6366F1]" />
          <h2 className="text-sm font-space font-extrabold uppercase tracking-wider">
            Create Roadmap Objective
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Name Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-space font-extrabold uppercase tracking-wider text-stone-400 block">
              Objective Title
            </label>
            <input
              type="text"
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Master dynamic models or complete homework sprint..."
              className="bg-[#FAFAFA] border border-stone-200 rounded-xl px-4 py-3 text-xs text-[#0A1128] focus:outline-none focus:ring-2 focus:ring-[#6366F1] placeholder-stone-400 font-semibold w-full transition"
            />
          </div>

          {/* Track Selection */}
          <div className="space-y-1">
            <label className="text-[10px] font-space font-extrabold uppercase tracking-wider text-stone-400 block">
              Academic / Professional Track
            </label>
            <select
              value={currentTrack}
              onChange={(e) => {
                const track = e.target.value as TrackType;
                setCurrentTrack(track);
                const domains = TRACK_MACRO_DOMAINS[track] || [];
                if (domains.length > 0) {
                  setProject(domains[0]);
                }
              }}
              className="bg-[#FAFAFA] border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-700 font-bold focus:outline-none focus:ring-2 focus:ring-[#6366F1] w-full cursor-pointer transition"
            >
              <option value="High School">🎒 High School Subject Track</option>
              <option value="Undergraduate (Bachelors)">🎓 Undergraduate (Bachelors)</option>
              <option value="Postgraduate (Masters)">🧑‍🎓 Postgraduate (Masters)</option>
              <option value="University/PhD">🔬 University / PhD Level</option>
              <option value="Working Professional">💼 Working Professional Track</option>
            </select>
          </div>

          {/* Associated Subject Dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] font-space font-extrabold uppercase tracking-wider text-stone-400 block">
              Associated Course / Subject
            </label>
            <select
              value={isCreatingCustomField ? '_ADD_CUSTOM_' : project}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '_ADD_CUSTOM_') {
                  setIsCreatingCustomField(true);
                } else {
                  setIsCreatingCustomField(false);
                  setProject(val);
                }
              }}
              className="bg-[#FAFAFA] border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-700 font-bold focus:outline-none focus:ring-2 focus:ring-[#6366F1] w-full cursor-pointer transition"
            >
              <optgroup label="Macro Domains">
                {(TRACK_MACRO_DOMAINS[currentTrack] || []).map(domain => (
                  <option key={domain} value={domain}>
                    {getCategoryEmoji(domain)} {domain}
                  </option>
                ))}
              </optgroup>
              {customCategories.length > 0 && (
                <optgroup label="Custom Workspace Fields">
                  {customCategories.map(cat => (
                    <option key={cat} value={cat}>
                      🏷️ {cat}
                    </option>
                  ))}
                </optgroup>
              )}
              <option value="_ADD_CUSTOM_">➕ Add Custom Field/Subject</option>
            </select>
          </div>

          {isCreatingCustomField && (
            <div className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200 animate-fade-in">
              <input
                type="text"
                placeholder="Enter custom subject (e.g. Data Structures)..."
                value={customFieldValue}
                onChange={(e) => setCustomFieldValue(e.target.value)}
                className="bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs text-[#0A1128] focus:outline-none focus:ring-1 focus:ring-[#6366F1] font-semibold flex-1"
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  const trimmed = customFieldValue.trim();
                  if (trimmed) {
                    onAddCustomCategory(trimmed);
                    setProject(trimmed);
                    setCustomFieldValue('');
                    setIsCreatingCustomField(false);
                  }
                }}
                className="bg-gradient-to-r from-[#6366F1] to-purple-600 hover:opacity-95 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingCustomField(false);
                  setCustomFieldValue('');
                  const domains = TRACK_MACRO_DOMAINS[currentTrack] || [];
                  if (domains.length > 0) {
                    setProject(domains[0]);
                  }
                }}
                className="text-xs text-stone-400 hover:text-stone-600 px-1 font-semibold"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Seriousness Priorities selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-space font-extrabold uppercase tracking-wider text-stone-400 block mb-1">
              Seriousness Level
            </label>
            <div className="flex items-center gap-2 bg-stone-50 border border-stone-150 rounded-xl p-1.5 w-max">
              {(['Low', 'Medium', 'High'] as Seriousness[]).map((level) => (
                <button
                  type="button"
                  key={level}
                  onClick={() => setActiveSeriousness(level)}
                  className={`text-[10px] font-space font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeSeriousness === level
                      ? level === 'High' ? 'bg-red-500 text-white shadow-md' :
                        level === 'Medium' ? 'bg-amber-500 text-white shadow-md' :
                        'bg-green-500 text-white shadow-md'
                      : 'text-stone-500 hover:text-stone-900 bg-transparent'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-stone-400 pt-1 leading-snug font-medium">
              * Papa Coach will suggest more book links and lock social alerts on High seriousness!
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-200 text-stone-500 hover:bg-stone-50 text-xs font-bold rounded-xl uppercase tracking-wider cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 bg-gradient-to-tr from-[#7C3AED] to-[#6366F1] text-white text-xs font-space font-extrabold rounded-xl uppercase tracking-wider shadow-md hover:shadow-lg transition active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

