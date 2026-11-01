import React from 'react';
import { AlertCircle, Bell, Calendar, Check, Clock, RefreshCw, X } from 'lucide-react';
import { AppNotification } from '../types';
import { StorageService } from '../services/storage';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onNavigate: (path: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    StorageService.markNotificationAsRead(id);
  };

  const handleMarkAllRead = () => {
    StorageService.markAllNotificationsRead();
  };

  const handleActionClick = (notif: AppNotification) => {
    StorageService.markNotificationAsRead(notif.id);
    if (notif.actionUrl) {
      onNavigate(notif.actionUrl);
      onClose();
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Notifications & Reminders
            </h3>
            {unreadCount > 0 && (
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subheader action */}
        {unreadCount > 0 && (
          <div className="px-5 py-2 bg-slate-50 dark:bg-slate-950 flex justify-end border-b border-slate-100 dark:border-slate-800">
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Mark all read
            </button>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No notifications at this time. You're completely up to date!
            </div>
          ) : (
            notifications.map((notif) => {
              const isUnread = !notif.read;
              return (
                <div
                  key={notif.id}
                  onClick={() => handleActionClick(notif)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                    isUnread
                      ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/50'
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {notif.type === 'EXAM_COUNTDOWN' ? (
                        <Calendar className="w-4 h-4 text-rose-500" />
                      ) : notif.type === 'MISSED_SESSION' ? (
                        <RefreshCw className="w-4 h-4 text-amber-500" />
                      ) : notif.type === 'WEAK_TOPIC' ? (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-indigo-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {notif.date}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {notif.message}
                      </p>

                      {notif.actionLabel && (
                        <div className="mt-2.5 flex items-center justify-between">
                          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                            {notif.actionLabel} &rarr;
                          </span>
                          {isUnread && (
                            <button
                              type="button"
                              onClick={(e) => handleMarkAsRead(notif.id, e)}
                              className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
