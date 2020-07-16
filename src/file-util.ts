import * as fs from "fs"
import * as glob from 'glob'

export function readFile (filePath: string): Promise<string> {
  return exec(fs.readFile, filePath, 'utf8')
}

export function writeFile (filePath: string, data: string): Promise<void> {
  return exec(fs.writeFile, filePath, data)
}

export function globSync(patterns: string | string[]): string[] {
  if (typeof patterns === "string") {
    patterns = [patterns];
  }

  return patterns.reduce((acc, pattern) => {
    return acc.concat(glob.sync(pattern));
  }, [] as string[]);
}

export function extractTargetFileExtension(fileName: string) {
  const result = /^.*\.(.*)$/.exec(fileName);
  if (result) {
    return result[1];
  }
}

function exec(fn: Function, ...args: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    fn.apply(
      undefined,
      args.concat((err: any, res: any) => {
        if (err) reject(err);
        resolve(res);
      })
    );
  });
}
