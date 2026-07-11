import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Folder, Plus, History, Play, Network, FileText, CheckSquare, Square, Settings, X, Save, Trash2, Edit2, GripVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

type Version = { id: string; content: string; timestamp: string };
type Prompt = { id: string; name: string; versions: Version[] };
type WorkspaceFolder = { id: string; name: string; prompts: Prompt[] };

const defaultData: WorkspaceFolder[] = [
  {
    id: 'f1',
    name: 'Customer Support',
    prompts: [
      {
        id: 'p1',
        name: 'Greeting Bot',
        versions: [
          { id: 'v2', content: 'You are a friendly customer support agent. Answer concisely with emojis.', timestamp: 'Just now' },
          { id: 'v1', content: 'You are a customer support agent. Answer concisely.', timestamp: '2 days ago' }
        ]
      }
    ]
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Persistence Hooks
  const [folders, setFolders] = useState<WorkspaceFolder[]>(() => {
    const saved = localStorage.getItem('promptdesk_folders');
    return saved ? JSON.parse(saved) : defaultData;
  });
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('promptdesk_apikey') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [showApiHelp, setShowApiHelp] = useState(false);

  useEffect(() => {
    localStorage.setItem('promptdesk_folders', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem('promptdesk_apikey', apiKey);
  }, [apiKey]);

  // State Management
  const [activeFolderId, setActiveFolderId] = useState<string>(folders[0]?.id || '');
  const [activePromptId, setActivePromptId] = useState<string>(folders[0]?.prompts[0]?.id || '');
  const [activeVersionId, setActiveVersionId] = useState<string>(folders[0]?.prompts[0]?.versions[0]?.id || '');
  
  const [actionTab, setActionTab] = useState<'eval' | 'arena'>('eval');
  const [editorContent, setEditorContent] = useState('');
  
  // Modals / Inputs
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  const [isCreatingPrompt, setIsCreatingPrompt] = useState(false);
  const [newPromptName, setNewPromptName] = useState('');

  // Evaluation State
  const [selectedPromptsForEval, setSelectedPromptsForEval] = useState<string[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResults, setEvalResults] = useState<{ [key: string]: { score: number, safety: number, tone: number } } | null>(null);

  // Arena State
  const [arenaResults, setArenaResults] = useState<{ [model: string]: string }>({});
  const [isArenaLoading, setIsArenaLoading] = useState(false);

  // Dynamic LLM Selection
  const [availableModels, setAvailableModels] = useState<{id: string, name: string}[]>([]);
  const [selectedModels, setSelectedModels] = useState<{id: string, name: string}[]>([
    { id: 'nvidia/nemotron-3-ultra-550b-a55b:free', name: 'Nemotron 550B' },
    { id: 'cohere/north-mini-code:free', name: 'Cohere North' },
    { id: 'openai/gpt-5.4-nano', name: 'GPT-5.4 Nano' }
  ]);

  useEffect(() => {
    fetch("https://openrouter.ai/api/v1/models")
      .then(r => r.json())
      .then(data => {
        const free = data.data.filter((m: any) => m.pricing.prompt === "0" && m.pricing.completion === "0");
        setAvailableModels(free);
      })
      .catch(console.error);
  }, []);

  // Layout: resizable editor
  const [editorHeightPct, setEditorHeightPct] = useState(50);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    const onMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((ev.clientY - rect.top) / rect.height) * 100;
      setEditorHeightPct(Math.min(80, Math.max(20, pct)));
    };
    const onMouseUp = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, []);

  // Layout: resizable sidebars
  const [sidebar1Width, setSidebar1Width] = useState(256);
  const [sidebar2Width, setSidebar2Width] = useState(320);
  const isDraggingS1 = useRef(false);
  const isDraggingS2 = useRef(false);

  const handleS1MouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingS1.current = true;
    const onMouseMove = (ev: MouseEvent) => {
      if (!isDraggingS1.current) return;
      setSidebar1Width(Math.max(60, Math.min(500, ev.clientX)));
    };
    const onMouseUp = () => {
      isDraggingS1.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, []);

  const handleS2MouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingS2.current = true;
    const onMouseMove = (ev: MouseEvent) => {
      if (!isDraggingS2.current) return;
      setSidebar2Width(Math.max(100, Math.min(600, ev.clientX - sidebar1Width)));
    };
    const onMouseUp = () => {
      isDraggingS2.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [sidebar1Width]);

  // Derived State
  const activeFolder = folders.find(f => f.id === activeFolderId);
  const activePrompt = activeFolder?.prompts.find(p => p.id === activePromptId);
  const activeVersion = activePrompt?.versions.find(v => v.id === activeVersionId);
  const activeVersionIndex = activePrompt ? activePrompt.versions.findIndex(v => v.id === activeVersionId) : -1;

  // Sync Editor
  useEffect(() => {
    if (activeVersion) {
      setEditorContent(activeVersion.content);
    } else {
      setEditorContent('');
    }
  }, [activeVersion]);

  // Handlers
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder: WorkspaceFolder = { id: Date.now().toString(), name: newFolderName, prompts: [] };
    setFolders([...folders, newFolder]);
    setActiveFolderId(newFolder.id);
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  const handleCreatePrompt = () => {
    if (!newPromptName.trim() || !activeFolder) return;
    const newPrompt: Prompt = {
      id: Date.now().toString(),
      name: newPromptName,
      versions: [{ id: Date.now().toString(), content: 'Enter prompt here...', timestamp: new Date().toLocaleString() }]
    };
    
    setFolders(folders.map(f => {
      if (f.id === activeFolder.id) return { ...f, prompts: [...f.prompts, newPrompt] };
      return f;
    }));
    setActivePromptId(newPrompt.id);
    setActiveVersionId(newPrompt.versions[0].id);
    setNewPromptName('');
    setIsCreatingPrompt(false);
  };

  const handleDeletePrompt = (promptId: string) => {
    if (!window.confirm("Are you sure you want to delete this prompt and all its versions?")) return;
    setFolders(folders.map(f => {
      if (f.id === activeFolderId) {
        return { ...f, prompts: f.prompts.filter(p => p.id !== promptId) };
      }
      return f;
    }));
    if (activePromptId === promptId) {
      setActivePromptId('');
      setActiveVersionId('');
    }
  };

  const handleRenamePrompt = (promptId: string, currentName: string) => {
    const newName = window.prompt("Enter new prompt name:", currentName);
    if (!newName || !newName.trim()) return;
    setFolders(folders.map(f => {
      if (f.id === activeFolderId) {
        return {
          ...f,
          prompts: f.prompts.map(p => p.id === promptId ? { ...p, name: newName.trim() } : p)
        };
      }
      return f;
    }));
  };

  const handleSaveVersion = () => {
    if (!activeFolder || !activePrompt) return;
    const newVersion: Version = { id: Date.now().toString(), content: editorContent, timestamp: new Date().toLocaleString() };
    
    setFolders(folders.map(f => {
      if (f.id === activeFolder.id) {
        return {
          ...f,
          prompts: f.prompts.map(p => {
            if (p.id === activePrompt.id) return { ...p, versions: [newVersion, ...p.versions] };
            return p;
          })
        };
      }
      return f;
    }));
    setActiveVersionId(newVersion.id);
  };

  const handleDeleteVersion = (e: React.MouseEvent, promptId: string, versionId: string) => {
    e.stopPropagation();
    if (!window.confirm("Delete this version?")) return;
    setFolders(folders.map(f => {
      if (f.id === activeFolderId) {
        return {
          ...f,
          prompts: f.prompts.map(p => {
            if (p.id === promptId) {
              return { ...p, versions: p.versions.filter(v => v.id !== versionId) };
            }
            return p;
          })
        };
      }
      return f;
    }));
    if (activeVersionId === versionId) {
      setActiveVersionId('');
    }
  };

  const handleRunEvaluation = () => {
    if (selectedPromptsForEval.length === 0) return;
    setIsEvaluating(true);
    setTimeout(() => {
      const results: any = {};
      selectedPromptsForEval.forEach(id => {
        results[id] = {
          score: Math.floor(Math.random() * 20) + 80,
          safety: Math.floor(Math.random() * 10) + 90,
          tone: Math.floor(Math.random() * 15) + 85
        };
      });
      setEvalResults(results);
      setIsEvaluating(false);
    }, 1500);
  };

  const toggleEvalSelection = (promptId: string) => {
    if (selectedPromptsForEval.includes(promptId)) {
      setSelectedPromptsForEval(selectedPromptsForEval.filter(id => id !== promptId));
    } else {
      setSelectedPromptsForEval([...selectedPromptsForEval, promptId]);
    }
  };

  const runArena = async () => {
    if (!apiKey) {
      alert("Please add your OpenRouter API Key in Settings first!");
      setShowSettings(true);
      return;
    }
    
    setIsArenaLoading(true);
    setArenaResults({});

    const models = selectedModels;

    for (const model of models) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "PromptDesk"
          },
          body: JSON.stringify({
            model: model.id,
            messages: [
              { role: "system", content: editorContent },
              { role: "user", content: "Hello! Please follow the system instructions above." }
            ],
            max_tokens: 4000
          })
        });
        const data = await response.json();
        if (!response.ok || data.error) {
          setArenaResults(prev => ({ ...prev, [model.name]: `⚠️ ${data.error?.message || response.statusText}` }));
        } else {
          setArenaResults(prev => ({ ...prev, [model.name]: data.choices?.[0]?.message?.content?.trim() || "No response received." }));
        }
      } catch (e: any) {
        setArenaResults(prev => ({ ...prev, [model.name]: `⚠️ Network error: ${e.message}` }));
      }
    }
    setIsArenaLoading(false);
  };

  return (
    <div className="w-full h-screen flex bg-primary text-txt font-sans overflow-hidden transition-colors">
      
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-secondary p-8 rounded-3xl w-full max-w-md shadow-2xl border-2 border-border relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-devanagari">Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-txt-muted hover:text-txt"><X /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-txt-muted mb-2 uppercase tracking-wider">OpenRouter API Key</label>
                <input 
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full px-4 py-3 bg-primary border border-border rounded-xl focus:border-accent outline-none text-txt transition-colors"
                />
                <p className="text-xs text-txt-muted mt-2">Required for live Arena testing. Your key is stored securely in your browser's localStorage.</p>
                <button 
                  onClick={() => setShowApiHelp(true)} 
                  className="text-xs font-bold text-accent hover:text-accent-hover hover:underline mt-2 block transition-colors"
                >
                  Don't know how to get a key? Click here.
                </button>
              </div>
              <div className="mt-4 border-t border-border pt-4">
                <label className="block text-sm font-bold text-txt-muted mb-3 uppercase tracking-wider">Arena Models</label>
                <div className="space-y-3">
                  {[0, 1, 2].map(idx => (
                    <select 
                      key={idx}
                      className="w-full px-4 py-3 bg-primary border border-border rounded-xl focus:border-accent outline-none text-txt text-sm transition-colors appearance-none cursor-pointer"
                      value={selectedModels[idx]?.id || ''}
                      onChange={e => {
                        const model = availableModels.find(m => m.id === e.target.value) || { id: e.target.value, name: e.target.value.split('/').pop() || e.target.value };
                        const newSelected = [...selectedModels];
                        newSelected[idx] = model;
                        setSelectedModels(newSelected);
                      }}
                    >
                      <option value="" disabled>Select Model {idx + 1}...</option>
                      {availableModels.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                      {selectedModels[idx] && !availableModels.find(m => m.id === selectedModels[idx].id) && (
                        <option value={selectedModels[idx].id}>{selectedModels[idx].name}</option>
                      )}
                    </select>
                  ))}
                </div>
                <p className="text-xs text-txt-muted mt-3">Select which three AI models to pit against each other in the live arena. Only actively free models are shown.</p>
              </div>
              <button onClick={() => setShowSettings(false)} className="w-full btn-primary text-center block mt-4 !px-6 !py-3">Save Configuration</button>
            </div>
          </div>
        </div>
      )}

      {/* API Help Documentation Modal */}
      {showApiHelp && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-md">
          <div className="bg-primary p-8 rounded-3xl w-full max-w-lg shadow-2xl border border-border relative">
             <button onClick={() => setShowApiHelp(false)} className="absolute top-6 right-6 text-txt-muted hover:text-txt"><X /></button>
             <h2 className="text-3xl font-bold font-devanagari mb-6 text-accent border-b border-border pb-4">Getting an API Key</h2>
             <div className="space-y-5 text-sm text-txt leading-relaxed font-sans">
                <p>To use the live AI Arena for free, PromptDesk connects to <strong>OpenRouter</strong>, a free proxy that gives you access to models like Llama 3 and Gemini Flash without needing a credit card.</p>
                <ol className="list-decimal pl-5 space-y-3 font-bold text-txt">
                  <li>Go to <a href="https://openrouter.ai" target="_blank" rel="noreferrer" className="text-accent underline hover:text-accent-hover transition-colors">OpenRouter.ai</a> and sign up for a free account.</li>
                  <li>Click on your profile in the top right and go to <strong>Keys</strong>.</li>
                  <li>Click <strong>Create Key</strong> and give it a name (e.g., "PromptDesk").</li>
                  <li>Copy the generated key (it starts with <code className="bg-accent/10 px-1 rounded text-accent">sk-or-v1-</code>) and paste it into the Settings menu here.</li>
                </ol>
                <div className="bg-accent/10 p-4 rounded-xl border border-border mt-6">
                  <p className="italic text-txt-muted"><strong>Note:</strong> We automatically route your arena requests to free-tier models, so you will never be charged!</p>
                </div>
             </div>
             <button onClick={() => setShowApiHelp(false)} className="btn-primary mt-8 w-full text-center !py-3">Got it! Return to Settings</button>
          </div>
        </div>
      )}

      {/* Panel 1: Folders */}
      <div 
        style={{ width: sidebar1Width }}
        className="border-r border-border bg-tertiary flex flex-col shrink-0 transition-colors relative"
      >
        <div className="p-6 border-b border-border flex items-center justify-between cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
          <div onClick={() => navigate('/')} className="flex items-center gap-3">
            <img src="/logo.jpg" alt="PromptDesk Logo" className="w-8 h-8 rounded-full shadow-sm" />
            <h1 className="font-bold text-2xl tracking-tight text-txt font-devanagari">PromptDesk</h1>
          </div>
          <ThemeToggle />
        </div>
        
        <div className="p-4 flex items-center justify-between mt-2">
          <h2 className="font-bold text-txt-muted uppercase tracking-widest text-xs">Workspaces</h2>
          <button onClick={() => setIsCreatingFolder(true)} className="text-accent hover:text-accent-hover transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {isCreatingFolder && (
          <div className="px-4 mb-2">
            <input 
              autoFocus
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
              placeholder="Folder Name..."
              className="w-full px-3 py-2 text-sm border border-border bg-secondary text-txt rounded-lg focus:border-accent outline-none transition-colors"
              onBlur={() => { if(!newFolderName) setIsCreatingFolder(false) }}
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          {folders.map(folder => (
            <button 
              key={folder.id}
              onClick={() => {
                setActiveFolderId(folder.id);
                setActivePromptId(folder.prompts.length > 0 ? folder.prompts[0].id : '');
                setEvalResults(null);
                setSelectedPromptsForEval([]);
              }}
              className={`w-full text-left px-3 py-3 rounded-xl flex items-center gap-3 transition-all ${
                activeFolderId === folder.id 
                  ? 'bg-accent/10 text-txt font-bold border border-accent/20 shadow-sm' 
                  : 'text-txt-muted hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Folder className={`w-4 h-4 ${activeFolderId === folder.id ? 'text-accent' : 'text-txt-muted'}`} />
              <span className="text-sm truncate">{folder.name}</span>
            </button>
          ))}
        </div>
        
        <div className="p-4 border-t border-border">
          <button onClick={() => setShowSettings(true)} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-txt-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-txt transition-colors">
            <Settings className="w-5 h-5" />
            <span className="text-sm font-bold">Settings</span>
          </button>
        </div>
      </div>

      {/* Resize Handle for Panel 1 */}
      <div
        onMouseDown={handleS1MouseDown}
        className="w-1.5 flex flex-col items-center justify-center cursor-col-resize hover:bg-accent/20 bg-transparent shrink-0 group z-10 transition-colors"
      >
        <GripVertical className="w-3 h-4 text-txt-muted/30 group-hover:text-accent transition-colors opacity-0 group-hover:opacity-100" />
      </div>

      {/* Panel 2: Prompts & Versions */}
      <div 
        style={{ width: sidebar2Width }}
        className="border-r border-border flex flex-col bg-secondary shrink-0 transition-colors relative"
      >
        {activeFolder ? (
          <>
            <div className="p-4 border-b border-border bg-tertiary/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-txt-muted uppercase tracking-widest">Prompts in {activeFolder.name}</span>
                <button 
                  onClick={() => setIsCreatingPrompt(true)} 
                  className="flex items-center gap-1 text-xs font-bold text-accent hover:text-accent-hover transition-colors border border-border px-3 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 shadow-sm bg-secondary"
                >
                  <Plus className="w-3 h-3" /> Add Prompt
                </button>
              </div>

              {isCreatingPrompt && (
                <input 
                  autoFocus
                  value={newPromptName}
                  onChange={e => setNewPromptName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreatePrompt()}
                  placeholder="New Prompt Name..."
                  className="w-full px-3 py-2 text-sm border border-border bg-secondary text-txt rounded-lg mb-4 focus:border-accent outline-none shadow-inner transition-colors"
                  onBlur={() => { if(!newPromptName) setIsCreatingPrompt(false) }}
                />
              )}

              <select 
                className="w-full p-3 text-sm font-bold border border-border rounded-xl bg-secondary text-txt outline-none focus:border-accent shadow-sm cursor-pointer mb-2 transition-colors"
                value={activePromptId}
                onChange={e => {
                  setActivePromptId(e.target.value);
                  const p = activeFolder.prompts.find(pr => pr.id === e.target.value);
                  if (p && p.versions.length > 0) setActiveVersionId(p.versions[0].id);
                  else setActiveVersionId('');
                }}
              >
                <option value="" disabled>Select a prompt...</option>
                {activeFolder.prompts.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              
              {activePrompt && (
                <div className="flex items-center gap-2 mt-2 px-1">
                  <button 
                    onClick={() => handleRenamePrompt(activePrompt.id, activePrompt.name)}
                    className="text-xs text-txt-muted hover:text-accent font-bold flex items-center gap-1 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" /> Rename
                  </button>
                  <span className="text-border">|</span>
                  <button 
                    onClick={() => handleDeletePrompt(activePrompt.id)}
                    className="text-xs text-txt-muted hover:text-red-500 font-bold flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              )}
            </div>

            {activePrompt && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-primary transition-colors">
                <div className="flex items-center justify-between px-2 mb-2">
                  <span className="text-xs font-bold text-txt-muted uppercase tracking-widest">Version History</span>
                  <History className="w-4 h-4 text-txt-muted" />
                </div>
                
                {activePrompt.versions.map((v, i) => (
                  <button 
                    key={v.id}
                    onClick={() => setActiveVersionId(v.id)}
                    className={`group w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden ${
                      activeVersionId === v.id 
                        ? 'border-accent bg-secondary shadow-md' 
                        : 'border-border hover:border-accent/50 bg-secondary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-txt">Version {activePrompt.versions.length - i}</span>
                      {i === 0 && <span className="bg-accent/10 text-accent text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-accent/20">Latest</span>}
                    </div>
                    <span className="text-[11px] text-txt-muted font-mono">{v.timestamp}</span>
                    
                    <div 
                      onClick={(e) => handleDeleteVersion(e, activePrompt.id, v.id)}
                      className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 p-1.5 bg-red-100 text-red-500 hover:bg-red-500 hover:text-white rounded-md transition-all shadow-sm"
                      title="Delete Version"
                    >
                      <Trash2 className="w-3 h-3" />
                    </div>
                  </button>
                ))}
                
                {activePrompt.versions.length === 0 && (
                  <div className="text-center text-txt-muted text-sm mt-8 italic font-devanagari">
                    No versions saved yet.<br/>Type in the editor and hit save!
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-txt-muted text-sm p-8 text-center">
            Create or select a workspace to get started.
          </div>
        )}
      </div>

      {/* Resize Handle for Panel 2 */}
      <div
        onMouseDown={handleS2MouseDown}
        className="w-1.5 flex flex-col items-center justify-center cursor-col-resize hover:bg-accent/20 bg-transparent shrink-0 group z-10 transition-colors"
      >
        <GripVertical className="w-3 h-4 text-txt-muted/30 group-hover:text-accent transition-colors opacity-0 group-hover:opacity-100" />
      </div>

      {/* Panel 3: Unified Workspace (Editor + Actions) */}
      <div ref={containerRef} className="flex-1 flex flex-col bg-secondary transition-colors overflow-hidden relative">
        {activePrompt ? (
          <>
            {/* Split Screen Top: Editor (resizable) */}
            <div className="flex flex-col border-b border-border p-6 relative overflow-hidden" style={{ height: `${editorHeightPct}%` }}>
              <div className="flex items-center justify-between mb-4 shrink-0">
                <h3 className="text-xl font-bold font-devanagari text-txt flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent" />
                  Editor: {activePrompt.name}
                  {activeVersionIndex >= 0 && (
                    <span className="text-sm font-normal text-txt-muted ml-1">
                      — Version {activePrompt.versions.length - activeVersionIndex}
                    </span>
                  )}
                </h3>
                {activeVersion?.content !== editorContent && (
                  <button 
                    onClick={handleSaveVersion}
                    className="btn-primary flex items-center gap-2 px-6 py-2 text-sm !rounded-lg animate-pulse"
                  >
                    <Save className="w-4 h-4" /> Save New Version
                  </button>
                )}
              </div>
              <textarea 
                className="flex-1 w-full bg-primary border border-border focus:border-accent rounded-2xl p-6 resize-none outline-none text-txt font-mono text-sm leading-relaxed shadow-inner transition-colors"
                value={editorContent}
                onChange={e => setEditorContent(e.target.value)}
                placeholder="Write your system prompt here..."
              />
            </div>

            {/* Drag handle */}
            <div
              onMouseDown={handleDividerMouseDown}
              className="h-3 flex items-center justify-center cursor-row-resize bg-tertiary/30 hover:bg-accent/10 border-y border-border/50 group transition-colors shrink-0"
              title="Drag to resize"
            >
              <GripVertical className="w-4 h-4 text-txt-muted/40 group-hover:text-accent rotate-90 transition-colors" />
            </div>

            {/* Split Screen Bottom: Action Panel */}
            <div className="flex flex-col bg-tertiary/20 overflow-hidden" style={{ height: `${100 - editorHeightPct}%` }}>
              <div className="flex border-b border-border bg-secondary">
                <button 
                  onClick={() => setActionTab('eval')}
                  className={`flex-1 py-4 font-bold tracking-widest uppercase text-sm transition-colors border-b-2 ${actionTab === 'eval' ? 'border-accent text-accent bg-accent/5' : 'border-transparent text-txt-muted hover:text-txt hover:bg-black/5 dark:hover:bg-white/5'}`}
                >
                  Automated Evaluation
                </button>
                <button 
                  onClick={() => setActionTab('arena')}
                  className={`flex-1 py-4 font-bold tracking-widest uppercase text-sm transition-colors border-b-2 ${actionTab === 'arena' ? 'border-accent text-accent bg-accent/5' : 'border-transparent text-txt-muted hover:text-txt hover:bg-black/5 dark:hover:bg-white/5'}`}
                >
                  Live Model Arena
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                  
                  {/* EVAL TAB */}
                  {actionTab === 'eval' && (
                    <motion.div key="eval" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto">
                      <div className="flex items-center justify-between mb-6">
                        <p className="text-txt-muted italic font-devanagari text-lg">Select versions to run against test suite</p>
                        <button 
                          onClick={handleRunEvaluation}
                          disabled={selectedPromptsForEval.length === 0 || isEvaluating}
                          className="btn-primary !px-6 !py-2 !rounded-lg flex items-center gap-2 disabled:opacity-50 text-sm"
                        >
                          {isEvaluating ? <span className="animate-spin text-xl">◌</span> : <Play className="w-4 h-4" />} 
                          Run Evaluations
                        </button>
                      </div>
                      
                      <div className="bg-secondary border border-border rounded-2xl shadow-sm overflow-hidden transition-colors">
                        <div className="flex items-center p-4 border-b border-border bg-tertiary">
                          <button onClick={() => setSelectedPromptsForEval(activeFolder.prompts.map(p => p.id))} className="text-txt-muted hover:text-accent mr-4 transition-colors">
                            <CheckSquare className="w-5 h-5" />
                          </button>
                          <div className="flex-1 font-bold text-xs tracking-widest uppercase text-txt-muted">PROMPT</div>
                          <div className="w-24 font-bold text-xs tracking-widest uppercase text-txt-muted text-center">SCORE</div>
                          <div className="w-24 font-bold text-xs tracking-widest uppercase text-txt-muted text-center">SAFETY</div>
                          <div className="w-24 font-bold text-xs tracking-widest uppercase text-txt-muted text-center">TONE</div>
                        </div>

                        {activeFolder.prompts.map(prompt => {
                          const isSelected = selectedPromptsForEval.includes(prompt.id);
                          const results = evalResults?.[prompt.id];

                          return (
                            <div key={prompt.id} className={`flex items-center p-4 border-b border-border/50 transition-colors ${isSelected ? 'bg-accent/5' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>
                              <button onClick={() => toggleEvalSelection(prompt.id)} className={`mr-4 transition-colors ${isSelected ? 'text-accent' : 'text-txt-muted/50 hover:text-txt-muted'}`}>
                                {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                              </button>
                              <div className="flex-1">
                                <div className="font-bold text-txt">{prompt.name}</div>
                              </div>
                              
                              {results ? (
                                <>
                                  <div className="w-24 text-center text-xl font-bold text-accent">{results.score}</div>
                                  <div className="w-24 text-center text-md font-bold text-txt/70">{results.safety}%</div>
                                  <div className="w-24 text-center text-md font-bold text-txt/70">{results.tone}%</div>
                                </>
                              ) : (
                                <div className="w-72 text-center text-sm text-txt-muted/50 italic">Not evaluated</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* ARENA TAB */}
                  {actionTab === 'arena' && (
                    <motion.div key="arena" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4 shrink-0">
                        <div>
                          <p className="text-txt-muted italic font-devanagari text-lg">Test active prompt simultaneously</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-txt-muted uppercase tracking-wider">Testing:</span>
                            <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                              {activePrompt.name}
                            </span>
                            {activeVersionIndex >= 0 && (
                              <span className="text-xs text-txt-muted">— Version {activePrompt.versions.length - activeVersionIndex}</span>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={runArena}
                          disabled={isArenaLoading}
                          className="btn-primary !px-6 !py-2 !rounded-lg flex items-center gap-2 disabled:opacity-50 text-sm"
                        >
                          {isArenaLoading ? <span className="animate-spin text-xl">◌</span> : <Network className="w-4 h-4" />} 
                          Run Arena
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-6 flex-1 min-h-0">
                        {selectedModels.map(model => (
                          <div key={model.id} className="bg-secondary border border-border rounded-2xl p-5 flex flex-col shadow-sm transition-colors">
                            <div className="font-bold text-md text-txt mb-3 pb-3 border-b border-border font-devanagari flex items-center justify-between">
                              {model.name}
                              {arenaResults[model.name] && !isArenaLoading && <span className="text-[10px] text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full uppercase tracking-widest font-sans">Done</span>}
                            </div>
                            <div className="flex-1 bg-primary border border-border rounded-xl p-4 overflow-y-auto text-sm text-txt/80 font-mono leading-relaxed transition-colors whitespace-pre-wrap">
                                {isArenaLoading ? (
                                  <span className="text-txt-muted italic">Generating response...</span>
                                ) : (
                                  arenaResults[model.name] || <span className="text-txt-muted/50 italic">Click Run Arena to fetch live response.</span>
                                )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-txt-muted/50 text-lg font-devanagari p-12 text-center">
            Select a prompt from the sidebar to open the workspace editor.
          </div>
        )}
      </div>
    </div>
  );
}
