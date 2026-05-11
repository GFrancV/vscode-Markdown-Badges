import * as vscode from 'vscode';
import { Badge } from '@/types';

export interface BadgeQuickPickItem extends vscode.QuickPickItem {
  badge: Badge;
}

export function insertMarkdown(editor: vscode.TextEditor, items: readonly BadgeQuickPickItem[]): void {
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor || activeEditor.document.uri.toString() !== editor.document.uri.toString()) {
    vscode.window.showWarningMessage('Markdown Badges: the original editor is no longer active.');
    return;
  }

  const markdown = items.map((i) => i.badge.markdown).join('\n');
  activeEditor.edit((eb) => eb.insert(activeEditor.selection.active, markdown)).then(
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
