import { useState } from "react";
import { Copy, Check, Volume2, VolumeX, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Mode } from "./ControlBar";

interface OutputPanelProps {
  result: string | null;
  mode: Mode;
  isLoading: boolean;
}

export default function OutputPanel({ result, mode, isLoading }: OutputPanelProps) {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!result) return;
    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(result);
    utterance.rate = 0.9;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `edubridge-${mode}-output.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const modeLabels: Record<Mode, string> = {
    explain: "Simplified Explanation",
    summary: "Bullet-Point Summary",
    quiz: "Quiz Questions",
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium">Processing with AI...</p>
          <p className="text-xs text-muted-foreground">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
        <div className="w-16 h-16 rounded-2xl surface-sunken flex items-center justify-center">
          <span className="text-2xl">🎓</span>
        </div>
        <h3 className="font-semibold text-foreground">Ready to Learn</h3>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          Paste text, upload a PDF, or enter a URL on the left. Choose your language, difficulty, and mode — then hit Process.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {modeLabels[mode]}
        </h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSpeak} title={speaking ? "Stop" : "Play Audio"}>
            {speaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy} title="Copy">
            {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload} title="Download">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="prose prose-sm max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
          {result}
        </div>
      </div>
    </div>
  );
}
