import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { checkUriContained, relativeLink, readClipboard, fileWritable } from './utils';
import { COMPANION_GET_WORKSPACE_ID, COMPANION_GET_CLIPBOARD_ID} from './companion';

function getLocalWorkspace(): vscode.Uri {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if ( !workspaceFolders || workspaceFolders.length === 0 ) {
    throw new Error("Error: No workspace exists.");
  }
  return workspaceFolders[0].uri;
}

async function getHostWorkspace(): Promise<vscode.Uri> {
  if (vscode.env.remoteName === undefined) {
    return getLocalWorkspace();
  }
  const uriStr: string = await vscode.commands.executeCommand(COMPANION_GET_WORKSPACE_ID);
  const uri = vscode.Uri.parse(uriStr, true);
  return uri;
}

async function getClipboardSources(): Promise<string[]> {
  if (vscode.env.remoteName === undefined) {
    return await readClipboard();
  }
  const files: string[] = await vscode.commands.executeCommand(COMPANION_GET_CLIPBOARD_ID);
  return files;
}

async function getDestDir(uri: vscode.Uri): Promise<string> {
  const workspace = getLocalWorkspace();
  if ( !(await fileWritable(uri.fsPath)) ){
    throw new Error("Error: Target directory is not accessible. Error: EACCES: permission denied.");
  }
  if (!checkUriContained(uri, workspace)) {
    throw new Error("Error: Target directory is not in workspace.");
  }
  return uri.fsPath;
}

async function getSrcs(): Promise<string[]> {
  const workspace = await getHostWorkspace();
  const files = await getClipboardSources();
  if (files.length === 0) {
    throw new Error("Error: Invalid clipboard content. Expected vscode file list.");
  }
  const uris = files.map(file => vscode.Uri.parse(file, true));
  const valid = uris.every( uri => checkUriContained(uri, workspace));
  if (!valid) {
    throw new Error("Error: Copied files are not in the same workspace as target directory.");
  }
  const filenames = uris.map(uri => uri.fsPath);
  return filenames;
}

export const pasteRelLink  = async (destDirUri: vscode.Uri) => {
  try {
    if (!destDirUri) {
      throw new Error("Unfortunately, this command can only works from the context menu. Vscode does not support keybinding.");
    }
    const destDir = await getDestDir(destDirUri);
    const srcs = await getSrcs();
    for (const src of srcs) {
      const dest = path.join(destDir, path.basename(src));
      await relativeLink(src, dest);
    }
  } catch (e: any) {
    vscode.window.showErrorMessage(e.message);
  }
};
