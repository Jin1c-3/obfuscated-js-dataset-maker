import fs from "fs/promises";
import path from "path";
import { globby } from "globby";

interface Stats {
  fileCount: number;
  totalLines: number;
  totalChars: number;
}

async function calculateStats(dir: string): Promise<Stats> {
  const jsFiles = await globby(["**/*.js", "!**/node_modules/**"], {
    cwd: dir,
  });

  let totalLines = 0;
  let totalChars = 0;

  await Promise.all(
    jsFiles.map(async (file) => {
      const content = await fs.readFile(path.join(dir, file), "utf-8");
      totalLines += content.split("\n").length;
      totalChars += content.length;
    })
  );

  return {
    fileCount: jsFiles.length,
    totalLines,
    totalChars,
  };
}

interface StatsTableRow extends Stats {
  name: string;
}

export async function printDatasetStats(
  finalDir: string, 
  choices: string[],
  originDir?: string,
  tempDir?: string
) {
  console.log("\n=== Dataset Statistics ===");
  
  const statsRows: StatsTableRow[] = [];

  // 统计原始源码
  if (originDir) {
    try {
      const stats = await calculateStats(originDir);
      statsRows.push({ name: "Original Source", ...stats });
    } catch {
      statsRows.push({ 
        name: "Original Source",
        fileCount: 0,
        totalLines: 0,
        totalChars: 0
      });
    }
  }

  // 统计预处理数据
  if (tempDir) {
    try {
      const stats = await calculateStats(tempDir);
      statsRows.push({ name: "Preprocessed", ...stats });
    } catch {
      statsRows.push({ 
        name: "Preprocessed",
        fileCount: 0,
        totalLines: 0,
        totalChars: 0
      });
    }
  }

  // 统计混淆后的数据
  for (const choice of choices) {
    try {
      const stats = await calculateStats(path.join(finalDir, choice));
      statsRows.push({ 
        name: choice.toUpperCase(), 
        ...stats 
      });
    } catch {
      statsRows.push({ 
        name: choice.toUpperCase(),
        fileCount: 0,
        totalLines: 0,
        totalChars: 0
      });
    }
  }

  console.table(statsRows);
  console.log("=== End of Statistics ===\n");
}
