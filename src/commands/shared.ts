import * as vscode from 'vscode';
import { Badge } from '@/types';

export interface BadgeQuickPickItem extends vscode.QuickPickItem {
  badge: Badge;
}

export function insertMarkdown(editor: vscode.TextEditor, items: readonly BadgeQuickPickItem[]): void {
  const markdown = items.map((i) => i.badge.markdown).join('\n');
  editor.edit((eb) => eb.insert(editor.selection.active, markdown)).then(
    (ok) => {
      if (!ok) {
        vscode.window.showErrorMessage('Markdown Badges: could not insert — the document may be read-only.');
      }
    },
    (err: unknown) => {
      vscode.window.showErrorMessage(
        `Markdown Badges: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  );
}
