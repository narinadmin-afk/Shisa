import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { Search, Send, Languages, Paperclip, Users, Settings, MessageCircle } from 'lucide-react';

const API = 'http://localhost:4000';
const demoConversationId = '00000000-0000-0000-0000-000000000001';
const demoUserId = '00000000-0000-0000-0000-000000000002';

const labels = {
  th: { chats: 'แชท', teams: 'ทีมงาน', search: 'ค้นหา', type: 'พิมพ์ข้อความ...', translate: 'แปล', settings: 'ตั้งค่า' },
  en: { chats: 'Chats', teams: 'Teams', search: 'Search', type: 'Type a message...', translate: 'Translate', settings: 'Settings' },
  zh: { chats: '聊天', teams: '团队', search: '搜索', type: '输入消息...', translate: '翻译', settings: '设置' }
};

export default function App() {
  const [language, setLanguage] = useState('th');
  const [messages, setMessages] = useState([
    { id: '1', sender_name: 'Somchai', body: 'สวัสดีครับ ยินดีต้อนรับสู่ Enterprise Chat', source_language: 'th', created_at: new Date().toISOString() },
    { id: '2', sender_name: 'Zhang Wei', body: '欢迎使用企业聊天系统', source_language: 'zh', created_at: new Date().toISOString() }
  ]);
  const [text, setText] = useState('');
  const [selected, setSelected] = useState(null);
  const [translations, setTranslations] = useState({});

  const t = useMemo(() => labels[language], [language]);

  useEffect(() => {
    const socket = io(API);
    socket.emit('conversation:join', demoConversationId);
    socket.on('message:new', (message) => setMessages((prev) => [...prev, message]));
    return () => socket.disconnect();
  }, []);

  async function translate(message) {
    const res = await fetch(`${API}/api/messages/${message.id}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetLanguage: language })
    });
    const data = await res.json();
    if (data.success) setTranslations((p) => ({ ...p, [message.id]: data.data.translated }));
    else setTranslations((p) => ({ ...p, [message.id]: `[${language}] ${message.body}` }));
  }

  function sendMessage() {
    if (!text.trim()) return;
    const message = {
      id: crypto.randomUUID(),
      conversationId: demoConversationId,
      sender_id: demoUserId,
      sender_name: 'You',
      body: text.trim(),
      source_language: language,
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, message]);
    setText('');
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="h-16 bg-white border-b flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white grid place-items-center font-bold">EC</div>
          <div>
            <h1 className="font-bold">Enterprise Chat</h1>
            <p className="text-xs text-slate-500">Organization Communication</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {['th','en','zh'].map((x) => (
            <button key={x} onClick={() => setLanguage(x)}
              className={`px-3 py-1.5 rounded-lg text-sm ${language === x ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-100'}`}>
              {x === 'th' ? '🇹🇭' : x === 'en' ? '🇬🇧' : '🇨🇳'} {x.toUpperCase()}
            </button>
          ))}
          <button className="p-2 hover:bg-slate-100 rounded-lg"><Settings size={19}/></button>
        </div>
      </header>

      <main className="h-[calc(100vh-4rem)] flex">
        <aside className="w-72 bg-white border-r p-4 hidden md:block">
          <div className="flex gap-2 mb-5">
            <button className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm">+ New Chat</button>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg text-sm text-slate-500">
            <Search size={16}/> {t.search}
          </div>
          <div className="mt-6 text-xs font-semibold text-slate-400 uppercase">{t.chats}</div>
          <div className="mt-2 p-3 bg-indigo-50 rounded-xl cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-200 grid place-items-center"><MessageCircle size={18}/></div>
              <div><div className="font-semibold text-sm">General</div><div className="text-xs text-slate-500">3 members</div></div>
            </div>
          </div>
          <div className="mt-6 text-xs font-semibold text-slate-400 uppercase">{t.teams}</div>
          {['Management','Production','Engineering','QA / QC','R&D'].map((team) =>
            <div key={team} className="py-3 px-2 text-sm hover:bg-slate-50 rounded-lg"># {team}</div>
          )}
        </aside>

        <section className="flex-1 flex flex-col">
          <div className="h-16 bg-white border-b px-6 flex items-center justify-between">
            <div>
              <h2 className="font-bold">General</h2>
              <p className="text-xs text-slate-500 flex items-center gap-1"><Users size={13}/> 3 members</p>
            </div>
            <button className="p-2 hover:bg-slate-100 rounded-lg"><Users size={19}/></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender_name === 'You' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xl ${m.sender_name === 'You' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className="text-xs text-slate-500 mb-1">{m.sender_name}</div>
                  <div className={`px-4 py-3 rounded-2xl ${m.sender_name === 'You' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white border rounded-bl-sm'}`}>
                    {m.body}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <button onClick={() => { setSelected(m.id); translate(m); }} className="text-indigo-600 hover:underline flex items-center gap-1">
                      <Languages size={13}/> {t.translate}
                    </button>
                    {selected === m.id && translations[m.id] && <span className="text-slate-500">{translations[m.id]}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-white border-t">
            <div className="max-w-5xl mx-auto flex items-center gap-2">
              <button className="p-3 hover:bg-slate-100 rounded-xl"><Paperclip size={20}/></button>
              <input value={text} onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={t.type}
                className="flex-1 bg-slate-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"/>
              <button onClick={sendMessage} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"><Send size={20}/></button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
