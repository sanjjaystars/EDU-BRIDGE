import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type Language = "english" | "tamil" | "hindi" | "telugu" | "kannada" | "malayalam" | "french" | "spanish";
export type Difficulty = "school" | "college" | "exam";
export type Mode = "explain" | "summary" | "quiz";

interface ControlBarProps {
  language: Language;
  difficulty: Difficulty;
  mode: Mode;
  onLanguageChange: (v: Language) => void;
  onDifficultyChange: (v: Difficulty) => void;
  onModeChange: (v: Mode) => void;
}

const languages: { value: Language; label: string }[] = [
  { value: "english", label: "English" },
  { value: "tamil", label: "தமிழ் (Tamil)" },
  { value: "hindi", label: "हिन्दी (Hindi)" },
  { value: "telugu", label: "తెలుగు (Telugu)" },
  { value: "kannada", label: "ಕನ್ನಡ (Kannada)" },
  { value: "malayalam", label: "മലയാളം (Malayalam)" },
  { value: "french", label: "Français (French)" },
  { value: "spanish", label: "Español (Spanish)" },
];

const difficulties: { value: Difficulty; label: string; desc: string }[] = [
  { value: "school", label: "School", desc: "Simple language" },
  { value: "college", label: "College", desc: "Detailed" },
  { value: "exam", label: "Exam Prep", desc: "Comprehensive" },
];

const modes: { value: Mode; label: string }[] = [
  { value: "explain", label: "Explain" },
  { value: "summary", label: "Summary" },
  { value: "quiz", label: "Quiz" },
];

export default function ControlBar(props: ControlBarProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Select value={props.language} onValueChange={(v) => props.onLanguageChange(v as Language)}>
        <SelectTrigger className="w-[160px] h-9 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages.map((l) => (
            <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={props.difficulty} onValueChange={(v) => props.onDifficultyChange(v as Difficulty)}>
        <SelectTrigger className="w-[130px] h-9 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {difficulties.map((d) => (
            <SelectItem key={d.value} value={d.value}>
              <span>{d.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1 p-1 rounded-lg surface-sunken">
        {modes.map((m) => (
          <button
            key={m.value}
            onClick={() => props.onModeChange(m.value)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all
              ${props.mode === m.value
                ? "surface-elevated shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
