import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import {
  createGeneratedBooklet,
  trainingBookletSpecs,
  validateConceptContentCodes
} from "./krok-generation-core.mjs";

const root = process.cwd();
const contentMapPath = path.join(root, "src/content/krok/content-map.ts");
const outputPath = path.join(root, "src/content/krok/training.ts");

function parseExportedArray(filePath, exportName, typeName) {
  const source = fs.readFileSync(filePath, "utf8");
  const prefix = `export const ${exportName} = `;
  const suffix = ` satisfies ${typeName}[];`;
  const start = source.indexOf(prefix);
  const end = source.lastIndexOf(suffix);
  if (start < 0 || end < 0 || end <= start) {
    throw new Error(`Unable to locate ${exportName} in ${filePath}`);
  }
  return JSON.parse(source.slice(start + prefix.length, end));
}

const contentTopics = parseExportedArray(contentMapPath, "krokContentTopics", "KrokContentTopic");
validateConceptContentCodes(new Set(contentTopics.map((topic) => topic.code)));

const trainingBooklets = trainingBookletSpecs.map((booklet, bookletIndex) =>
  createGeneratedBooklet({ booklet, bookletIndex })
);

const output = `import type { KrokTrainingBooklet } from "./schema";

// Curated training data generated from the KROK 3 Neurology content structure.
// Official imported booklets remain in generated.ts and are not mixed with this bank.
export const krokTrainingBooklets = ${JSON.stringify(trainingBooklets, null, 2)} satisfies KrokTrainingBooklet[];
`;

fs.writeFileSync(outputPath, output);
console.log(`Generated ${trainingBooklets.length} KROK training booklets -> ${outputPath}`);
