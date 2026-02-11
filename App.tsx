import React, { useState, useRef, useEffect } from 'react';
import { Send, UploadCloud, Menu, UserCircle, LogOut, ArrowRight, Bot, Image as ImageIcon, FileText } from 'lucide-react';
import AuthPage from './components/AuthPage';
import FileUpload from './components/FileUpload';
import { sendMessageToGemini } from './services/geminiService';
import { User, Message, FileAttachment } from './types';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './services/firebase';

function App() {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Quack! I'm FileDuck. Upload a file or just start chatting. I'm here to help!",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentAttachments, setCurrentAttachments] = useState<FileAttachment[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const newUser: User = {
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email || ''
        };
        setUser(newUser);
        
        // If this is a fresh login (we can check simple state or just rely on existing messages state check)
        // We only add welcome if history is empty (or just default welcome)
        // Note: This might trigger on refresh, so we check if we already have the login-welcome
        
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handlers
  const handleLogin = (newUser: User) => {
    // This is now mainly handled by the onAuthStateChanged effect, 
    // but can be used for explicit UI updates if needed.
    // We'll add the welcome message here if the user just logged in and messages are default.
    if (messages.length === 1 && messages[0].id === 'welcome') {
        setMessages(prev => [...prev, {
            id: 'login-welcome',
            role: 'model',
            text: `Welcome to the flock, ${newUser.name}! 🦆 How can I help you with your files today?`,
            timestamp: new Date()
        }]);
    }
  };
  
  // Trigger welcome message when user is set from null (state change)
  useEffect(() => {
      if (user && messages.length === 1 && messages[0].id === 'welcome') {
          setMessages(prev => [...prev, {
            id: 'login-welcome',
            role: 'model',
            text: `Welcome to the flock, ${user.name}! 🦆 How can I help you with your files today?`,
            timestamp: new Date()
        }]);
      }
  }, [user]);

  const handleLogout = async () => {
    try {
        await signOut(auth);
        setUser(null);
        setMessages([{
            id: 'reset',
            role: 'model',
            text: "Quack! I'm FileDuck. Upload a file or just start chatting. I'm here to help!",
            timestamp: new Date()
        }]);
        setCurrentAttachments([]);
    } catch (error) {
        console.error("Error signing out:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && currentAttachments.length === 0) return;

    const userMsgId = Date.now().toString();
    const newUserMessage: Message = {
      id: userMsgId,
      role: 'user',
      text: inputMessage,
      timestamp: new Date(),
      attachments: [...currentAttachments]
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setCurrentAttachments([]); // Clear attachments after sending
    setIsTyping(true);

    // Call Gemini
    const responseText = await sendMessageToGemini(messages, newUserMessage.text, newUserMessage.attachments);

    const botMsgId = (Date.now() + 1).toString();
    const newBotMessage: Message = {
      id: botMsgId,
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setIsTyping(false);
    setMessages(prev => [...prev, newBotMessage]);
  };

  const handleFilesSelected = (files: FileAttachment[]) => {
    setCurrentAttachments(prev => [...prev, ...files]);
  };

  if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-amber-500">
            <div className="text-4xl animate-bounce">🦆</div>
        </div>
      );
  }

  // If user is not authenticated, show the AuthPage landing
  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  // Otherwise, show the Chat Interface
  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-950 text-slate-200">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo(0, 0)}>
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 transform rotate-3 group-hover:rotate-6 transition-transform duration-300">
                <span className="text-2xl select-none">🦆</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                File<span className="text-amber-500">Duck</span>
              </span>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-semibold text-slate-200">{user.name}</span>
                  <span className="text-xs text-slate-500">{user.email}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-full hover:bg-slate-800"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-slate-900">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
        
        {/* Left Sidebar (File Upload & Context) - Collapsible on mobile */}
        <aside className="w-full md:w-80 bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-6 overflow-y-auto">
           
           <div>
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Upload Context</h3>
             <FileUpload onFilesSelected={handleFilesSelected} />
           </div>

           {/* Features Info */}
           <div className="mt-auto space-y-4 text-xs text-slate-500">
             <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-800 rounded-md shadow-sm border border-slate-700">
                    <ImageIcon className="w-3 h-3 text-amber-500" />
                </div>
                <span>Image Analysis</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-800 rounded-md shadow-sm border border-slate-700">
                    <FileText className="w-3 h-3 text-blue-500" />
                </div>
                <span>Document Summaries</span>
             </div>
           </div>
        </aside>

        {/* Chat Area */}
        <section className="flex-1 flex flex-col bg-slate-950 relative">
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-hide">
                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`flex gap-4 max-w-3xl mx-auto ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${
                            msg.role === 'user' 
                            ? 'bg-slate-800 text-white border border-slate-700' 
                            : 'bg-amber-500/10 text-2xl border border-amber-500/20'
                        }`}>
                            {msg.role === 'user' ? <UserCircle className="w-6 h-6 text-slate-400" /> : '🦆'}
                        </div>

                        {/* Bubble */}
                        <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            
                            {/* Attachments in message history */}
                            {msg.attachments && msg.attachments.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-1 justify-end">
                                    {msg.attachments.map((att, idx) => (
                                        <div key={idx} className="bg-slate-800 p-2 rounded-lg border border-slate-700 text-xs flex items-center gap-2 max-w-[200px]">
                                            {att.type.startsWith('image/') ? (
                                                <img src={att.data} alt="attachment" className="w-8 h-8 object-cover rounded" />
                                            ) : (
                                                <FileText className="w-4 h-4 text-slate-400" />
                                            )}
                                            <span className="truncate text-slate-300">{att.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div 
                                className={`
                                    py-3 px-5 rounded-2xl shadow-sm leading-relaxed whitespace-pre-wrap
                                    ${msg.role === 'user' 
                                        ? 'bg-amber-600 text-white rounded-tr-none shadow-lg shadow-amber-900/20' 
                                        : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none'
                                    }
                                `}
                            >
                                {msg.text}
                            </div>
                            <span className="text-[10px] text-slate-600 px-1">
                                {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                    </div>
                ))}
                
                {isTyping && (
                    <div className="flex gap-4 max-w-3xl mx-auto">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl animate-pulse">🦆</div>
                        <div className="bg-slate-900 border border-slate-800 py-4 px-6 rounded-2xl rounded-tl-none shadow-md flex gap-1 items-center">
                            <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-slate-800 bg-slate-950 p-4">
                <div className="max-w-3xl mx-auto">
                    {currentAttachments.length > 0 && (
                        <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                            {currentAttachments.map((file, idx) => (
                                <div key={idx} className="relative group bg-slate-900 border border-slate-700 rounded-lg p-2 flex items-center gap-2 min-w-[120px]">
                                    <div className="text-xs truncate max-w-[100px] text-slate-300">{file.name}</div>
                                    <button 
                                        onClick={() => setCurrentAttachments(prev => prev.filter((_, i) => i !== idx))}
                                        className="bg-slate-800 hover:bg-red-500/20 hover:text-red-400 rounded-full p-0.5 text-slate-500 transition-colors"
                                    >
                                        <LogOut className="w-3 h-3 rotate-45" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <div className="relative flex items-center gap-2">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Ask FileDuck anything about your files..."
                            className="w-full pl-5 pr-14 py-4 bg-slate-900 border border-slate-800 rounded-full focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-slate-200 placeholder-slate-600 transition-all shadow-lg"
                        />
                        <button 
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() && currentAttachments.length === 0}
                            className="absolute right-2 p-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-amber-900/20"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-center text-[10px] text-slate-600 mt-2">
                        FileDuck can make mistakes. Verify important info. 🦆
                    </p>
                </div>
            </div>

        </section>
      </main>
    </div>
  );
}

export default App;