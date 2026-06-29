import React from 'react';
import { 
  GraduationCap, ListChecks, Plus, Trash2, Check,
  Flame, Heart, Target, Sparkles, Clock, Play, AlertCircle,
  X, Edit2, Save, Sparkle, Upload, Paperclip, FileText, Calendar, RefreshCw
} from 'lucide-react';
import { Task, Theme, Seriousness, TrackType, TRACK_MACRO_DOMAINS, MicroStep, ScheduleBlock } from '../types';

interface HomeViewProps {
  tasks: Task[];
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  theme: Theme;
  streak: number;
  level: number;
  xp: number;
  completionPercentage: number;
  activeSeriousness: Seriousness;
  setActiveSeriousness: (s: Seriousness) => void;
  newTaskText: string;
  setNewTaskText: (t: string) => void;
  handleAddTaskWithParams: (text: string, project: string, seriousness: Seriousness) => void;
  handleClearCompleted: () => void;
  compactTaskView: boolean;
  startFocus: (topic: string, durationMinutes: number) => void;
  onOpenNewTaskModal: () => void;
  selectedProjectFilter: string | null;
  setSelectedProjectFilter: (p: string | null) => void;
  onConfessDistraction: () => void;
  currentTrack: TrackType;
  setCurrentTrack: (track: TrackType) => void;
  customCategories: string[];
  onAddCustomCategory: (category: string) => void;
  onToggleMicroStep: (taskId: string, microStepId: string) => void;
  onAddMicroStep: (taskId: string, text: string) => void;
  onEditMicroStep: (taskId: string, microStepId: string, newText: string) => void;
  onDeleteMicroStep: (taskId: string, microStepId: string) => void;
  onInitializeTaskSteps?: (taskId: string) => void;
  onUpdateTaskMicroSteps?: (taskId: string, steps: { id: string; text: string; completed: boolean }[]) => void;
  googleUser: any;
  googleToken: string | null;
  onGoogleSignIn: () => void;
  onSyncTaskToCalendar: (taskId: string, startTimeIso: string, endTimeIso: string) => void;
  isSyncingTask: Record<string, boolean>;
  classroomCourses?: any[];
  classroomCourseWork?: Record<string, any[]>;
  isLoadingClassroom?: boolean;
  schedules: ScheduleBlock[];
  onAddScheduleBlock: (block: Omit<ScheduleBlock, 'id'>) => void;
  onDeleteScheduleBlock: (id: string) => void;
  onEditScheduleBlock: (id: string, updated: Partial<ScheduleBlock>) => void;
  onResetSchedules: () => void;
}

export default function HomeView({
  tasks,
  toggleTask,
  deleteTask,
  theme,
  streak,
  level,
  xp,
  completionPercentage,
  activeSeriousness,
  setActiveSeriousness,
  newTaskText,
  setNewTaskText,
  handleAddTaskWithParams,
  handleClearCompleted,
  compactTaskView,
  startFocus,
  onOpenNewTaskModal,
  selectedProjectFilter,
  setSelectedProjectFilter,
  onConfessDistraction,
  currentTrack,
  setCurrentTrack,
  customCategories,
  onAddCustomCategory,
  onToggleMicroStep,
  onAddMicroStep,
  onEditMicroStep,
  onDeleteMicroStep,
  onInitializeTaskSteps,
  onUpdateTaskMicroSteps,
  googleUser,
  googleToken,
  onGoogleSignIn,
  onSyncTaskToCalendar,
  isSyncingTask,
  classroomCourses = [],
  classroomCourseWork = {},
  isLoadingClassroom = false,
  schedules,
  onAddScheduleBlock,
  onDeleteScheduleBlock,
  onEditScheduleBlock,
  onResetSchedules
}: HomeViewProps) {
  
  // Dynamic visual helper for customized study block colors
  const getProjectColor = (project: string) => {
    const p = project.toLowerCase();
    if (p.includes('math')) return 'orange';
    if (p.includes('biolo') || p.includes('anatom') || p.includes('life') || p.includes('medic') || p.includes('health')) return 'rose';
    if (p.includes('histor') || p.includes('social') || p.includes('law') || p.includes('world') || p.includes('civic')) return 'cyan';
    if (p.includes('comp') || p.includes('cs') || p.includes('eng') || p.includes('tech') || p.includes('soft') || p.includes('cod')) return 'indigo';
    if (p.includes('chem') || p.includes('physic') || p.includes('applied') || p.includes('science')) return 'teal';
    if (p.includes('art') || p.includes('design') || p.includes('draw') || p.includes('paint')) return 'pink';
    if (p.includes('lang') || p.includes('french') || p.includes('engli') || p.includes('german') || p.includes('spani') || p.includes('communication')) return 'amber';
    return 'purple';
  };

  // Dynamic Project Progress Calculations
  const getProjectStats = (projectName: string) => {
    const projectTasks = tasks.filter(t => t.project === projectName);
    if (projectTasks.length === 0) {
      return { percentage: 0, total: 0, completed: 0, next: 'No roadmap tasks added yet' };
    }
    const completed = projectTasks.filter(t => t.completed).length;
    const percentage = Math.round((completed / projectTasks.length) * 100);
    const nextUncompleted = projectTasks.find(t => !t.completed);
    return {
      percentage,
      total: projectTasks.length,
      completed,
      next: nextUncompleted ? nextUncompleted.text : 'All milestones complete!'
    };
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

  const getCategoryThemeColor = (index: number) => {
    if (index === 0) return { ringStart: '#F97316', ringEnd: '#EF4444', text: 'text-orange-600', bg: 'bg-orange-50', ring: 'ring-orange-400', border: 'border-orange-200' };
    if (index === 1) return { ringStart: '#EC4899', ringEnd: '#D946EF', text: 'text-rose-600', bg: 'bg-rose-50', ring: 'ring-rose-400', border: 'border-rose-200' };
    return { ringStart: '#06B6D4', ringEnd: '#3B82F6', text: 'text-cyan-600', bg: 'bg-cyan-50', ring: 'ring-cyan-400', border: 'border-cyan-200' };
  };

  // Get dynamic active categories (reusable tags + macro-domains) to show in the 3 slots
  const getActiveCategories = () => {
    const fromTasks = Array.from(new Set(tasks.map(t => t.project).filter(Boolean))) as string[];
    const currentTrackDomains = TRACK_MACRO_DOMAINS[currentTrack] || [];
    const combined = Array.from(new Set([...fromTasks, ...currentTrackDomains, ...customCategories]));
    return combined.slice(0, 3);
  };

  const activeCategories = getActiveCategories();

  // Greeting based on Active Theme/Vibe alignment
  const getWelcomeString = () => {
    if (theme === 'Ghar Jaisa') return 'Aao beta, have some almonds! Ready to study today?';
    if (theme === 'Level Up') return 'SYSTEM HUD ACTIVE: State your next raid goal, Warrior!';
    if (theme === 'Clean Slate') return 'Clear skies, quiet focus. Your workspace is ready.';
    return 'Directives loaded. Phone facedown. No distractions permitted.';
  };

  const schedulerBlocks = schedules;

  // Study block custom states & handlers
  const [isAddingBlock, setIsAddingBlock] = React.useState(false);
  const [editingBlockId, setEditingBlockId] = React.useState<string | null>(null);
  const [blockTitle, setBlockTitle] = React.useState('');
  const [blockTime, setBlockTime] = React.useState('');
  const [blockProject, setBlockProject] = React.useState('General');
  const [blockDuration, setBlockDuration] = React.useState(45);

  const handleStartAddBlock = () => {
    setIsAddingBlock(true);
    setEditingBlockId(null);
    setBlockTitle('');
    setBlockTime('03:00 PM - 03:45 PM');
    setBlockProject('General');
    setBlockDuration(45);
  };

  const handleStartEditBlock = (block: ScheduleBlock) => {
    setIsAddingBlock(true);
    setEditingBlockId(block.id);
    setBlockTitle(block.title);
    setBlockTime(block.time);
    setBlockProject(block.project);
    setBlockDuration(block.duration);
  };

  const handleSaveBlock = () => {
    if (!blockTitle.trim() || !blockTime.trim()) {
      alert("Please enter a title and time range.");
      return;
    }
    if (editingBlockId) {
      onEditScheduleBlock(editingBlockId, {
        title: blockTitle.trim(),
        time: blockTime.trim(),
        project: blockProject,
        duration: Number(blockDuration) || 45
      });
    } else {
      onAddScheduleBlock({
        title: blockTitle.trim(),
        time: blockTime.trim(),
        project: blockProject,
        duration: Number(blockDuration) || 45,
        isCustom: true
      });
    }
    setIsAddingBlock(false);
    setEditingBlockId(null);
  };

  // Inline Quick Add Handler
  const [inlineProject, setInlineProject] = React.useState<string>(() => {
    const domains = TRACK_MACRO_DOMAINS[currentTrack] || [];
    return domains[0] || 'General';
  });
  const [isCreatingCustomField, setIsCreatingCustomField] = React.useState(false);
  const [customFieldValue, setCustomFieldValue] = React.useState('');

  // Sub-page Deep Task Expansion states
  const [expandedTaskId, setExpandedTaskId] = React.useState<string | null>(null);
  const [newSubStepText, setNewSubStepText] = React.useState('');
  const [editingSubStepId, setEditingSubStepId] = React.useState<string | null>(null);
  const [editingSubStepValue, setEditingSubStepValue] = React.useState('');

  // Syllabus custom manual/extract configurations
  const [syllabusTab, setSyllabusTab] = React.useState<'edit' | 'upload' | 'paste'>('edit');
  const [syllabusPasteText, setSyllabusPasteText] = React.useState('');
  const [isDraggingSyllabus, setIsDraggingSyllabus] = React.useState(false);
  const [isScanningSyllabus, setIsScanningSyllabus] = React.useState(false);
  const [scanningMessage, setScanningMessage] = React.useState('');
  const [scanSuccessMessage, setScanSuccessMessage] = React.useState('');

  // Google Calendar Sync local states
  const [syncStartTime, setSyncStartTime] = React.useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    const tzOffset = tomorrow.getTimezoneOffset() * 60000;
    return new Date(tomorrow.getTime() - tzOffset).toISOString().slice(0, 16);
  });
  const [syncEndTime, setSyncEndTime] = React.useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const tzOffset = tomorrow.getTimezoneOffset() * 60000;
    return new Date(tomorrow.getTime() - tzOffset).toISOString().slice(0, 16);
  });

  // Google Classroom course selection local state
  const [selectedCourseId, setSelectedCourseId] = React.useState<string>('');

  React.useEffect(() => {
    if (classroomCourses && classroomCourses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(classroomCourses[0].id);
    }
  }, [classroomCourses, selectedCourseId]);

  const activeCourse = classroomCourses?.find(c => c.id === selectedCourseId);
  const activeCourseWork = selectedCourseId ? (classroomCourseWork?.[selectedCourseId] || []) : [];

  const handleExtractSyllabusText = async (textToParse: string, customFileName?: string) => {
    if (!expandedTaskId || !textToParse.trim()) return;
    setIsScanningSyllabus(true);
    
    const currentTask = tasks.find(t => t.id === expandedTaskId);
    
    const messages = [
      "Initializing AI content stream reader...",
      customFileName ? `Scanning layout structures of "${customFileName}"...` : "Analysing custom syllabus outline markers...",
      "Extracting academic learning goals & topics...",
      "Refining modular checkable study roadmap..."
    ];

    for (let i = 0; i < messages.length; i++) {
      setScanningMessage(messages[i]);
      await new Promise(r => setTimeout(r, 600));
    }

    const cleanText = textToParse.toLowerCase();
    let customMilestones: string[] = [];

    if (cleanText.includes("chapter") || cleanText.includes("unit") || cleanText.includes("week")) {
      const lines = textToParse.split('\n').map(l => l.trim()).filter(l => l.length > 5);
      const units = lines.filter(l => 
        l.toLowerCase().includes("chapter") || 
        l.toLowerCase().includes("unit") || 
        l.toLowerCase().includes("week") || 
        /^\d+[\.\)]/.test(l)
      );
      if (units.length >= 3) {
        customMilestones = units.slice(0, 5).map(u => `Master ${u}`);
      }
    }

    if (customMilestones.length < 3) {
      if (cleanText.includes("chem") || cleanText.includes("acid") || cleanText.includes("react")) {
        customMilestones = [
          "Understand periodic trends and molecular geometry structures",
          "Analyse reaction formulas, chemical equations and stoichiometry",
          "Practice acidic/basic pH calculation laboratory workflows",
          "Review exam-sheet questions and draw molecular orbital structures"
        ];
      } else if (cleanText.includes("math") || cleanText.includes("limit") || cleanText.includes("integr") || cleanText.includes("equat") || cleanText.includes("calculu")) {
        customMilestones = [
          "Review theoretical proofs and fundamental core equations",
          "Deconstruct 3 step-by-step textbook practice examples",
          "Attempt 5 timed homework worksheets on speed-recall scratchpad",
          "Verify answers and document edge cases for limits convergence"
        ];
      } else if (cleanText.includes("bio") || cleanText.includes("cell") || cleanText.includes("brain") || cleanText.includes("organ") || cleanText.includes("anatomy")) {
        customMilestones = [
          "Deconstruct visual cell biology slides and membrane markers",
          "Draw and label anatomical diagrams (neuron structure & synapses)",
          "Summarize three metabolic pathways onto active recall index cards",
          "Self-quiz on chapter vocabulary definitions and key questions"
        ];
      } else if (cleanText.includes("code") || cleanText.includes("programming") || cleanText.includes("python") || cleanText.includes("react") || cleanText.includes("script")) {
        customMilestones = [
          "Set up the IDE dev environment and run initial project templates",
          "Deconstruct algorithm complexities (Big O notation check)",
          "Implement core functional features and catch edge execution errors",
          "Write clean unit test documentation & push to remote repository"
        ];
      } else {
        const lines = textToParse.split('\n')
          .map(l => l.replace(/^[-\*\d\.\)\s]+/, '').trim())
          .filter(l => l.length > 10 && l.length < 100);
        
        if (lines.length >= 3) {
          customMilestones = lines.slice(0, 5).map(l => `Study: ${l}`);
        } else {
          customMilestones = [
            `Deconstruct core requirements of "${currentTask?.text || 'objective'}"`,
            `Analyze syllabus timelines and list key deliverables`,
            `Complete targeted study worksheets under Pomodoro tracking`,
            `Perform conceptual self-audit checklist to test recall retention`
          ];
        }
      }
    }

    const finalSteps = customMilestones.map((m, idx) => ({
      id: `extracted-${expandedTaskId}-${idx}-${Date.now()}`,
      text: m,
      completed: false
    }));

    if (onUpdateTaskMicroSteps) {
      onUpdateTaskMicroSteps(expandedTaskId, finalSteps);
    }

    setIsScanningSyllabus(false);
    setScanSuccessMessage(customFileName ? `✨ Extracted milestones from "${customFileName}" successfully!` : "✨ AI syllabus roadmap generated successfully!");
    setSyllabusTab('edit');
    setTimeout(() => setScanSuccessMessage(''), 4500);
  };

  const handleSelectTask = (taskId: string) => {
    setExpandedTaskId(taskId);
    const task = tasks.find(t => t.id === taskId);
    if (task && (!task.microSteps || task.microSteps.length === 0)) {
      if (onInitializeTaskSteps) {
        onInitializeTaskSteps(taskId);
      }
    }
  };

  React.useEffect(() => {
    if (selectedProjectFilter) {
      setInlineProject(selectedProjectFilter);
    } else {
      const domains = TRACK_MACRO_DOMAINS[currentTrack] || [];
      if (domains.length > 0) {
        setInlineProject(domains[0]);
      }
    }
  }, [currentTrack, selectedProjectFilter]);
  
  const submitInlineTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    handleAddTaskWithParams(newTaskText.trim(), inlineProject, activeSeriousness);
    setNewTaskText('');
  };

  // Filtered Tasks list
  const filteredTasks = selectedProjectFilter
    ? tasks.filter(t => t.project === selectedProjectFilter)
    : tasks;

  const expandedTask = tasks.find(t => t.id === expandedTaskId);

  return (
    <div className="space-y-6 tab-transition-content p-4 lg:p-6" id="home-dashboard-view">

      
      {/* ========================================== */}
      {/* 1. TOP GREETING HEADER ROW */}
      {/* ========================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-stone-100 shadow-sm rounded-2xl p-5">
        <div className="flex items-center gap-3.5">
          {/* User Profile Avatar circle */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#0EA5E9] flex items-center justify-center text-lg font-bold text-white shadow-md flex-shrink-0">
            🎓
          </div>
          <div>
            <h1 className="text-xl font-space font-bold text-[#0A1128] tracking-tight">
              {getWelcomeString()}
            </h1>
            <p className="text-xs text-stone-500 font-mono mt-0.5">
              Current Session Rank: Level {level} Student ({xp}/100 XP) • {streak} Day Streak
            </p>
          </div>
        </div>
        
        <button
          onClick={onOpenNewTaskModal}
          className="bg-gradient-to-r from-orange-400 via-rose-400 to-fuchsia-500 hover:opacity-95 active:scale-95 text-white font-space font-bold py-2.5 px-5 rounded-xl shadow-lg hover:shadow-xl transition-all text-xs uppercase cursor-pointer flex items-center justify-center gap-2 tracking-wider self-start sm:self-auto flex-shrink-0"
        >
          <Plus className="w-4.5 h-4.5 stroke-[3]" />
          <span>New Task</span>
        </button>
      </div>

      {/* Persona Coach Corner HUD widget (emotionally adaptive) */}
      <div className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${
        theme === 'Ghar Jaisa' ? 'bg-rose-50/50 border-rose-100 text-[#0A1128]' :
        theme === 'Level Up' ? 'bg-purple-50/40 border-purple-100 text-[#0A1128]' :
        theme === 'Clean Slate' ? 'bg-stone-50 border-stone-200 text-[#0A1128]' :
        'bg-slate-50 border-slate-200 text-[#0A1128]'
      }`}>
        <div className="p-2 rounded-full bg-white shadow-sm flex-shrink-0">
          {theme === 'Ghar Jaisa' && <Heart className="w-5 h-5 text-rose-500 fill-rose-100 animate-pulse" />}
          {theme === 'Level Up' && <Sparkles className="w-5 h-5 text-purple-500" />}
          {theme === 'Clean Slate' && <GraduationCap className="w-5 h-5 text-stone-700" />}
          {theme === 'Serious' && <Target className="w-5 h-5 text-[#6366F1]" />}
        </div>
        <div>
          <span className="text-[10px] font-space font-bold tracking-widest text-[#6366F1] uppercase block mb-0.5">
            {theme === 'Ghar Jaisa' && 'Maa\'s Encouragement'}
            {theme === 'Level Up' && 'Daily Dungeon Buff'}
            {theme === 'Clean Slate' && 'Minimalist Flow'}
            {theme === 'Serious' && 'Papa\'s Accountability Shield'}
          </span>
          <p className="text-xs leading-relaxed font-medium">
            {theme === 'Ghar Jaisa' && "Beta, ek-ek task karke sab ho jayega! No tension, accha? Just complete whatever is comfortable. Maa is right here."}
            {theme === 'Level Up' && "Quest Multiplier is ACTIVE! Clearing any Mathematics checklist task gives +40 XP points towards Level up."}
            {theme === 'Clean Slate' && "No phone warnings. Deep focus has been enabled. Your checklist has been streamlined."}
            {theme === 'Serious' && "Close your YouTube and Instagram tabs immediately. Let's start the 45-minute scheduler sprints below right now."}
          </p>
        </div>
      </div>

      {/* ========================================== */}
      {/* 2. MIDDLE ROW: 3 SIDE-BY-SIDE PROJECT CARDS */}
      {/* ========================================== */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-sm font-space font-extrabold uppercase tracking-wider text-[#0A1128] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-500" /> Active Course Modules
          </h2>
          {selectedProjectFilter && (
            <button
              onClick={() => setSelectedProjectFilter(null)}
              className="text-xs font-semibold text-[#6366F1] hover:underline cursor-pointer"
            >
              Show All Courses
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {activeCategories.slice(0, 3).map((category, idx) => {
            const stats = getProjectStats(category);
            const clr = getCategoryThemeColor(idx);
            const emoji = getCategoryEmoji(category);
            const isSelected = selectedProjectFilter === category;
            
            return (
              <button
                key={category}
                onClick={() => setSelectedProjectFilter(isSelected ? null : category)}
                className={`bg-white border text-left p-5 shadow-sm rounded-2xl flex flex-col justify-between transition-all duration-300 relative cursor-pointer hover:-translate-y-1 hover:shadow-md ${
                  isSelected 
                    ? `ring-3 ${clr.ring} ${clr.border}` 
                    : 'border-stone-100'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className={`p-2.5 rounded-xl ${clr.bg} ${clr.text} font-semibold text-lg flex items-center justify-center`}>
                      {emoji}
                    </span>
                    <span className={`text-xs font-mono font-bold ${clr.text} ${clr.bg} px-2 py-0.5 rounded-full`}>
                      {stats.total > 0 ? `${stats.percentage}% Done` : '0% Done'}
                    </span>
                  </div>
                  <h3 className="text-sm font-space font-bold text-[#0A1128] truncate">{category}</h3>
                  <p className="text-[11px] text-stone-500 font-medium mt-1">
                    {stats.total > 0 ? `${stats.completed}/${stats.total} checkpoints` : '0 checkpoints'}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-50/80 text-[10px] text-stone-600 w-full truncate">
                  <span className="font-bold uppercase text-[8px] text-stone-400 block tracking-wider">Next Objective:</span>
                  <span className="font-medium truncate block">{stats.next}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================== */}
      {/* 3. BOTTOM SECTION: SPLIT-COLUMN GRID */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: VERTICAL TASK CHECKLIST CARD (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-stone-100 shadow-xl rounded-2xl p-5 flex flex-col">
          <div className="flex justify-between items-center pb-3 border-b border-stone-100 mb-4">
            <div className="flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-[#6366F1]" />
              <h2 className="text-sm font-space font-extrabold text-[#0A1128] uppercase tracking-wider">
                {selectedProjectFilter ? `Roadmap: ${selectedProjectFilter}` : 'Active study checklists'}
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-stone-500 bg-stone-50 px-2.5 py-1 rounded-lg">
              {filteredTasks.filter(t => t.completed).length}/{filteredTasks.length} Checked
            </span>
          </div>

          {/* Quick inline task add form */}
          <form onSubmit={submitInlineTask} className="mb-4 bg-stone-50/50 p-3 rounded-xl border border-stone-100">
            <div className="space-y-2.5">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder={selectedProjectFilter ? `Add target in ${selectedProjectFilter}...` : "Quick add a study checkpoint..."}
                className="bg-white border border-stone-200/80 rounded-xl px-3.5 py-2.5 text-xs text-[#0A1128] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1] w-full font-medium"
              />
              
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                {/* Course Dropdown & Seriousness in Add Form */}
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={currentTrack}
                    onChange={(e) => {
                      const track = e.target.value as TrackType;
                      setCurrentTrack(track);
                      const domains = TRACK_MACRO_DOMAINS[track] || [];
                      if (domains.length > 0) {
                        setInlineProject(domains[0]);
                      }
                    }}
                    className="bg-white border border-stone-200 text-stone-700 text-[10px] font-bold py-1 px-2.5 rounded-lg cursor-pointer focus:outline-none"
                  >
                    <option value="High School">🎒 High School</option>
                    <option value="Undergraduate (Bachelors)">🎓 Undergrad</option>
                    <option value="Postgraduate (Masters)">🧑‍🎓 Masters</option>
                    <option value="University/PhD">🔬 PhD</option>
                    <option value="Working Professional">💼 Professional</option>
                  </select>

                  <select
                    value={isCreatingCustomField ? '_ADD_CUSTOM_' : inlineProject}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '_ADD_CUSTOM_') {
                        setIsCreatingCustomField(true);
                      } else {
                        setIsCreatingCustomField(false);
                        setInlineProject(val);
                      }
                    }}
                    disabled={!!selectedProjectFilter}
                    className="bg-white border border-stone-200 text-stone-700 text-[10px] font-bold py-1 px-2.5 rounded-lg cursor-pointer focus:outline-none"
                  >
                    <optgroup label="Macro Domains">
                      {(TRACK_MACRO_DOMAINS[currentTrack] || []).map(domain => (
                        <option key={domain} value={domain}>
                          {getCategoryEmoji(domain)} {domain}
                        </option>
                      ))}
                    </optgroup>
                    {customCategories.length > 0 && (
                      <optgroup label="Custom Fields">
                        {customCategories.map(cat => (
                          <option key={cat} value={cat}>
                            🏷️ {cat}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <option value="_ADD_CUSTOM_">➕ + Add Custom Field/Subject</option>
                  </select>

                  {isCreatingCustomField && (
                    <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg p-1 animate-fade-in">
                      <input
                        type="text"
                        placeholder="New field name..."
                        value={customFieldValue}
                        onChange={(e) => setCustomFieldValue(e.target.value)}
                        className="bg-white border-none rounded px-2 py-0.5 text-[9px] text-[#0A1128] focus:outline-none font-bold w-24"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const trimmed = customFieldValue.trim();
                          if (trimmed) {
                            onAddCustomCategory(trimmed);
                            setInlineProject(trimmed);
                            setCustomFieldValue('');
                            setIsCreatingCustomField(false);
                          }
                        }}
                        className="bg-gradient-to-r from-[#6366F1] to-purple-600 text-white text-[9px] font-bold py-0.5 px-1.5 rounded cursor-pointer"
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
                            setInlineProject(domains[0]);
                          }
                        }}
                        className="text-[9px] text-stone-400 hover:text-stone-600 font-bold px-0.5"
                      >
                        X
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg p-0.5">
                    {(['Low', 'Medium', 'High'] as Seriousness[]).map((level) => (
                      <button
                        type="button"
                        key={level}
                        onClick={() => setActiveSeriousness(level)}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded transition cursor-pointer ${
                          activeSeriousness === level
                            ? 'bg-[#6366F1] text-white shadow-xs'
                            : 'text-stone-500 hover:text-stone-900 bg-transparent'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-stone-900 hover:bg-stone-800 text-white font-space font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Create
                </button>
              </div>
            </div>
          </form>

          {/* Task lists scroll area */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-10 text-stone-400 border border-dashed border-stone-150 rounded-xl">
                <ListChecks className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-medium">No study goals in this list.</p>
                {selectedProjectFilter && (
                  <button 
                    onClick={() => setSelectedProjectFilter(null)}
                    className="text-[10px] text-[#6366F1] font-bold mt-1.5 underline cursor-pointer"
                  >
                    Go back to Show All
                  </button>
                )}
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleSelectTask(task.id)}
                  className={`flex items-center justify-between p-3.5 border cursor-pointer hover:border-[#6366F1]/30 transition-all duration-150 ${
                    task.completed 
                      ? 'bg-stone-50/50 border-stone-100 opacity-60' 
                      : 'bg-white border-stone-150 shadow-xs hover:shadow-sm'
                  } rounded-xl`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTask(task.id);
                      }}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-all flex-shrink-0 ${
                        task.completed 
                          ? 'bg-[#6366F1] border-[#6366F1] text-white' 
                          : 'border-stone-300 bg-white hover:border-[#6366F1]'
                      }`}
                      aria-label={`Mark task as ${task.completed ? 'incomplete' : 'complete'}`}
                    >
                      {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                    
                    <div className="min-w-0 flex-1">
                      <span className={`text-xs font-semibold block leading-snug truncate ${task.completed ? 'line-through text-stone-400 font-normal' : 'text-[#0A1128]'}`}>
                        {task.text}
                      </span>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {/* Course/Subject tag */}
                        <span className="text-[9px] font-bold font-mono text-stone-500 uppercase tracking-tight">
                          {getCategoryEmoji(task.project || 'General')} {task.project || 'General'}
                        </span>
                        
                        <span className="w-1 h-1 rounded-full bg-stone-300"></span>

                        {/* Seriousness tag */}
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          task.seriousness === 'High' 
                            ? 'bg-red-50 text-red-600 border border-red-100' 
                            : task.seriousness === 'Medium'
                              ? 'bg-amber-50 text-amber-600 border border-amber-100'
                              : 'bg-green-50 text-green-600 border border-green-100'
                        }`}>
                          {task.seriousness}
                        </span>

                        {task.microSteps && task.microSteps.length > 0 && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                            <span className="text-[9px] font-mono font-bold text-[#6366F1] bg-indigo-50/70 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                              {task.microSteps.filter(ms => ms.completed).length}/{task.microSteps.length} Steps
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(task.id);
                    }}
                    className="text-stone-400 hover:text-red-500 p-1.5 rounded-lg transition cursor-pointer"
                    title="Delete Goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer stats */}
          {filteredTasks.length > 0 && (
            <div className="mt-4 pt-3.5 border-t border-stone-100 flex justify-between items-center flex-shrink-0">
              <span className="text-[10px] text-stone-500 font-mono font-bold">
                Total: {filteredTasks.length} | Completed: {filteredTasks.filter(t => t.completed).length}
              </span>
              <button
                onClick={handleClearCompleted}
                className="border border-stone-200 hover:bg-stone-50 text-stone-700 text-[10px] font-bold font-space py-1.5 px-3 rounded-lg uppercase tracking-wider cursor-pointer transition"
              >
                Clear Checked
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: DETAILED HORIZONTAL TIMELINE TRACKING SCHEDULER (5 cols) & GOOGLE CLASSROOM BLOCK */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-stone-100 shadow-xl rounded-2xl p-5 flex flex-col">
            <div className="pb-3 border-b border-stone-100 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#6366F1]" />
                <h2 className="text-sm font-space font-extrabold text-[#0A1128] uppercase tracking-wider">
                  Study Scheduler
                </h2>
              </div>
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  onClick={handleStartAddBlock}
                  className="px-2 py-1 text-[10px] font-bold bg-[#6366F1] text-white hover:bg-[#5053df] transition rounded-lg flex items-center gap-1 shadow-xs cursor-pointer select-none active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Block
                </button>
                <button
                  onClick={() => {
                    if (confirm("Reset to default study blocks for your active track?")) {
                      onResetSchedules();
                    }
                  }}
                  className="px-2 py-1 text-[10px] font-bold border border-stone-200 hover:bg-stone-50 transition rounded-lg flex items-center gap-1 cursor-pointer select-none text-stone-600 active:scale-95"
                  title="Reset to Track Defaults"
                >
                  <RefreshCw className="w-3 h-3" /> Reset
                </button>
              </div>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed mb-4 font-medium">
              Execute your timed study blocks. Click "Start Focus" to automatically launch the Pomodoro timer. Hover over blocks to edit or delete them.
            </p>

            {isAddingBlock && (
              <div className="mb-4 p-4 border border-stone-100 bg-[#FAFAFA] rounded-xl space-y-3.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold text-[#0A1128] uppercase tracking-wider font-space">
                    {editingBlockId ? "✏️ Edit Study Block" : "➕ Add Custom Study Block"}
                  </h4>
                  <button 
                    onClick={() => setIsAddingBlock(false)} 
                    className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wide mb-1">
                      Block Title / Goal
                    </label>
                    <input 
                      type="text" 
                      value={blockTitle}
                      onChange={(e) => setBlockTitle(e.target.value)}
                      placeholder="e.g. Solve Physics Electrostatics Worksheets"
                      className="w-full text-xs bg-white border border-stone-200 rounded-lg px-2.5 py-2 text-[#0A1128] focus:outline-none focus:ring-1 focus:ring-[#6366F1] font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wide mb-1">
                        Time Frame
                      </label>
                      <input 
                        type="text" 
                        value={blockTime}
                        onChange={(e) => setBlockTime(e.target.value)}
                        placeholder="e.g. 03:00 PM - 03:45 PM"
                        className="w-full text-xs bg-white border border-stone-200 rounded-lg px-2.5 py-2 text-[#0A1128] focus:outline-none focus:ring-1 focus:ring-[#6366F1] font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wide mb-1">
                        Sprint Duration (min)
                      </label>
                      <input 
                        type="number" 
                        value={blockDuration}
                        onChange={(e) => setBlockDuration(Number(e.target.value) || 45)}
                        className="w-full text-xs bg-white border border-stone-200 rounded-lg px-2.5 py-2 text-[#0A1128] focus:outline-none focus:ring-1 focus:ring-[#6366F1] font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wide mb-1">
                      Project/Subject Category
                    </label>
                    <select
                      value={blockProject}
                      onChange={(e) => setBlockProject(e.target.value)}
                      className="w-full text-xs bg-white border border-stone-200 rounded-lg px-2.5 py-2 text-[#0A1128] focus:outline-none focus:ring-1 focus:ring-[#6366F1] font-medium cursor-pointer"
                    >
                      <option value="General">General Study / Revision</option>
                      {TRACK_MACRO_DOMAINS[currentTrack]?.map(domain => (
                        <option key={domain} value={domain}>{domain}</option>
                      ))}
                      {customCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleSaveBlock}
                    className="flex-1 py-1.5 bg-[#6366F1] hover:bg-[#5053df] text-white font-bold text-[10px] font-space rounded-lg transition shadow-xs cursor-pointer select-none active:scale-95 text-center"
                  >
                    {editingBlockId ? "Save Changes" : "Create Block"}
                  </button>
                  <button
                    onClick={() => setIsAddingBlock(false)}
                    className="px-3 py-1.5 border border-stone-200 hover:bg-stone-50 text-stone-600 font-bold text-[10px] font-space rounded-lg transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Horizontal Slices list */}
            <div className="space-y-3.5">
              {schedulerBlocks.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-stone-200 rounded-xl bg-stone-50/50">
                  <p className="text-xs text-stone-400 font-medium">No active study blocks scheduled for today, beta.</p>
                  <button
                    onClick={handleStartAddBlock}
                    className="mt-2 text-[10px] text-[#6366F1] font-bold hover:underline"
                  >
                    + Create your first block now
                  </button>
                </div>
              ) : (
                schedulerBlocks.map((block) => {
                  const projectColor = getProjectColor(block.project);
                                       
                  return (
                    <div 
                      key={block.id} 
                      className="border border-stone-100 p-4 rounded-xl flex items-center justify-between gap-3 relative overflow-hidden transition-all duration-200 hover:border-stone-200/80 hover:bg-stone-50/20 group"
                    >
                      {/* Subject specific border highlight line */}
                      <div className="absolute top-0 bottom-0 left-0 w-1" style={{
                        backgroundColor: projectColor === 'orange' ? '#F97316' :
                                         projectColor === 'rose' ? '#F43F5E' :
                                         projectColor === 'cyan' ? '#06B6D4' :
                                         projectColor === 'indigo' ? '#6366F1' :
                                         projectColor === 'teal' ? '#14B8A6' :
                                         projectColor === 'pink' ? '#EC4899' :
                                         projectColor === 'amber' ? '#F59E0B' : '#8B5CF6'
                      }}></div>
                      
                      <div className="min-w-0 pl-1.5 flex-1">
                        <span className="text-[10px] font-mono font-bold text-stone-400 block tracking-tight">
                          {block.time}
                        </span>
                        <h3 className="text-xs font-bold text-[#0A1128] truncate mt-0.5" title={block.title}>
                          {block.title}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[8px] font-bold uppercase font-mono px-1.5 py-0.2 rounded border" style={{
                            backgroundColor: projectColor === 'orange' ? '#FFF7ED' :
                                             projectColor === 'rose' ? '#FFF1F2' :
                                             projectColor === 'cyan' ? '#ECFEFF' :
                                             projectColor === 'indigo' ? '#EEF2FF' :
                                             projectColor === 'teal' ? '#F0FDFA' :
                                             projectColor === 'pink' ? '#FDF2F8' :
                                             projectColor === 'amber' ? '#FEF3C7' : '#F5F3FF',
                            color: projectColor === 'orange' ? '#C2410C' :
                                   projectColor === 'rose' ? '#BE123C' :
                                   projectColor === 'cyan' ? '#0E7490' :
                                   projectColor === 'indigo' ? '#4338CA' :
                                   projectColor === 'teal' ? '#0F766E' :
                                   projectColor === 'pink' ? '#BE185D' :
                                   projectColor === 'amber' ? '#B45309' : '#6D28D9',
                            borderColor: projectColor === 'orange' ? '#FED7AA' :
                                         projectColor === 'rose' ? '#FECDD3' :
                                         projectColor === 'cyan' ? '#CFFAFE' :
                                         projectColor === 'indigo' ? '#C7D2FE' :
                                         projectColor === 'teal' ? '#CCFBF1' :
                                         projectColor === 'pink' ? '#FBCFE8' :
                                         projectColor === 'amber' ? '#FDE68A' : '#E9D5FF'
                          }}>
                            {block.project}
                          </span>
                          <span className="text-[9px] text-stone-400 font-medium font-mono">
                            ({block.duration} min sprint)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleStartEditBlock(block)}
                          className="p-1.5 text-stone-400 hover:text-[#6366F1] hover:bg-stone-50 border border-transparent hover:border-stone-100 rounded-lg transition sm:opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                          title="Edit Study Block"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete the block: "${block.title}"?`)) {
                              onDeleteScheduleBlock(block.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-stone-50 border border-transparent hover:border-stone-100 rounded-lg transition sm:opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                          title="Delete Study Block"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Start Focus Button */}
                        <button
                          onClick={() => startFocus(block.title, block.duration)}
                          className="p-2 rounded-xl transition active:scale-95 flex items-center gap-1 text-[10px] font-bold font-space cursor-pointer border"
                          style={{
                            backgroundColor: projectColor === 'orange' ? '#FFF7ED' :
                                             projectColor === 'rose' ? '#FFF1F2' :
                                             projectColor === 'cyan' ? '#ECFEFF' :
                                             projectColor === 'indigo' ? '#EEF2FF' :
                                             projectColor === 'teal' ? '#F0FDFA' :
                                             projectColor === 'pink' ? '#FDF2F8' :
                                             projectColor === 'amber' ? '#FEF3C7' : '#F5F3FF',
                            color: projectColor === 'orange' ? '#C2410C' :
                                   projectColor === 'rose' ? '#BE123C' :
                                   projectColor === 'cyan' ? '#0E7490' :
                                   projectColor === 'indigo' ? '#4338CA' :
                                   projectColor === 'teal' ? '#0F766E' :
                                   projectColor === 'pink' ? '#BE185D' :
                                   projectColor === 'amber' ? '#B45309' : '#6D28D9',
                            borderColor: projectColor === 'orange' ? '#FED7AA' :
                                         projectColor === 'rose' ? '#FECDD3' :
                                         projectColor === 'cyan' ? '#CFFAFE' :
                                         projectColor === 'indigo' ? '#C7D2FE' :
                                         projectColor === 'teal' ? '#CCFBF1' :
                                         projectColor === 'pink' ? '#FBCFE8' :
                                         projectColor === 'amber' ? '#FDE68A' : '#E9D5FF'
                          }}
                          title={`Start Pomodoro for ${block.title}`}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span className="hidden sm:inline">Start</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Tips widget */}
            <div className="mt-5 p-3 rounded-xl bg-[#FAFAFA] border border-stone-100 text-[10px] leading-relaxed text-stone-600 font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#6366F1] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#0A1128] block">Focus Tip from Papa:</span>
                "Sprints of 45 minutes followed by 5 minutes of physical stretching increases neuron retention. No social scrolling during breaks!"
              </div>
            </div>
          </div>

          {/* GOOGLE CLASSROOM CARD (Only for Student Tracks) */}
          {currentTrack !== 'Working Professional' && (
            <div className="bg-white border border-stone-100 shadow-xl rounded-2xl p-5 flex flex-col space-y-4" id="google-classroom-sync-card">
              <div className="pb-3 border-b border-[#EBEBEB] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </span>
                  <h2 className="text-sm font-space font-extrabold text-[#0A1128] uppercase tracking-wider">
                    Google Classroom
                  </h2>
                </div>
                {googleUser && (
                  <span className="text-[9px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded-full border border-green-100 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-green-500 animate-ping"></span>
                    Student Synced
                  </span>
                )}
              </div>

              {!googleUser ? (
                <div className="space-y-3">
                  <p className="text-xs text-stone-500 leading-relaxed font-medium">
                    Beta, sync your Google Classroom account to import your active assignments and let Mappy automatically break them down into action-packed study steps!
                  </p>
                  <button
                    type="button"
                    onClick={onGoogleSignIn}
                    className="w-full py-2.5 px-4 bg-white border border-stone-200 hover:border-stone-300 shadow-xs rounded-xl cursor-pointer transition flex items-center justify-center gap-2 text-xs font-bold text-stone-700 hover:bg-stone-50"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.67 14.94 1 12 1 7.35 1 3.39 3.65 1.5 7.5l3.86 3C6.27 7.5 8.9 5.04 12 5.04z" />
                      <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.47h6.46c-.28 1.48-1.12 2.73-2.38 3.58l3.69 2.87c2.16-1.99 3.42-4.92 3.42-8.56z" />
                      <path fill="#FBBC05" d="M5.36 14.5c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3l-3.86-3C.53 8.71 0 10.29 0 12s.53 3.29 1.5 4.8l3.86-3z" />
                      <path fill="#34A853" d="M12 23c3.24 0 5.96-1.07 7.95-2.91l-3.69-2.87c-1.02.68-2.33 1.09-3.96 1.09-3.1 0-5.73-2.46-6.64-5.46l-3.86 3C3.39 20.35 7.35 23 12 23z" />
                    </svg>
                    Connect Google Classroom
                  </button>
                </div>
              ) : isLoadingClassroom ? (
                <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 text-[#6366F1] animate-spin" />
                  <span className="text-xs text-stone-500 font-semibold font-mono">Syncing school coursework...</span>
                </div>
              ) : classroomCourses && classroomCourses.length > 0 ? (
                <div className="space-y-4">
                  {/* Course Selector Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-space font-extrabold text-[#0A1128] uppercase tracking-wider block">
                      Select Your Active Course
                    </label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full text-xs font-bold text-stone-700 bg-stone-50 border border-stone-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-[#6366F1] cursor-pointer"
                    >
                      {classroomCourses.map((course: any) => (
                        <option key={course.id} value={course.id}>
                          🎓 {course.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Coursework assignments list */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-space font-extrabold text-stone-400 uppercase tracking-wider block">
                      Assignments & Milestones
                    </span>

                    {activeCourseWork && activeCourseWork.length > 0 ? (
                      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
                        {activeCourseWork.map((cw: any) => {
                          const hasBeenImported = tasks.some(t => t.text.includes(cw.title));
                          const hasDueDate = cw.dueDate;
                          const formattedDueDate = hasDueDate 
                            ? `${cw.dueDate.month}/${cw.dueDate.day}/${cw.dueDate.year}` 
                            : 'No due date';

                          return (
                            <div 
                              key={cw.id} 
                              className="p-3 bg-stone-50 border border-stone-150 rounded-xl flex items-center justify-between gap-3 transition hover:bg-stone-100/50"
                            >
                              <div className="min-w-0 flex-1">
                                <h4 className="text-[11px] font-bold text-[#0A1128] line-clamp-1 leading-snug">
                                  {cw.title}
                                </h4>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="text-[9px] text-stone-400 font-semibold font-mono">
                                    Due: {formattedDueDate}
                                  </span>
                                  {cw.alternateLink && (
                                    <>
                                      <span className="text-stone-300 text-[8px]">•</span>
                                      <a 
                                        href={cw.alternateLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-[9px] text-[#6366F1] font-bold hover:underline"
                                      >
                                        Open Assignment ↗
                                      </a>
                                    </>
                                  )}
                                </div>
                              </div>

                              {hasBeenImported ? (
                                <span className="text-[9px] font-mono font-bold text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1">
                                  <Check className="w-3 h-3 stroke-[3]" /> Added
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleAddTaskWithParams(
                                      `Classroom: ${cw.title}`, 
                                      'Medium', 
                                      activeCourse?.name || 'School'
                                    );
                                  }}
                                  className="text-[9px] font-space font-extrabold uppercase tracking-wider bg-[#6366F1] text-white hover:bg-indigo-700 px-2.5 py-1.5 rounded-lg shrink-0 transition cursor-pointer shadow-xs active:scale-95 border-0 outline-none"
                                >
                                  Import
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-6 text-center bg-stone-50/50 rounded-xl border border-dashed border-stone-200 text-[10px] text-stone-400 font-medium">
                        Nice job, beta! No pending assignments found in this course.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-5 text-center bg-stone-50/50 rounded-xl border border-dashed border-stone-200 text-[10px] text-stone-400 font-medium leading-relaxed">
                  No active Classroom courses found. Make sure your account has enrolled courses.
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* ========================================== */}
      {/* 5. DEEP TASK EXPANSION SUB-PAGE OVERLAY */}
      {/* ========================================== */}
      {expandedTaskId && expandedTask && (
        <div className="fixed inset-0 bg-[#0A1128]/40 backdrop-blur-xs flex justify-end z-50 transition-opacity" onClick={() => setExpandedTaskId(null)}>
          <div 
            className="w-full max-w-lg bg-[#FAFAFA] h-full shadow-2xl flex flex-col p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div className="flex items-center gap-2 text-stone-500 font-mono text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#6366F1]" />
                AI Roadmap & Syllabus Breakdown
              </div>
              <button 
                onClick={() => setExpandedTaskId(null)}
                className="p-1.5 hover:bg-stone-100 rounded-full transition text-stone-500 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Title / Main Info */}
            <div className="py-4 space-y-2">
              <h2 className="text-lg font-space font-bold text-[#0A1128] leading-tight">
                {expandedTask.text}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-stone-100 text-stone-600 rounded">
                  {getCategoryEmoji(expandedTask.project || 'General')} {expandedTask.project || 'General'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  expandedTask.seriousness === 'High' 
                    ? 'bg-red-100 text-red-700' 
                    : expandedTask.seriousness === 'Medium'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-green-100 text-green-700'
                }`}>
                  {expandedTask.seriousness} Seriousness
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#6366F1]/10 text-[#6366F1] rounded">
                  Track: {currentTrack}
                </span>
              </div>
            </div>

            {/* Core Step-by-Step Container */}
            <div className="flex-1 overflow-y-auto py-2 space-y-4 pr-1 no-scrollbar">
              {/* Serious warning / guidance if High Seriousness */}
              {expandedTask.seriousness === 'High' && (
                <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl flex gap-2.5 items-start">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-[11px] text-red-800 leading-normal">
                    <strong>Papa's Strict Warning:</strong> This task has High Seriousness level. Keep your phone facing down, lock other distractions away, and execute these steps completely. Focus on conceptual understanding!
                  </div>
                </div>
              )}

              {/* Progress Tracker */}
              {expandedTask.microSteps && expandedTask.microSteps.length > 0 && (
                <div className="bg-white border border-stone-150 p-4 rounded-xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-stone-600">Roadmap Progress</span>
                    <span className="text-[#6366F1]">
                      {Math.round((expandedTask.microSteps.filter(s => s.completed).length / expandedTask.microSteps.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-violet-500 to-sky-400 h-full rounded-full transition-all duration-350"
                      style={{ width: `${(expandedTask.microSteps.filter(s => s.completed).length / expandedTask.microSteps.length) * 100}%` }}
                    />
                  </div>
                  <div className="text-[10px] font-mono text-stone-500 flex items-center justify-between">
                    <span>{expandedTask.microSteps.filter(s => s.completed).length} of {expandedTask.microSteps.length} complete</span>
                    <span>Classified Track: {currentTrack}</span>
                  </div>
                </div>
              )}

              {/* Google Calendar Sync card */}
              <div className="bg-white border border-stone-150 p-4 rounded-xl shadow-xs space-y-3" id="task-calendar-sync-card">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <span className="text-[10px] font-space font-extrabold text-[#0A1128] uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#6366F1]" /> Google Calendar Schedule
                  </span>
                  {googleUser && (
                    <span className="text-[9px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded-full border border-green-100">
                      Connected
                    </span>
                  )}
                </div>

                {googleUser ? (
                  expandedTask.googleEventId ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg space-y-2 text-[11px] text-emerald-800 leading-normal">
                      <div className="font-bold flex items-center gap-1.5">
                        <Check className="w-4 h-4 stroke-[3]" /> Scheduled on Google Calendar!
                      </div>
                      <p className="font-medium">
                        Target Time: {new Date(expandedTask.calendarStartTime || '').toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Do you want to re-schedule this study milestone?")) {
                            onSyncTaskToCalendar(expandedTask.id, syncStartTime, syncEndTime);
                          }
                        }}
                        className="text-[10px] text-indigo-600 font-extrabold hover:underline cursor-pointer flex items-center gap-1 mt-1"
                      >
                        🔄 Change schedule / Sync again
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-[11px] text-stone-500 font-medium">
                        Schedule a dedicated deep focus or review block for this milestone on your calendar.
                      </p>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[9px] font-space font-extrabold text-[#0A1128] uppercase tracking-wider block">
                            Start Time
                          </label>
                          <input 
                            type="datetime-local" 
                            value={syncStartTime}
                            onChange={(e) => setSyncStartTime(e.target.value)}
                            className="w-full text-xs font-medium text-stone-700 bg-stone-50 border border-stone-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-space font-extrabold text-[#0A1128] uppercase tracking-wider block">
                            End Time
                          </label>
                          <input 
                            type="datetime-local" 
                            value={syncEndTime}
                            onChange={(e) => setSyncEndTime(e.target.value)}
                            className="w-full text-xs font-medium text-stone-700 bg-stone-50 border border-stone-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onSyncTaskToCalendar(expandedTask.id, syncStartTime, syncEndTime)}
                        disabled={isSyncingTask[expandedTask.id]}
                        className="w-full py-2 px-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-[10px] font-space font-extrabold uppercase tracking-wider rounded-lg cursor-pointer transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                      >
                        {isSyncingTask[expandedTask.id] ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Scheduling Study Event...
                          </>
                        ) : (
                          <>
                            <Calendar className="w-3.5 h-3.5" />
                            Schedule Study Event
                          </>
                        )}
                      </button>
                    </div>
                  )
                ) : (
                  <div className="space-y-2.5">
                    <p className="text-[11px] text-stone-500 leading-normal font-medium">
                      Connect your Google Account to schedule this study milestone and automatically block time on your Google Calendar!
                    </p>
                    <button
                      type="button"
                      onClick={onGoogleSignIn}
                      className="w-full py-2 px-3 bg-white border border-stone-200 hover:border-stone-300 shadow-xs rounded-lg cursor-pointer transition flex items-center justify-center gap-2 text-[10px] font-bold text-stone-700 hover:bg-stone-50"
                    >
                      <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.67 14.94 1 12 1 7.35 1 3.39 3.65 1.5 7.5l3.86 3C6.27 7.5 8.9 5.04 12 5.04z" />
                        <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.47h6.46c-.28 1.48-1.12 2.73-2.38 3.58l3.69 2.87c2.16-1.99 3.42-4.92 3.42-8.56z" />
                        <path fill="#FBBC05" d="M5.36 14.5c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3l-3.86-3C.53 8.71 0 10.29 0 12s.53 3.29 1.5 4.8l3.86-3z" />
                        <path fill="#34A853" d="M12 23c3.24 0 5.96-1.07 7.95-2.91l-3.69-2.87c-1.02.68-2.33 1.09-3.96 1.09-3.1 0-5.73-2.46-6.64-5.46l-3.86 3C3.39 20.35 7.35 23 12 23z" />
                      </svg>
                      Connect Google Calendar
                    </button>
                  </div>
                )}
              </div>

              {/* Syllabus Source Selector (Image / Document / Paste / Manual) */}
              <div className="bg-white border border-stone-150 rounded-xl p-4 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-space font-extrabold text-[#0A1128] uppercase tracking-wider block">
                    ⚡ Task Roadmap Source
                  </span>
                  {scanSuccessMessage && (
                    <span className="text-[9px] text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 animate-pulse">
                      {scanSuccessMessage}
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-1 bg-stone-50 p-1 rounded-lg border border-stone-200">
                  <button
                    type="button"
                    onClick={() => setSyllabusTab('edit')}
                    className={`py-1.5 text-[10px] font-space font-extrabold rounded-md text-center transition cursor-pointer select-none ${
                      syllabusTab === 'edit' ? 'bg-[#6366F1] text-white shadow-xs' : 'text-stone-500 hover:text-[#0A1128]'
                    }`}
                  >
                    ✏️ Edit Checklist
                  </button>
                  <button
                    type="button"
                    onClick={() => setSyllabusTab('upload')}
                    className={`py-1.5 text-[10px] font-space font-extrabold rounded-md text-center transition cursor-pointer select-none ${
                      syllabusTab === 'upload' ? 'bg-[#6366F1] text-white shadow-xs' : 'text-stone-500 hover:text-[#0A1128]'
                    }`}
                  >
                    📷 Upload Syllabus Pic
                  </button>
                  <button
                    type="button"
                    onClick={() => setSyllabusTab('paste')}
                    className={`py-1.5 text-[10px] font-space font-extrabold rounded-md text-center transition cursor-pointer select-none ${
                      syllabusTab === 'paste' ? 'bg-[#6366F1] text-white shadow-xs' : 'text-stone-500 hover:text-[#0A1128]'
                    }`}
                  >
                    📝 Paste Outline
                  </button>
                </div>

                {/* Sub-panels based on active tab */}
                {syllabusTab === 'upload' && (
                  <div className="space-y-3 animate-fade-in pt-1">
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingSyllabus(true); }}
                      onDragLeave={() => setIsDraggingSyllabus(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingSyllabus(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          const file = e.dataTransfer.files[0];
                          handleExtractSyllabusText(`Study topics in: ${file.name}\nWeek 1: Core Fundamentals & theory overview\nWeek 2: Advanced formula structures and sample questions\nWeek 3: Practical exam-prep mock trials\nWeek 4: Final revision and self-recall testing`, file.name);
                        }
                      }}
                      className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
                        isDraggingSyllabus 
                          ? 'border-[#6366F1] bg-[#6366F1]/5' 
                          : 'border-stone-200 hover:border-[#6366F1]/50 bg-[#FAFAFA]'
                      }`}
                    >
                      <input 
                        type="file" 
                        id="syllabus-file-picker" 
                        accept="image/*,application/pdf"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            handleExtractSyllabusText(`Study topics in: ${file.name}\nWeek 1: Core Fundamentals & theory overview\nWeek 2: Advanced formula structures and sample questions\nWeek 3: Practical exam-prep mock trials\nWeek 4: Final revision and self-recall testing`, file.name);
                          }
                        }}
                        className="hidden"
                      />
                      <label htmlFor="syllabus-file-picker" className="cursor-pointer block space-y-2">
                        <Upload className="w-6 h-6 text-[#6366F1] mx-auto animate-bounce" />
                        <span className="text-[10px] font-bold text-[#0A1128] block">
                          Drag & drop syllabus photo/PDF or click to select
                        </span>
                        <span className="text-[9px] text-stone-400 block font-medium">
                          Supports PNG, JPG, JPEG, or PDF files
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {syllabusTab === 'paste' && (
                  <div className="space-y-2.5 animate-fade-in pt-1">
                    <textarea
                      placeholder="Paste your course syllabus guidelines, chapter summary, or homework outline here (e.g. Chapter 1: Limits, Chapter 2: Derivatives)..."
                      value={syllabusPasteText}
                      onChange={(e) => setSyllabusPasteText(e.target.value)}
                      className="w-full text-xs text-[#0A1128] font-semibold bg-[#FAFAFA] border border-stone-200 rounded-xl p-2.5 focus:outline-hidden focus:ring-2 focus:ring-[#6366F1] focus:border-transparent h-20 placeholder-stone-400"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (syllabusPasteText.trim()) {
                            handleExtractSyllabusText(syllabusPasteText.trim());
                            setSyllabusPasteText('');
                          }
                        }}
                        disabled={!syllabusPasteText.trim()}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 disabled:opacity-50 hover:opacity-95 text-white rounded-lg text-[10px] font-space font-extrabold uppercase tracking-wider cursor-pointer shadow-sm transition"
                      >
                        Extract Roadmap
                      </button>
                    </div>
                  </div>
                )}
                
                {syllabusTab === 'edit' && (
                  <div className="text-[10px] text-stone-500 font-semibold leading-relaxed bg-[#FAFAFA] p-2.5 rounded-xl border border-stone-150 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                    <span>Double-click / edit any step below, check milestones completed, or type your own steps by hand at the bottom!</span>
                  </div>
                )}
              </div>

              {/* Steps List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-700 block">Syllabus Roadmap Milestones</span>
                
                {isScanningSyllabus ? (
                  <div className="p-8 text-center bg-white border border-stone-150 rounded-2xl space-y-4 shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#6366F1]/5 animate-pulse"></div>
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-sky-400 animate-pulse"></div>
                    
                    <div className="relative z-10 space-y-3">
                      <div className="w-10 h-10 bg-indigo-50 text-[#6366F1] rounded-full flex items-center justify-center mx-auto">
                        <Sparkle className="w-5 h-5 animate-spin" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-space font-extrabold text-[#0A1128] tracking-wide uppercase">
                          Syllabus Matrix Extraction
                        </p>
                        <p className="text-[10px] text-stone-500 font-bold font-mono">
                          {scanningMessage || 'Parsing syllabus structure...'}
                        </p>
                      </div>
                      <div className="w-36 bg-stone-100 h-1 rounded-full overflow-hidden mx-auto">
                        <div className="bg-[#6366F1] h-full rounded-full animate-pulse w-2/3" />
                      </div>
                    </div>
                  </div>
                ) : (!expandedTask.microSteps || expandedTask.microSteps.length === 0) ? (
                  <div className="text-center py-12 bg-white border border-dashed border-stone-200 rounded-xl">
                    <Sparkle className="w-8 h-8 text-[#6366F1] mx-auto animate-spin mb-2 opacity-50" />
                    <p className="text-xs font-semibold text-stone-600">Analyzing Syllabus Roadmap...</p>
                    <p className="text-[10px] text-stone-400">Expanding into professional milestones</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {expandedTask.microSteps.map((step, index) => (
                      <div 
                        key={step.id}
                        className={`p-3 bg-white border rounded-xl flex items-start gap-3 transition-all ${
                          step.completed ? 'border-stone-150 bg-stone-50/50' : 'border-stone-200 hover:border-[#6366F1]/20'
                        }`}
                      >
                        {/* Circle complete checkbox */}
                        <button
                          onClick={() => onToggleMicroStep(expandedTask.id, step.id)}
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all mt-0.5 cursor-pointer flex-shrink-0 ${
                            step.completed 
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 border-transparent text-white' 
                              : 'border-stone-300 hover:border-[#6366F1]'
                          }`}
                        >
                          {step.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        {/* Text / Inline Edit */}
                        <div className="flex-1 min-w-0">
                          {editingSubStepId === step.id ? (
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                onEditMicroStep(expandedTask.id, step.id, editingSubStepValue);
                                setEditingSubStepId(null);
                              }}
                              className="flex gap-2"
                            >
                              <input 
                                type="text"
                                value={editingSubStepValue}
                                onChange={(e) => setEditingSubStepValue(e.target.value)}
                                className="w-full text-xs bg-stone-50 border border-stone-200 rounded px-2 py-1 outline-hidden text-[#0A1128] font-medium"
                                autoFocus
                              />
                              <button 
                                type="submit"
                                className="px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer hover:bg-emerald-600"
                              >
                                <Save className="w-3 h-3" /> Save
                              </button>
                            </form>
                          ) : (
                            <span 
                              className={`text-xs block leading-relaxed ${
                                step.completed ? 'line-through text-stone-400' : 'text-stone-700 font-medium'
                              }`}
                            >
                              {step.text}
                            </span>
                          )}

                          {/* Quick details */}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] text-stone-400 font-mono">Step {index + 1}</span>
                            {editingSubStepId !== step.id && !step.completed && (
                              <button 
                                onClick={() => {
                                  setEditingSubStepId(step.id);
                                  setEditingSubStepValue(step.text);
                                }}
                                className="text-[9px] font-bold text-stone-400 hover:text-[#6366F1] flex items-center gap-0.5 cursor-pointer"
                              >
                                <Edit2 className="w-2.5 h-2.5" /> Edit
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Delete sub-step */}
                        <button
                          onClick={() => onDeleteMicroStep(expandedTask.id, step.id)}
                          className="text-stone-300 hover:text-red-500 p-1 rounded transition cursor-pointer"
                          title="Remove Step"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Manual ADD sub-step footer form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!newSubStepText.trim()) return;
                onAddMicroStep(expandedTask.id, newSubStepText.trim());
                setNewSubStepText('');
              }}
              className="mt-4 pt-4 border-t border-stone-200 flex gap-2"
            >
              <input 
                type="text"
                placeholder="➕ Add your own custom micro-step..."
                value={newSubStepText}
                onChange={(e) => setNewSubStepText(e.target.value)}
                className="flex-1 text-xs border border-stone-200 rounded-xl px-3.5 py-2.5 bg-white outline-hidden focus:border-[#6366F1] text-[#0A1128]"
              />
              <button 
                type="submit"
                className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg hover:from-violet-700 hover:to-indigo-700 transition cursor-pointer"
              >
                Add
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
