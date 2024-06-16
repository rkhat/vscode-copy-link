import * as vscode from 'vscode';
import { pasteRelLink } from './service';
import { COMPANION_EXTENSION_ID, COMPANION_GET_HOST_ID} from './companion';


const PASTE_REL_LINK_ID = 'copyLink.pasteRelLink';

async function getHost(): Promise<string> {
  if (vscode.env.remoteName === undefined) {
    return process.platform;
  }
  try {
    const host: string = await vscode.commands.executeCommand(COMPANION_GET_HOST_ID);
    return host;
  } catch {
    throw new Error("Companion extension not found. Please install 'Copy Link Companion'.");
  }
}

export async function activate(context: vscode.ExtensionContext) {
  const host = await getHost();
  if (host !== "linux") {
    throw new Error('Unsupported platform. Only Linux is supported.');
  }
  context.subscriptions.push(
    vscode.commands.registerCommand(PASTE_REL_LINK_ID, pasteRelLink),
  );
}
