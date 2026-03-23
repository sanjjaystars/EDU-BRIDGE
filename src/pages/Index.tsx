import { useState } from "react";
import { BookOpen, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import InputPanel from "@/components/InputPanel";
import OutputPanel from "@/components/OutputPanel";
import ControlBar, { type Language, type Difficulty, type Mode } from "@/components/ControlBar";

export default function Index() {
  const [language, setLanguage] = useState<Language>("english");
  const [difficulty, setDifficulty] = useState<Difficulty>("school");
  const [mode, setMode] = useState<Mode>("explain");
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleProcess = async (content: string) => {
    setIsLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("process", {
        body: { content, language, difficulty, mode },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 surface-elevated">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center shadow-sm">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">EduBridge AI</h1>
              <p className="text-[10px] text-muted-foreground leading-none">Universal Education Translator</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground px-2.5 py-1 rounded-full surface-sunken">
              <Sparkles className="w-3 h-3" />
              AI-Powered
            </span>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="border-b border-border/50 surface-elevated">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <ControlBar
            language={language}
            difficulty={difficulty}
            mode={mode}
            onLanguageChange={setLanguage}
            onDifficultyChange={setDifficulty}
            onModeChange={setMode}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-[calc(100vh-10rem)]">
          {/* Input */}
          <div className="surface-elevated rounded-xl border border-border/50 p-5 shadow-sm flex flex-col animate-fade-up" style={{ animationDelay: "0ms" }}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Input</h2>
            <div className="flex-1 min-h-0">
              <InputPanel onSubmit={handleProcess} isLoading={isLoading} />
            </div>
          </div>

          {/* Output */}
          <div className="surface-elevated rounded-xl border border-border/50 p-5 shadow-sm flex flex-col animate-fade-up" style={{ animationDelay: "100ms" }}>
            <div className="flex-1 min-h-0">
              <OutputPanel result={result} mode={mode} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
