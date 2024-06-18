import * as vscode from 'vscode';
import { pasteRelLink } from './service';

const PASTE_REL_LINK_ID = 'copyLink.pasteRelLink';

export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(PASTE_REL_LINK_ID, pasteRelLink),
  );
}
