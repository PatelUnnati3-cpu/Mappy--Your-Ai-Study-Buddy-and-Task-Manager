import React from 'react';
import { 
  Calendar, HardDrive, FileText, FileSpreadsheet, Presentation, 
  ExternalLink, Search, X, RefreshCw, LogOut, File, GraduationCap 
} from 'lucide-react';

interface IntegrationHubProps {
  googleUser: any;
  googleToken: string | null;
  onGoogleSignIn: () => void;
  onGoogleLogout: () => void;
  calendarEvents: any[];
}

export function GoogleWorkspaceIntegrationHub({
  googleUser,
  googleToken,
  onGoogleSignIn,
  onGoogleLogout,
  calendarEvents
}: IntegrationHubProps) {
  return (
    <div className="bg-white border border-stone-100 shadow-xl rounded-2xl p-5 space-y-4" id="google-calendar-integration-card">
      <h2 className="text-xs font-space font-extrabold uppercase tracking-wider text-[#0A1128] pb-3 border-b border-stone-100 flex items-center gap-1.5">
        <Calendar className="w-4 h-4 text-[#6366F1]" /> Google Workspace Integration Hub
      </h2>

      <p className="text-xs text-stone-500 leading-relaxed font-medium">
        Synchronize your academic assets, coursework milestones, calendar events, and study material seamlessly to your personal Mappy study buddy.
      </p>

      {/* Grid of All 6 Core Integrations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
        {/* Integration item 1: Calendar */}
        <div className={`p-3 border rounded-xl flex items-center justify-between gap-3 transition-all duration-200 ${
          googleUser ? 'bg-indigo-50/25 border-indigo-100/50' : 'bg-stone-50/50 border-stone-200/50'
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            <span className={`p-1.5 rounded-lg flex-shrink-0 ${googleUser ? 'bg-indigo-100 text-[#6366F1]' : 'bg-stone-100 text-stone-400'}`}>
              <Calendar className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h3 className="text-[10px] font-space font-extrabold uppercase tracking-wider text-[#0A1128] leading-tight">
                Google Calendar
              </h3>
              <p className="text-[9px] text-stone-400 font-semibold leading-tight truncate">
                Pomodoro study blocks & timers
              </p>
            </div>
          </div>
          <span className={`text-[8px] font-space font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
            googleUser 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
              : 'bg-stone-100 text-stone-500 border-stone-200'
          }`}>
            {googleUser ? '● Enabled' : 'Inactive'}
          </span>
        </div>

        {/* Integration item 2: Classroom */}
        <div className={`p-3 border rounded-xl flex items-center justify-between gap-3 transition-all duration-200 ${
          googleUser ? 'bg-indigo-50/25 border-indigo-100/50' : 'bg-stone-50/50 border-stone-200/50'
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            <span className={`p-1.5 rounded-lg flex-shrink-0 ${googleUser ? 'bg-indigo-100 text-[#6366F1]' : 'bg-stone-100 text-stone-400'}`}>
              <GraduationCap className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h3 className="text-[10px] font-space font-extrabold uppercase tracking-wider text-[#0A1128] leading-tight">
                Google Classroom
              </h3>
              <p className="text-[9px] text-stone-400 font-semibold leading-tight truncate">
                Homework & roadmap milestones
              </p>
            </div>
          </div>
          <span className={`text-[8px] font-space font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
            googleUser 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
              : 'bg-stone-100 text-stone-500 border-stone-200'
          }`}>
            {googleUser ? '● Enabled' : 'Inactive'}
          </span>
        </div>

        {/* Integration item 3: Drive */}
        <div className={`p-3 border rounded-xl flex items-center justify-between gap-3 transition-all duration-200 ${
          googleUser ? 'bg-indigo-50/25 border-indigo-100/50' : 'bg-stone-50/50 border-stone-200/50'
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            <span className={`p-1.5 rounded-lg flex-shrink-0 ${googleUser ? 'bg-indigo-100 text-[#6366F1]' : 'bg-stone-100 text-stone-400'}`}>
              <HardDrive className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h3 className="text-[10px] font-space font-extrabold uppercase tracking-wider text-[#0A1128] leading-tight">
                Google Drive
              </h3>
              <p className="text-[9px] text-stone-400 font-semibold leading-tight truncate">
                Reference books & guides
              </p>
            </div>
          </div>
          <span className={`text-[8px] font-space font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
            googleUser 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
              : 'bg-stone-100 text-stone-500 border-stone-200'
          }`}>
            {googleUser ? '● Enabled' : 'Inactive'}
          </span>
        </div>

        {/* Integration item 4: Docs */}
        <div className={`p-3 border rounded-xl flex items-center justify-between gap-3 transition-all duration-200 ${
          googleUser ? 'bg-indigo-50/25 border-indigo-100/50' : 'bg-stone-50/50 border-stone-200/50'
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            <span className={`p-1.5 rounded-lg flex-shrink-0 ${googleUser ? 'bg-indigo-100 text-[#6366F1]' : 'bg-stone-100 text-stone-400'}`}>
              <FileText className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h3 className="text-[10px] font-space font-extrabold uppercase tracking-wider text-[#0A1128] leading-tight">
                Google Docs
              </h3>
              <p className="text-[9px] text-stone-400 font-semibold leading-tight truncate">
                Reading material outlines
              </p>
            </div>
          </div>
          <span className={`text-[8px] font-space font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
            googleUser 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
              : 'bg-stone-100 text-stone-500 border-stone-200'
          }`}>
            {googleUser ? '● Enabled' : 'Inactive'}
          </span>
        </div>

        {/* Integration item 5: Sheets */}
        <div className={`p-3 border rounded-xl flex items-center justify-between gap-3 transition-all duration-200 ${
          googleUser ? 'bg-indigo-50/25 border-indigo-100/50' : 'bg-stone-50/50 border-stone-200/50'
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            <span className={`p-1.5 rounded-lg flex-shrink-0 ${googleUser ? 'bg-indigo-100 text-[#6366F1]' : 'bg-stone-100 text-stone-400'}`}>
              <FileSpreadsheet className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h3 className="text-[10px] font-space font-extrabold uppercase tracking-wider text-[#0A1128] leading-tight">
                Google Sheets
              </h3>
              <p className="text-[9px] text-stone-400 font-semibold leading-tight truncate">
                Course progress trackers
              </p>
            </div>
          </div>
          <span className={`text-[8px] font-space font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
            googleUser 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
              : 'bg-stone-100 text-stone-500 border-stone-200'
          }`}>
            {googleUser ? '● Enabled' : 'Inactive'}
          </span>
        </div>

        {/* Integration item 6: Slides */}
        <div className={`p-3 border rounded-xl flex items-center justify-between gap-3 transition-all duration-200 ${
          googleUser ? 'bg-indigo-50/25 border-indigo-100/50' : 'bg-stone-50/50 border-stone-200/50'
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            <span className={`p-1.5 rounded-lg flex-shrink-0 ${googleUser ? 'bg-indigo-100 text-[#6366F1]' : 'bg-stone-100 text-stone-400'}`}>
              <Presentation className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h3 className="text-[10px] font-space font-extrabold uppercase tracking-wider text-[#0A1128] leading-tight">
                Google Slides
              </h3>
              <p className="text-[9px] text-stone-400 font-semibold leading-tight truncate">
                Lecture visual presentations
              </p>
            </div>
          </div>
          <span className={`text-[8px] font-space font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
            googleUser 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
              : 'bg-stone-100 text-stone-500 border-stone-200'
          }`}>
            {googleUser ? '● Enabled' : 'Inactive'}
          </span>
        </div>
      </div>

      {googleUser ? (
        <div className="space-y-4">
          {/* Connected User Profile */}
          <div className="flex items-center justify-between p-3 bg-indigo-50/40 rounded-xl border border-indigo-100/50">
            <div className="flex items-center gap-2.5 min-w-0">
              {googleUser.photoURL ? (
                <img 
                  src={googleUser.photoURL} 
                  alt="Profile" 
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full border border-[#6366F1]"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#6366F1] flex items-center justify-center text-white text-xs font-black">
                  {googleUser.displayName?.charAt(0) || 'G'}
                </div>
              )}
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#0A1128] block truncate">
                  {googleUser.displayName || 'Google Explorer'}
                </span>
                <span className="text-[10px] text-stone-500 block truncate font-medium">
                  {googleUser.email}
                </span>
              </div>
            </div>

            <span className="text-[9px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full border border-green-200">
              Active
            </span>
          </div>

          {/* Recent calendar events */}
          <div className="space-y-2">
            <span className="text-[10px] font-space font-extrabold text-stone-500 uppercase tracking-wider block">
              Upcoming Calendar Events
            </span>
            {calendarEvents && calendarEvents.length > 0 ? (
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 no-scrollbar">
                {calendarEvents.map((evt: any) => (
                  <div key={evt.id} className="p-2 bg-stone-50 border border-stone-150 rounded-lg flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold text-[#0A1128] truncate">
                      {evt.summary}
                    </span>
                    <span className="text-[9px] text-stone-400 font-semibold">
                      {evt.start?.dateTime 
                        ? new Date(evt.start.dateTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : 'All day event'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center bg-stone-50/50 rounded-xl border border-dashed border-stone-200 text-[10px] text-stone-400 font-medium">
                No study events found in primary calendar.
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onGoogleLogout}
            className="w-full py-2 px-3 border border-stone-200 hover:bg-stone-50 text-stone-600 text-[10px] font-space font-extrabold uppercase tracking-wider rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Disconnect Workspace
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl text-[10px] text-amber-800 leading-normal font-medium">
            <strong>Notice:</strong> Complete the Google Workspace authentication flow to synchronize your syllabus roadmaps, classroom assignments, documents, and active study countdowns instantly.
          </div>

          <button
            type="button"
            onClick={onGoogleSignIn}
            className="w-full py-2.5 px-4 bg-white border border-stone-200 hover:border-stone-300 shadow-sm rounded-xl cursor-pointer transition flex items-center justify-center gap-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.67 14.94 1 12 1 7.35 1 3.39 3.65 1.5 7.5l3.86 3C6.27 7.5 8.9 5.04 12 5.04z" />
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.47h6.46c-.28 1.48-1.12 2.73-2.38 3.58l3.69 2.87c2.16-1.99 3.42-4.92 3.42-8.56z" />
              <path fill="#FBBC05" d="M5.36 14.5c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3l-3.86-3C.53 8.71 0 10.29 0 12s.53 3.29 1.5 4.8l3.86-3z" />
              <path fill="#34A853" d="M12 23c3.24 0 5.96-1.07 7.95-2.91l-3.69-2.87c-1.02.68-2.33 1.09-3.96 1.09-3.1 0-5.73-2.46-6.64-5.46l-3.86 3C3.39 20.35 7.35 23 12 23z" />
            </svg>
            Connect Google Workspace
          </button>
        </div>
      )}
    </div>
  );
}

interface DocumentLibraryProps {
  googleUser: any;
  driveFiles?: any[];
  isLoadingDrive?: boolean;
  onRefreshDrive?: () => void;
}

export function MappyDocumentLibrary({
  googleUser,
  driveFiles = [],
  isLoadingDrive = false,
  onRefreshDrive
}: DocumentLibraryProps) {
  const [activeDriveTab, setActiveDriveTab] = React.useState<'all' | 'doc' | 'sheet' | 'slide'>('all');
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <div className="bg-white border border-stone-100 shadow-xl rounded-2xl p-5 space-y-4" id="google-drive-docs-sheets-slides-card">
      <div className="pb-3 border-b border-stone-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <HardDrive className="w-4.5 h-4.5 text-[#0EA5E9]" />
          <h2 className="text-xs font-space font-extrabold uppercase tracking-wider text-[#0A1128]">
            Mappy Document Library
          </h2>
        </div>
        {googleUser && (
          <button
            type="button"
            onClick={onRefreshDrive}
            disabled={isLoadingDrive}
            className="p-1.5 text-stone-500 hover:text-[#6366F1] hover:bg-stone-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
            title="Refresh Drive Files"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDrive ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      <p className="text-xs text-stone-500 leading-relaxed font-medium">
        Access your real-time academic documents, project guidelines, spreadsheets, and slides directly. Integrate guidelines with Mappy study plans!
      </p>

      {googleUser ? (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search your Docs, Sheets, Slides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs text-[#0A1128] font-medium bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#6366F1] focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 border-none bg-transparent"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveDriveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-space font-extrabold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 border-0 ${
                activeDriveTab === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200/50'
              }`}
            >
              <HardDrive className="w-3 h-3" /> All Files
            </button>
            <button
              onClick={() => setActiveDriveTab('doc')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-space font-extrabold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 border-0 ${
                activeDriveTab === 'doc'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50/50 hover:bg-blue-100/50 text-blue-700 border border-blue-100'
              }`}
            >
              <FileText className="w-3 h-3" /> Docs
            </button>
            <button
              onClick={() => setActiveDriveTab('sheet')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-space font-extrabold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 border-0 ${
                activeDriveTab === 'sheet'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50/50 hover:bg-emerald-100/50 text-emerald-700 border border-emerald-100'
              }`}
            >
              <FileSpreadsheet className="w-3 h-3" /> Sheets
            </button>
            <button
              onClick={() => setActiveDriveTab('slide')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-space font-extrabold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 border-0 ${
                activeDriveTab === 'slide'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50/50 hover:bg-amber-100/50 text-amber-700 border border-amber-100'
              }`}
            >
              <Presentation className="w-3 h-3" /> Slides
            </button>
          </div>

          {/* File list */}
          {isLoadingDrive ? (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 text-[#6366F1] animate-spin" />
              <span className="text-xs text-stone-500 font-bold font-mono">Connecting to Google Drive...</span>
            </div>
          ) : driveFiles && driveFiles.length > 0 ? (
            (() => {
              const filteredDriveFiles = driveFiles.filter(file => {
                const matchesSearch = file.name?.toLowerCase().includes(searchQuery.toLowerCase());
                if (!matchesSearch) return false;

                if (activeDriveTab === 'all') return true;
                if (activeDriveTab === 'doc') {
                  return file.mimeType === 'application/vnd.google-apps.document' || 
                         file.mimeType?.includes('document') ||
                         file.name?.endsWith('.doc') || 
                         file.name?.endsWith('.docx');
                }
                if (activeDriveTab === 'sheet') {
                  return file.mimeType === 'application/vnd.google-apps.spreadsheet' || 
                         file.mimeType?.includes('spreadsheet') ||
                         file.name?.endsWith('.xls') || 
                         file.name?.endsWith('.xlsx') || 
                         file.name?.endsWith('.csv');
                }
                if (activeDriveTab === 'slide') {
                  return file.mimeType === 'application/vnd.google-apps.presentation' || 
                         file.mimeType?.includes('presentation') ||
                         file.name?.endsWith('.ppt') || 
                         file.name?.endsWith('.pptx');
                }
                return true;
              });

              if (filteredDriveFiles.length === 0) {
                return (
                  <div className="p-8 text-center bg-stone-50/50 rounded-xl border border-dashed border-stone-200 text-[10px] text-stone-400 font-medium">
                    No documents matched your filter criteria or search.
                  </div>
                );
              }

              return (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                  {filteredDriveFiles.map((file: any) => {
                    const isDoc = file.mimeType === 'application/vnd.google-apps.document' || file.mimeType?.includes('document');
                    const isSheet = file.mimeType === 'application/vnd.google-apps.spreadsheet' || file.mimeType?.includes('spreadsheet');
                    const isSlide = file.mimeType === 'application/vnd.google-apps.presentation' || file.mimeType?.includes('presentation');

                    let accentColor = 'stone';
                    let FileIcon = File;
                    if (isDoc) {
                      accentColor = 'blue';
                      FileIcon = FileText;
                    } else if (isSheet) {
                      accentColor = 'emerald';
                      FileIcon = FileSpreadsheet;
                    } else if (isSlide) {
                      accentColor = 'amber';
                      FileIcon = Presentation;
                    }

                    const colors: Record<string, { bg: string, text: string, border: string, leftBg: string }> = {
                      blue: { bg: 'bg-blue-50/40', text: 'text-blue-700', border: 'border-blue-100', leftBg: 'bg-blue-500' },
                      emerald: { bg: 'bg-emerald-50/40', text: 'text-emerald-700', border: 'border-emerald-100', leftBg: 'bg-emerald-500' },
                      amber: { bg: 'bg-amber-50/40', text: 'text-amber-700', border: 'border-amber-100', leftBg: 'bg-amber-500' },
                      stone: { bg: 'bg-stone-50/40', text: 'text-stone-700', border: 'border-stone-100', leftBg: 'bg-stone-500' }
                    };

                    const currentColors = colors[accentColor];

                    return (
                      <div
                        key={file.id}
                        className={`p-3 border rounded-xl flex items-center justify-between gap-3 relative overflow-hidden transition-all duration-200 hover:border-stone-200 hover:bg-stone-50/30 ${currentColors.bg} ${currentColors.border}`}
                      >
                        <div className={`absolute top-0 bottom-0 left-0 w-1 ${currentColors.leftBg}`}></div>
                        
                        <div className="min-w-0 pl-1.5 flex items-start gap-2.5">
                          <span className={`p-1.5 rounded-lg ${currentColors.bg} ${currentColors.text} flex-shrink-0 mt-0.5`}>
                            <FileIcon className="w-4 h-4" />
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-[11px] font-bold text-[#0A1128] truncate leading-tight">
                              {file.name}
                            </h4>
                            <p className="text-[9px] text-stone-400 font-semibold font-mono mt-0.5">
                              Modified: {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`p-1.5 rounded-lg border bg-white hover:bg-stone-50 text-stone-600 transition flex items-center justify-center`}
                              title="Open in Workspace"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()
          ) : (
            <div className="p-8 text-center bg-stone-50/50 rounded-xl border border-dashed border-stone-200 text-[10px] text-stone-400 font-medium">
              No documents found in your Google Workspace. Click the refresh button to trigger an update!
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 text-center bg-stone-50/50 rounded-xl border border-dashed border-stone-200 text-[10px] text-stone-400 font-medium leading-relaxed">
          Connect your Google Workspace in the settings tab above to enable direct access to your Docs study guidelines, Sheets trackers, Slides presentations, and Drive files!
        </div>
      )}
    </div>
  );
}
