import * as vscode from 'vscode';
import { readClipboard } from './utils';

export const getHost = (): String => {
  return process.platform;
};

export const getWorkspace = (): string => {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if ( !workspaceFolders || workspaceFolders.length === 0 ) {
    throw new Error("Error: No workspace exists from Host.");
  }
  const uri = workspaceFolders[0].uri.toString();
  return uri;
};

export const getClipboard = async (): Promise<string[]> =>  {
  const clipboard = await readClipboard();
  return clipboard;
};