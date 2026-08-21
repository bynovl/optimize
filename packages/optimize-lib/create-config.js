import fs from "fs";
import path from "path";
import { defaultConfig } from "./get-config.js";

/**
 * Writes a fresh `optimize.config.js` to the repository root. Existing config is backed up as `optimize.config.js.bak`.
 */
export async function createConfig() {
  const config = await defaultConfig();
  const rootDir = path.resolve(process.cwd());
  const configPath = path.join(rootDir, "optimize.config.js");
  const backupPath = `${configPath}.bak`;

  // If a config already exists, rename it to .bak (overwrites any previous backup)
  if (fs.existsSync(configPath)) {
    try {
      if (fs.existsSync(backupPath)) {
        fs.rmSync(backupPath);
      }
      fs.renameSync(configPath, backupPath);
    } catch (e) {
      console.error("Failed to backup existing optimize.config.js:", e);
      return;
    }
  }

  // Serialize the default configurat`ion as an ES module exporting a default object.
  const fileContent = `export default ${JSON.stringify(config, null, 2)};\n`;

  try {
    fs.writeFileSync(configPath, fileContent, { encoding: "utf8" });
    console.log("[novl optimize]:Created new optimize.config.js with default settings.");
  } catch (e) {
    console.error("Failed to write optimize.config.js:", e);
  }
}