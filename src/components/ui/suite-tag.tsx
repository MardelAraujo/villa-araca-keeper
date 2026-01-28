import { cn } from "@/lib/utils";

// Cores definidas para cada suíte conforme memória do projeto
export const SUITE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Verde: { bg: "bg-[#4CAF50]/15", text: "text-[#2E7D32]", border: "border-[#4CAF50]/30" },
  Azul: { bg: "bg-[#2196F3]/15", text: "text-[#1565C0]", border: "border-[#2196F3]/30" },
  Abacate: { bg: "bg-[#8BC34A]/15", text: "text-[#558B2F]", border: "border-[#8BC34A]/30" },
  Amarela: { bg: "bg-[#FFC107]/15", text: "text-[#F57F17]", border: "border-[#FFC107]/30" },
  Laranja: { bg: "bg-[#FF9800]/15", text: "text-[#E65100]", border: "border-[#FF9800]/30" },
  Master: { bg: "bg-[#E2B6BB]/20", text: "text-[#8B5A5E]", border: "border-[#E2B6BB]/40" },
};

interface SuiteTagProps {
  suiteName: string;
  suiteColor?: string | null;
  className?: string;
  size?: "sm" | "md";
}

export function SuiteTag({ suiteName, suiteColor, className, size = "sm" }: SuiteTagProps) {
  // Tenta encontrar as cores pela cor de identificação ou pelo nome da suíte
  const colorKey = suiteColor || suiteName.replace("Suíte ", "");
  const colors = SUITE_COLORS[colorKey] || {
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        colors.bg,
        colors.text,
        colors.border,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className
      )}
    >
      {suiteName}
    </span>
  );
}
