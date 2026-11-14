import { useState } from 'react';
import {
  MessageCircle,
  X,
  Send,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { useCatalog } from '@/contexts/CatalogContext';
import { cn } from '@/lib/utils';

export const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { threads, activeThread, openChat, closeChat, sendMessage } = useChat();
  const { stores, designers } = useCatalog();
  const [inputText, setInputText] = useState('');

  // إجمالي الرسائل
  const totalMessagesCount = threads.reduce((acc, t) => acc + t.messages.length, 0);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText.trim());
    setInputText('');
  };

  const handleSelectTarget = (type: 'store' | 'designer', id: string, name: string, phone: string) => {
    openChat({ type, id, name, phone });
  };

  return (
    <>
      {/* زر الشات العائم على طريقة الواتساب */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xl transition-transform hover:scale-110 active:scale-95"
          aria-label="محادثة المعارض والمصممين"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-7 w-7" />
          )}

          {/* شارة العداد */}
          {!isOpen && totalMessagesCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold text-white shadow-md">
              {totalMessagesCount}
            </span>
          )}
        </button>
      </div>

      {/* نافذة المحادثة العائمة */}
      {isOpen && (
        <div
          dir="rtl"
          className="fixed bottom-24 left-4 sm:left-6 z-50 flex h-[520px] w-[calc(100vw-2rem)] sm:w-96 flex-col overflow-hidden rounded-3xl border border-[#E5DEC9] bg-[#FAF7F2] shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* ترويسة الشات الخضراء كنمط الواتساب */}
          <div className="flex items-center justify-between bg-emerald-700 px-4 py-3.5 text-white">
            <div className="flex items-center gap-2.5">
              {activeThread ? (
                <button
                  type="button"
                  onClick={closeChat}
                  className="rounded-full p-1 text-emerald-100 hover:bg-emerald-600 hover:text-white"
                  title="رجوع للمحادثات"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">
                  {activeThread ? activeThread.name : 'محادثات معارض ومصممي إيوان'}
                </p>
                <p className="text-[11px] text-emerald-100">
                  {activeThread
                    ? activeThread.type === 'designer'
                      ? 'مصمم ديكور معتمد • متصل الآن'
                      : 'معرض أثاث حضرمي • متصل الآن'
                    : 'استفسر مباشرة وتلق الردود هنا'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-emerald-100 hover:bg-emerald-600 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* محتوى الشات */}
          {activeThread ? (
            // شاشة المحادثة المحددة
            <div className="flex flex-1 flex-col overflow-hidden bg-[#EFEAE2]">
              {/* شريط الإجراءات السريع للواتساب الرسمي */}
              {activeThread.phone && (
                <div className="flex items-center justify-between border-b border-[#E5DEC9] bg-white/90 px-4 py-2 text-xs">
                  <span className="text-[#5C534E]">رقم التواصل: {activeThread.phone}</span>
                  <a
                    href={`https://wa.me/967${activeThread.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `مرحباً ${activeThread.name}، أنا أتواصل معكم عبر منصة إيوان للأثاث.`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 shadow-2xs"
                  >
                    <span>فتح واتساب</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              {/* فقاعات الرسائل */}
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {activeThread.messages.length === 0 ? (
                  <div className="my-auto rounded-2xl bg-white/80 p-4 text-center text-xs text-[#5C534E] shadow-2xs border border-[#E5DEC9]">
                    <Sparkles className="mx-auto h-5 w-5 text-[#9C6644] mb-1.5" />
                    مرحباً بك! اكتب استفسارك بخصوص الأسعار، التفصيل، أو المقاسات وسيرد عليك ممثل{' '}
                    <strong>{activeThread.name}</strong> فوراً.
                  </div>
                ) : (
                  activeThread.messages.map((msg) => {
                    const isMe = msg.from === 'customer';
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          'max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs',
                          isMe
                            ? 'mr-auto rounded-tl-2xs bg-emerald-700 text-white'
                            : 'ml-auto rounded-tr-2xs bg-white text-[#231F1E] border border-[#E5DEC9]',
                        )}
                      >
                        {!isMe && (
                          <p className="mb-1 text-[10px] font-bold text-[#9C6644]">
                            {activeThread.name}
                          </p>
                        )}
                        <p>{msg.text}</p>
                        <p
                          className={cn(
                            'mt-1 text-left text-[9px]',
                            isMe ? 'text-emerald-200' : 'text-[#786C65]',
                          )}
                        >
                          {new Date(msg.at).toLocaleTimeString('ar-YE', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* حقل الإرسال */}
              <div className="flex items-center gap-2 border-t border-[#E5DEC9] bg-white p-3">
                <input
                  type="text"
                  placeholder="اكتب رسالتك هنا…"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="flex-1 rounded-full border border-[#E5DEC9] bg-[#FAF7F2] px-4 py-2 text-xs outline-none focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            // شاشة قائمة المحادثات والمزودين
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* المحادثات الجارية */}
              {threads.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-[#786C65] mb-2">محادثاتك السابقة:</p>
                  <div className="space-y-2">
                    {threads.map((thread) => {
                      const lastMsg = thread.messages[thread.messages.length - 1];
                      return (
                        <button
                          key={thread.threadId}
                          type="button"
                          onClick={() => openChat(thread)}
                          className="flex w-full items-center justify-between rounded-2xl border border-[#E5DEC9] bg-white p-3 text-right shadow-2xs hover:border-emerald-600 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-[#231F1E]">
                              {thread.name}
                            </p>
                            <p className="truncate text-[11px] text-[#786C65] mt-0.5">
                              {lastMsg ? lastMsg.text : 'اضغط للمراسلة'}
                            </p>
                          </div>
                          <span className="rounded-full bg-[#FAF7F2] px-2 py-0.5 text-[10px] text-[#9C6644] font-semibold border border-[#E5DEC9]">
                            {thread.messages.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* بدء محادثة جديدة مع المعارض والمصممين */}
              <div>
                <p className="text-xs font-bold text-[#786C65] mb-2">
                  ابدأ محادثة مع أرقى معارض ومصممي المكلا:
                </p>
                <div className="space-y-2">
                  {/* المصممة ريم الكثيري */}
                  {designers.slice(0, 1).map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleSelectTarget('designer', d.id, d.name, d.phone || '777000000')}
                      className="flex w-full items-center justify-between rounded-2xl border border-[#E5DEC9] bg-white p-3 text-right shadow-2xs hover:border-[#9C6644] transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#231F1E] flex items-center gap-1.5">
                          <span>{d.name}</span>
                          <span className="rounded-full bg-[#FAF7F2] px-2 py-0.5 text-[9px] text-[#9C6644] font-bold">
                            مصممة AI
                          </span>
                        </p>
                        <p className="text-[10px] text-[#786C65] mt-0.5">{d.title}</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-700">مراسلة</span>
                    </button>
                  ))}

                  {/* المعارض المعتمدة */}
                  {stores.slice(0, 5).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSelectTarget('store', s.id, s.name, s.phone)}
                      className="flex w-full items-center justify-between rounded-2xl border border-[#E5DEC9] bg-white p-3 text-right shadow-2xs hover:border-emerald-600 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#231F1E]">{s.name}</p>
                        <p className="text-[10px] text-[#786C65] mt-0.5">{s.area || s.city}</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-700">مراسلة</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
