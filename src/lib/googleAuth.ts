import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Detect if Firebase setup was declined or config has placeholders
const isPlaceholderConfig = !firebaseConfig.apiKey || 
                             firebaseConfig.apiKey === 'remixed-api-key' || 
                             firebaseConfig.apiKey.startsWith('remixed-') ||
                             firebaseConfig.apiKey === '';

// Initialize Firebase App securely and prevent double initialization if not on placeholder
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();
// Add required Calendar scopes
provider.addScope('https://www.googleapis.com/auth/calendar');
provider.addScope('https://www.googleapis.com/auth/calendar.events');
// Add required Google Classroom scopes
provider.addScope('https://www.googleapis.com/auth/classroom.courses.readonly');
provider.addScope('https://www.googleapis.com/auth/classroom.coursework.me.readonly');
// Add required Google Drive, Docs, Sheets, and Slides scopes
provider.addScope('https://www.googleapis.com/auth/drive.readonly');
provider.addScope('https://www.googleapis.com/auth/documents.readonly');
provider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');
provider.addScope('https://www.googleapis.com/auth/presentations.readonly');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Sandbox/Demo mock listeners
let activeAuthSuccessCallback: ((user: any, token: string) => void) | null = null;
let activeAuthFailureCallback: (() => void) | null = null;

// Initialize auth state listener. Call this on app load.
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  if (onAuthSuccess) activeAuthSuccessCallback = onAuthSuccess;
  if (onAuthFailure) activeAuthFailureCallback = onAuthFailure;

  if (isPlaceholderConfig) {
    const mockUserStr = localStorage.getItem('mappy_mock_user');
    const mockToken = localStorage.getItem('mappy_google_access_token') || 'mappy_sandbox_token';
    if (mockUserStr) {
      try {
        const mockUser = JSON.parse(mockUserStr);
        if (onAuthSuccess) onAuthSuccess(mockUser, mockToken);
      } catch (e) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      if (onAuthFailure) onAuthFailure();
    }
    return () => {
      activeAuthSuccessCallback = null;
      activeAuthFailureCallback = null;
    };
  }

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      const persistedToken = localStorage.getItem('mappy_google_access_token');
      if (persistedToken) {
        cachedAccessToken = persistedToken;
        if (onAuthSuccess) onAuthSuccess(user, persistedToken);
      } else if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      localStorage.removeItem('mappy_google_access_token');
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Must be called from a button click or user interaction
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (isPlaceholderConfig) {
    const mockUser: any = {
      uid: 'sandbox_user_rahul',
      email: 'rahul.sharma@school.edu',
      displayName: 'Rahul Sharma',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
      emailVerified: true,
    };
    cachedAccessToken = 'mappy_sandbox_token';
    localStorage.setItem('mappy_google_access_token', cachedAccessToken);
    localStorage.setItem('mappy_mock_user', JSON.stringify(mockUser));
    if (activeAuthSuccessCallback) activeAuthSuccessCallback(mockUser, cachedAccessToken);
    return { user: mockUser, accessToken: cachedAccessToken };
  }

  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    localStorage.setItem('mappy_google_access_token', cachedAccessToken);
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken || localStorage.getItem('mappy_google_access_token');
};

export const logout = async () => {
  if (isPlaceholderConfig) {
    cachedAccessToken = null;
    localStorage.removeItem('mappy_google_access_token');
    localStorage.removeItem('mappy_mock_user');
    if (activeAuthFailureCallback) activeAuthFailureCallback();
    return;
  }

  await auth.signOut();
  cachedAccessToken = null;
  localStorage.removeItem('mappy_google_access_token');
};

/**
 * Lists Google Calendar events from the user's primary calendar
 */
export async function listCalendarEvents(token: string) {
  if (token === 'mappy_sandbox_token' || isPlaceholderConfig) {
    return [
      {
        id: 'mock-evt-1',
        summary: '📚 AP Calculus Study Roadmap Sprint',
        start: { dateTime: new Date(Date.now() + 2 * 3600 * 1000).toISOString() },
        end: { dateTime: new Date(Date.now() + 4 * 3600 * 1000).toISOString() }
      },
      {
        id: 'mock-evt-2',
        summary: '🧬 Biology Nervous System Diagrams Prep',
        start: { dateTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString() },
        end: { dateTime: new Date(Date.now() + 26 * 3600 * 1000).toISOString() }
      },
      {
        id: 'mock-evt-3',
        summary: '📝 French Revolution Essay Formatting Review',
        start: { dateTime: new Date(Date.now() + 48 * 3600 * 1000).toISOString() },
        end: { dateTime: new Date(Date.now() + 50 * 3600 * 1000).toISOString() }
      },
      {
        id: 'mock-evt-4',
        summary: '💻 Computer Science Lab Assignment 4 Dry Run',
        start: { dateTime: new Date(Date.now() - 4 * 3600 * 1000).toISOString() },
        end: { dateTime: new Date(Date.now() - 2 * 3600 * 1000).toISOString() }
      }
    ];
  }

  try {
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=8&orderBy=startTime&singleEvents=true',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Failed to list calendar events');
    }
    const data = await response.json();
    return data.items || [];
  } catch (err) {
    console.error('listCalendarEvents Error:', err);
    throw err;
  }
}

/**
 * Creates an event in Google Calendar
 */
export async function createCalendarEvent(
  token: string,
  event: {
    summary: string;
    description: string;
    startTime: string; // ISO date-time
    endTime: string;   // ISO date-time
  }
) {
  if (token === 'mappy_sandbox_token' || isPlaceholderConfig) {
    return {
      id: 'mock-evt-' + Date.now(),
      summary: event.summary,
      description: event.description,
      start: { dateTime: event.startTime },
      end: { dateTime: event.endTime }
    };
  }

  try {
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: event.summary,
          description: event.description,
          start: {
            dateTime: event.startTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          },
          end: {
            dateTime: event.endTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          },
          reminders: {
            useDefault: true,
          },
        }),
      }
    );
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Failed to create calendar event');
    }
    return await response.json();
  } catch (err) {
    console.error('createCalendarEvent Error:', err);
    throw err;
  }
}

/**
 * Lists Google Classroom courses where the user is a student or teacher
 */
export async function listClassroomCourses(token: string) {
  if (token === 'mappy_sandbox_token' || isPlaceholderConfig) {
    return [
      { id: 'course-math', name: 'AP Calculus BC', section: 'Grade 12', descriptionHeading: 'Advanced integration & limits' },
      { id: 'course-bio', name: 'Honor Biology', section: 'Grade 11', descriptionHeading: 'Neuroanatomy & mitosis cell slides' },
      { id: 'course-hist', name: 'European History', section: 'Grade 12', descriptionHeading: 'French Revolution timeline study' },
      { id: 'course-cs', name: 'Introduction to Computer Science', section: 'Grade 10', descriptionHeading: 'Algorithms & active sandbox logic' }
    ];
  }

  try {
    const response = await fetch(
      'https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Failed to list classroom courses');
    }
    const data = await response.json();
    return data.courses || [];
  } catch (err) {
    console.error('listClassroomCourses Error:', err);
    throw err;
  }
}

/**
 * Lists coursework/assignments for a specific course
 */
export async function listClassroomCourseWork(token: string, courseId: string) {
  if (token === 'mappy_sandbox_token' || isPlaceholderConfig) {
    const courseWorkMap: Record<string, any[]> = {
      'course-math': [
        { id: 'cw-math-1', title: 'Worksheet 5: Integration by Parts', dueDate: { year: 2026, month: 7, day: 5 } },
        { id: 'cw-math-2', title: 'Calculus Boundary Limits Practice', dueDate: { year: 2026, month: 7, day: 12 } }
      ],
      'course-bio': [
        { id: 'cw-bio-1', title: 'Mitosis Slide Hand-drawn Sketches', dueDate: { year: 2026, month: 7, day: 3 } },
        { id: 'cw-bio-2', title: 'Nervous System Synapse Diagram Sheet', dueDate: { year: 2026, month: 7, day: 10 } }
      ],
      'course-hist': [
        { id: 'cw-hist-1', title: 'French Revolution Social Inequality Essay', dueDate: { year: 2026, month: 7, day: 8 } },
        { id: 'cw-hist-2', title: 'Napoleon Battle Impacts Presentation', dueDate: { year: 2026, month: 7, day: 15 } }
      ],
      'course-cs': [
        { id: 'cw-cs-1', title: 'Lab 4: Binary Search Trees in Python', dueDate: { year: 2026, month: 7, day: 2 } },
        { id: 'cw-cs-2', title: 'Clean Modular Code functions implementation', dueDate: { year: 2026, month: 7, day: 9 } }
      ]
    };
    return courseWorkMap[courseId] || [];
  }

  try {
    const response = await fetch(
      `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork?orderBy=dueDate%20asc`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Failed to list coursework');
    }
    const data = await response.json();
    return data.courseWork || [];
  } catch (err) {
    console.error('listClassroomCourseWork Error:', err);
    throw err;
  }
}

/**
 * Lists files from Google Drive with optional mimeType query filters
 */
export async function listDriveFiles(token: string, q?: string) {
  if (token === 'mappy_sandbox_token' || isPlaceholderConfig) {
    return [
      {
        id: 'file-doc-1',
        name: 'AP Calculus Integration Cheat Sheet.docx',
        mimeType: 'application/vnd.google-apps.document',
        modifiedTime: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        webViewLink: 'https://docs.google.com'
      },
      {
        id: 'file-doc-2',
        name: 'Nerve Cell Action Potential Study Guide.docx',
        mimeType: 'application/vnd.google-apps.document',
        modifiedTime: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        webViewLink: 'https://docs.google.com'
      },
      {
        id: 'file-sheet-1',
        name: 'Grade Tracker & Target Syllabus Progress.xlsx',
        mimeType: 'application/vnd.google-apps.spreadsheet',
        modifiedTime: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        webViewLink: 'https://docs.google.com'
      },
      {
        id: 'file-slide-1',
        name: 'French Revolution Bastille Day presentation.pptx',
        mimeType: 'application/vnd.google-apps.presentation',
        modifiedTime: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
        webViewLink: 'https://docs.google.com'
      },
      {
        id: 'file-doc-3',
        name: 'CS Data Structures Exam Notes.docx',
        mimeType: 'application/vnd.google-apps.document',
        modifiedTime: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        webViewLink: 'https://docs.google.com'
      }
    ];
  }

  try {
    let url = 'https://www.googleapis.com/drive/v3/files?pageSize=25&fields=files(id,name,mimeType,webViewLink,iconLink,thumbnailLink,modifiedTime)';
    if (q) {
      url += `&q=${encodeURIComponent(q)}`;
    }
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Failed to list Drive files');
    }
    const data = await response.json();
    return data.files || [];
  } catch (err) {
    console.error('listDriveFiles Error:', err);
    throw err;
  }
}

/**
 * Sign up a new user with Email and Password
 */
export async function signUpWithEmailAndPassword(email: string, password: string, displayName: string): Promise<User> {
  if (isPlaceholderConfig) {
    const mockUser: any = {
      uid: 'sandbox_email_user_' + Date.now(),
      email,
      displayName,
      photoURL: undefined,
      emailVerified: true,
    };
    cachedAccessToken = 'mappy_sandbox_token';
    localStorage.setItem('mappy_google_access_token', cachedAccessToken);
    localStorage.setItem('mappy_mock_user', JSON.stringify(mockUser));
    if (activeAuthSuccessCallback) activeAuthSuccessCallback(mockUser, cachedAccessToken);
    return mockUser;
  }

  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName });
    return credential.user;
  } catch (err) {
    console.error('signUpWithEmailAndPassword Error:', err);
    throw err;
  }
}

/**
 * Sign in an existing user with Email and Password
 */
export async function loginWithEmailAndPassword(email: string, password: string): Promise<User> {
  if (isPlaceholderConfig) {
    const mockUser: any = {
      uid: 'sandbox_email_user_123',
      email,
      displayName: email.split('@')[0],
      photoURL: undefined,
      emailVerified: true,
    };
    cachedAccessToken = 'mappy_sandbox_token';
    localStorage.setItem('mappy_google_access_token', cachedAccessToken);
    localStorage.setItem('mappy_mock_user', JSON.stringify(mockUser));
    if (activeAuthSuccessCallback) activeAuthSuccessCallback(mockUser, cachedAccessToken);
    return mockUser;
  }

  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  } catch (err) {
    console.error('loginWithEmailAndPassword Error:', err);
    throw err;
  }
}

/**
 * Send password reset email to user
 */
export async function sendPasswordReset(email: string): Promise<void> {
  if (isPlaceholderConfig) {
    console.log('Simulating password reset email to:', email);
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
  } catch (err) {
    console.error('sendPasswordReset Error:', err);
    throw err;
  }
}



