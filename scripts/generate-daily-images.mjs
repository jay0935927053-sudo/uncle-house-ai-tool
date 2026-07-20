import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(new URL("..", import.meta.url).pathname);
const envPath = path.join(repoRoot, ".env.local");

loadEnv(envPath);

const options = parseArgs(process.argv.slice(2));
const outDir = path.resolve(repoRoot, options.out || "daily-images");
const date = options.date || formatDate(new Date());
const model = options.model || "gpt-image-1";
const quality = options.quality || "low";
const size = options.size || "1024x1536";
const dryRun = options.dryRun;

const categories = [
  {
    folder: "01_海外資產內容",
    topic: "高收入家庭為什麼開始看馬來西亞吉隆坡 KLCC 資產配置",
    file: "FB貼文圖.png",
    prompt: [
      "Generate a cinematic realistic vertical image.",
      "Purpose: Facebook feed image for a real estate personal brand post.",
      "Topic: high income Taiwanese families planning Malaysia KLCC overseas asset allocation.",
      "Fixed character: 42-year-old Taiwanese male realtor, dark luxury suit, white shirt, slightly loosened tie, short hair, calm professional expression, mature, trustworthy.",
      "Scene: luxury condo lobby and KLCC-inspired skyline, Taiwanese family discussing wealth planning with the realtor, overseas property documents, warm orange practical lighting, blue-gray cinematic tone.",
      "Visual style: Netflix original series quality, luxury commercial film, low key lighting, high contrast, 35mm lens, shallow depth of field, film grain, ultra realistic skin texture, natural acting, HDR.",
      "9:16 vertical, no text, no watermark."
    ].join(" ")
  },
  {
    folder: "02_房仲自媒體內容",
    topic: "房仲如何用短影音把曝光變成私訊名單",
    file: "FB貼文圖.png",
    prompt: [
      "Generate a cinematic realistic vertical image.",
      "Purpose: Facebook feed image for a realtor personal branding post.",
      "Topic: Taiwanese realtor content factory turning short-form video exposure into private message leads.",
      "Fixed character: 42-year-old Taiwanese male realtor, dark luxury suit, white shirt, slightly loosened tie, short hair, calm professional expression, mature, trustworthy.",
      "Scene: elegant real estate content studio, organized desk, smartphone on tripod, CRM dashboard mood, planning board, warm orange practical lighting against blue-gray background.",
      "Visual style: Netflix original series quality, luxury commercial film, low key lighting, high contrast, 35mm lens, shallow depth of field, film grain, ultra realistic skin texture, natural acting, HDR.",
      "9:16 vertical, no text, no watermark."
    ].join(" ")
  }
];

if (!process.env.OPENAI_API_KEY && !dryRun) {
  throw new Error("OPENAI_API_KEY is missing. Save it in .env.local first.");
}

fs.mkdirSync(outDir, { recursive: true });

const manifest = {
  date,
  model,
  quality,
  size,
  generatedAt: new Date().toISOString(),
  files: []
};

for (const category of categories) {
  const categoryDir = path.join(outDir, category.folder);
  fs.mkdirSync(categoryDir, { recursive: true });
  const promptPath = path.join(categoryDir, "image-prompt.txt");
  const imagePath = path.join(categoryDir, category.file);
  fs.writeFileSync(promptPath, `${category.topic}\n\n${category.prompt}\n`, "utf8");

  if (dryRun) {
    manifest.files.push({ category: category.folder, topic: category.topic, promptPath, imagePath, dryRun: true });
    continue;
  }

  const image = await generateImage({ model, prompt: category.prompt, quality, size });
  fs.writeFileSync(imagePath, Buffer.from(image, "base64"));
  manifest.files.push({ category: category.folder, topic: category.topic, promptPath, imagePath });
}

fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
console.log(JSON.stringify({
  ok: true,
  outDir,
  date,
  files: manifest.files.map(file => ({
    category: file.category,
    imagePath: file.imagePath,
    promptPath: file.promptPath,
    dryRun: Boolean(file.dryRun)
  }))
}, null, 2));

async function generateImage({ model, prompt, quality, size }) {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      prompt,
      n: 1,
      size,
      quality,
      output_format: "png"
    })
  });

  const payload = await response.json();
  if (!response.ok) {
    const message = payload?.error?.message || `OpenAI image generation failed with status ${response.status}`;
    throw new Error(message);
  }

  const b64 = payload?.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI response did not include image b64_json.");
  return b64;
}

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, value] = match;
    if (!process.env[key]) process.env[key] = value.replace(/^["']|["']$/g, "");
  }
}

function parseArgs(args) {
  const parsed = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--dry-run") {
      parsed.dryRun = true;
      continue;
    }
    if (arg.startsWith("--")) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
      parsed[key] = args[index + 1];
      index += 1;
    }
  }
  return parsed;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
