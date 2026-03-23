import { useState, useRef } from "react";
import { FileText, Link, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

type InputMode = "text" | "pdf" | "url";

interface InputPanelProps {
  onSubmit: (content: string) => void;
  isLoading: boolean;
}

export default function InputPanel({ onSubmit, isLoading }: InputPanelProps) {
  const [mode, setMode] = useState<InputMode>("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [pdfText, setPdfText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const tabs: { id: InputMode; label: string; icon: React.ReactNode }[] = [
    { id: "text", label: "Text", icon: <FileText className="w-4 h-4" /> },
    { id: "pdf", label: "PDF", icon: <Upload className="w-4 h-4" /> },
    { id: "url", label: "URL", icon: <Link className="w-4 h-4" /> },
  ];

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= Math.min(pdf.numPages, 20); i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map((item: any) => item.str).join(" ") + "\n";
      }
      setPdfText(fullText.trim());
    } catch {
      setPdfText("");
      setFileName("");
    }
  };

  const handleSubmit = () => {
    let content = "";
    if (mode === "text") content = text;
    else if (mode === "pdf") content = pdfText;
    else if (mode === "url") content = `[URL]: ${url}`;
    if (content.trim()) onSubmit(content.trim());
  };

  const hasContent =
    (mode === "text" && text.trim()) ||
    (mode === "pdf" && pdfText) ||
    (mode === "url" && url.trim());

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 p-1 rounded-lg surface-sunken mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all flex-1 justify-center
              ${mode === tab.id
                ? "surface-elevated shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        {mode === "text" && (
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your content here... lectures, textbook passages, articles, or any educational material."
            className="h-full min-h-[200px] resize-none border-border/50 bg-transparent focus-visible:ring-primary/30 text-sm leading-relaxed"
          />
        )}

        {mode === "pdf" && (
          <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-border/60 rounded-lg p-8">
            {fileName ? (
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <p className="font-medium text-sm">{fileName}</p>
                <p className="text-xs text-muted-foreground">{pdfText.length} characters extracted</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setFileName(""); setPdfText(""); }}
                >
                  <X className="w-3 h-3 mr-1" /> Remove
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full surface-sunken flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Drop a PDF or click to browse</p>
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  Choose File
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
              </div>
            )}
          </div>
        )}

        {mode === "url" && (
          <div className="h-full flex flex-col items-center justify-center gap-4 p-8">
            <div className="w-12 h-12 rounded-full surface-sunken flex items-center justify-center">
              <Link className="w-6 h-6 text-muted-foreground" />
            </div>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="max-w-md border-border/50"
            />
            <p className="text-xs text-muted-foreground">Paste a URL to an article or webpage</p>
          </div>
        )}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!hasContent || isLoading}
        className="mt-4 brand-gradient text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all shadow-md"
        size="lg"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Processing...
          </span>
        ) : (
          "Process Content"
        )}
      </Button>
    </div>
  );
}
