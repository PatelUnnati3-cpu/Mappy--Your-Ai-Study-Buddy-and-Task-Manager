import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';
import { Task, Theme, BreakdownMode, LanguageOption, TrackType, ScratchpadNote, ScheduleBlock } from '../types';

export const db = getFirestore();

export interface UserProfile {
  email: string;
  displayName: string;
  photoURL?: string;
  currentTrack: TrackType;
  theme: Theme;
  languageOption: LanguageOption;
  breakdownMode: BreakdownMode;
  xp: number;
  level: number;
  streak: number;
  muteVoice: boolean;
  dailyReminders: boolean;
  compactTaskView: boolean;
  customCategories: string[];
  scratchpadNotes: ScratchpadNote[];
  schedules?: ScheduleBlock[];
  updatedAt: string;
}

// Save or update user profile
export async function saveUserProfile(userId: string, profile: Partial<UserProfile>) {
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      ...profile,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error('Error saving user profile:', err);
  }
}

// Get user profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    console.error('Error getting user profile:', err);
    return null;
  }
}

// Save a task to Firestore
export async function saveTaskToCloud(userId: string, task: Task) {
  try {
    const taskDocRef = doc(db, 'tasks', task.id);
    await setDoc(taskDocRef, {
      ...task,
      userId,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error saving task to cloud:', err);
  }
}

// Save multiple tasks (e.g., initial migration of local tasks to cloud)
export async function syncLocalTasksToCloud(userId: string, tasks: Task[]) {
  try {
    const batch = writeBatch(db);
    tasks.forEach(task => {
      const docRef = doc(db, 'tasks', task.id);
      batch.set(docRef, {
        ...task,
        userId,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.error('Error syncing local tasks to cloud:', err);
  }
}

// Delete a task from Firestore
export async function deleteTaskFromCloud(taskId: string) {
  try {
    const taskDocRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskDocRef);
  } catch (err) {
    console.error('Error deleting task from cloud:', err);
  }
}

// Fetch all user tasks from Firestore
export async function getUserTasksFromCloud(userId: string): Promise<Task[]> {
  try {
    const q = query(collection(db, 'tasks'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const tasks: Task[] = [];
    snap.forEach(docSnap => {
      const data = docSnap.data();
      // Remove userId and updatedAt from data for compatibility with Task interface
      const { userId: _, updatedAt: __, ...task } = data;
      tasks.push(task as Task);
    });
    return tasks;
  } catch (err) {
    console.error('Error getting user tasks from cloud:', err);
    return [];
  }
}
