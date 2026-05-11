import * as vscode from 'vscode';
import { BadgeApiClient } from '@/api';
import { insertBadge } from '@/commands/insertBadge';
import { browseByCategory } from '@/commands/browseByCategory';

export function activate(ctx: vscode.ExtensionContext): void {
  const client = new BadgeApiClient();

  ctx.subscriptions.push(
    vscode.commands.registerCommand('markdownBadges.insertBadge', () => insertBadge(client)),
    vscode.commands.registerCommand('markdownBadges.browseByCategory', () => browseByCategory(client)),
    vscode.commands.registerCommand('markdownBadges.clearCache', () => {
      client.clearCache();
      vscode.window.showInformationMessage('Markdown Badges: cache cleared.');
    })
  );
}

export function deactivate(): void {}
