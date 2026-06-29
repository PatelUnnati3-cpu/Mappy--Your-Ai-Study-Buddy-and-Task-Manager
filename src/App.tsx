import React, { useState, useEffect, useRef } from 'react';
import { Menu, Heart, Flame, Target, Sparkles, RefreshCw, X, Home, BarChart2, MessageSquare, Settings, Clock, Play, Pause, RotateCcw, Minimize2, Maximize2, Minus, User } from 'lucide-react';

import { Theme, BreakdownMode, Seriousness, Task, Message, LanguageOption, TrackType, ScratchpadNote, ScheduleBlock, TRACK_MACRO_DOMAINS } from './types';
import { THEMES, DEFAULT_WELCOME_MESSAGES } from './data/themes';

import Sidebar from './components/Sidebar';
import HomeView from './components/HomeView';
import ProgressView from './components/ProgressView';
import ChatView from './components/ChatView';
import SettingsView from './components/SettingsView';
import NewTaskModal from './components/NewTaskModal';
import AuthView from './components/AuthView';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  listCalendarEvents, 
  createCalendarEvent,
  listClassroomCourses,
  listClassroomCourseWork,
  listDriveFiles
} from './lib/googleAuth';
import { 
  saveUserProfile, 
  getUserProfile, 
  saveTaskToCloud, 
  syncLocalTasksToCloud, 
  deleteTaskFromCloud, 
  getUserTasksFromCloud 
} from './lib/db';

const DEFAULT_TASKS: Task[] = [
  { 
    id: 't1', 
    text: 'Solve advanced integration worksheets', 
    completed: false, 
    seriousness: 'High', 
    project: 'Mathematics', 
    createdAt: new Date().toISOString(),
    microSteps: [
      { id: 'ms1-1', text: "Review mathematical foundations of integration by parts and substitution", completed: false },
      { id: 'ms1-2', text: "Solve 3 practice integration worksheets step-by-step", completed: false },
      { id: 'ms1-3', text: "Check solved solutions against a numerical calculator to verify convergence", completed: false },
      { id: 'ms1-4', text: "Document tricky integral boundary rules in scratchpad", completed: false }
    ]
  },
  { 
    id: 't2', 
    text: 'Practice limits boundary rules questions', 
    completed: true, 
    seriousness: 'Medium', 
    project: 'Mathematics', 
    createdAt: new Date().toISOString(),
    microSteps: [
      { id: 'ms2-1', text: "Revise standard limit theorems and L'Hopital's rule", completed: true },
      { id: 'ms2-2', text: "Complete 5 boundary rule questions with high-degree polynomials", completed: true },
      { id: 'ms2-3', text: "Identify common limit pitfalls like infinity minus infinity", completed: true }
    ]
  },
  { 
    id: 't3', 
    text: 'Prepare Biology nervous system diagrams', 
    completed: false, 
    seriousness: 'High', 
    project: 'Biology', 
    createdAt: new Date().toISOString(),
    microSteps: [
      { id: 'ms3-1', text: "Study the anatomy and parts of a neuron from textbook chapter 4", completed: false },
      { id: 'ms3-2', text: "Draw the action potential flow and label the myelin sheath", completed: false },
      { id: 'ms3-3', text: "List 3 primary neurotransmitters and their respective synapse functions", completed: false }
    ]
  },
  { 
    id: 't4', 
    text: 'Draw mitosis cells slides', 
    completed: true, 
    seriousness: 'Medium', 
    project: 'Biology', 
    createdAt: new Date().toISOString(),
    microSteps: [
      { id: 'ms4-1', text: "Diagram the prophase and metaphase alignment on scratchpad", completed: true },
      { id: 'ms4-2', text: "Draw telophase cell divisions showing contractile rings", completed: true },
      { id: 'ms4-3', text: "Label centromeres and sister chromatids accurately", completed: true }
    ]
  },
  { 
    id: 't5', 
    text: 'Outline French Revolution timeline essay', 
    completed: true, 
    seriousness: 'Low', 
    project: 'History', 
    createdAt: new Date().toISOString(),
    microSteps: [
      { id: 'ms5-1', text: "List key timeline factors and triggering historical events", completed: true },
      { id: 'ms5-2', text: "Formulate a clear 3-point thesis statement", completed: true },
      { id: 'ms5-3', text: "Structure paragraphs detailing social inequality and Bastille impact", completed: true }
    ]
  },
  { 
    id: 't6', 
    text: 'Review Napoleon battle impacts review', 
    completed: false, 
    seriousness: 'Medium', 
    project: 'History', 
    createdAt: new Date().toISOString(),
    microSteps: [
      { id: 'ms6-1', text: "Summarize Battle of Waterloo tactical outcomes", completed: false },
      { id: 'ms6-2', text: "Outline administrative reforms under the Napoleonic Code", completed: false },
      { id: 'ms6-3', text: "Draft battle impacts cheat-sheet for active recall testing", completed: false }
    ]
  },
];

export default function App() {

  const handleSyncTaskToCalendar = async (taskId: string, startTimeIso: string, endTimeIso: string) => {
    if (!googleToken) {
      alert("Please connect to Google Calendar first!");
      return;
    }
    const taskToSync = tasks.find(t => t.id === taskId);
    if (!taskToSync) return;

    setIsSyncingTask(prev => ({ ...prev, [taskId]: true }));
    try {
      const description = `Academic study roadmap target created with Mappy study buddy.
Seriousness level: ${taskToSync.seriousness}
Syllabus / roadmap micro-steps:
${taskToSync.microSteps?.map((ms, idx) => `${idx + 1}. [${ms.completed ? 'x' : ' '}] ${ms.text}`).join('\n') || 'No micro-steps generated'}`;

      const response = await createCalendarEvent(googleToken, {
        summary: `📚 Study Target: ${taskToSync.text}`,
        description,
        startTime: startTimeIso,
        endTime: endTimeIso,
      });

      if (response && response.id) {
        setTasks(prev => prev.map(t => t.id === taskId ? { 
          ...t, 
          googleEventId: response.id, 
          calendarStartTime: startTimeIso 
        } : t));
        fetchCalendarEvents(googleToken);
      }
    } catch (err: any) {
      console.error("Sync to Calendar failed:", err);
      alert(`Sync to Calendar failed: ${err.message || err}`);
    } finally {
      setIsSyncingTask(prev => ({ ...prev, [taskId]: false }));
    }
  };

  // Sync Control Refs
  const isInitialSyncRef = useRef(true);
  const prevTasksRef = useRef<Task[]>([]);

  // Core Persistent States
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('mappy-theme') as Theme) || 'Ghar Jaisa';
  });
  
  const [breakdownMode, setBreakdownMode] = useState<BreakdownMode>(() => {
    return (localStorage.getItem('mappy-breakdown') as BreakdownMode) || 'AUTO';
  });

  const [languageOption, setLanguageOption] = useState<LanguageOption>(() => {
    return (localStorage.getItem('mappy-language') as LanguageOption) || 'English';
  });

  const [currentTrack, setCurrentTrack] = useState<TrackType>(() => {
    return (localStorage.getItem('mappy-current-track') as TrackType) || 'High School';
  });

  // Google Auth, Calendar, Classroom, and Drive States & Functions
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [classroomCourses, setClassroomCourses] = useState<any[]>([]);
  const [classroomCourseWork, setClassroomCourseWork] = useState<Record<string, any[]>>({});
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [isLoadingClassroom, setIsLoadingClassroom] = useState(false);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [isSyncingTask, setIsSyncingTask] = useState<Record<string, boolean>>({});

  const fetchCalendarEvents = async (token: string) => {
    try {
      const events = await listCalendarEvents(token);
      setCalendarEvents(events);
    } catch (err) {
      console.error("Failed to fetch calendar events:", err);
    }
  };

  const fetchClassroomData = async (token: string) => {
    if (currentTrack === 'Working Professional') {
      setClassroomCourses([]);
      setClassroomCourseWork({});
      return;
    }
    setIsLoadingClassroom(true);
    try {
      const courses = await listClassroomCourses(token);
      setClassroomCourses(courses);
      
      const courseworkMap: Record<string, any[]> = {};
      const coursePromises = courses.slice(0, 8).map(async (course: any) => {
        try {
          const list = await listClassroomCourseWork(token, course.id);
          courseworkMap[course.id] = list;
        } catch (e) {
          console.error(`Failed to fetch coursework for course ${course.id}:`, e);
        }
      });
      await Promise.all(coursePromises);
      setClassroomCourseWork(courseworkMap);
    } catch (err) {
      console.error("Failed to fetch Google Classroom data:", err);
    } finally {
      setIsLoadingClassroom(false);
    }
  };

  const fetchDriveFilesData = async (token: string) => {
    setIsLoadingDrive(true);
    try {
      // Fetch user's Google Drive files (Docs, Sheets, Slides, and general files)
      const files = await listDriveFiles(token);
      setDriveFiles(files);
    } catch (err) {
      console.error("Failed to fetch Google Drive files:", err);
    } finally {
      setIsLoadingDrive(false);
    }
  };

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (googleToken) {
      fetchCalendarEvents(googleToken);
      fetchClassroomData(googleToken);
      fetchDriveFilesData(googleToken);
    } else {
      setCalendarEvents([]);
      setClassroomCourses([]);
      setClassroomCourseWork({});
      setDriveFiles([]);
    }
  }, [googleToken, currentTrack]);

  const handleGoogleSignIn = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setGoogleToken(result.accessToken);
      }
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await logout();
      setGoogleUser(null);
      setGoogleToken(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('mappy-custom-categories');
    return saved ? JSON.parse(saved) : [];
  });

  const getInitialSchedulesForTrack = (track: TrackType): ScheduleBlock[] => {
    const domains = TRACK_MACRO_DOMAINS[track] || ['General'];
    const d1 = domains[0] || 'General';
    const d2 = domains[1] || 'General';
    const d3 = domains[2] || 'General';
    
    return [
      { id: 'sb1', time: '09:00 AM - 09:45 AM', title: `Deep Focus Block: ${d1}`, project: d1, duration: 45 },
      { id: 'sb2', time: '10:00 AM - 10:45 AM', title: `Collaborative Session: ${d2}`, project: d2, duration: 45 },
      { id: 'sb3', time: '11:00 AM - 11:45 AM', title: `Practical/Lab Work: ${d3}`, project: d3, duration: 45 },
      { id: 'sb4', time: '02:00 PM - 02:45 PM', title: 'Comprehensive revision sprint', project: 'General', duration: 45 },
    ];
  };

  const [schedules, setSchedules] = useState<ScheduleBlock[]>(() => {
    const saved = localStorage.getItem('mappy-schedules');
    if (saved) return JSON.parse(saved);
    const savedTrack = (localStorage.getItem('mappy-current-track') as TrackType) || 'High School';
    return getInitialSchedulesForTrack(savedTrack);
  });

  const handleAddScheduleBlock = (block: Omit<ScheduleBlock, 'id'>) => {
    const newBlock: ScheduleBlock = {
      ...block,
      id: 'sb_' + Date.now(),
      isCustom: true
    };
    setSchedules(prev => [...prev, newBlock]);
  };

  const handleDeleteScheduleBlock = (id: string) => {
    setSchedules(prev => prev.filter(b => b.id !== id));
  };

  const handleEditScheduleBlock = (id: string, updated: Partial<ScheduleBlock>) => {
    setSchedules(prev => prev.map(b => b.id === id ? { ...b, ...updated } : b));
  };

  const handleResetSchedules = () => {
    setSchedules(getInitialSchedulesForTrack(currentTrack));
  };

  const [scratchpadNotes, setScratchpadNotes] = useState<ScratchpadNote[]>(() => {
    const saved = localStorage.getItem('mappy-scratchpad-notes');
    return saved ? JSON.parse(saved) : [];
  });

  const handleAddScratchpadNote = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newNote: ScratchpadNote = {
      id: 'note_' + Date.now(),
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })
    };
    setScratchpadNotes(prev => [newNote, ...prev]);
  };

  const handleDeleteScratchpadNote = (id: string) => {
    setScratchpadNotes(prev => prev.filter(n => n.id !== id));
  };

  const handleEditScratchpadNote = (id: string, newText: string) => {
    const trimmed = newText.trim();
    if (!trimmed) return;
    setScratchpadNotes(prev => prev.map(n => n.id === id ? { ...n, text: trimmed } : n));
  };

  const handleAddCustomCategory = (category: string) => {
    const trimmed = category.trim();
    if (trimmed && !customCategories.includes(trimmed)) {
      setCustomCategories(prev => [...prev, trimmed]);
    }
  };

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('mappy-tasks');
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });

  const [chatHistories, setChatHistories] = useState<Record<Theme, Message[]>>(() => {
    const saved = localStorage.getItem('mappy-chat-histories');
    if (saved) return JSON.parse(saved);

    return {
      'Ghar Jaisa': [DEFAULT_WELCOME_MESSAGES['Ghar Jaisa']],
      'Level Up': [DEFAULT_WELCOME_MESSAGES['Level Up']],
      'Clean Slate': [DEFAULT_WELCOME_MESSAGES['Clean Slate']],
      'Serious': [DEFAULT_WELCOME_MESSAGES['Serious']]
    };
  });

  // Gamification States
  const [xp, setXp] = useState<number>(() => {
    return Number(localStorage.getItem('mappy-xp')) || 35;
  });
  const [level, setLevel] = useState<number>(() => {
    return Number(localStorage.getItem('mappy-level')) || 4;
  });
  const [streak, setStreak] = useState<number>(() => {
    return Number(localStorage.getItem('mappy-streak')) || 5;
  });

  // Settings Configurations
  const [muteVoice, setMuteVoice] = useState<boolean>(() => {
    return localStorage.getItem('mappy-setting-mute') === 'true';
  });
  const [dailyReminders, setDailyReminders] = useState<boolean>(() => {
    return localStorage.getItem('mappy-setting-remind') !== 'false';
  });
  const [compactTaskView, setCompactTaskView] = useState<boolean>(() => {
    return localStorage.getItem('mappy-setting-compact') === 'true';
  });

  // UI Control States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'progress' | 'chat' | 'settings' | 'account'>('home');
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string | null>(null);
  const [showMobileConfig, setShowMobileConfig] = useState(false);

  // Chat/Input states
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeSeriousness, setActiveSeriousness] = useState<Seriousness>('Medium');
  const [newTaskText, setNewTaskText] = useState('');
  const [drawerNoteText, setDrawerNoteText] = useState('');
  const [drawerShowSaveSuccess, setDrawerShowSaveSuccess] = useState(false);

  // Pomodoro custom configuration states
  const [customFocusDuration, setCustomFocusDuration] = useState<number>(25);
  const [customFocusUnit, setCustomFocusUnit] = useState<'Minutes' | 'Hours'>('Minutes');
  const [enableMiddleBreaks, setEnableMiddleBreaks] = useState<boolean>(false);
  const [breakInterval, setBreakInterval] = useState<number>(25);
  const [breakDuration, setBreakDuration] = useState<number>(5);

  const [pomodoroMode, setPomodoroMode] = useState<'Work' | 'Break'>('Work');
  const [totalFocusSecondsRemaining, setTotalFocusSecondsRemaining] = useState(25 * 60);
  const [currentTimerSeconds, setCurrentTimerSeconds] = useState(25 * 60);
  const [pomodoroIsRunning, setPomodoroIsRunning] = useState(false);
  const [showFloatingBubble, setShowFloatingBubble] = useState(false);
  const [isBubbleMinimized, setIsBubbleMinimized] = useState(false);

  // Trigger floating bubble when focus timer starts running
  useEffect(() => {
    if (pomodoroIsRunning) {
      setShowFloatingBubble(true);
    }
  }, [pomodoroIsRunning]);

  // Derive minutes and seconds for the visible UI timer from currentTimerSeconds
  const pomodoroMinutes = Math.floor(currentTimerSeconds / 60);
  const pomodoroSeconds = currentTimerSeconds % 60;

  // Anti-Distraction warning toggles
  const [facedownReminder, setFacedownReminder] = useState(false);
  const [hideSocialNotice, setHideSocialNotice] = useState(false);

  // Voice simulator control states
  const [isListening, setIsListening] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  const activeChat = chatHistories[theme];

  // Cloud Data loading and synchronizing on login
  useEffect(() => {
    if (googleUser && googleUser.uid) {
      const loadCloudData = async () => {
        try {
          const cloudProfile = await getUserProfile(googleUser.uid);
          if (cloudProfile) {
            if (cloudProfile.currentTrack) setCurrentTrack(cloudProfile.currentTrack);
            if (cloudProfile.theme) setTheme(cloudProfile.theme);
            if (cloudProfile.languageOption) setLanguageOption(cloudProfile.languageOption);
            if (cloudProfile.breakdownMode) setBreakdownMode(cloudProfile.breakdownMode);
            if (cloudProfile.xp) setXp(cloudProfile.xp);
            if (cloudProfile.level) setLevel(cloudProfile.level);
            if (cloudProfile.streak) setStreak(cloudProfile.streak);
            if (cloudProfile.muteVoice !== undefined) setMuteVoice(cloudProfile.muteVoice);
            if (cloudProfile.dailyReminders !== undefined) setDailyReminders(cloudProfile.dailyReminders);
            if (cloudProfile.compactTaskView !== undefined) setCompactTaskView(cloudProfile.compactTaskView);
            if (cloudProfile.customCategories) setCustomCategories(cloudProfile.customCategories);
            if (cloudProfile.scratchpadNotes) setScratchpadNotes(cloudProfile.scratchpadNotes);
            if (cloudProfile.schedules && cloudProfile.schedules.length > 0) {
              setSchedules(cloudProfile.schedules);
            }
          } else {
            // First time sign-in: write local data to Firestore as template
            await saveUserProfile(googleUser.uid, {
              email: googleUser.email || '',
              displayName: googleUser.displayName || '',
              photoURL: googleUser.photoURL || '',
              currentTrack,
              theme,
              languageOption,
              breakdownMode,
              xp,
              level,
              streak,
              muteVoice,
              dailyReminders,
              compactTaskView,
              customCategories,
              scratchpadNotes,
              schedules
            });
          }

          const cloudTasks = await getUserTasksFromCloud(googleUser.uid);
          if (cloudTasks && cloudTasks.length > 0) {
            setTasks(cloudTasks);
          } else if (tasks.length > 0) {
            await syncLocalTasksToCloud(googleUser.uid, tasks);
          }
        } catch (err) {
          console.error("Failed to sync profile on load:", err);
        }
      };
      loadCloudData();
    }
  }, [googleUser]);

  // Local Storage Caches & Firestore Syncs
  useEffect(() => {
    localStorage.setItem('mappy-theme', theme);
    if (googleUser?.uid) saveUserProfile(googleUser.uid, { theme });
  }, [theme, googleUser]);

  useEffect(() => {
    localStorage.setItem('mappy-breakdown', breakdownMode);
    if (googleUser?.uid) saveUserProfile(googleUser.uid, { breakdownMode });
  }, [breakdownMode, googleUser]);

  useEffect(() => {
    localStorage.setItem('mappy-language', languageOption);
    if (googleUser?.uid) saveUserProfile(googleUser.uid, { languageOption });
  }, [languageOption, googleUser]);

  useEffect(() => {
    localStorage.setItem('mappy-current-track', currentTrack);
    if (googleUser?.uid) saveUserProfile(googleUser.uid, { currentTrack });
  }, [currentTrack, googleUser]);

  useEffect(() => {
    localStorage.setItem('mappy-custom-categories', JSON.stringify(customCategories));
    if (googleUser?.uid) saveUserProfile(googleUser.uid, { customCategories });
  }, [customCategories, googleUser]);

  useEffect(() => {
    localStorage.setItem('mappy-scratchpad-notes', JSON.stringify(scratchpadNotes));
    if (googleUser?.uid) saveUserProfile(googleUser.uid, { scratchpadNotes });
  }, [scratchpadNotes, googleUser]);

  useEffect(() => {
    localStorage.setItem('mappy-tasks', JSON.stringify(tasks));
    if (googleUser?.uid) {
      syncLocalTasksToCloud(googleUser.uid, tasks);
    }
  }, [tasks, googleUser]);

  useEffect(() => {
    localStorage.setItem('mappy-schedules', JSON.stringify(schedules));
    if (googleUser?.uid) saveUserProfile(googleUser.uid, { schedules });
  }, [schedules, googleUser]);

  useEffect(() => {
    localStorage.setItem('mappy-chat-histories', JSON.stringify(chatHistories));
  }, [chatHistories]);

  useEffect(() => {
    localStorage.setItem('mappy-xp', String(xp));
    localStorage.setItem('mappy-level', String(level));
    localStorage.setItem('mappy-streak', String(streak));
    if (googleUser?.uid) saveUserProfile(googleUser.uid, { xp, level, streak });
  }, [xp, level, streak, googleUser]);

  useEffect(() => {
    localStorage.setItem('mappy-setting-mute', String(muteVoice));
    localStorage.setItem('mappy-setting-remind', String(dailyReminders));
    localStorage.setItem('mappy-setting-compact', String(compactTaskView));
    if (googleUser?.uid) {
      saveUserProfile(googleUser.uid, { muteVoice, dailyReminders, compactTaskView });
    }
  }, [muteVoice, dailyReminders, compactTaskView, googleUser]);

  // Pomodoro Core Countdown
  useEffect(() => {
    let timer: any = null;
    if (pomodoroIsRunning) {
      timer = setInterval(() => {
        if (currentTimerSeconds > 0) {
          setCurrentTimerSeconds(prev => prev - 1);
          if (pomodoroMode === 'Work') {
            setTotalFocusSecondsRemaining(prev => Math.max(0, prev - 1));
          }
        } else {
          // currentTimerSeconds is 0!
          if (pomodoroMode === 'Work') {
            if (totalFocusSecondsRemaining <= 0) {
              // Overall focus session is 100% complete!
              playBeep('work-complete');
              setPomodoroIsRunning(false);
              setPomodoroMode('Work');
              
              // Reset values to initial custom config
              const totalMins = customFocusUnit === 'Hours' ? Math.round(customFocusDuration * 60) : customFocusDuration;
              const totalSecs = totalMins * 60;
              setTotalFocusSecondsRemaining(totalSecs);
              const firstSegment = enableMiddleBreaks ? Math.min(totalSecs, breakInterval * 60) : totalSecs;
              setCurrentTimerSeconds(firstSegment);

              // Celebration notifications based on Theme and Language
              let celebrationText = '';
              if (languageOption === 'Hindi') {
                celebrationText = theme === 'Ghar Jaisa'
                  ? `[MAA] अरे वाह बेटा! तुमने पूरा ${totalMins} मिनट का ध्यान सत्र सफलतापूर्वक समाप्त कर लिया! मुझे तुम पर बहुत गर्व है। बहुत ही शानदार काम किया है!`
                  : `[PAPA] असाधारण अनुशासन, बेटा! फोकस सत्र समाप्त हुआ। पूरे ${totalMins} मिनट तक बिना विचलित हुए पढ़ना एक सच्चे योद्धा की निशानी है।`;
              } else if (languageOption === 'Hinglish') {
                celebrationText = theme === 'Ghar Jaisa'
                  ? `[MAA] Beta, you completed the full ${totalMins} minutes study session successfully! Mujhe tum par bohot bohot proud hai. Chalo, ab thoda relax karo, accha?`
                  : `[PAPA] Magnificent work! Session completed: ${totalMins} minutes. High discipline verified. You maintained zero distraction flawlessly! Keep this energy up!`;
              } else {
                celebrationText = theme === 'Ghar Jaisa'
                  ? `[MAA] Splendid job, dear! You completed the entire ${totalMins} minutes focus block! I am immensely proud of your dedication and focus today.`
                  : `[PAPA] Mission Accomplished: ${totalMins} minutes of concentrated work completed. Exceptional executive stamina. Keep this bar high, trooper!`;
              }

              const systemMsg: Message = {
                id: 'pomodoro-complete-sys-' + Date.now(),
                sender: 'model',
                text: celebrationText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };

              setChatHistories(prev => ({
                ...prev,
                [theme]: [...prev[theme], systemMsg]
              }));

              // Award XP points in Level Up
              if (theme === 'Level Up') {
                setXp(currentXp => {
                  const nextXp = currentXp + 50; // Big focus gives 50 XP
                  if (nextXp >= 100) {
                    setLevel(l => l + 1);
                    playBeep('level-up');
                    return nextXp - 100;
                  }
                  return nextXp;
                });
              }

              setActiveTab('chat');
            } else if (enableMiddleBreaks) {
              // Time for a scheduled middle break!
              playBeep('success');
              setPomodoroMode('Break');
              setCurrentTimerSeconds(breakDuration * 60);

              let breakText = '';
              if (languageOption === 'Hindi') {
                breakText = `[MAA] बेटा, लगातार पढ़ाई के बीच में छोटा सा ब्रेक लेना बहुत ज़रूरी है। चलो ${breakDuration} मिनट के लिए खड़े हो जाओ, पानी पी लो और थोड़ा घूम लो, अच्छा?`;
              } else if (languageOption === 'Hinglish') {
                breakText = `[MAA] Beta, long study sessions ke beech me minor breaks are necessary. Chalo ${breakDuration} minutes ka break le lo. Drink some water and stretch a bit, accha?`;
              } else {
                breakText = `[MAA] Time for a refreshing break, dear! Your study segment is complete. Stand up, rest your eyes, and stretch for ${breakDuration} minutes.`;
              }

              const systemMsg: Message = {
                id: 'pomodoro-break-sys-' + Date.now(),
                sender: 'model',
                text: breakText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };

              setChatHistories(prev => ({
                ...prev,
                [theme]: [...prev[theme], systemMsg]
              }));
              setActiveTab('chat');
            } else {
              // Breaks not enabled but timer hit 0? This triggers completion
              setTotalFocusSecondsRemaining(0);
            }
          } else {
            // Break mode ended! Time to focus again.
            playBeep('work-complete');
            setPomodoroMode('Work');
            const nextWorkSegment = Math.min(totalFocusSecondsRemaining, breakInterval * 60);
            setCurrentTimerSeconds(nextWorkSegment);

            let resumeText = '';
            if (languageOption === 'Hindi') {
              resumeText = `[PAPA] ब्रेक खत्म, बेटा! अब पूरी ऊर्जा के साथ वापस पढ़ाई पर ध्यान दो। सोशल मीडिया बंद होना चाहिए!`;
            } else if (languageOption === 'Hinglish') {
              resumeText = `[PAPA] Break is over, trooper! Let's resume the focus block. Lock all distractions and get back to work!`;
            } else {
              resumeText = `[PAPA] Break time has concluded. Let's resume the focus session with maximum intensity. Put distractions away immediately!`;
            }

            const systemMsg: Message = {
              id: 'pomodoro-resume-sys-' + Date.now(),
              sender: 'model',
              text: resumeText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setChatHistories(prev => ({
              ...prev,
              [theme]: [...prev[theme], systemMsg]
            }));
            setActiveTab('chat');
          }
        }
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [
    pomodoroIsRunning, 
    currentTimerSeconds, 
    pomodoroMode, 
    totalFocusSecondsRemaining, 
    enableMiddleBreaks, 
    breakInterval, 
    breakDuration, 
    customFocusDuration, 
    customFocusUnit, 
    theme, 
    languageOption
  ]);

  // Sound Synth Beeps
  const playBeep = (type: 'success' | 'level-up' | 'work-complete') => {
    if (muteVoice) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.15);
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'level-up') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.5);
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === 'work-complete') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.3);
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.warn("Audio Context restricted:", e);
    }
  };

  // Simple client-side micro-step fallback generator
  const getClientFallbackSteps = (text: string, project: string): string[] => {
    const lower = text.toLowerCase();
    
    if (lower.includes("neural") || lower.includes("deep learning") || lower.includes("machine learning") || lower.includes("ai")) {
      return [
        "Review mathematical foundations of backpropagation",
        "Diagram a single hidden layer architecture",
        "Code a basic activation function"
      ];
    }
    if (lower.includes("calculus") || lower.includes("integration") || lower.includes("limit") || lower.includes("derivative")) {
      return [
        "Identify core boundary rules and standard formulas",
        "Solve 3 practice integration worksheets step-by-step",
        "Check answers against a calculator/solver to verify"
      ];
    }
    if (lower.includes("biology") || lower.includes("cell") || lower.includes("nervous") || lower.includes("mitosis")) {
      return [
        "Review definitions and cell anatomy from chapter",
        "Draw and label cell structures or neuron pathways",
        "Test active recall by explaining aloud"
      ];
    }
    if (lower.includes("history") || lower.includes("revolution") || lower.includes("essay") || lower.includes("outline")) {
      return [
        "Identify major historical triggers, figures and timeline",
        "Draft a structured 3-part essay outline",
        "Conduct a final spelling and grammar checklist pass"
      ];
    }

    const sub = (project || "General").toLowerCase();
    if (sub.includes("math") || sub.includes("calc")) {
      return [
        `Review key formulas and axioms relevant to ${text}`,
        `Deconstruct 3 step-by-step textbook exercises`,
        `Attempt 2 exam-style problems under timed study`
      ];
    }
    if (sub.includes("scien") || sub.includes("biolo") || sub.includes("chem") || sub.includes("physic")) {
      return [
        `Study the core theoretical laws explaining ${text}`,
        `Deconstruct diagram representations or equations`,
        `Formulate a quick summary flashcard detailing principles`
      ];
    }
    return [
      "Survey core principles and definitions of " + text,
      "Draft a structured summary list or cheat-sheet in scratchpad",
      "Explain the key concepts aloud to test understanding"
    ];
  };

  const expandTaskWithAI = async (taskId: string, text: string, project: string, seriousness: Seriousness) => {
    try {
      const response = await fetch('/api/expand-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          project,
          seriousness,
          track: currentTrack
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.steps && Array.isArray(data.steps)) {
          const generatedMicroSteps = data.steps.map((stepText: string, idx: number) => ({
            id: `micro-${taskId}-${idx}-${Date.now()}`,
            text: stepText,
            completed: false
          }));
          setTasks(prev => prev.map(t => {
            if (t.id === taskId) {
              return { ...t, microSteps: generatedMicroSteps };
            }
            return t;
          }));
        }
      }
    } catch (err) {
      console.warn("Failed to expand task with AI, keeping fallbacks:", err);
    }
  };

  const handleInitializeTaskSteps = (taskId: string) => {
    setTasks(prev => {
      // Find the target task first
      const target = prev.find(t => t.id === taskId);
      if (!target) return prev;
      
      // If microSteps is already populated, do nothing
      if (target.microSteps && target.microSteps.length > 0) return prev;

      const fallbackSteps = getClientFallbackSteps(target.text, target.project || 'General').map((sText, idx) => ({
        id: `micro-${taskId}-${idx}-${Date.now()}`,
        text: sText,
        completed: false
      }));

      // Trigger asynchronous AI task expansion
      expandTaskWithAI(taskId, target.text, target.project || 'General', target.seriousness);

      return prev.map(t => {
        if (t.id === taskId) {
          return { ...t, microSteps: fallbackSteps };
        }
        return t;
      });
    });
  };

  // Chat Checklist Parser
  const parseAndInjectSteps = (text: string) => {
    const lines = text.split('\n');
    const newTasks: Task[] = [];
    
    for (const line of lines) {
      const match = line.match(/^[\s*-]*\[\s*\]\s*(.+)$/);
      if (match) {
        const stepText = match[1].trim();
        if (!tasks.some(t => t.text.toLowerCase() === stepText.toLowerCase())) {
          const taskId = 'extracted-' + Math.random().toString(36).substring(2, 9);
          const initialSteps = getClientFallbackSteps(stepText, selectedProjectFilter || 'General').map((sText, idx) => ({
            id: `micro-${taskId}-${idx}-${Date.now()}`,
            text: sText,
            completed: false
          }));

          newTasks.push({
            id: taskId,
            text: stepText,
            completed: false,
            seriousness: activeSeriousness,
            project: selectedProjectFilter || 'General',
            createdAt: new Date().toISOString(),
            microSteps: initialSteps
          });
          
          expandTaskWithAI(taskId, stepText, selectedProjectFilter || 'General', activeSeriousness);
        }
      }
    }

    if (newTasks.length > 0) {
      setTasks(prev => [...prev, ...newTasks]);
      playBeep('success');
    }
  };

  const handleToggleMicroStep = (taskId: string, microStepId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedSteps = (t.microSteps || []).map(ms => {
          if (ms.id === microStepId) {
            return { ...ms, completed: !ms.completed };
          }
          return ms;
        });
        playBeep('success');
        return { ...t, microSteps: updatedSteps };
      }
      return t;
    }));
  };

  const handleAddMicroStep = (taskId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const newStep = {
          id: `micro-manual-${Date.now()}`,
          text: trimmed,
          completed: false
        };
        return { ...t, microSteps: [...(t.microSteps || []), newStep] };
      }
      return t;
    }));
    playBeep('success');
  };

  const handleEditMicroStep = (taskId: string, microStepId: string, newText: string) => {
    const trimmed = newText.trim();
    if (!trimmed) return;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updated = (t.microSteps || []).map(ms => {
          if (ms.id === microStepId) {
            return { ...ms, text: trimmed };
          }
          return ms;
        });
        return { ...t, microSteps: updated };
      }
      return t;
    }));
  };

  const handleDeleteMicroStep = (taskId: string, microStepId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, microSteps: (t.microSteps || []).filter(ms => ms.id !== microStepId) };
      }
      return t;
    }));
  };

  const handleUpdateTaskMicroSteps = (taskId: string, steps: { id: string; text: string; completed: boolean }[]) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, microSteps: steps };
      }
      return t;
    }));
    playBeep('success');
  };

  // Submit chat message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputValue;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...activeChat, userMsg];

    setChatHistories(prev => ({
      ...prev,
      [theme]: updatedHistory
    }));
    
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory,
          theme,
          breakdownMode,
          seriousness: activeSeriousness,
          currentTasks: tasks,
          languageOption
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to talk to Mappy.");
      }

      const data = await response.json();
      const replyText = data.text;

      const aiMsg: Message = {
        id: 'msg-ai-' + Date.now(),
        sender: 'model',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatHistories(prev => ({
        ...prev,
        [theme]: [...prev[theme], aiMsg]
      }));

      if (breakdownMode === 'AUTO') {
        parseAndInjectSteps(replyText);
      }

    } catch (err: any) {
      console.error(err);
      const errMsg: Message = {
        id: 'msg-err-' + Date.now(),
        sender: 'model',
        text: `[SYSTEM ERROR] ${err.message || "Failed to contact Mappy's brain. Verify your API Key."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistories(prev => ({
        ...prev,
        [theme]: [...prev[theme], errMsg]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Create customized task with project association
  const handleAddTaskWithParams = (text: string, project: string, seriousness: Seriousness) => {
    const taskId = 'task-' + Date.now();
    const initialSteps = getClientFallbackSteps(text, project).map((sText, idx) => ({
      id: `micro-${taskId}-${idx}-${Date.now()}`,
      text: sText,
      completed: false
    }));

    const task: Task = {
      id: taskId,
      text: text,
      completed: false,
      seriousness: seriousness,
      project: project,
      createdAt: new Date().toISOString(),
      microSteps: initialSteps
    };
    
    setTasks(prev => [task, ...prev]);
    playBeep('success');

    // Trigger asynchronous AI task expansion
    expandTaskWithAI(taskId, text, project, seriousness);
  };

  // Checkbox interactions
  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextCompleted = !t.completed;
        
        if (nextCompleted && theme === 'Level Up') {
          // Extra XP points logic
          const xpGained = t.seriousness === 'High' ? 40 : t.seriousness === 'Medium' ? 25 : 15;
          setXp(currentXp => {
            const nextXp = currentXp + xpGained;
            if (nextXp >= 100) {
              setLevel(l => l + 1);
              playBeep('level-up');
              setTimeout(() => {
                const systemMsg: Message = {
                  id: 'levelup-sys-' + Date.now(),
                  sender: 'model',
                  text: `[PAPA] COMPLETED CHECKPOINT! +${xpGained} XP! Magnificent discipline. Warrior reached Level ${level + 1}! Conquering dungeons, one step at a time.`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setChatHistories(p => ({ ...p, [theme]: [...p[theme], systemMsg] }));
              }, 600);
              return nextXp - 100;
            } else {
              playBeep('success');
              return nextXp;
            }
          });
        } else if (nextCompleted) {
          playBeep('success');
        }

        return { ...t, completed: nextCompleted };
      }
      return t;
    }));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleClearCompleted = () => {
    setTasks(prev => prev.filter(t => !t.completed));
  };

  // Reset Pomodoro timer based on active settings
  const resetPomodoro = () => {
    setPomodoroIsRunning(false);
    setPomodoroMode('Work');
    const totalMins = customFocusUnit === 'Hours' ? Math.round(customFocusDuration * 60) : customFocusDuration;
    const totalSecs = totalMins * 60;
    setTotalFocusSecondsRemaining(totalSecs);
    const firstSegment = (enableMiddleBreaks && totalMins >= 25) 
      ? Math.min(totalSecs, breakInterval * 60)
      : totalSecs;
    setCurrentTimerSeconds(firstSegment);
    setShowFloatingBubble(false);
    setIsBubbleMinimized(false);
  };

  // Launch Pomodoro timer from Scheduler
  const handleStartFocusFromScheduler = (topic: string, durationMinutes: number) => {
    setCustomFocusDuration(durationMinutes);
    setCustomFocusUnit('Minutes');
    setEnableMiddleBreaks(durationMinutes >= 25);
    setBreakInterval(25);
    setBreakDuration(5);

    const totalSecs = durationMinutes * 60;
    setTotalFocusSecondsRemaining(totalSecs);
    const firstSegment = durationMinutes >= 25 
      ? Math.min(totalSecs, 25 * 60)
      : totalSecs;
    setCurrentTimerSeconds(firstSegment);
    setPomodoroMode('Work');
    setPomodoroIsRunning(true);
    playBeep('success');

    // Inform Mappy of active task
    const systemNotice: Message = {
      id: 'start-focus-' + Date.now(),
      sender: 'model',
      text: theme === 'Ghar Jaisa' 
        ? `[MAA] Shabaash beta! Let's study "${topic}" for ${durationMinutes} minutes. Maa is praying for your focus. No scrolling, accha?`
        : `[PAPA] Study Sprint Launched: "${topic}". Pomodoro set for ${durationMinutes} minutes. Phone face down. Focus!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistories(prev => ({
      ...prev,
      [theme]: [...prev[theme], systemNotice]
    }));

    // Alert overlay details
    if (facedownReminder) {
      alert(`[Mappy Shield]: Study sprint initialized for "${topic}". Put your phone face-down immediately!`);
    }
  };

  // Distraction confess trigger
  const handleConfessDistraction = () => {
    const confessionText = theme === 'Ghar Jaisa'
      ? "Maa, I got distracted and scrolled on my phone..."
      : theme === 'Level Up'
        ? "Mappy, my focus broke and I wandered off quest path..."
        : theme === 'Clean Slate'
          ? "Mentor, I was unfocused."
          : "Papa, I got distracted by social media...";

    setActiveTab('chat');
    handleSendMessage(confessionText);
  };

  // Helper to optimize vocal transcript text
  const optimizeVocalTranscript = (rawTranscript: string): string => {
    let cleaned = rawTranscript;
    
    // Remove common verbal fillers/artifacts
    const fillers = [
      /\bum+\b/gi, /\buh+\b/gi, /\beh+\b/gi, /\berr+\b/gi, 
      /\blike\b/gi, /\byou know\b/gi, /\bactually\b/gi, 
      /\bbasically\b/gi, /\bso,?\b/gi, /\bhm+\b/gi, /\bah+\b/gi
    ];
    
    fillers.forEach(regex => {
      cleaned = cleaned.replace(regex, '');
    });
    
    // Clean multiple spaces and trim
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Capitalize first letter
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
    
    return cleaned;
  };

  const recognitionRef = useRef<any>(null);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Web speech microphone simulation
  const startVoiceInput = () => {
    if (isListening) {
      // Toggle off if already listening
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error("Error stopping recognition:", e);
        }
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionError("Web Speech API is blocked or not supported inside this preview iframe container. Try these simulator templates:");
      setIsListening(true);
      return;
    }

    setRecognitionError(null);
    setIsListening(true);
    
    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      // Set speech language adaptively based on chosen language option
      recognition.lang = languageOption === 'Hindi' ? 'hi-IN' : (languageOption === 'Hinglish' ? 'hi-IN' : 'en-US');
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let accumulated = '';
        for (let i = 0; i < event.results.length; i++) {
          accumulated += event.results[i][0].transcript + ' ';
        }
        const trimmed = accumulated.trim();
        if (trimmed) {
          const optimized = optimizeVocalTranscript(trimmed);
          setInputValue(optimized);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech error:", event.error);
        const errType = event.error;
        if (errType === 'not-allowed') {
          setRecognitionError("Microphone access is blocked or denied. Please grant microphone permissions in your browser or phone settings, then try again.");
        } else if (errType === 'no-speech') {
          // Do not crash or quit on no-speech in continuous mode, just log it or notify
        } else {
          setRecognitionError(`Speech recognition error (${errType}). You can also use the manual template buttons below to simulate inputs:`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
      recognitionRef.current = null;
    }
  };

  // Universal Stats calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Tabs structure for Bottom Mobile navigation
  const mobileNavTabs = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'progress' as const, label: 'Progress', icon: BarChart2 },
    { id: 'chat' as const, label: 'Chat', icon: MessageSquare },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
    { id: 'account' as const, label: 'Profile', icon: User },
  ];

  return (
    <div className="bg-[#FAFAFA] text-[#0A1128] font-sans flex flex-col h-screen overflow-hidden" id="mappy-app-root">
      
      {/* ========================================================= */}
      {/* LAPTOP & TABLET VIEWPORT LAYOUT */}
      {/* ========================================================= */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Vertical Sidebar (Hidden on Mobile) */}
        <div className="hidden lg:block flex-shrink-0">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            streak={streak}
            level={level}
            xp={xp}
            completionPercentage={completionPercentage}
            theme={theme}
            pomodoroMinutes={pomodoroMinutes}
            pomodoroSeconds={pomodoroSeconds}
            pomodoroIsRunning={pomodoroIsRunning}
            setPomodoroIsRunning={setPomodoroIsRunning}
            pomodoroMode={pomodoroMode}
            resetPomodoro={resetPomodoro}
            confessDistraction={handleConfessDistraction}
            customFocusDuration={customFocusDuration}
            setCustomFocusDuration={setCustomFocusDuration}
            customFocusUnit={customFocusUnit}
            setCustomFocusUnit={setCustomFocusUnit}
            enableMiddleBreaks={enableMiddleBreaks}
            setEnableMiddleBreaks={setEnableMiddleBreaks}
            breakInterval={breakInterval}
            setBreakInterval={setBreakInterval}
            breakDuration={breakDuration}
            setBreakDuration={setBreakDuration}
            onAddNote={handleAddScratchpadNote}
          />
        </div>

        {/* Main Workspace Frame container */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          
          {/* Top Header Row for Welcome/Streak Badge in Small Screens & Mobile Drawer Triggers */}
          <header className="h-16 px-4 bg-white border-b border-stone-100 flex items-center justify-between lg:px-6 flex-shrink-0">
            <div className="flex items-center gap-3">
              {/* Sidebar toggle button (Mobile only) */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                aria-label="Open Navigation drawer"
              >
                <Menu className="w-5.5 h-5.5 text-[#0A1128]" />
              </button>

              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#0EA5E9] animate-bounce"></span>
                <span className="font-space font-black tracking-widest text-lg text-[#0A1128]">MAPPY</span>
                <span className="text-[9px] font-mono text-stone-500 font-bold uppercase hidden sm:inline">STUDY BUDDY</span>
              </div>
            </div>

            {/* General streak alerts & metrics info in Header */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-orange-50 border border-orange-100 rounded-full px-2.5 py-1 text-[11px] font-bold text-orange-600">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                <span>{streak} DAY STREAK</span>
              </div>

              {theme === 'Ghar Jaisa' && (
                <div className="hidden sm:flex items-center gap-1 text-rose-500 text-xs font-semibold">
                  <Heart className="w-3.5 h-3.5 fill-rose-500" />
                  <span>Maa's Joy: {completionPercentage}%</span>
                </div>
              )}

              <button
                onClick={() => {
                  setActiveTab('account');
                  playBeep('success');
                }}
                className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-stone-50 border border-stone-200 rounded-full text-[11px] font-bold text-stone-700 transition cursor-pointer active:scale-95 ml-1 shadow-xs"
              >
                {googleUser ? (
                  <>
                    {googleUser.photoURL ? (
                      <img 
                        src={googleUser.photoURL} 
                        alt="Profile" 
                        referrerPolicy="no-referrer"
                        className="w-4.5 h-4.5 rounded-full border border-indigo-100"
                      />
                    ) : (
                      <div className="w-4.5 h-4.5 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#0EA5E9] flex items-center justify-center text-[9px] text-white font-black">
                        {googleUser.displayName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="hidden md:inline max-w-[80px] truncate">{googleUser.displayName?.split(' ')[0] || 'Profile'}</span>
                  </>
                ) : (
                  <>
                    <User className="w-3.5 h-3.5 text-stone-500" />
                    <span>Log In</span>
                  </>
                )}
              </button>
            </div>
          </header>

          {/* Core Panel Content Screen */}
          <div className="flex-1 overflow-y-auto bg-[#FAFAFA] min-h-0 relative no-scrollbar">
            {activeTab === 'home' && (
              <HomeView
                tasks={tasks}
                toggleTask={handleToggleTask}
                deleteTask={handleDeleteTask}
                theme={theme}
                streak={streak}
                level={level}
                xp={xp}
                completionPercentage={completionPercentage}
                activeSeriousness={activeSeriousness}
                setActiveSeriousness={setActiveSeriousness}
                newTaskText={newTaskText}
                setNewTaskText={setNewTaskText}
                handleAddTaskWithParams={handleAddTaskWithParams}
                handleClearCompleted={handleClearCompleted}
                compactTaskView={compactTaskView}
                startFocus={handleStartFocusFromScheduler}
                onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
                selectedProjectFilter={selectedProjectFilter}
                setSelectedProjectFilter={setSelectedProjectFilter}
                onConfessDistraction={handleConfessDistraction}
                currentTrack={currentTrack}
                setCurrentTrack={setCurrentTrack}
                customCategories={customCategories}
                onAddCustomCategory={handleAddCustomCategory}
                onToggleMicroStep={handleToggleMicroStep}
                onAddMicroStep={handleAddMicroStep}
                onEditMicroStep={handleEditMicroStep}
                onDeleteMicroStep={handleDeleteMicroStep}
                onInitializeTaskSteps={handleInitializeTaskSteps}
                onUpdateTaskMicroSteps={handleUpdateTaskMicroSteps}
                googleUser={googleUser}
                googleToken={googleToken}
                onGoogleSignIn={handleGoogleSignIn}
                onSyncTaskToCalendar={handleSyncTaskToCalendar}
                isSyncingTask={isSyncingTask}
                classroomCourses={classroomCourses}
                classroomCourseWork={classroomCourseWork}
                isLoadingClassroom={isLoadingClassroom}
                schedules={schedules}
                onAddScheduleBlock={handleAddScheduleBlock}
                onDeleteScheduleBlock={handleDeleteScheduleBlock}
                onEditScheduleBlock={handleEditScheduleBlock}
                onResetSchedules={handleResetSchedules}
              />
            )}

            {activeTab === 'progress' && (
              <ProgressView
                tasks={tasks}
                streak={streak}
                level={level}
                xp={xp}
                theme={theme}
                currentTrack={currentTrack}
                customCategories={customCategories}
              />
            )}

            {activeTab === 'chat' && (
              <ChatView
                activeChat={activeChat}
                inputValue={inputValue}
                setInputValue={setInputValue}
                handleSendMessage={handleSendMessage}
                isLoading={isLoading}
                theme={theme}
                isListening={isListening}
                startVoiceInput={startVoiceInput}
                recognitionError={recognitionError}
                setIsListening={setIsListening}
                onClearHistory={() => {
                  if (confirm("Reset conversation history for this active theme?")) {
                    setChatHistories(prev => ({
                      ...prev,
                      [theme]: [DEFAULT_WELCOME_MESSAGES[theme]]
                    }));
                  }
                }}
                onConfessDistraction={handleConfessDistraction}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                theme={theme}
                setTheme={(newTheme) => {
                  setTheme(newTheme);
                  // Push welcome message of new alignment to histories
                  const welcomeMsg = DEFAULT_WELCOME_MESSAGES[newTheme];
                  setChatHistories(prev => ({
                    ...prev,
                    [newTheme]: [
                      ...prev[newTheme].filter(m => m.id !== welcomeMsg.id),
                      welcomeMsg
                    ]
                  }));
                }}
                breakdownMode={breakdownMode}
                setBreakdownMode={setBreakdownMode}
                languageOption={languageOption}
                setLanguageOption={setLanguageOption}
                muteVoice={muteVoice}
                setMuteVoice={setMuteVoice}
                dailyReminders={dailyReminders}
                setDailyReminders={setDailyReminders}
                compactTaskView={compactTaskView}
                setCompactTaskView={setCompactTaskView}
                facedownReminder={facedownReminder}
                setFacedownReminder={setFacedownReminder}
                hideSocialNotice={hideSocialNotice}
                setHideSocialNotice={setHideSocialNotice}
                onClearHistory={() => {
                  if (confirm("Reset conversation history?")) {
                    setChatHistories({
                      'Ghar Jaisa': [DEFAULT_WELCOME_MESSAGES['Ghar Jaisa']],
                      'Level Up': [DEFAULT_WELCOME_MESSAGES['Level Up']],
                      'Clean Slate': [DEFAULT_WELCOME_MESSAGES['Clean Slate']],
                      'Serious': [DEFAULT_WELCOME_MESSAGES['Serious']]
                    });
                  }
                }}
                scratchpadNotes={scratchpadNotes}
                onDeleteNote={handleDeleteScratchpadNote}
                onEditNote={handleEditScratchpadNote}
                googleUser={googleUser}
                googleToken={googleToken}
                onGoogleSignIn={handleGoogleSignIn}
                onGoogleLogout={handleGoogleLogout}
                calendarEvents={calendarEvents}
                driveFiles={driveFiles}
                isLoadingDrive={isLoadingDrive}
                onRefreshDrive={() => {
                  if (googleToken) fetchDriveFilesData(googleToken);
                }}
              />
            )}

            {activeTab === 'account' && (
              <div className="p-6">
                <AuthView
                  googleUser={googleUser}
                  onGoogleSignIn={handleGoogleSignIn}
                  onGoogleLogout={handleGoogleLogout}
                  streak={streak}
                  xp={xp}
                  level={level}
                />
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* MOBILE-FIRST RESPONSIVE BOTTOM NAVIGATION BAR */}
      {/* ========================================================= */}
      <nav className="lg:hidden sticky bottom-0 left-0 right-0 z-40 border-t py-1.5 px-3 flex items-center justify-around bg-white border-stone-150 shadow-lg select-none flex-shrink-0">
        {mobileNavTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                playBeep('success');
              }}
              className={`flex-1 min-h-[48px] flex flex-col items-center justify-center gap-0.5 transition-all duration-300 py-1 px-1 rounded-xl cursor-pointer relative ${
                isActive
                  ? 'text-[#6366F1] scale-105 font-bold'
                  : 'text-stone-500 hover:text-stone-700 font-medium'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              <span className="text-[9px] tracking-wide uppercase font-space">{tab.label}</span>
              {/* Active accent line styled with the purple-to-sky-blue gradient */}
              {isActive && (
                <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-[#7C3AED] to-[#0EA5E9] rounded-full"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* ========================================================= */}
      {/* NEW ROADMAP OBJECTIVE CREATION MODAL */}
      {/* ========================================================= */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        activeSeriousness={activeSeriousness}
        setActiveSeriousness={setActiveSeriousness}
        handleAddTaskWithParams={handleAddTaskWithParams}
        currentTrack={currentTrack}
        setCurrentTrack={setCurrentTrack}
        customCategories={customCategories}
        onAddCustomCategory={handleAddCustomCategory}
      />

      {/* ========================================================= */}
      {/* SLIDING MOBILE NAVIGATION DRAWER */}
      {/* ========================================================= */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" id="mobile-navigation-drawer">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsSidebarOpen(false)}
          ></div>
          
          <div className="relative flex flex-col w-72 max-w-[80vw] h-full p-6 shadow-2xl transition-all duration-300 transform bg-gradient-to-b from-[#7C3AED] via-[#6366F1] to-[#0EA5E9] text-white">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition cursor-pointer"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
              <span className="text-xl animate-slow-bounce inline-block">🎓</span>
              <h2 className="text-sm font-space font-extrabold uppercase tracking-wider">Mappy Explorer</h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6">
              {/* Profile details in Drawer */}
              <div className="bg-white/10 border border-white/10 p-4 rounded-xl space-y-2">
                <span className="text-[9px] font-space font-extrabold text-purple-200 uppercase tracking-widest block">Active Student Profiler</span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white text-[#6366F1] flex items-center justify-center text-lg font-bold">
                    🎓
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Active Student</span>
                    <span className="text-[10px] text-purple-100 font-mono block">Rank: Level {level}</span>
                  </div>
                </div>
              </div>

              {/* Pomodoro controls in Drawer */}
              <div className="bg-white/10 border border-white/10 p-4 rounded-xl space-y-3 text-center">
                <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-purple-200">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> POMODORO</span>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setShowMobileConfig(!showMobileConfig)}
                      className="p-1 hover:bg-white/10 rounded transition text-purple-200 hover:text-white"
                      title="Configure Focus Timer"
                    >
                      <Settings className="w-3.5 h-3.5 text-purple-200 hover:text-yellow-300" />
                    </button>
                    <span className={`px-1.5 py-0.5 text-[8px] rounded font-bold ${pomodoroMode === 'Work' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                      {pomodoroMode}
                    </span>
                  </div>
                </div>

                {!showMobileConfig ? (
                  <>
                    <div className="font-mono text-2xl font-black">
                      {String(pomodoroMinutes).padStart(2, '0')}:{String(pomodoroSeconds).padStart(2, '0')}
                    </div>
                    <div className="flex justify-center gap-1.5 pt-1">
                      <button
                        onClick={() => { setPomodoroIsRunning(!pomodoroIsRunning); setIsSidebarOpen(false); }}
                        className="bg-white text-[#6366F1] font-bold text-[10px] px-3 py-1.5 rounded-lg transition active:scale-95"
                      >
                        {pomodoroIsRunning ? 'Pause' : 'Start'}
                      </button>
                      <button
                        onClick={resetPomodoro}
                        className="border border-white/20 hover:bg-white/10 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg"
                      >
                        Reset
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
                          setShowMobileConfig(false);
                        }}
                        className="flex-1 py-1 bg-white hover:bg-stone-100 text-[#6366F1] font-bold text-[9px] rounded-md transition select-none cursor-pointer"
                      >
                        Apply & Reset
                      </button>
                      <button
                        onClick={() => setShowMobileConfig(false)}
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
                  value={drawerNoteText}
                  onChange={(e) => setDrawerNoteText(e.target.value)}
                  placeholder="Type a thought or focus note..."
                  rows={2}
                  className="w-full text-xs bg-white/10 hover:bg-white/15 focus:bg-white/25 text-white placeholder-purple-300/60 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-white/30 resize-none border border-white/10 transition-colors"
                />
                <div className="flex items-center justify-between">
                  {drawerShowSaveSuccess ? (
                    <span className="text-[9px] text-green-300 font-bold flex items-center gap-1">
                      ✓ Saved to Session Logs!
                    </span>
                  ) : (
                    <span className="text-[8px] text-purple-300 italic">Press Save to log</span>
                  )}
                  <button
                    onClick={() => {
                      if (drawerNoteText.trim()) {
                        handleAddScratchpadNote(drawerNoteText);
                        setDrawerNoteText('');
                        setDrawerShowSaveSuccess(true);
                        setTimeout(() => setDrawerShowSaveSuccess(false), 2000);
                      }
                    }}
                    disabled={!drawerNoteText.trim()}
                    className="py-1 px-3 bg-white hover:bg-stone-100 text-[#6366F1] font-bold text-[9px] rounded-lg cursor-pointer transition select-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-center text-[9px] text-purple-100 opacity-60">
              Mappy study buddy container sandbox
            </div>
          </div>
        </div>
      )}

      {/* Floating Pomodoro Bubble */}
      {showFloatingBubble && (
        <div 
          id="mappy-floating-pomodoro-bubble"
          className={`fixed z-50 transition-all duration-300 ease-out select-none ${
            isBubbleMinimized 
              ? 'bottom-20 right-4 md:bottom-8 md:right-8 w-14 h-14 rounded-full bg-gradient-to-tr from-[#6366F1] to-purple-600 shadow-xl border-2 border-white flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95' 
              : 'bottom-20 right-4 md:bottom-8 md:right-8 w-72 rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl border border-stone-200/60 p-4 text-[#0A1128]'
          }`}
          onClick={() => {
            if (isBubbleMinimized) {
              setIsBubbleMinimized(false);
            }
          }}
          title={isBubbleMinimized ? "Click to expand Pomodoro Timer" : undefined}
        >
          {isBubbleMinimized ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center text-white">
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pomodoroMode === 'Work' ? 'bg-rose-400' : 'bg-emerald-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${pomodoroMode === 'Work' ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
              </span>
              <span className="text-[10px] font-bold tracking-tighter leading-none mb-0.5">
                {pomodoroMode === 'Work' ? '🎯' : '☕'}
              </span>
              <span className="font-mono text-[9px] font-black leading-none">
                {String(pomodoroMinutes).padStart(2, '0')}:{String(pomodoroSeconds).padStart(2, '0')}
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">
                    {pomodoroMode === 'Work' ? '🎯' : '☕'}
                  </span>
                  <span className="text-xs font-bold text-stone-700 tracking-wide uppercase">
                    {pomodoroMode === 'Work' ? 'Focus Session' : 'Break Time'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsBubbleMinimized(true);
                    }}
                    className="p-1 hover:bg-stone-100 rounded text-stone-400 hover:text-stone-700 transition"
                    title="Minimize"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      resetPomodoro();
                    }}
                    className="p-1 hover:bg-red-50 rounded text-stone-400 hover:text-red-500 transition"
                    title="Close Timer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Timer Display */}
              <div className="text-center py-1">
                <div className="font-mono text-3xl font-black tracking-widest text-[#0A1128]">
                  {String(pomodoroMinutes).padStart(2, '0')}:{String(pomodoroSeconds).padStart(2, '0')}
                </div>
                
                {/* Visual Progress Bar */}
                {(() => {
                  const totalSegmentSecs = pomodoroMode === 'Work' 
                    ? (enableMiddleBreaks ? breakInterval * 60 : (customFocusUnit === 'Hours' ? customFocusDuration * 60 * 60 : customFocusDuration * 60)) 
                    : (breakDuration * 60);
                  const progressPercentage = totalSegmentSecs > 0 
                    ? ((totalSegmentSecs - currentTimerSeconds) / totalSegmentSecs) * 100 
                    : 100;
                  return (
                    <div className="w-full bg-stone-100 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          pomodoroMode === 'Work' 
                            ? 'bg-gradient-to-r from-orange-400 to-pink-500' 
                            : 'bg-gradient-to-r from-green-400 to-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
                      />
                    </div>
                  );
                })()}
              </div>

              {/* Action Controls */}
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPomodoroIsRunning(!pomodoroIsRunning);
                  }}
                  className={`flex-1 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 text-white cursor-pointer select-none ${
                    pomodoroIsRunning 
                      ? 'bg-gradient-to-r from-stone-600 to-stone-800 shadow-md hover:from-stone-700 hover:to-stone-900' 
                      : 'bg-gradient-to-r from-[#6366F1] to-purple-600 shadow-md hover:from-[#5053df] hover:to-purple-700'
                  }`}
                >
                  {pomodoroIsRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Resume
                    </>
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetPomodoro();
                  }}
                  className="px-3 py-1.5 border border-stone-200 hover:bg-stone-50 hover:border-stone-300 text-stone-500 rounded-xl transition flex items-center justify-center cursor-pointer"
                  title="Reset timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
