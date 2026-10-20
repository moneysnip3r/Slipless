const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const envPath = path.join(projectRoot, ".env");
const outputPath = path.join(projectRoot, "public", "supabase-config.js");

// Read the local .env without adding a dependency; browsers cannot read .env files directly.
function readEnvFile() {
    if (!fs.existsSync(envPath)) return {};

    return Object.fromEntries(
        fs.readFileSync(envPath, "utf8")
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line && !line.startsWith("#"))
            .map((line) => {
                const separator = line.indexOf("=");
                if (separator === -1) return [null, null];

                const name = line.slice(0, separator).trim();
                let value = line.slice(separator + 1).trim();
                if (
                    (value.startsWith('"') && value.endsWith('"')) ||
                    (value.startsWith("'") && value.endsWith("'"))
                ) {
                    value = value.slice(1, -1);
                }
                return [name, value];
            })
            .filter(([name]) => name)
    );
}

// Environment variables take priority so build systems can supply config without a local .env.
const fileEnv = readEnvFile();
const supabaseUrl = process.env.SUPABASE_URL || fileEnv.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY || fileEnv.SUPABASE_ANON_KEY;

// Stop instead of generating a broken config if values are missing or still example placeholders.
if (!supabaseUrl || !anonKey || supabaseUrl.includes("your-project-id") || anonKey.includes("your-supabase-")) {
    throw new Error(
        "Set SUPABASE_URL and SUPABASE_ANON_KEY in .env or the environment before generating the Supabase config."
    );
}

// Supabase endpoints should use HTTPS; allow HTTP only for local development.
let parsedUrl;
try {
    parsedUrl = new URL(supabaseUrl);
} catch {
    throw new Error("SUPABASE_URL must be a valid URL.");
}

if (
    parsedUrl.protocol !== "https:" &&
    !(parsedUrl.protocol === "http:" && parsedUrl.hostname === "localhost")
) {
    throw new Error("SUPABASE_URL must use HTTPS (except for localhost).");
}

// This config is loaded by the browser, so include only the public anon/publishable key,
// never a Supabase service_role key.
const config = {
    url: supabaseUrl,
    anonKey
};

// Write a small browser-readable file consumed by public/supabase-client.js.
fs.writeFileSync(
    outputPath,
    `window.SLIPLESS_SUPABASE_CONFIG = ${JSON.stringify(config)};\n`,
    "utf8"
);
console.log(`Generated ${path.relative(projectRoot, outputPath)}`);
