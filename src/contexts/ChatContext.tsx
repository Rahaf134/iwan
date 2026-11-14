import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface ChatMessage {
  id: string;
  from: 'customer' | 'provider';
  text: string;
  at: string;
  senderName?: string;
}

export interface ChatTarget {
  type: 'store' | 'designer';
  id: string;
  name: string;
  phone: string;
  providerEmail?: string;
}

export interface ChatThread extends ChatTarget {
  threadId: string;
  messages: ChatMessage[];
  updatedAt: string;
  customerEmail?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  providerId?: string;
  providerEmail?: string;
}

interface ChatContextValue {
  threads: ChatThread[];
  allThreads: ChatThread[];
  activeThread: ChatThread | null;
  openChat: (target: ChatTarget) => void;
  closeChat: () => void;
  sendMessage: (text: string) => void;
  sendReply: (threadId: string, text: string, senderName?: string) => Promise<void>;
  markThreadAsRead: (threadId: string) => void;
  totalMessages: number;
  totalUnread: number;
  refreshChats: () => Promise<void>;
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

const STORAGE_KEY = 'ewan_v4_chats';
const READ_TIMESTAMPS_KEY = 'ewan_v4_read_threads_map';

const isMessage = (value: unknown): value is ChatMessage => {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    (record.from === 'customer' || record.from === 'provider') &&
    typeof record.text === 'string' &&
    typeof record.at === 'string'
  );
};

const readThreads = (): ChatThread[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
      .map((item): ChatThread => ({
        threadId: String(item.threadId ?? ''),
        type: item.type === 'designer' ? 'designer' : 'store',
        id: String(item.id ?? ''),
        name: String(item.name ?? ''),
        phone: String(item.phone ?? ''),
        customerEmail: item.customerEmail ? String(item.customerEmail) : undefined,
        customerId: item.customerId ? String(item.customerId) : undefined,
        customerName: item.customerName ? String(item.customerName) : undefined,
        customerPhone: item.customerPhone ? String(item.customerPhone) : undefined,
        providerId: item.providerId ? String(item.providerId) : undefined,
        providerEmail: item.providerEmail ? String(item.providerEmail) : undefined,
        messages: Array.isArray(item.messages) ? item.messages.filter(isMessage) : [],
        updatedAt: String(item.updatedAt ?? ''),
      }))
      .filter((thread) => thread.threadId && thread.id);
  } catch {
    return [];
  }
};

const writeThreads = (threads: ChatThread[]) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  } catch {
    // التخزين غير متاح — تبقى المحادثات في الذاكرة
  }
};

const readReadTimestamps = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(READ_TIMESTAMPS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { profile, isAdmin, isProvider } = useAuth();
  const [allThreadsState, setAllThreadsState] = useState<ChatThread[]>(() => readThreads());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [readTimestamps, setReadTimestamps] = useState<Record<string, string>>(() => readReadTimestamps());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const setDrawerOpen = useCallback((open: boolean) => setIsDrawerOpen(open), []);

  // حفظ في localStorage كـ cache فوري
  useEffect(() => {
    writeThreads(allThreadsState);
  }, [allThreadsState]);

  // استرجاع ومزامنة رسائل الشات من Supabase
  const refreshChats = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('type', 'chat_message')
        .order('created_at', { ascending: true });

      if (error || !data || data.length === 0) return;

      setAllThreadsState((current) => {
        const map = new Map<string, ChatThread>();
        for (const t of current) {
          map.set(t.threadId, { ...t, messages: [...t.messages] });
        }

        for (const row of data) {
          try {
            if (!row.details) continue;
            const details = JSON.parse(row.details);
            const threadId = details.threadId || `${details.targetType || 'store'}-${details.targetId || row.phone}`;
            if (!threadId) continue;

            const existing = map.get(threadId);
            const msg: ChatMessage = {
              id: details.messageId || row.id,
              from: details.from || 'customer',
              text: details.text || '',
              at: details.at || row.created_at,
              senderName: details.senderName || row.name || undefined,
            };

            if (existing) {
              if (
                !existing.messages.some(
                  (m) =>
                    m.id === msg.id ||
                    (m.text === msg.text &&
                      Math.abs(new Date(m.at).getTime() - new Date(msg.at).getTime()) < 3000),
                )
              ) {
                existing.messages.push(msg);
                existing.updatedAt = msg.at;
              }
              if (details.customerEmail && !existing.customerEmail) {
                existing.customerEmail = details.customerEmail;
              }
              if (details.customerId && !existing.customerId) {
                existing.customerId = details.customerId;
              }
              if (details.customerName && !existing.customerName) {
                existing.customerName = details.customerName;
              }
              if (details.customerPhone && !existing.customerPhone) {
                existing.customerPhone = details.customerPhone;
              }
              if (details.providerId && !existing.providerId) {
                existing.providerId = details.providerId;
              }
              if (details.providerEmail && !existing.providerEmail) {
                existing.providerEmail = details.providerEmail;
              }
            } else {
              map.set(threadId, {
                threadId,
                type: details.targetType === 'designer' ? 'designer' : 'store',
                id: details.targetId || threadId,
                name: details.targetName || row.name || 'محادثة إيوان',
                phone: details.targetPhone || row.phone || '',
                customerEmail: details.customerEmail,
                customerId: details.customerId,
                customerName: details.customerName || row.name,
                customerPhone: details.customerPhone || row.phone,
                providerId: details.providerId || details.targetId,
                providerEmail: details.providerEmail,
                messages: [msg],
                updatedAt: msg.at,
              });
            }
          } catch {
            // تخطي السجلات غير المتوافقة
          }
        }

        return Array.from(map.values());
      });
    } catch {
      // الحفاظ على الرسائل المحلية إذا تعذر الاتصال
    }
  }, []);

  useEffect(() => {
    void refreshChats();
  }, [refreshChats]);

  // دالة تحديد المحادثة كمقروءة فوراً
  const markThreadAsRead = useCallback((threadId: string) => {
    if (!threadId) return;
    setReadTimestamps((prev) => {
      const updated = { ...prev, [threadId]: new Date().toISOString() };
      try {
        window.localStorage.setItem(READ_TIMESTAMPS_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  // عزل المحادثات حسب هوية المستخدم الحالي المسجل بدقة تامة
  const visibleThreads = useMemo(() => {
    if (!profile) {
      // زائر غير مسجل: لا تعرض له محادثات العملاء الآخرين
      return allThreadsState.filter(
        (t) => t.customerEmail === 'guest' && t.messages && t.messages.length > 0,
      );
    }

    if (isAdmin) {
      // مديرة المنصة: ترى المحادثات النشطة التي تحتوي على رسائل
      return allThreadsState.filter((t) => t.messages && t.messages.length > 0);
    }

    if (isProvider) {
      // المزود (معرض أو مصمم): يرى فقط المحادثات الموجهة له هو تحديداً
      const providerEmail = (profile.email || '').toLowerCase().trim();
      const storeId = profile.storeId || '';
      const designerId = profile.designerId || '';
      const businessName = (profile.businessName || profile.fullName || '').toLowerCase().trim();

      return allThreadsState.filter((t) => {
        if (!t.messages || t.messages.length === 0) return false;

        // مطابقة مباشرة بالإيميل الخاص بالمزود
        if (t.providerEmail && t.providerEmail.toLowerCase().trim() === providerEmail) return true;

        // مطابقة المعرف الخاص بالمتجر أو المصمم
        if (storeId && (t.id === storeId || t.providerId === storeId || t.threadId.includes(storeId))) return true;
        if (designerId && (t.id === designerId || t.providerId === designerId || t.threadId.includes(designerId))) return true;

        // مطابقة الحسابات التجريبية المعتمدة
        if (providerEmail === 'reem@ewan.com' && (t.type === 'designer' || t.name.includes('ريم') || t.threadId.includes('reem') || t.id.includes('285c6c4b'))) return true;
        if (providerEmail === 'altaweel@ewan.com' && (t.name.includes('الطويل') || t.threadId.includes('altaweel') || t.id.includes('e8a10001'))) return true;
        if (providerEmail === 'homecentre@ewan.com' && (t.name.includes('هوم سنتر') || t.threadId.includes('homecentre') || t.id.includes('e8a10002'))) return true;
        if (providerEmail === 'ard@ewan.com' && (t.name.includes('حمير') || t.threadId.includes('ard') || t.id.includes('3117f43e'))) return true;

        // مطابقة اسم المنشأة
        if (businessName && (t.name.toLowerCase().includes(businessName) || businessName.includes(t.name.toLowerCase()))) {
          return true;
        }

        return false;
      });
    }

    // العميل: يرى فقط المحادثات التي بدأها هو بنفسه
    const customerEmail = (profile.email || '').toLowerCase().trim();
    const customerId = profile.id;
    const customerPhone = (profile.phone || '').replace(/\D/g, '');

    return allThreadsState.filter((t) => {
      if (!t.messages || t.messages.length === 0) return false;

      if (t.customerEmail && t.customerEmail.toLowerCase().trim() === customerEmail) return true;
      if (customerId && t.customerId === customerId) return true;
      if (t.threadId.toLowerCase().includes(customerEmail)) return true;
      if (customerPhone && t.customerPhone && t.customerPhone.replace(/\D/g, '') === customerPhone) return true;

      return false;
    });
  }, [allThreadsState, profile, isAdmin, isProvider]);

  // فتح محادثة
  const openChat = useCallback(
    (target: ChatTarget) => {
      const customerIdentifier = (profile?.email || profile?.id || 'guest').toLowerCase().trim();
      const threadId = `${target.type}-${target.id}-${customerIdentifier}`;

      setAllThreadsState((current) => {
        if (current.some((thread) => thread.threadId === threadId)) return current;
        return [
          ...current,
          {
            ...target,
            threadId,
            customerEmail: profile?.email || 'guest',
            customerId: profile?.id || 'guest',
            customerName: profile?.fullName || 'عميل إيوان',
            customerPhone: profile?.phone || '',
            providerId: target.id,
            providerEmail: target.providerEmail,
            messages: [],
            updatedAt: new Date().toISOString(),
          },
        ];
      });

      setActiveId(threadId);
      markThreadAsRead(threadId);
      setIsDrawerOpen(true);
    },
    [profile, markThreadAsRead],
  );

  const closeChat = useCallback(() => setActiveId(null), []);

  const activeThread = useMemo(
    () => allThreadsState.find((thread) => thread.threadId === activeId) ?? null,
    [allThreadsState, activeId],
  );

  // إرسال رسالة من العميل
  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !activeId) return;

      const message: ChatMessage = {
        id: `m-${Date.now()}`,
        from: 'customer',
        text: trimmed,
        at: new Date().toISOString(),
        senderName: profile?.fullName || 'عميل إيوان',
      };

      setAllThreadsState((current) =>
        current.map((thread) =>
          thread.threadId === activeId
            ? {
                ...thread,
                customerEmail: thread.customerEmail || profile?.email || 'guest',
                customerId: thread.customerId || profile?.id || 'guest',
                customerName: thread.customerName || profile?.fullName || 'عميل إيوان',
                customerPhone: thread.customerPhone || profile?.phone || '',
                messages: [...thread.messages, message],
                updatedAt: message.at,
              }
            : thread,
        ),
      );

      // تحديد مقروءة للطرف المرسل
      markThreadAsRead(activeId);

      const targetThread = allThreadsState.find((t) => t.threadId === activeId);
      void (async () => {
        try {
          await supabase.from('requests').insert({
            type: 'chat_message',
            name: profile?.fullName || targetThread?.customerName || 'عميل إيوان',
            phone: profile?.phone || targetThread?.customerPhone || '',
            details: JSON.stringify({
              threadId: activeId,
              messageId: message.id,
              from: message.from,
              text: message.text,
              at: message.at,
              senderName: profile?.fullName || 'عميل إيوان',
              targetType: targetThread?.type ?? 'store',
              targetId: targetThread?.id ?? '',
              targetName: targetThread?.name ?? '',
              targetPhone: targetThread?.phone ?? '',
              customerEmail: profile?.email || targetThread?.customerEmail || '',
              customerId: profile?.id || targetThread?.customerId || '',
              customerName: profile?.fullName || targetThread?.customerName || '',
              customerPhone: profile?.phone || targetThread?.customerPhone || '',
              providerId: targetThread?.providerId || targetThread?.id || '',
              providerEmail: targetThread?.providerEmail || '',
            }),
            status: 'unread',
          });
        } catch {
          // offline local fallback
        }
      })();
    },
    [activeId, allThreadsState, profile, markThreadAsRead],
  );

  // إرسال رد من المزود
  const sendReply = useCallback(
    async (threadId: string, text: string, senderName?: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const thread = allThreadsState.find((t) => t.threadId === threadId);
      const effectiveSender = senderName || profile?.businessName || profile?.fullName || 'المزود';

      const message: ChatMessage = {
        id: `r-${Date.now()}`,
        from: 'provider',
        text: trimmed,
        at: new Date().toISOString(),
        senderName: effectiveSender,
      };

      setAllThreadsState((current) =>
        current.map((t) =>
          t.threadId === threadId
            ? { ...t, messages: [...t.messages, message], updatedAt: message.at }
            : t,
        ),
      );

      markThreadAsRead(threadId);

      try {
        await supabase.from('requests').insert({
          type: 'chat_message',
          name: effectiveSender,
          phone: thread?.customerPhone || thread?.phone || '',
          details: JSON.stringify({
            threadId,
            messageId: message.id,
            from: 'provider',
            text: trimmed,
            at: message.at,
            senderName: effectiveSender,
            targetType: thread?.type ?? 'store',
            targetId: thread?.id ?? '',
            targetName: thread?.name ?? '',
            targetPhone: thread?.phone ?? '',
            customerEmail: thread?.customerEmail || '',
            customerId: thread?.customerId || '',
            customerName: thread?.customerName || '',
            customerPhone: thread?.customerPhone || '',
            providerId: thread?.providerId || thread?.id || '',
            providerEmail: profile?.email || thread?.providerEmail || '',
          }),
          status: 'read',
        });
      } catch {
        // local only if offline
      }
    },
    [allThreadsState, profile, markThreadAsRead],
  );

  // حساب عدد الرسائل غير المقروءة بدقة (تصفير فوري بمجرد القراءة)
  const totalUnread = useMemo(() => {
    if (!profile) return 0;

    let unreadCount = 0;
    const incomingFrom = isProvider ? 'customer' : 'provider';

    for (const thread of visibleThreads) {
      const lastReadIso = readTimestamps[thread.threadId];
      const lastReadTime = lastReadIso ? new Date(lastReadIso).getTime() : 0;

      const unreadInThread = thread.messages.filter((m) => {
        const msgTime = new Date(m.at).getTime();
        return m.from === incomingFrom && msgTime > lastReadTime;
      }).length;

      unreadCount += unreadInThread;
    }

    return unreadCount;
  }, [profile, isProvider, visibleThreads, readTimestamps]);

  const totalMessages = totalUnread;

  const value = useMemo<ChatContextValue>(
    () => ({
      threads: visibleThreads,
      allThreads: allThreadsState,
      activeThread,
      openChat,
      closeChat,
      sendMessage,
      sendReply,
      markThreadAsRead,
      totalMessages,
      totalUnread,
      refreshChats,
      isDrawerOpen,
      setDrawerOpen,
      openDrawer,
      closeDrawer,
    }),
    [
      visibleThreads,
      allThreadsState,
      activeThread,
      openChat,
      closeChat,
      sendMessage,
      sendReply,
      markThreadAsRead,
      totalMessages,
      totalUnread,
      refreshChats,
      isDrawerOpen,
      setDrawerOpen,
      openDrawer,
      closeDrawer,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used inside ChatProvider');
  return context;
};
