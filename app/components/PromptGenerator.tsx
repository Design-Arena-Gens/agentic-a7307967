"use client";

import { useMemo, useState } from "react";

type OptionalAddOns = {
  includeVoiceover: boolean;
  includeDialogue: boolean;
  includeThumbnail: boolean;
  includeCaptionsTags: boolean;
  includeMusic: boolean;
};

export type GeneratedOutput = {
  title: string;
  oneLine: string;
  mood: string;
  style: string;
  scenes: Array<{
    index: number;
    setting: string;
    cameraAngle: string;
    cameraMovement: string;
    actions: string;
    lighting: string;
    colors: string;
    atmosphere: string;
    importantObjects: string;
  }>;
  fullPrompt: string;
  addOns?: {
    voiceover?: string;
    dialogue?: string;
    thumbnail?: string;
    captionsTags?: string;
    music?: string;
  };
};

const DEFAULT_SCENE_COUNT = 5;

function toTitleCase(text: string): string {
  return text
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function inferMood(topic: string): string {
  const t = topic.toLowerCase();
  if (/(storm|war|night|neon|noir|revenge|betrayal|loss)/.test(t)) return "moody, dramatic, tension";
  if (/(sunrise|spring|child|smile|peace|home|ocean|breeze)/.test(t)) return "warm, hopeful, gentle";
  if (/(future|cyber|city|neon|tech|robot)/.test(t)) return "cool, futuristic, surreal";
  if (/(journey|mountain|forest|desert|wild)/.test(t)) return "epic, adventurous, cinematic";
  return "cinematic, emotional, immersive";
}

function inferStyle(topic: string): string {
  const t = topic.toLowerCase();
  if (/(noir|detective|rain|cigarette|shadow)/.test(t)) return "film noir, grain, hard contrast";
  if (/(vintage|retro|70s|80s)/.test(t)) return "vintage film, soft bloom, subtle grain";
  if (/(anime|manga|ghibli)/.test(t)) return "anime-inspired, painterly, soft light";
  if (/(nature|wild|ocean|forest|mountain)/.test(t)) return "naturalistic, sweeping, high dynamic range";
  if (/(space|cyber|neon|future)/.test(t)) return "neo-futuristic, neon, reflective surfaces";
  return "cinematic realism, shallow depth, widescreen";
}

function buildScenes(topic: string, sceneCount: number): GeneratedOutput["scenes"] {
  const base = toTitleCase(topic);
  const templates = [
    {
      setting: `${base} ? Exterior ? Golden Hour`,
      cameraAngle: "wide establishing shot",
      cameraMovement: "slow forward dolly",
      actions: "subject enters frame with purpose",
      lighting: "soft, warm rim light, long shadows",
      colors: "amber, teal accents",
      atmosphere: "dust motes, gentle breeze",
      importantObjects: "distant landmark, path leading in"
    },
    {
      setting: `${base} ? Interior ? Quiet Space`,
      cameraAngle: "medium over-the-shoulder",
      cameraMovement: "subtle handheld drift",
      actions: "hands interact with key object",
      lighting: "single source window light",
      colors: "neutral base with soft highlights",
      atmosphere: "hushed, intimate",
      importantObjects: "photograph, letter, small relic"
    },
    {
      setting: `${base} ? Mid-Action`,
      cameraAngle: "tracking low angle",
      cameraMovement: "dynamic lateral slide",
      actions: "decisive movement, reveal of scale",
      lighting: "contrast with motivated practicals",
      colors: "deep blues, sharp whites",
      atmosphere: "energy, motion blur hints",
      importantObjects: "moving vehicle, doorway, horizon"
    },
    {
      setting: `${base} ? Intimate Close`,
      cameraAngle: "close-up profile",
      cameraMovement: "slow arc to front",
      actions: "micro expressions shift, breath visible",
      lighting: "soft key, delicate catchlight",
      colors: "skin tones, gentle desaturation",
      atmosphere: "quiet tension, time slows",
      importantObjects: "eyes, fingertips, fabric texture"
    },
    {
      setting: `${base} ? Climax / Reveal`,
      cameraAngle: "high wide tilt down",
      cameraMovement: "push-in to stillness",
      actions: "revelation held in silence",
      lighting: "cool ambient, warm highlight contrast",
      colors: "cool base with warm focal point",
      atmosphere: "air shimmers, particles rise",
      importantObjects: "central symbol, destination, sky"
    }
  ];

  return Array.from({ length: sceneCount }, (_, i) => ({ index: i + 1, ...templates[i % templates.length] }));
}

function buildFullPrompt(topic: string, mood: string, style: string, scenes: GeneratedOutput["scenes"]): string {
  const sceneLines = scenes
    .map((s) =>
      [
        `Scene ${s.index}: ${s.setting}.`,
        `Camera: ${s.cameraAngle}; movement: ${s.cameraMovement}.`,
        `Action: ${s.actions}.`,
        `Lighting: ${s.lighting}. Colors: ${s.colors}.`,
        `Atmosphere: ${s.atmosphere}. Objects: ${s.importantObjects}.`
      ].join(" ")
    )
    .join("\n");

  return [
    `${toTitleCase(topic)} ? cinematic text-to-video prompt`,
    `Mood: ${mood}. Style: ${style}.`,
    `Keep visuals consistent. Short, clear sentences. Focus on what the camera sees.`,
    sceneLines,
    `Final notes: consistent subject design, steady motion, no flicker, filmic grain, anamorphic bokeh.`
  ].join("\n\n");
}

function buildAddOns(topic: string, options: OptionalAddOns): GeneratedOutput["addOns"] {
  const base = toTitleCase(topic);
  const addOns: GeneratedOutput["addOns"] = {};
  if (options.includeVoiceover) {
    addOns.voiceover = [
      "Voiceover (calm, intimate, present):",
      `${base}. I walk into the light. The world holds its breath.`,
      "Between what was and what will be, I choose to move."
    ].join("\n");
  }
  if (options.includeDialogue) {
    addOns.dialogue = [
      "Dialogue:",
      `A: "Do you hear it?"`,
      `B: "Only when it's quiet."`,
      `A: "Then listen."`
    ].join("\n");
  }
  if (options.includeThumbnail) {
    addOns.thumbnail = [
      "Thumbnail prompt:",
      `${base} hero shot, strong silhouette, dominant focal point, shallow depth, soft bloom, high contrast, clean negative space, cinematic color grade`
    ].join("\n");
  }
  if (options.includeCaptionsTags) {
    addOns.captionsTags = [
      "Captions & tags:",
      `#cinematic #texttovideo #${base.replace(/\s+/g, "").toLowerCase()} #filmlook #shortfilm`
    ].join("\n");
  }
  if (options.includeMusic) {
    addOns.music = [
      "Music & sound mood:",
      `Sparse piano, warm pads, low cello; subtle field sounds (wind, fabric, breath)`
    ].join("\n");
  }
  return addOns;
}

export default function PromptGenerator() {
  const [topic, setTopic] = useState("");
  const [sceneCount, setSceneCount] = useState(DEFAULT_SCENE_COUNT);
  const [options, setOptions] = useState<OptionalAddOns>({
    includeVoiceover: false,
    includeDialogue: false,
    includeThumbnail: false,
    includeCaptionsTags: false,
    includeMusic: false
  });

  const output: GeneratedOutput | null = useMemo(() => {
    const clean = topic.trim();
    if (!clean) return null;
    const mood = inferMood(clean);
    const style = inferStyle(clean);
    const scenes = buildScenes(clean, Math.min(Math.max(sceneCount, 3), 10));
    const fullPrompt = buildFullPrompt(clean, mood, style, scenes);
    const addOns = buildAddOns(clean, options);

    return {
      title: `${toTitleCase(clean)}`,
      oneLine: `${toTitleCase(clean)} ? a ${mood.split(",")[0]} journey` ,
      mood,
      style,
      scenes,
      fullPrompt,
      addOns
    };
  }, [topic, sceneCount, options]);

  const [copied, setCopied] = useState(false);

  async function copyAll() {
    if (!output) return;
    const sceneText = output.scenes
      .map(
        (s) =>
          `Scene ${s.index}:\n- Setting: ${s.setting}\n- Camera angle: ${s.cameraAngle}\n- Camera movement: ${s.cameraMovement}\n- Character actions: ${s.actions}\n- Lighting: ${s.lighting}\n- Colors: ${s.colors}\n- Atmosphere: ${s.atmosphere}\n- Important objects: ${s.importantObjects}`
      )
      .join("\n\n");

    const addOnText = [
      output.addOns?.voiceover,
      output.addOns?.dialogue,
      output.addOns?.thumbnail,
      output.addOns?.captionsTags,
      output.addOns?.music
    ]
      .filter(Boolean)
      .join("\n\n");

    const text = [
      `1) Video Concept`,
      `Title: ${output.title}`,
      `One-line: ${output.oneLine}`,
      `Mood & emotion: ${output.mood}`,
      `Style: ${output.style}`,
      "",
      `2) Scene Breakdown`,
      sceneText,
      "",
      `3) Full Text-to-Video Prompt`,
      output.fullPrompt,
      addOnText ? "\n\n4) Optional Add-ons\n" + addOnText : ""
    ]
      .filter(Boolean)
      .join("\n");

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function updateOption<K extends keyof OptionalAddOns>(key: K) {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="grid">
      <div className="card">
        <div className="card-inner">
          <div className="section-title">Your Idea</div>
          <div style={{ height: 10 }} />
          <div className="row">
            <input
              className="input"
              placeholder="Describe your idea in one short line (e.g., lone traveler in neon city during rain)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              aria-label="Idea topic"
            />
          </div>
          <div style={{ height: 12 }} />
          <div className="row two">
            <div>
              <label className="kbd">Scene count</label>
              <input
                className="input"
                type="number"
                min={3}
                max={10}
                value={sceneCount}
                onChange={(e) => setSceneCount(parseInt(e.target.value || "5", 10))}
              />
            </div>
            <div>
              <label className="kbd">Add-ons</label>
              <div className="row" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <label><input type="checkbox" checked={options.includeVoiceover} onChange={() => updateOption("includeVoiceover")} /> Voiceover</label>
                <label><input type="checkbox" checked={options.includeDialogue} onChange={() => updateOption("includeDialogue")} /> Dialogue</label>
                <label><input type="checkbox" checked={options.includeThumbnail} onChange={() => updateOption("includeThumbnail")} /> Thumbnail</label>
                <label><input type="checkbox" checked={options.includeCaptionsTags} onChange={() => updateOption("includeCaptionsTags")} /> Captions & tags</label>
                <label><input type="checkbox" checked={options.includeMusic} onChange={() => updateOption("includeMusic")} /> Music</label>
              </div>
            </div>
          </div>
          <div style={{ height: 14 }} />
          <button className="btn primary" onClick={copyAll} disabled={!output}>
            {copied ? "Copied!" : "Copy Full Prompt"}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-inner">
          <div className="section-title">Generated Prompt</div>
          <div style={{ height: 10 }} />
          {!output ? (
            <div className="kbd">Type your idea to generate a cinematic prompt.</div>
          ) : (
            <div className="output" aria-live="polite">
              <strong>1) Video Concept</strong>
              {"\n"}
              Title: {output.title}
              {"\n"}
              One-line: {output.oneLine}
              {"\n"}
              Mood & emotion: {output.mood}
              {"\n"}
              Style: {output.style}
              {"\n\n"}

              <strong>2) Scene Breakdown</strong>
              {"\n"}
              {output.scenes.map((s) => (
                <div key={s.index} style={{ margin: "10px 0" }}>
                  Scene {s.index}
                  {"\n"}- Setting: {s.setting}
                  {"\n"}- Camera angle: {s.cameraAngle}
                  {"\n"}- Camera movement: {s.cameraMovement}
                  {"\n"}- Character actions: {s.actions}
                  {"\n"}- Lighting: {s.lighting}
                  {"\n"}- Colors: {s.colors}
                  {"\n"}- Atmosphere: {s.atmosphere}
                  {"\n"}- Important objects: {s.importantObjects}
                </div>
              ))}

              {"\n"}
              <strong>3) Full Text-to-Video Prompt</strong>
              {"\n"}
              {output.fullPrompt}

              {output.addOns && (
                <>
                  {output.addOns.voiceover && (
                    <>
                      {"\n\n"}
                      <strong>4) Optional Add-ons</strong>
                      {"\n"}
                      {output.addOns.voiceover}
                    </>
                  )}
                  {output.addOns.dialogue && (
                    <>
                      {"\n\n"}
                      {output.addOns.dialogue}
                    </>
                  )}
                  {output.addOns.thumbnail && (
                    <>
                      {"\n\n"}
                      {output.addOns.thumbnail}
                    </>
                  )}
                  {output.addOns.captionsTags && (
                    <>
                      {"\n\n"}
                      {output.addOns.captionsTags}
                    </>
                  )}
                  {output.addOns.music && (
                    <>
                      {"\n\n"}
                      {output.addOns.music}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
