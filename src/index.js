const fs = require("fs");
const path = require("path");
const { TextDocument } = require("vscode-languageserver");
const {
  VueInterpolationMode
} = require("vue-language-server/dist/modes/template/interpolationMode");
const {
  getJavascriptMode
} = require("vue-language-server/dist/modes/script/javascript");
const {
  getServiceHost
} = require("vue-language-server/dist/services/typescriptService/serviceHost");
const {
  getLanguageModelCache
} = require("vue-language-server/dist/embeddedSupport/languageModelCache");
const {
  getVueDocumentRegions
} = require("vue-language-server/dist/embeddedSupport/embeddedSupport");
const tsModule = require("typescript");
const { getLines, formatLine, formatCursor } = require("./print");

const workspace = "/home/yanzhen/workspace/fisheye";
//FIXME: hardcode src
const srcDir = path.resolve(workspace, "src");

function traverse(root) {
  const docs = [];

  function walk(dir) {
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

const docs = traverse(srcDir);

(async () => {
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
      scriptRegionDocuments,
      workspace
    );
    let done = 0;
    for (const doc of docs) {
      console.time("vue tpl");
      const vueTplResults = vueMode.doValidation(doc);
      console.timeEnd("vue tpl");
      console.time("script");
      const scriptResults = scriptMode.doValidation(doc);
      console.timeEnd("script");
      const results = vueTplResults.concat(scriptResults);
      done++;
      if (results.length) {
        hasError = true;
        for (const result of results) {
          const total = doc.lineCount;
          const lines = getLines({
            start: result.range.start.line,
            end: result.range.end.line,
            total
          });
          console.log(`Error in ${doc.uri}`);
          console.log(result.message);
          for (const line of lines) {
            const code = doc
              .getText({
                start: { line, character: 0 },
                end: { line, character: Infinity }
              })
              .replace(/\n$/, "");
            const isError = line === result.range.start.line;
            console.log(formatLine({ number: line, code, isError }));
            if (isError) {
              console.log(formatCursor(result.range));
            }
          }
        }
      }
      console.log(`${done}/${docs.length}`);
    }
  } catch (error) {
    hasError = true;
    console.error(error);
  } finally {
    documentRegions.dispose();
    scriptRegionDocuments.dispose();
    process.exit(hasError ? 1 : 0);
  }
})();
