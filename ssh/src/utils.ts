import { promisify } from 'util';
import { exec as execCallback } from 'child_process';

const exec = promisify(execCallback);

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