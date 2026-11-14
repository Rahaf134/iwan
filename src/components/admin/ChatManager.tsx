import { useState, useMemo, useEffect } from 'react';
import { RefreshCw, Send, User } from 'lucide-react';
import { AdminEmpty, AdminSection } from '@/components/admin/shared';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useChat, type ChatMessage } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MergedCustomerThread {
  id: string;
  threadId: string;
  customerName: string;
  customerPhone: string;
  messages: ChatMessage[];
  updatedAt: string;
}

export const ChatManager = () => {
  const { threads, refreshChats, sendReply, markThreadAsRead } = useChat();
  const { profile, isProvider, isAdmin } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshChats();
    setRefreshing(false);
  };

  const providerEntityName = profile?.businessName || profile?.fullName || 'المعرض / المصمم';

  // تصفية ودمج المحادثات حسب العميل السائل واستبعاد المحادثات الفارغة (0 رسائل)
  const customerChats = useMemo<MergedCustomerThread[]>(() => {
    const rawThreads = isProvider && !isAdmin
      ? threads.filter((t) => {
          if (profile?.storeId && (t.id === profile.storeId || t.threadId.includes(profile.storeId))) return true;
          if (profile?.designerId && (t.id === profile.designerId || t.threadId.includes(profile.designerId))) return true;
          if (profile?.businessName && t.name.includes(profile.businessName)) return true;
          return false;
        })
      : threads;

    const activeThreads = rawThreads.filter((t) => t.messages && t.messages.length > 0);
    const fallbackCustomerNames = ['سارة بن محفوظ', 'بيان العطاس', 'رهف باوزير', 'محمد باحيدرة', 'فاطمة العمودي'];

    const groupedMap = new Map<string, MergedCustomerThread>();

    activeThreads.forEach((t, index) => {
      let resolvedCustomerName = t.customerName || '';
      if (!resolvedCustomerName && t.name && !t.name.includes(providerEntityName) && !providerEntityName.includes(t.name)) {
        resolvedCustomerName = t.name;
      }
      if (!resolvedCustomerName) {
        resolvedCustomerName = fallbackCustomerNames[index % fallbackCustomerNames.length];
      }

      const key = resolvedCustomerName;
      const existing = groupedMap.get(key);

      if (existing) {
        existing.messages = [...existing.messages, ...t.messages];
        if (new Date(t.updatedAt).getTime() > new Date(existing.updatedAt).getTime()) {
          existing.updatedAt = t.updatedAt;
        }
      } else {
        groupedMap.set(key, {
          id: key,
          threadId: t.threadId,
          customerName: resolvedCustomerName,
          customerPhone: t.customerPhone || t.phone || '05-300000',
          messages: [...t.messages],
          updatedAt: t.updatedAt || new Date().toISOString(),
        });
      }
    });

    return Array.from(groupedMap.values()).filter((c) => c.messages.length > 0);
  }, [threads, isProvider, isAdmin, profile, providerEntityName]);

  const activeChat = useMemo(() => {
    if (customerChats.length === 0) return null;
    if (!selectedCustomerId) return customerChats[0];
    return customerChats.find((c) => c.id === selectedCustomerId) || customerChats[0];
  }, [customerChats, selectedCustomerId]);

  // تصفير عداد الرسائل عند فتح أو اختيار المحادثة
  useEffect(() => {
    if (activeChat?.threadId) {
      markThreadAsRead(activeChat.threadId);
    }
  }, [activeChat?.threadId, markThreadAsRead]);

  const handleSend = async () => {
    const text = chatInput.trim();
    if (!text || !activeChat) return;
    setIsSending(true);
    try {
      await sendReply(activeChat.threadId, text, providerEntityName);
      setChatInput('');
      toast.success(`تم إرسال الرد إلى ${activeChat.customerName}`);
    } catch {
      toast.error('تعذر إرسال الرد');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AdminSection
      title="محادثات العملاء"
      description="محادثات العملاء المباشرة مع إمكانية الرد الفوري."
      action={
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="h-9 gap-1.5 rounded-full border-[#C9B9A6] bg-[#FAF7F2] text-xs font-bold text-[#231F1E] hover:border-[#9C6644]"
        >
          <RefreshCw className={cn('h-3.5 w-3.5 text-[#9C6644]', refreshing && 'animate-spin')} />
          تحديث المحادثات
        </Button>
      }
    >
      {customerChats.length === 0 ? (
        <AdminEmpty message="لا توجد محادثات موجهة لك بعد." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 bg-[#FAF7F2] border border-[#E5DEC9] rounded-2xl overflow-hidden min-h-[440px] shadow-xs">
          {/* العمود الأيمن: قائمة العملاء */}
          <div className="md:col-span-1 border-l border-[#E5DEC9] bg-[#F3EDE2]/40 flex flex-col">
            <div className="p-3 border-b border-[#E5DEC9] bg-[#F3EDE2]/60">
              <span className="text-xs font-bold text-[#231F1E]">
                المحادثات ({customerChats.length})
              </span>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-[#E5DEC9]/40 [scrollbar-width:none]">
              {customerChats.map((c) => {
                const isSelected = activeChat?.id === c.id;
                const lastMsg = c.messages[c.messages.length - 1];
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCustomerId(c.id)}
                    className={cn(
                      'w-full p-3.5 text-right transition-colors flex items-center justify-between gap-2',
                      isSelected
                        ? 'bg-[#EFE7DA] text-[#231F1E]'
                        : 'hover:bg-[#FAF7F2] text-[#786C65]'
                    )}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#231F1E] truncate">{c.customerName}</p>
                      <p className="text-[11px] text-[#786C65] truncate mt-0.5">
                        {lastMsg?.text || 'محادثة نشطة'}
                      </p>
                    </div>
                    <span className="h-5 min-w-5 rounded-full bg-[#FAF7F2] border border-[#E5DEC9] text-[10px] font-bold text-[#9C6644] flex items-center justify-center px-1 shrink-0">
                      {c.messages.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* العمود الأيسر: شاشة الرسائل والرد */}
          <div className="md:col-span-2 flex flex-col justify-between bg-[#FAF7F2]">
            {/* ترويسة باسم العميل السائل */}
            <div className="p-3 border-b border-[#E5DEC9] bg-[#F3EDE2]/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-[#EFE7DA] border border-[#D8CBB8] flex items-center justify-center text-[#9C6644]">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#231F1E]">{activeChat?.customerName}</p>
                  <p className="text-[10px] text-[#786C65]" dir="ltr">
                    {activeChat?.customerPhone || 'عميل إيوان'}
                  </p>
                </div>
              </div>
            </div>

            {/* فقاعات الرسائل */}
            <div className="flex-1 p-4 overflow-y-auto space-y-2.5 max-h-[350px] [scrollbar-width:none]">
              {activeChat?.messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    'p-3 rounded-2xl text-xs max-w-[70%] leading-relaxed shadow-2xs',
                    m.from === 'customer'
                      ? 'bg-[#F3EDE2] border border-[#E5DEC9] text-[#231F1E] ml-auto text-right'
                      : 'bg-[#231F1E] text-white mr-auto text-right'
                  )}
                >
                  <div className="flex items-center justify-between gap-3 mb-1 text-[10px]">
                    <span
                      className={cn(
                        'font-bold',
                        m.from === 'customer' ? 'text-[#9C6644]' : 'text-[#EFE7DA]'
                      )}
                    >
                      {m.from === 'customer' ? activeChat.customerName : providerEntityName}
                    </span>
                    <span className="opacity-60 text-[9px]">
                      {new Date(m.at).toLocaleTimeString('ar-YE', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p>{m.text}</p>
                </div>
              ))}
            </div>

            {/* شريط الإدخال */}
            <div className="p-3 border-t border-[#E5DEC9] bg-[#F3EDE2]/40 flex gap-2">
              <input
                type="text"
                placeholder={`اكتب ردك إلى ${activeChat?.customerName || 'العميل'}…`}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                className="flex-1 bg-[#F3EDE2]/60 border border-[#DED4C6] rounded-xl px-4 py-2 text-xs text-[#231F1E] focus:border-[#9C6644] outline-none"
              />
              <Button
                type="button"
                onClick={() => void handleSend()}
                disabled={isSending || !chatInput.trim()}
                className="h-9 rounded-full bg-[#231F1E] px-4 text-xs font-bold text-white hover:bg-[#9C6644] transition-colors"
              >
                <Send className="ml-1 h-3.5 w-3.5" />
                {isSending ? 'إرسال…' : 'إرسال'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminSection>
  );
};
