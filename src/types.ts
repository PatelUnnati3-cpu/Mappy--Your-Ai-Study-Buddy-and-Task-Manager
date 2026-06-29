export type Theme = 'Ghar Jaisa' | 'Level Up' | 'Clean Slate' | 'Serious';
export type BreakdownMode = 'AUTO' | 'COLLABORATIVE' | 'MANUAL';
export type Seriousness = 'Low' | 'Medium' | 'High';
export type LanguageOption = 'English' | 'Hindi' | 'Hinglish';

export type TrackType = 'High School' | 'Undergraduate (Bachelors)' | 'Postgraduate (Masters)' | 'University/PhD' | 'Working Professional';

export const TRACK_MACRO_DOMAINS: Record<TrackType, string[]> = {
  'High School': ['Sciences', 'Mathematics', 'Humanities & History', 'Languages', 'Arts & Design'],
  'Undergraduate (Bachelors)': ['Engineering & CS', 'Medical & Life Sciences', 'Business & Finance', 'Social Sciences & Humanities', 'General Studies'],
  'Postgraduate (Masters)': ['Advanced Engineering & Tech', 'Clinical & Health Sciences', 'Economics & MBA', 'Humanities Research', 'Applied Sciences'],
  'University/PhD': ['Specialized Research', 'Grant Writing & Academia', 'Advanced Theory', 'Interdisciplinary Studies', 'Pedagogy & Teaching'],
  'Working Professional': ['Professional Upskilling', 'Corporate Law', 'Project Management & Leadership', 'System Design & Architecture', 'Finance & Investing']
};

export interface MicroStep {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  seriousness: Seriousness;
  createdAt: string;
  project?: string; // Optional project/subject association
  microSteps?: MicroStep[];
  googleEventId?: string;
  calendarStartTime?: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface ScratchpadNote {
  id: string;
  text: string;
  timestamp: string;
}

export interface ScheduleBlock {
  id: string;
  time: string;
  title: string;
  project: string;
  duration: number;
  isCustom?: boolean;
}



