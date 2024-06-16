import * as vscode from 'vscode';
import { getHost, getWorkspace, getClipboard } from './service';


const GET_HOST_ID = 'copyLinkCompanion.getHost';
const GET_WORKSPACE_ID = 'copyLinkCompanion.getWorkspace';
const GET_CLIPBOARD_ID = 'copyLinkCompanion.getClipboard';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(GET_HOST_ID, getHost),
    vscode.commands.registerCommand(GET_WORKSPACE_ID, getWorkspace),
    vscode.commands.registerCommand(GET_CLIPBOARD_ID, getClipboard),
  );
}
