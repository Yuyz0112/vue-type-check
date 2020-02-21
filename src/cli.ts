#!/usr/bin/env node
import * as path from "path";
import minimist from "minimist";
import { check } from "./index";

const { workspace, srcDir, onlyTemplate, _ } = minimist(process.argv.slice(2));
const cwd = process.cwd();

check({
  workspace: path.resolve(cwd, workspace || '.'),
  srcDir: srcDir && path.resolve(cwd, srcDir),
  onlyTemplate,
  files: _
});
