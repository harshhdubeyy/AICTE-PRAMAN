import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, AlertCircle, AlertTriangle, CheckCircle2, Info, ExternalLink } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { NotificationItem } from '../types';

export const NotificationBell: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { notifications, unreadNotificationCount, markNotificationAsRead, markAllNotificationsAsRead, setActiveNav } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (item: NotificationItem) => {
    markNotificationAsRead(item.id);
    if (item.link_nav) {
      setActiveNav(item.link_nav);
      setIsOpen(false);
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'action_required':
        return <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-3.5 h-3.5 text-[#4F63E8] shrink-0" />;
    }
  };

  const formatTimeAgo = (isoDate: string) => {
    try {
      const diffMs = Date.now() - new Date(isoDate).getTime();
      const mins = Math.floor(diffMs / (1000 * 60));
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg text-[#8C91AB] hover:text-[#4F63E8] hover:bg-gray-100 transition-colors relative cursor-pointer"
        title="Regulatory Alerts & Realtime Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadNotificationCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#F0566A] text-white text-[9.5px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
            {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-92 bg-white rounded-2xl shadow-xl border border-[#ECEDF7] py-2 z-50 text-[11px] font-medium text-[#1F2350] animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-2 border-b border-[#F0F1FA]">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-[#1F2350]">Statutory Notifications</span>
              {unreadNotificationCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#EEF0FD] text-[#4F63E8] text-[9.5px] font-bold">
                  {unreadNotificationCount} unread
                </span>
              )}
            </div>

            {unreadNotificationCount > 0 && (
              <button
                onClick={() => markAllNotificationsAsRead()}
                className="text-[10px] text-[#4F63E8] hover:text-[#3B4DB8] font-bold flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3 h-3" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[340px] overflow-y-auto divide-y divide-[#F0F1FA] custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-[#8C91AB]">
                <Bell className="w-6 h-6 mx-auto mb-2 opacity-30" />
                <p className="text-[11px]">No alerts at this time</p>
              </div>
            ) : (
              notifications.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3 hover:bg-[#F8F9FE] transition-colors cursor-pointer flex items-start gap-2.5 ${
                    !item.read ? 'bg-[#EEF0FD]/30 font-semibold' : ''
                  }`}
                >
                  <div className="mt-0.5">{getIcon(item.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11.5px] text-[#1F2350] font-bold truncate">
                        {item.title}
                      </span>
                      <span className="text-[9.5px] text-[#8C91AB] whitespace-nowrap">
                        {formatTimeAgo(item.created_at)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8C91AB] mt-0.5 leading-snug line-clamp-2">
                      {item.message}
                    </p>
                    {item.link_nav && (
                      <span className="text-[9.5px] text-[#4F63E8] font-bold flex items-center gap-0.5 mt-1">
                        <span>View docket item</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-[#4F63E8] mt-1 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-3.5 py-1.5 border-t border-[#F0F1FA] bg-[#FAF8FF] rounded-b-xl flex items-center justify-between text-[10px] text-[#8C91AB]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3DBE8B] animate-pulse" />
              Live Realtime Channel Active
            </span>
            <span>Section 10(k)</span>
          </div>
        </div>
      )}
    </div>
  );
};
