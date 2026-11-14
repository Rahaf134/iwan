import { useState, useEffect } from 'react';
import {
  MessageCircle,
  Send,
  ArrowRight,
  Store,
  Sparkles,
  User,
  Clock,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useChat } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';

interface ChatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChatDrawer = ({ open, onOpenChange }: ChatDrawerProps) => {
  const { threads, activeThread, openChat, closeChat, sendMessage, markThreadAsRead } = useChat();
  const [inputText, setInputText] = useState('');

  // تصفير عداد غير المقروء تلقائياً بمجرد فتح أي محادثة نشطة
  useEffect(() => {
    if (activeThread?.threadId) {
      markThreadAsRead(activeThread.threadId);
    }
  }, [activeThread?.threadId, markThreadAsRead]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-full sm:max-w-md p-0 flex flex-col bg-[#FAF7F2] border-r border-[#E5DEC9] text-right"
        dir="rtl"
      >
        {/* الترويسة الأنيقة بنمط Casa */}
        <SheetHeader className="p-4 sm:p-5 border-b border-[#E5DEC9] bg-[#F3EDE2]/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {activeThread ? (
                <button
                  type="button"
                  onClick={closeChat}
                  className="rounded-full p-1.5 text-[#5C534E] hover:bg-[#E5DEC9]/50 transition-colors"
                  title="العودة لكل المحادثات"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#9C6644]/10 text-[#9C6644] border border-[#9C6644]/20">
                  <MessageCircle className="h-5 w-5" />
                </div>
              )}
              <div>
                <SheetTitle className="font-display text-base sm:text-lg text-[#231F1E]">
                  {activeThread ? activeThread.name : 'محادثاتي مع المعارض والمصممين'}
                </SheetTitle>
                <p className="text-xs text-[#786C65] mt-0.5">
                  {activeThread
                    ? activeThread.type === 'designer'
                      ? 'محادثة استشارة وتفصيل مباشر'
                      : 'محادثة مباشرة مع المعرض'
                    : 'تواصل فوري ومباشر داخل منصة إيوان'}
                </p>
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* جسم الشات */}
        {activeThread ? (
          // شاشة المحادثة المحددة
          <div className="flex flex-1 flex-col overflow-hidden bg-[#FAF7F2]">
            {/* الرسائل المتبادلة */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {activeThread.messages.length === 0 ? (
                <div className="my-auto rounded-2xl bg-[#F3EDE2]/70 p-5 text-center text-xs text-[#5C534E] border border-[#E5DEC9]">
                  <Sparkles className="mx-auto h-6 w-6 text-[#9C6644] mb-2" />
                  <p className="font-bold text-[#231F1E] mb-1">مرحباً بك في المحادثة المباشرة</p>
                  اكتب استفسارك عن المقاسات، الأسعار، أو التوصيل وسيرد عليك ممثل{' '}
                  <strong>{activeThread.name}</strong> داخل المنصة فوراً.
                </div>
              ) : (
                activeThread.messages.map((msg) => {
                  const isMe = msg.from === 'customer';
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        'max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs transition-all',
                        isMe
                          ? 'mr-auto rounded-tl-2xs bg-[#231F1E] text-stone-100'
                          : 'ml-auto rounded-tr-2xs bg-[#F3EDE2] text-[#231F1E] border border-[#E5DEC9]',
                      )}
                    >
                      {!isMe && (
                        <p className="mb-1 text-[10px] font-bold text-[#9C6644]">
                          {msg.senderName || activeThread.name}
                        </p>
                      )}
                      <p>{msg.text}</p>
                      <div
                        className={cn(
                          'mt-1 flex items-center justify-end gap-1 text-[9px]',
                          isMe ? 'text-stone-400' : 'text-[#786C65]',
                        )}
                      >
                        <Clock className="h-2.5 w-2.5" />
                        <span>
                          {new Date(msg.at).toLocaleTimeString('ar-YE', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* حقل الإدخال والإرسال */}
            <div className="border-t border-[#E5DEC9] bg-[#F3EDE2]/60 p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="اكتب رسالتك للمصمم أو المعرض…"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="flex-1 rounded-full border border-[#E5DEC9] bg-[#FAF7F2] px-4 py-2.5 text-xs text-[#231F1E] outline-none focus:border-[#9C6644] placeholder:text-[#9C8E84]"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#9C6644] text-white hover:bg-[#855436] disabled:opacity-40 transition-colors shadow-2xs"
                  aria-label="إرسال"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          // شاشة قائمة المحادثات النشطة الخاصة بالمستخدم فقط
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {threads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#9C6644]/10 text-[#9C6644] border border-[#9C6644]/20 mb-3">
                  <MessageCircle className="h-7 w-7" />
                </div>
                <p className="font-display font-bold text-base text-[#231F1E] mb-1.5">لا توجد محادثات بعد</p>
                <p className="text-xs text-[#786C65] max-w-xs leading-relaxed">
                  محادثاتك المباشرة مع المعارض ومصممي الديكور ستظهر هنا فور إرسال أول استفسار من صفحة أي منتج أو متجر.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-bold text-[#786C65] mb-2.5">محادثاتك الجارية:</p>
                <div className="space-y-2">
                  {threads.map((thread) => {
                    const lastMsg = thread.messages[thread.messages.length - 1];
                    return (
                      <button
                        key={thread.threadId}
                        type="button"
                        onClick={() => {
                          openChat(thread);
                          markThreadAsRead(thread.threadId);
                        }}
                        className="flex w-full items-center justify-between rounded-2xl border border-[#E5DEC9] bg-[#F3EDE2]/70 p-3.5 text-right shadow-2xs hover:border-[#9C6644] hover:bg-[#F3EDE2] transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FAF7F2] border border-[#E5DEC9] text-[#9C6644]">
                            {thread.type === 'designer' ? <User className="h-5 w-5" /> : <Store className="h-5 w-5" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-[#231F1E]">
                              {thread.name}
                            </p>
                            <p className="truncate text-[11px] text-[#786C65] mt-0.5">
                              {lastMsg ? lastMsg.text : 'اضغط لفتح المحادثة'}
                            </p>
                          </div>
                        </div>
                        <span className="mr-2 rounded-full bg-[#FAF7F2] px-2.5 py-1 text-[10px] font-bold text-[#9C6644] border border-[#E5DEC9]">
                          {thread.messages.length}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
