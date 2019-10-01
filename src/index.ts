import * as fs from "fs";
import * as path from "path";
import { TextDocument, Diagnostic } from "vscode-languageserver";
import { VueInterpolationMode } from "vue-language-server/dist/modes/template/interpolationMode";
import { getJavascriptMode } from "vue-language-server/dist/modes/script/javascript";
import { getServiceHost } from "vue-language-server/dist/services/typescriptService/serviceHost";
import { getLanguageModelCache } from "vue-language-server/dist/embeddedSupport/languageModelCache";
import { getVueDocumentRegions } from "vue-language-server/dist/embeddedSupport/embeddedSupport";
import tsModule from "typescript";
import ProgressBar from "progress";
import {
  getLines,
  formatLine,
  formatCursor,
  printError,
  printMessage,
  printLog
} from "./print";

interface Options {
  workspace: string;
  srcDir?: string;
  onlyTemplate?: boolean;
}

interface Source {
  docs: TextDocument[];
  workspace: string;
  onlyTemplate: boolean;
}

export async function check(options: Options) {
  const { workspace, onlyTemplate = false } = options;
  const srcDir = options.srcDir || options.workspace;
  const docs = traverse(srcDir);
  await getDiagnostics({ docs, workspace, onlyTemplate });
}

function traverse(root: string) {
  const docs: TextDocument[] = [];

  function walk(dir: string) {
    fs.readdirSync(dir).forEach(p => {
      const joinedP = path.join(dir, p);
      const stats = fs.statSync(joinedP);
      if (stats.isDirectory()) {
        walk(joinedP);
      } else if (path.extname(p) === ".vue") {
        docs.push(
          TextDocument.create(
            `file://${joinedP}`,
            "vue",
            0,
            fs.readFileSync(joinedP, "utf8")
          )
        );
      }
    });
  }

  walk(root);
  return docs;
}

async function getDiagnostics({ docs, workspace, onlyTemplate }: Source) {
  const documentRegions = getLanguageModelCache(10, 60, document =>
    getVueDocumentRegions(document)
  );
  const scriptRegionDocuments = getLanguageModelCache(10, 60, document => {
    const vueDocument = documentRegions.refreshAndGet(document);
    return vueDocument.getSingleTypeDocument("script");
  });
  let hasError = false;
  try {
    const serviceHost = getServiceHost(
      tsModule,
      workspace,
      scriptRegionDocuments
    );
    const vueMode = new VueInterpolationMode(tsModule, serviceHost);
    const scriptMode = await getJavascriptMode(
      serviceHost,
      scriptRegionDocuments as any,
      workspace
    );
    const bar = new ProgressBar("checking [:bar] :current/:total", {
      total: docs.length,
      width: 20,
      clear: true
    });
    for (const doc of docs) {
      const vueTplResults = vueMode.doValidation(doc);
      let scriptResults: Diagnostic[] = [];
      if (!onlyTemplate && scriptMode.doValidation) {
        scriptResults = scriptMode.doValidation(doc);
      }
      const results = vueTplResults.concat(scriptResults);
      if (results.length) {
        hasError = true;
        for (const result of results) {
          const total = doc.lineCount;
          const lines = getLines({
            start: result.range.start.line,
            end: result.range.end.line,
            total
          });
          printError(`Error in ${doc.uri}`);
          printMessage(
            `${result.range.start.line}:${result.range.start.character} ${result.message}`
          );
          for (const line of lines) {
            const code = doc
              .getText({
                start: { line, character: 0 },
                end: { line, character: Infinity }
              })
              .replace(/\n$/, "");
            const isError = line === result.range.start.line;
            printLog(formatLine({ number: line, code, isError }));
            if (isError) {
              printLog(formatCursor(result.range));
            }
          }
        }
      }
      bar.tick();
    }
  } catch (error) {
    hasError = true;
    console.error(error);
  } finally {
    documentRegions.dispose();
    scriptRegionDocuments.dispose();
    process.exit(hasError ? 1 : 0);
  }
}
