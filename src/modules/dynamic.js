import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dynamic = async () => {
  let parsedPlugins = process.argv.slice(2);

  parsedPlugins.forEach(async (value) => {
    try {
      let pluginPath = path.join(__dirname, "plugins", value + ".js");
      await fs.access(pluginPath, fs.constants.F_OK);
      
      const pluginUrl = pathToFileURL(pluginPath);
      let plugin = await import(pluginUrl);
      
      console.log(plugin.run());
    } catch {
      console.log("Plugin not found");
      process.exit(1);
    }
  });
};

await dynamic();
