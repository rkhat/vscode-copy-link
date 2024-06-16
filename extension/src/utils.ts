import { Uri } from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';

const exec = promisify(execCallback);

export function checkUriContained(inner: Uri, outer: Uri): boolean {
  return inner.scheme === outer.scheme && inner.authority === outer.authority && inner.path.startsWith(outer.path);
}

export async function fileExists (filename: string): Promise<boolean> {
  try {
    await fs.access(filename, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function fileWritable (filename: string): Promise<boolean> {
  try {
    await fs.access(filename, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

export async function fileIsDirectory (filename: string): Promise<boolean> {
  if (await fileExists(filename)) {
    return false;
  }
  const lstat = await fs.lstat(filename);
  return lstat.isDirectory();
}

export async function targetLinkName (filename: string): Promise<string> {
  const MAX_LINKS = 20;
  if (await fileExists(filename)) {
    const dirName = path.dirname(filename);
    const extName = path.extname(filename);
    const baseName = path.basename(filename, extName);
    filename = path.join(dirName, `${baseName} link${extName}`);
    let i = 2;
    while((await fileExists(filename)) && i < MAX_LINKS) {
      filename = path.join(dirName, `${baseName} link ${i}${extName}`);
      i++;
    }
    if (i >= MAX_LINKS) {
      throw new Error("Error: Too many links in the same directory.");
    }
  }
  return filename;
}

export async function relativeLink(src: string, dest: string): Promise<void> {
  dest = await targetLinkName(dest);
  const target = path.relative(path.dirname(dest), src);
  await fs.symlink(target, dest);
}

export async function readClipboard (): Promise<string[]> {
  if (process.platform === "linux") {
    try {
      const { stdout } = await exec("xclip -o -selection clipboard -t code/file-list");
      const fileList = stdout.split('\n').filter(line => line.trim() !== '');
      return fileList;
    } catch (error: any) {
      if (error.code === 127) {
        throw new Error("Error: Missing xclip command. Please install xclip on your system.");
      }
      return [];
    }
  } else {
    // Unreachable code because of the platform check in activate function.
    throw new Error("Error: Unsupported platform.");
  }
}