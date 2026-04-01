import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, 
  Moon, 
  Brain, 
  CheckCircle2, 
  LayoutDashboard, 
  ChevronRight,
  AlertCircle,
  Loader2,
  Mic,
  MicOff,
  TrendingUp,
  BarChart3,
  Info,
  BookOpen,
  X
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  db, 
  auth, 
  googleProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot, 
  User,
  handleFirestoreError,
  OperationType
} from './firebase';
import { DailyData, COGNITIVE_STEPS, AppState, DOCTRINA_OPERATIVA } from './types';
import { generateMorningPlan, generateNightAudit } from './lib/gemini';

// --- Auth Component ---
const AuthScreen = ({ onLogin, loading, error }: { onLogin: () => void, loading: boolean, error: string | null }) => (
  <div className="min-h-screen bg-[#E4E3E0] flex items-center justify-center p-6">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#141414] p-12 max-w-md w-full shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] text-center space-y-8"
    >
      <div className="space-y-2">
        <h1 className="font-serif italic text-4xl">Coherencia Vital</h1>
        <p className="font-mono text-[10px] uppercase tracking-widest opacity-50">Sistema de Auditoría Ejecutiva</p>
      </div>
      <p className="text-sm opacity-70 leading-relaxed">
        Bienvenido al centro de mando. Para sincronizar tu doctrina y auditorías en la nube, por favor identifícate.
      </p>
      
      {error && (
        <div className="bg-red-50 border border-red-200 p-3 text-red-600 text-[10px] font-mono uppercase text-left">
          Error: {error}
          {error.includes('popup-closed-by-user') ? '' : ' - Asegúrate de permitir las ventanas emergentes (popups) en tu navegador.'}
        </div>
      )}

      <button 
        onClick={onLogin}
        disabled={loading}
        className="w-full py-4 bg-[#141414] text-[#E4E3E0] font-mono text-xs uppercase tracking-widest hover:bg-[#141414]/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" size={16} /> : <TrendingUp size={16} />}
        {loading ? 'Iniciando...' : 'Iniciar con Google'}
      </button>
    </motion.div>
  </div>
);

// --- Doctrina Modal ---
const DoctrinaModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#141414]/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#E4E3E0] border border-[#141414] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]"
      >
        <div className="sticky top-0 bg-[#E4E3E0] border-b border-[#141414] p-6 flex justify-between items-center">
          <h2 className="font-serif italic text-2xl">La Arquitectura de la Coherencia Vital</h2>
          <button onClick={onClose} className="hover:rotate-90 transition-transform">
            <X size={24} />
          </button>
        </div>
        <div className="p-8 space-y-8 font-sans text-sm leading-relaxed">
          <section className="space-y-4">
            <h3 className="font-mono text-[10px] uppercase tracking-widest bg-[#141414] text-[#E4E3E0] px-2 py-1 inline-block">El Metamodelo</h3>
            <div className="grid gap-4">
              <div className="border-l-2 border-[#141414] pl-4">
                <strong className="block font-mono text-[11px] mb-1">1. El Centro es la Identidad</strong>
                <p className="opacity-70">La empresa debe ser una extensión orgánica de los valores y la pasión del emprendedor (el rostro es el espejo del alma).</p>
              </div>
              <div className="border-l-2 border-[#141414] pl-4">
                <strong className="block font-mono text-[11px] mb-1">2. El Filtro es el Propósito</strong>
                <p className="opacity-70">Se dice «no» a lo que no encaja con esa identidad, protegiendo así la atención, que es el activo más frágil.</p>
              </div>
              <div className="border-l-2 border-[#141414] pl-4">
                <strong className="block font-mono text-[11px] mb-1">3. El Motor es la Humanidad</strong>
                <p className="opacity-70">El éxito no es una cifra, sino la capacidad de generar un entorno donde el equipo sienta que está "construyendo una catedral" y no solo "cargando piedras".</p>
              </div>
              <div className="border-l-2 border-[#141414] pl-4">
                <strong className="block font-mono text-[11px] mb-1">4. El Proceso es el Movimiento Perpetuo</strong>
                <p className="opacity-70">Se acepta el fracaso y el cambio no como derrotas, sino como la dinámica natural de un organismo vivo que opera en un mercado global y cambiante.</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-mono text-[10px] uppercase tracking-widest bg-[#141414] text-[#E4E3E0] px-2 py-1 inline-block">Doctrina Operativa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DOCTRINA_OPERATIVA.trim().split('\n').map((line, i) => (
                <div key={i} className="p-3 border border-[#141414]/10 font-mono text-[11px] uppercase tracking-tighter">
                  {line}
                </div>
              ))}
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

// --- Speech Recognition Component ---
const SpeechInput = ({ onTranscript, placeholder }: { onTranscript: (text: string) => void, placeholder?: string }) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tu navegador no soporta reconocimiento de voz.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      // Handle common errors gracefully
      if (event.error === 'no-speech') {
        setError('No se detectó voz.');
      } else if (event.error === 'aborted') {
        // Silently handle aborted
      } else if (event.error === 'not-allowed') {
        setError('Permiso denegado.');
      } else {
        console.error('Speech error:', event.error);
        setError('Error de voz.');
      }
      setIsListening(false);
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="flex items-center gap-2">
      {error && (
        <motion.span 
          initial={{ opacity: 0, x: 5 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-[9px] font-mono uppercase text-red-500 bg-red-50 px-2 py-1 border border-red-200"
        >
          {error}
        </motion.span>
      )}
      <button
        type="button"
        onClick={toggleListening}
        className={`p-2 rounded-full transition-all relative ${
          isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-[#141414]/10 text-[#141414] hover:bg-[#141414]/20'
        }`}
        title={isListening ? 'Detener' : 'Dictar por voz'}
      >
        {isListening ? <MicOff size={16} /> : <Mic size={16} />}
      </button>
    </div>
  );
};

// --- Helper to extract score ---
const extractScore = (text: string): number | undefined => {
  const match = text.match(/Puntuación final del día del (\d) al 5/i) || text.match(/Puntuación: (\d)\/5/i) || text.match(/(\d)\/5/i);
  if (match) return parseInt(match[1]);
  return undefined;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'morning' | 'cognitive' | 'night' | 'dashboard'>('morning');
  const [isDoctrinaOpen, setIsDoctrinaOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [state, setState] = useState<AppState>(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      history: {
        [today]: {
          date: today,
          cognitiveChecklist: {},
          noNegociables: []
        }
      },
      currentDate: today
    };
  });
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
      if (u) {
        setAuthLoading(false);
        setAuthError(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Firestore Sync
  useEffect(() => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    
    // Initial load of all history
    const historyRef = collection(db, 'users', user.uid, 'history');
    const unsubscribe = onSnapshot(historyRef, (snapshot) => {
      const history: { [date: string]: DailyData } = {};
      snapshot.forEach((doc) => {
        history[doc.id] = doc.data() as DailyData;
      });

      setState(prev => ({
        ...prev,
        history: {
          ...history,
          [today]: history[today] || { date: today, cognitiveChecklist: {}, noNegociables: [] }
        },
        currentDate: today
      }));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/history`);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login Error:", error);
      setAuthError(error.message || "Error al iniciar sesión");
      setAuthLoading(false);
    }
  };

  const currentDay = state.history[state.currentDate] || {
    date: state.currentDate,
    cognitiveChecklist: {},
    noNegociables: []
  };

  const updateCurrentDay = async (updates: Partial<DailyData>) => {
    if (!user) return;
    
    const newData = { ...currentDay, ...updates };
    const docRef = doc(db, 'users', user.uid, 'history', state.currentDate);
    
    try {
      await setDoc(docRef, newData);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docRef.path);
    }
  };

  const getHistoryContext = () => {
    const dates = Object.keys(state.history).sort().reverse().slice(1, 6); // Last 5 days excluding today
    return dates.map(d => {
      const day = state.history[d];
      return `FECHA: ${d} | SCORE: ${day.score || 'N/A'} | AUDITORÍA: ${day.nightOutput || 'N/A'}`;
    }).join('\n\n');
  };

  const handleMorningSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const morningInput = {
      agenda: formData.get('agenda') as string,
      tasks: formData.get('tasks') as string,
      energy: formData.get('energy') as string,
      pending: formData.get('pending') as string,
    };

    setLoading(true);
    try {
      const historyContext = getHistoryContext();
      const { text, noNegociables } = await generateMorningPlan(
        morningInput.agenda,
        morningInput.tasks,
        morningInput.energy,
        morningInput.pending,
        historyContext
      );
      await updateCurrentDay({ morningInput, morningOutput: text, noNegociables });
    } catch (error) {
      console.error(error);
      alert('Error generando plan.');
    } finally {
      setLoading(false);
    }
  };

  const handleNightSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const log = formData.get('dayLog') as string;

    setLoading(true);
    try {
      const historyContext = getHistoryContext();
      const output = await generateNightAudit(log, historyContext);
      const score = extractScore(output) ? extractScore(output)! * 20 : 0;
      await updateCurrentDay({ nightInput: log, nightOutput: output, score });
    } catch (error) {
      console.error(error);
      alert('Error generando auditoría.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthReady) return (
    <div className="min-h-screen bg-[#E4E3E0] flex items-center justify-center">
      <Loader2 className="animate-spin opacity-20" size={48} />
    </div>
  );

  if (!user) return <AuthScreen onLogin={handleLogin} loading={authLoading} error={authError} />;

  const toggleCognitive = (id: string) => {
    const newChecklist = {
      ...currentDay.cognitiveChecklist,
      [id]: !currentDay.cognitiveChecklist[id]
    };
    updateCurrentDay({ cognitiveChecklist: newChecklist });
  };

  // --- Dashboard Data Prep ---
  const chartData = (Object.values(state.history) as DailyData[])
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(day => {
      const cognitiveCount = Object.values(day.cognitiveChecklist).filter(Boolean).length;
      const cognitivePercent = (cognitiveCount / COGNITIVE_STEPS.length) * 100;
      return {
        date: day.date.split('-').slice(1).join('/'),
        score: day.score || 0,
        cognitive: Math.round(cognitivePercent),
      };
    });

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-b border-[#141414] p-6 flex flex-col md:flex-row justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-50 gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-serif italic text-2xl tracking-tight">Operaciones & Auditoría</h1>
            <p className="font-mono text-[10px] uppercase opacity-50 tracking-widest mt-1">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button 
            onClick={() => setIsDoctrinaOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#141414] text-[#E4E3E0] font-mono text-[10px] uppercase tracking-widest hover:bg-[#141414]/90 transition-colors rounded-sm"
          >
            <BookOpen size={12} />
            Doctrina
          </button>
        </div>
        <nav className="flex gap-1 bg-[#141414]/5 p-1 rounded-sm overflow-x-auto max-w-full">
          {[
            { id: 'morning', icon: Sun, label: 'Mañana' },
            { id: 'cognitive', icon: Brain, label: 'Rendimiento' },
            { id: 'night', icon: Moon, label: 'Noche' },
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-tighter transition-all whitespace-nowrap ${
                activeTab === tab.id 
                ? 'bg-[#141414] text-[#E4E3E0]' 
                : 'hover:bg-[#141414]/10'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-4xl mx-auto p-6 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'morning' && (
            <motion.section
              key="morning"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="border-l-2 border-[#141414] pl-6 py-2">
                <h2 className="font-serif italic text-3xl">Director de Operaciones</h2>
                <p className="text-sm opacity-60 mt-2">Diseño de día coherente con la doctrina operativa.</p>
              </div>

              {!currentDay.morningOutput ? (
                <form onSubmit={handleMorningSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[10px] uppercase opacity-50 block">Agenda de Hoy</span>
                        <SpeechInput onTranscript={(t) => {
                          const el = document.getElementById('agenda-input') as HTMLTextAreaElement;
                          el.value += (el.value ? ' ' : '') + t;
                        }} />
                      </div>
                      <textarea 
                        id="agenda-input"
                        name="agenda" 
                        required
                        placeholder="Reuniones, compromisos fijos..."
                        className="w-full bg-white border border-[#141414]/20 p-4 font-mono text-sm focus:border-[#141414] outline-none min-h-[120px] transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[10px] uppercase opacity-50 block">Tareas Prioritarias</span>
                        <SpeechInput onTranscript={(t) => {
                          const el = document.getElementById('tasks-input') as HTMLTextAreaElement;
                          el.value += (el.value ? ' ' : '') + t;
                        }} />
                      </div>
                      <textarea 
                        id="tasks-input"
                        name="tasks" 
                        required
                        placeholder="Lo que crees que es importante..."
                        className="w-full bg-white border border-[#141414]/20 p-4 font-mono text-sm focus:border-[#141414] outline-none min-h-[120px] transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="block">
                      <span className="font-mono text-[10px] uppercase opacity-50 block mb-2">Nivel de Energía</span>
                      <input 
                        name="energy" 
                        required
                        placeholder="1-10 o descripción..."
                        className="w-full bg-white border border-[#141414]/20 p-4 font-mono text-sm focus:border-[#141414] outline-none transition-colors"
                      />
                    </label>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[10px] uppercase opacity-50 block">Pendientes Críticos</span>
                        <SpeechInput onTranscript={(t) => {
                          const el = document.getElementById('pending-input') as HTMLTextAreaElement;
                          el.value += (el.value ? ' ' : '') + t;
                        }} />
                      </div>
                      <textarea 
                        id="pending-input"
                        name="pending" 
                        required
                        placeholder="Lo que te quita el sueño..."
                        className="w-full bg-white border border-[#141414]/20 p-4 font-mono text-sm focus:border-[#141414] outline-none min-h-[120px] transition-colors"
                      />
                    </div>
                    <button 
                      disabled={loading}
                      className="w-full bg-[#141414] text-[#E4E3E0] py-4 font-mono uppercase tracking-widest text-sm hover:invert transition-all flex justify-center items-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : 'Generar Plan Operativo'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white border border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] prose prose-sm max-w-none">
                    <div className="flex justify-between items-start mb-6 border-b border-[#141414]/10 pb-4">
                      <span className="font-mono text-[10px] uppercase bg-[#141414] text-[#E4E3E0] px-2 py-1">Plan de Operaciones</span>
                      <button 
                        onClick={() => updateCurrentDay({ morningOutput: undefined })}
                        className="text-[10px] font-mono uppercase opacity-50 hover:opacity-100 underline"
                      >
                        Reiniciar
                      </button>
                    </div>
                    <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {currentDay.morningOutput}
                    </div>
                  </div>
                </div>
              )}
            </motion.section>
          )}

          {activeTab === 'cognitive' && (
            <motion.section
              key="cognitive"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="border-l-2 border-[#141414] pl-6 py-2">
                <h2 className="font-serif italic text-3xl">Alto Rendimiento Cognitivo</h2>
                <p className="text-sm opacity-60 mt-2">Checklist milimétrico de neuroplasticidad.</p>
              </div>

              {/* No Negociables Section */}
              {currentDay.noNegociables && currentDay.noNegociables.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-mono text-[10px] uppercase opacity-40 tracking-[0.2em] mb-4">No Negociables del Día</h3>
                  <div className="grid gap-3">
                    {currentDay.noNegociables.map((nn) => (
                      <button
                        key={nn.id}
                        onClick={() => {
                          const newList = currentDay.noNegociables?.map(item => 
                            item.id === nn.id ? { ...item, completed: !item.completed } : item
                          );
                          updateCurrentDay({ noNegociables: newList });
                        }}
                        className={`w-full flex items-center gap-4 p-5 border transition-all text-left shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] ${
                          nn.completed
                          ? 'bg-green-50 border-green-600 text-green-900 opacity-60'
                          : 'bg-white border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0]'
                        }`}
                      >
                        <div className={`w-6 h-6 border flex items-center justify-center transition-colors shrink-0 ${
                          nn.completed ? 'border-green-600 bg-green-600 text-white' : 'border-[#141414]'
                        }`}>
                          {nn.completed && <CheckCircle2 size={16} />}
                        </div>
                        <span className="text-sm font-mono tracking-tight font-bold">{nn.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {['MAÑANA', 'MEDIODÍA', 'TARDE', 'NOCHE'].map(phase => (
                  <div key={phase} className="space-y-2">
                    <h3 className="font-mono text-[10px] uppercase opacity-40 tracking-[0.2em] mb-4 mt-8">{phase}</h3>
                    <div className="grid gap-2">
                      {COGNITIVE_STEPS.filter(s => s.phase === phase).map(step => (
                        <div key={step.id} className="group relative">
                          <button
                            onClick={() => toggleCognitive(step.id)}
                            className={`w-full flex items-center gap-4 p-4 border transition-all text-left ${
                              currentDay.cognitiveChecklist[step.id]
                              ? 'bg-[#141414] border-[#141414] text-[#E4E3E0]'
                              : 'bg-white border-[#141414]/10 hover:border-[#141414]'
                            }`}
                          >
                            <div className={`w-5 h-5 border flex items-center justify-center transition-colors shrink-0 ${
                              currentDay.cognitiveChecklist[step.id] ? 'border-[#E4E3E0]' : 'border-[#141414]/20 group-hover:border-[#141414]'
                            }`}>
                              {currentDay.cognitiveChecklist[step.id] && <CheckCircle2 size={14} />}
                            </div>
                            <div className="flex-1">
                              <span className="text-sm font-mono tracking-tighter block">{step.label}</span>
                              <p className={`text-[10px] mt-1 leading-tight opacity-50 group-hover:opacity-100 transition-opacity ${
                                currentDay.cognitiveChecklist[step.id] ? 'text-[#E4E3E0]/70' : 'text-[#141414]'
                              }`}>
                                {step.description}
                              </p>
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {activeTab === 'night' && (
            <motion.section
              key="night"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="border-l-2 border-[#141414] pl-6 py-2">
                <h2 className="font-serif italic text-3xl">Auditoría Ejecutiva</h2>
                <p className="text-sm opacity-60 mt-2">Evaluación de coherencia con la doctrina operativa.</p>
              </div>

              {!currentDay.nightOutput ? (
                <form onSubmit={handleNightSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[10px] uppercase opacity-50 block">Registro del Día</span>
                      <SpeechInput onTranscript={(t) => {
                        const el = document.getElementById('day-log-input') as HTMLTextAreaElement;
                        el.value += (el.value ? ' ' : '') + t;
                      }} />
                    </div>
                    <textarea 
                      id="day-log-input"
                      name="dayLog" 
                      required
                      placeholder="¿Qué has hecho hoy? Sé brutalmente honesto..."
                      className="w-full bg-white border border-[#141414]/20 p-6 font-mono text-sm focus:border-[#141414] outline-none min-h-[300px] transition-colors"
                    />
                  </div>
                  <button 
                    disabled={loading}
                    className="w-full bg-[#141414] text-[#E4E3E0] py-4 font-mono uppercase tracking-widest text-sm hover:invert transition-all flex justify-center items-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Ejecutar Auditoría'}
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white border border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] prose prose-sm max-w-none">
                    <div className="flex justify-between items-start mb-6 border-b border-[#141414]/10 pb-4">
                      <span className="font-mono text-[10px] uppercase bg-[#141414] text-[#E4E3E0] px-2 py-1">Informe de Auditoría</span>
                      <button 
                        onClick={() => updateCurrentDay({ nightOutput: undefined })}
                        className="text-[10px] font-mono uppercase opacity-50 hover:opacity-100 underline"
                      >
                        Nueva Auditoría
                      </button>
                    </div>
                    <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {currentDay.nightOutput}
                    </div>
                  </div>
                </div>
              )}
            </motion.section>
          )}

          {activeTab === 'dashboard' && (
            <motion.section
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="border-l-2 border-[#141414] pl-6 py-2">
                <h2 className="font-serif italic text-3xl">Cuadro de Mando</h2>
                <p className="text-sm opacity-60 mt-2">Correlación entre Rendimiento Cognitivo y Coherencia Vital.</p>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {/* Correlation Chart */}
                <div className="bg-white border border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
                  <div className="flex items-center gap-2 mb-6">
                    <BarChart3 size={18} />
                    <h3 className="font-mono text-xs uppercase tracking-widest">Correlación: Rendimiento vs Auditoría</h3>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#14141410" />
                        <XAxis dataKey="date" fontSize={10} fontStyle="italic" />
                        <YAxis domain={[0, 100]} fontSize={10} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#141414', color: '#E4E3E0', border: 'none', fontSize: '10px' }}
                          itemStyle={{ color: '#E4E3E0' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="cognitive" 
                          name="Rendimiento Cognitivo"
                          stroke="#141414" 
                          strokeWidth={2}
                          dot={{ r: 4, fill: '#141414' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          name="Puntuación Auditoría"
                          stroke="#F27D26" 
                          strokeWidth={2}
                          dot={{ r: 4, fill: '#F27D26' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 flex gap-6 justify-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#141414]"></div>
                      <span className="font-mono text-[9px] uppercase opacity-60">Rendimiento Cognitivo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#F27D26]"></div>
                      <span className="font-mono text-[9px] uppercase opacity-60">Puntuación Auditoría</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Días Registrados', value: Object.keys(state.history).length },
                  { label: 'Media Auditoría', value: (chartData.reduce((acc, curr) => acc + curr.score, 0) / (chartData.filter(d => d.score > 0).length || 1)).toFixed(1) },
                  { label: 'Media Cognitiva', value: (chartData.reduce((acc, curr) => acc + curr.cognitive, 0) / chartData.length).toFixed(0) + '%' },
                  { label: 'Racha Actual', value: '1 día' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white border border-[#141414]/10 p-4 text-center">
                    <span className="font-mono text-[9px] uppercase opacity-50 block mb-1">{stat.label}</span>
                    <span className="font-serif italic text-2xl">{stat.value}</span>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <DoctrinaModal isOpen={isDoctrinaOpen} onClose={() => setIsDoctrinaOpen(false)} />

      {/* Footer / Status */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-[#141414] bg-white/80 backdrop-blur-md p-4 flex justify-between items-center text-[10px] font-mono uppercase tracking-[0.2em] opacity-60">
        <div className="flex gap-4">
          <span>Status: Operativo</span>
          <span>Doctrina: Activa</span>
        </div>
        <div>
          © {new Date().getFullYear()} SHED CO.
        </div>
      </footer>
    </div>
  );
}
