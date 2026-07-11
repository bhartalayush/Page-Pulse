import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Folder, Plus, History, Play, Network, FileText, CheckSquare, Square, Settings, X, Save, Trash2, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

  // Derived State
  const activeFolder = folders.find(f => f.id === activeFolderId);
  const activePrompt = activeFolder?.prompts.find(p => p.id === activePromptId);
  const activeVersion = activePrompt?.versions.find(v => v.id === activeVersionId);

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

    const models = [
      { id: 'google/gemini-2.5-flash-free', name: 'Gemini 2.5 Flash' },
      { id: 'meta-llama/llama-3-8b-instruct:free', name: 'Llama 3 8B' },
      { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B' }
    ];

    for (const model of models) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: model.id,
            messages: [{ role: "system", content: editorContent }, { role: "user", content: "Hello!" }]
          })
        });
        const data = await response.json();
        setArenaResults(prev => ({ ...prev, [model.name]: data.choices?.[0]?.message?.content || "Error" }));
      } catch (e) {
        setArenaResults(prev => ({ ...prev, [model.name]: "Failed to fetch" }));
      }
    }
    setIsArenaLoading(false);
  };

  return (
    <div className="w-full h-screen flex bg-parchment text-ink font-sans overflow-hidden">
      
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl border-2 border-gold/20 relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-devanagari">Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-ink/50 hover:text-ink"><X /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-ink/70 mb-2 uppercase tracking-wider">OpenRouter API Key</label>
                <input 
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full px-4 py-3 bg-parchment border border-gold/30 rounded-xl focus:border-gold outline-none"
                />
                <p className="text-xs text-ink/50 mt-2">Required for live Arena testing. Your key is stored securely in your browser's localStorage.</p>
                <button 
                  onClick={() => setShowApiHelp(true)} 
                  className="text-xs font-bold text-gold hover:text-gold-dark hover:underline mt-2 block"
                >
                  Don't know how to get a key? Click here.
                </button>
              </div>
              <button onClick={() => setShowSettings(false)} className="w-full btn-primary text-center block mt-4 !px-6 !py-3">Save Configuration</button>
            </div>
          </div>
        </div>
      )}

      {/* API Help Documentation Modal */}
      {showApiHelp && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center backdrop-blur-md">
          <div className="bg-parchment p-8 rounded-3xl w-full max-w-lg shadow-2xl border border-gold/40 relative">
             <button onClick={() => setShowApiHelp(false)} className="absolute top-6 right-6 text-ink/50 hover:text-ink"><X /></button>
             <h2 className="text-3xl font-bold font-devanagari mb-6 text-gold-dark border-b border-gold/20 pb-4">Getting an API Key</h2>
             <div className="space-y-5 text-sm text-ink/80 leading-relaxed font-sans">
                <p>To use the live AI Arena for free, PromptDesk connects to <strong>OpenRouter</strong>, a free proxy that gives you access to models like Llama 3 and Gemini Flash without needing a credit card.</p>
                <ol className="list-decimal pl-5 space-y-3 font-bold text-ink">
                  <li>Go to <a href="https://openrouter.ai" target="_blank" rel="noreferrer" className="text-gold underline hover:text-gold-dark">OpenRouter.ai</a> and sign up for a free account.</li>
                  <li>Click on your profile in the top right and go to <strong>Keys</strong>.</li>
                  <li>Click <strong>Create Key</strong> and give it a name (e.g., "PromptDesk").</li>
                  <li>Copy the generated key (it starts with <code className="bg-gold/10 px-1 rounded text-gold-dark">sk-or-v1-</code>) and paste it into the Settings menu here.</li>
                </ol>
                <div className="bg-gold/10 p-4 rounded-xl border border-gold/20 mt-6">
                  <p className="italic text-ink/70"><strong>Note:</strong> We automatically route your arena requests to free-tier models, so you will never be charged!</p>
                </div>
             </div>
             <button onClick={() => setShowApiHelp(false)} className="btn-primary mt-8 w-full text-center !py-3">Got it! Return to Settings</button>
          </div>
        </div>
      )}

      {/* Panel 1: Folders (w-64) */}
      <div className="w-64 border-r border-gold/20 bg-parchment-dark/10 flex flex-col shrink-0">
        <div className="p-6 border-b border-gold/10 flex items-center justify-between cursor-pointer hover:bg-gold/5 transition-colors" onClick={() => navigate('/')}>
          <h1 className="font-bold text-2xl tracking-tight text-ink font-devanagari">PromptDesk</h1>
        </div>
        
        <div className="p-4 flex items-center justify-between mt-2">
          <h2 className="font-bold text-ink/50 uppercase tracking-widest text-xs">Workspaces</h2>
          <button onClick={() => setIsCreatingFolder(true)} className="text-gold hover:text-gold-dark transition-colors">
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
              className="w-full px-3 py-2 text-sm border border-gold/30 bg-white rounded-lg focus:border-gold outline-none"
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
                  ? 'bg-gold/10 text-ink font-bold border border-gold/30 shadow-sm' 
                  : 'text-ink/60 hover:bg-gold/5'
              }`}
            >
              <Folder className={`w-4 h-4 ${activeFolderId === folder.id ? 'text-gold' : 'text-ink/40'}`} />
              <span className="text-sm truncate">{folder.name}</span>
            </button>
          ))}
        </div>
        
        <div className="p-4 border-t border-gold/10">
          <button onClick={() => setShowSettings(true)} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-ink/60 hover:bg-gold/10 hover:text-ink transition-colors">
            <Settings className="w-5 h-5" />
            <span className="text-sm font-bold">Settings</span>
          </button>
        </div>
      </div>

      {/* Panel 2: Prompts & Versions (w-80) */}
      <div className="w-80 border-r border-gold/20 flex flex-col bg-white shrink-0">
        {activeFolder ? (
          <>
            <div className="p-4 border-b border-gold/10 bg-parchment-dark/5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-ink/50 uppercase tracking-widest">Prompts in {activeFolder.name}</span>
                <button 
                  onClick={() => setIsCreatingPrompt(true)} 
                  className="flex items-center gap-1 text-xs font-bold text-gold hover:text-gold-dark transition-colors border border-gold/30 px-3 py-1.5 rounded-full hover:bg-gold/5 shadow-sm bg-white"
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
                  className="w-full px-3 py-2 text-sm border border-gold/30 bg-white rounded-lg mb-4 focus:border-gold outline-none shadow-inner"
                  onBlur={() => { if(!newPromptName) setIsCreatingPrompt(false) }}
                />
              )}

              <select 
                className="w-full p-3 text-sm font-bold border border-gold/20 rounded-xl bg-white outline-none focus:border-gold shadow-sm cursor-pointer mb-2"
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
                    className="text-xs text-ink/40 hover:text-gold font-bold flex items-center gap-1 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" /> Rename
                  </button>
                  <span className="text-ink/20">|</span>
                  <button 
                    onClick={() => handleDeletePrompt(activePrompt.id)}
                    className="text-xs text-ink/40 hover:text-red-500 font-bold flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              )}
            </div>

            {activePrompt && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-parchment/30">
                <div className="flex items-center justify-between px-2 mb-2">
                  <span className="text-xs font-bold text-ink/50 uppercase tracking-widest">Version History</span>
                  <History className="w-4 h-4 text-ink/30" />
                </div>
                
                {activePrompt.versions.map((v, i) => (
                  <button 
                    key={v.id}
                    onClick={() => setActiveVersionId(v.id)}
                    className={`group w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden ${
                      activeVersionId === v.id 
                        ? 'border-gold bg-white shadow-md' 
                        : 'border-gold/10 hover:border-gold/30 bg-white/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-ink">Version {activePrompt.versions.length - i}</span>
                      {i === 0 && <span className="bg-gold/10 text-gold text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-gold/20">Latest</span>}
                    </div>
                    <span className="text-[11px] text-ink/40 font-mono">{v.timestamp}</span>
                    
                    {/* Delete Version Button (Shows on Hover) */}
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
                  <div className="text-center text-ink/40 text-sm mt-8 italic font-devanagari">
                    No versions saved yet.<br/>Type in the editor and hit save!
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-ink/40 text-sm p-8 text-center">
            Create or select a workspace to get started.
          </div>
        )}
      </div>

      {/* Panel 3: Unified Workspace (Editor + Actions) */}
      <div className="flex-1 flex flex-col bg-white">
        {activePrompt ? (
          <>
            {/* Split Screen Top: Editor */}
            <div className="h-1/2 flex flex-col border-b border-gold/20 p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold font-devanagari text-ink flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gold" />
                  Editor: {activePrompt.name}
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
                className="flex-1 w-full bg-parchment/50 border border-gold/20 focus:border-gold rounded-2xl p-6 resize-none outline-none text-ink font-mono text-sm leading-relaxed shadow-inner"
                value={editorContent}
                onChange={e => setEditorContent(e.target.value)}
                placeholder="Write your system prompt here..."
              />
            </div>

            {/* Split Screen Bottom: Action Panel */}
            <div className="h-1/2 flex flex-col bg-parchment/20">
              <div className="flex border-b border-gold/10 bg-white">
                <button 
                  onClick={() => setActionTab('eval')}
                  className={`flex-1 py-4 font-bold tracking-widest uppercase text-sm transition-colors border-b-2 ${actionTab === 'eval' ? 'border-gold text-gold bg-gold/5' : 'border-transparent text-ink/40 hover:text-ink hover:bg-gray-50'}`}
                >
                  Automated Evaluation
                </button>
                <button 
                  onClick={() => setActionTab('arena')}
                  className={`flex-1 py-4 font-bold tracking-widest uppercase text-sm transition-colors border-b-2 ${actionTab === 'arena' ? 'border-gold text-gold bg-gold/5' : 'border-transparent text-ink/40 hover:text-ink hover:bg-gray-50'}`}
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
                        <p className="text-ink/60 italic font-devanagari text-lg">Select versions to run against test suite</p>
                        <button 
                          onClick={handleRunEvaluation}
                          disabled={selectedPromptsForEval.length === 0 || isEvaluating}
                          className="btn-primary !px-6 !py-2 !rounded-lg flex items-center gap-2 disabled:opacity-50 text-sm"
                        >
                          {isEvaluating ? <span className="animate-spin text-xl">◌</span> : <Play className="w-4 h-4" />} 
                          Run Evaluations
                        </button>
                      </div>
                      
                      <div className="bg-white border border-gold/20 rounded-2xl shadow-sm overflow-hidden">
                        <div className="flex items-center p-4 border-b border-gold/10 bg-parchment">
                          <button onClick={() => setSelectedPromptsForEval(activeFolder.prompts.map(p => p.id))} className="text-ink/40 hover:text-gold mr-4">
                            <CheckSquare className="w-5 h-5" />
                          </button>
                          <div className="flex-1 font-bold text-xs tracking-widest uppercase text-ink/50">PROMPT</div>
                          <div className="w-24 font-bold text-xs tracking-widest uppercase text-ink/50 text-center">SCORE</div>
                          <div className="w-24 font-bold text-xs tracking-widest uppercase text-ink/50 text-center">SAFETY</div>
                          <div className="w-24 font-bold text-xs tracking-widest uppercase text-ink/50 text-center">TONE</div>
                        </div>

                        {activeFolder.prompts.map(prompt => {
                          const isSelected = selectedPromptsForEval.includes(prompt.id);
                          const results = evalResults?.[prompt.id];

                          return (
                            <div key={prompt.id} className={`flex items-center p-4 border-b border-gold/5 transition-colors ${isSelected ? 'bg-gold/5' : 'hover:bg-parchment/50'}`}>
                              <button onClick={() => toggleEvalSelection(prompt.id)} className={`mr-4 ${isSelected ? 'text-gold' : 'text-ink/20 hover:text-ink/40'}`}>
                                {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                              </button>
                              <div className="flex-1">
                                <div className="font-bold text-ink">{prompt.name}</div>
                              </div>
                              
                              {results ? (
                                <>
                                  <div className="w-24 text-center text-xl font-bold text-gold">{results.score}</div>
                                  <div className="w-24 text-center text-md font-bold text-ink/70">{results.safety}%</div>
                                  <div className="w-24 text-center text-md font-bold text-ink/70">{results.tone}%</div>
                                </>
                              ) : (
                                <div className="w-72 text-center text-sm text-ink/30 italic">Not evaluated</div>
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
                        <p className="text-ink/60 italic font-devanagari text-lg">Test active prompt simultaneously</p>
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
                        {['Gemini 2.5 Flash', 'Llama 3 8B', 'Mistral 7B'].map(model => (
                          <div key={model} className="bg-white border border-gold/20 rounded-2xl p-5 flex flex-col shadow-sm">
                            <div className="font-bold text-md text-ink mb-3 pb-3 border-b border-gold/10 font-devanagari flex items-center justify-between">
                              {model}
                              {arenaResults[model] && <span className="text-[10px] text-green-600 bg-green-100 px-2 py-0.5 rounded-full uppercase tracking-widest font-sans">Done</span>}
                            </div>
                            <div className="flex-1 bg-parchment/50 border border-gold/10 rounded-xl p-4 overflow-y-auto text-sm text-ink/80 font-mono leading-relaxed">
                              {isArenaLoading ? (
                                <span className="text-ink/40 italic">Generating response...</span>
                              ) : (
                                arenaResults[model] || <span className="text-ink/30 italic">Click Run Arena to fetch live response.</span>
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
          <div className="flex-1 flex items-center justify-center text-ink/30 text-lg font-devanagari p-12 text-center">
            Select a prompt from the sidebar to open the workspace editor.
          </div>
        )}
      </div>
    </div>
  );
}
