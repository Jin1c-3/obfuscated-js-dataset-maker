import path from "path";
import {
  PathConfig,
  ObfuscatorChoice,
  OriginSource,
  JsObfuscatorConfig,
} from "./config/index.js";
import fs from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";
import js_beautify_pkg from "js-beautify";
const { js_beautify } = js_beautify_pkg;
import { globby } from "globby";
// import { encode as JSFuck } from "./model/jsfuck.js";
import JavaScriptObfuscator from "javascript-obfuscator";

async function makeDataset(origin: string, temp: string) {
  await fs.rm(temp, { recursive: true, force: true });
  await fs.mkdir(temp, { recursive: true });

  const execAsync = promisify(exec);
  for (const repo of OriginSource) {
    const repoPath = path.join(origin, repo.name);
    try {
      await fs.access(repoPath);
    } catch {
      await execAsync(`git clone ${repo.url} ${repoPath}`);
    }
  }

  await fs.cp(origin, temp, {
    recursive: true,
    filter: (src) => !src.includes(".git"),
  });

  const jsFiles = await globby(["**/*.js", "!**/node_modules/**"], {
    cwd: temp,
  });

  await Promise.all(
    jsFiles.map(async (file) => {
      const filePath = path.join(temp, file);
      let content = await fs.readFile(filePath, "utf-8");

      content = content.replace(/\/\*[\s\S]*?\*\//g, "");
      content = content.replace(/\/\/.*/g, "");

      content = js_beautify(content, {
        indent_size: 2,
        space_in_empty_paren: true,
        preserve_newlines: false,
      });

      await fs.writeFile(filePath, content, "utf-8");
    })
  );

  console.log("\nFile preprocessing completed!");
}

async function obfuscate(temp: string, final: string, choices: string[]) {
  await fs.rm(final, { recursive: true, force: true });
  await fs.mkdir(final, { recursive: true });

  for (const choice of choices) {
    const choicePath = path.join(final, choice);
    await fs.mkdir(choicePath, { recursive: true });

    // 复制文件到对应目录
    await fs.cp(temp, choicePath, {
      recursive: true,
    });

    const jsFiles = await globby(["**/*.js", "!**/node_modules/**"], {
      cwd: choicePath,
    });

    await Promise.all(
      jsFiles.map(async (file) => {
        const filePath = path.join(choicePath, file);
        const content = await fs.readFile(filePath, "utf-8");

        let obfuscatedCode: string;

        const config = getObfuscatorConfig(choice);
        // 将 config 转换为普通对象
        obfuscatedCode = JavaScriptObfuscator.obfuscate(content, {
          ...config,
        }).getObfuscatedCode();

        await fs.writeFile(filePath, obfuscatedCode, "utf-8");
      })
    );
    console.log(
      `${
        choice.charAt(0).toUpperCase() + choice.slice(1)
      } obfuscation completed!`
    );
  }
}

function getObfuscatorConfig(choice: string) {
  switch (choice.toLowerCase()) {
    case "data":
      return JsObfuscatorConfig.dataObfuscation();
    case "logic":
      return JsObfuscatorConfig.logicObfuscation();
    case "random":
      return JsObfuscatorConfig.randomObfuscation();
    case "encode":
      return JsObfuscatorConfig.encodeObfuscation();
    case "trick":
      return JsObfuscatorConfig.trickObfuscation();
    case "preset-low":
      return JsObfuscatorConfig.presetLowObfuscation();
    case "preset-medium":
      return JsObfuscatorConfig.presetMediumObfuscation();
    case "preset-high":
      return JsObfuscatorConfig.presetHighObfuscation();
    default:
      throw new Error(`Invalid obfuscator choice: ${choice}`);
  }
}

async function main() {
  await makeDataset(PathConfig.origin, PathConfig.temp);
  await obfuscate(PathConfig.temp, PathConfig.final, ObfuscatorChoice);
}

main();
