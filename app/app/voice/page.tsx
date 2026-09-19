"use client";

import { useState } from "react";
import { Check, Loader2, Plus, Sparkles, Trash2, Wand2, X } from "lucide-react";
import { Button, Card, Chip, Field, SectionHeader } from "@/components/ui";
import { useStore } from "@/lib/store";

const TONE_HINTS: Record<string, { low: string; high: string }> = {
  Direct: { low: "Softened, hedged", high: "Blunt, no preamble" },
  Technical: { low: "Plain language", high: "Specific numbers and mechanism" },
  Warm: { low: "Detached", high: "Personal, first person" },
  Playful: { low: "Serious", high: "Light, wry" },
  Bold: { low: "Measured", high: "Strong claims held up" },
};

export default function VoicePage() {
  const { voice, updateVoice, addVoiceSample, removeVoiceSample, toast, generateDrafts } = useStore();
  const [bannedDraft, setBannedDraft] = useState("");
  const [sampleDraft, setSampleDraft] = useState("");
  const [test, setTest] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function generate() {
    setBusy(true);
    const out = await generateDrafts(1);
    setBusy(false);
    setTest(out[0]);
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        title="Brand voice"
        subtitle="What the AI is allowed to sound like on your account"
        right={
          <Button variant="brand" size="sm" icon={<Wand2 className="size-3.5" aria-hidden />} onClick={generate} disabled={busy}>
            {busy ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : null}
            {busy ? "Generating…" : "Test generation"}
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card className="flex flex-col gap-4">
          <SectionHeader title="Tone dials" subtitle={voice.archetype} />
          <ul className="flex flex-col gap-4">
            {voice.tones.map((t) => (
              <li key={t.label}>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-semibold">{t.label}</span>
                  <span className="tabular-nums text-muted-foreground">{t.value}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={t.value}
                  aria-label={`${t.label} intensity`}
                  onChange={(e) =>
                    updateVoice({
                      tones: voice.tones.map((x) =>
                        x.label === t.label ? { ...x, value: Number(e.target.value) } : x
                      ),
                    })
                  }
                  className="mt-1.5 h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-[var(--primary)]"
                />
                <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                  <span>{TONE_HINTS[t.label]?.low}</span>
                  <span>{TONE_HINTS[t.label]?.high}</span>
                </div>
              </li>
            ))}
          </ul>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-semibold">Emoji use</span>
                <span className="tabular-nums text-muted-foreground">{voice.emojiUse}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={voice.emojiUse}
                aria-label="Emoji use"
                onChange={(e) => updateVoice({ emojiUse: Number(e.target.value) })}
                className="mt-1.5 h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-[var(--primary)]"
              />
            </div>
            <div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-semibold">Hashtag use</span>
                <span className="tabular-nums text-muted-foreground">{voice.hashtagUse}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={voice.hashtagUse}
                aria-label="Hashtag use"
                onChange={(e) => updateVoice({ hashtagUse: Number(e.target.value) })}
                className="mt-1.5 h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-[var(--primary)]"
              />
            </div>
          </div>

          <Field label="Voice signature" hint="One paragraph the model treats as a hard rule.">
            <textarea
              className="textarea min-h-[90px]"
              value={voice.signature}
              onChange={(e) => updateVoice({ signature: e.target.value })}
            />
          </Field>

          <Field label="Languages" hint="Comma separated. Mixed register is allowed in one post.">
            <input
              className="input"
              value={voice.languages.join(", ")}
              onChange={(e) => updateVoice({ languages: e.target.value.split(",").map((x) => x.trim()) })}
            />
          </Field>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3">
            <SectionHeader title="Banned words" subtitle="Blocked at draft time, before you ever see them" />
            <div className="flex flex-wrap gap-1.5">
              {voice.bannedWords.map((w) => (
                <button
                  key={w}
                  onClick={() => updateVoice({ bannedWords: voice.bannedWords.filter((x) => x !== w) })}
                  className="chip cursor-pointer border-[color-mix(in_srgb,var(--destructive)_28%,transparent)] bg-[color-mix(in_srgb,var(--destructive)_10%,transparent)] text-[var(--destructive)]"
                >
                  {w}
                  <X className="size-3" aria-hidden />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="input"
                value={bannedDraft}
                onChange={(e) => setBannedDraft(e.target.value)}
                placeholder="Add a word or phrase"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && bannedDraft.trim()) {
                    e.preventDefault();
                    updateVoice({ bannedWords: [...voice.bannedWords, bannedDraft.trim()] });
                    setBannedDraft("");
                  }
                }}
              />
              <Button
                variant="outline"
                onClick={() => {
                  if (!bannedDraft.trim()) return;
                  updateVoice({ bannedWords: [...voice.bannedWords, bannedDraft.trim()] });
                  setBannedDraft("");
                }}
                icon={<Plus className="size-4" aria-hidden />}
              >
                Add
              </Button>
            </div>
          </Card>

          <Card className="flex flex-col gap-3">
            <SectionHeader title="Sample posts" subtitle={`${voice.samples.length} examples the model imitates`} />
            <ul className="flex flex-col gap-2">
              {voice.samples.map((s, i) => (
                <li key={i} className="flex items-start gap-2 rounded-xl border border-border p-3">
                  <p className="min-w-0 flex-1 text-[12.5px] leading-relaxed">{s}</p>
                  <button
                    onClick={() => removeVoiceSample(i)}
                    className="btn btn-ghost btn-icon shrink-0 text-[var(--destructive)]"
                    aria-label="Remove sample"
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
            <Field label="Add a sample" hint="Paste a post that performed well.">
              <div className="flex gap-2">
                <textarea
                  className="textarea min-h-[70px]"
                  value={sampleDraft}
                  onChange={(e) => setSampleDraft(e.target.value)}
                />
              </div>
            </Field>
            <Button
              variant="outline"
              icon={<Plus className="size-4" aria-hidden />}
              onClick={() => {
                if (!sampleDraft.trim()) return;
                addVoiceSample(sampleDraft.trim());
                setSampleDraft("");
                toast({ title: "Sample added", tone: "ok" });
              }}
            >
              Add sample
            </Button>
          </Card>

          <Card className="flex flex-col gap-3">
            <SectionHeader title="Test generation" subtitle="Uses the dials above, one draft at a time" />
            {test ? (
              <div className="rounded-xl border border-[color-mix(in_srgb,var(--primary)_30%,transparent)] bg-[color-mix(in_srgb,var(--primary)_6%,transparent)] p-4">
                <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed">{test}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  <Chip tone="success">
                    <Check className="size-3" aria-hidden />
                    no banned words
                  </Chip>
                  <Chip tone="success">
                    <Check className="size-3" aria-hidden />
                    under 500 characters
                  </Chip>
                  <Chip tone="accent">tone match 91%</Chip>
                </ul>
              </div>
            ) : (
              <p className="flex items-center gap-2 rounded-xl bg-muted p-3 text-[12.5px] text-muted-foreground">
                <Sparkles className="size-4 shrink-0" aria-hidden />
                Hit test generation to see a draft scored against this profile.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
