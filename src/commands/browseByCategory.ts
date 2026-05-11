import * as vscode from 'vscode';

import { BadgeApiClient } from '@/api';
import { Badge } from '@/types';
import { BadgeQuickPickItem, insertMarkdown } from '@/commands/shared';

function getUniqueCategories(badges: Badge[]): string[] {
  const set = new Set<string>();
  for (const badge of badges) {
    for (const cat of badge.categories) {
      set.add(cat);
    }
  }
  return [...set].sort();
}

export async function browseByCategory(client: BadgeApiClient): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('Markdown Badges: open a file first.');
    return;
  }

  let allBadges: Badge[];

  try {
    allBadges = await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: 'Loading badges…', cancellable: false },
      () => client.getAllBadges()
    );
  } catch (err) {
    vscode.window.showErrorMessage(
      `Markdown Badges: ${err instanceof Error ? err.message : String(err)}`
    );
    return;
  }

  const categories = getUniqueCategories(allBadges);

  const selectedCategory = await vscode.window.showQuickPick(categories, {
    placeHolder: 'Select a category…',
  });

  if (!selectedCategory) {
    return;
  }

  const filtered = allBadges.filter((b) => b.categories.includes(selectedCategory));

  const quickPick = vscode.window.createQuickPick<BadgeQuickPickItem>();
  quickPick.placeholder = `Badges in "${selectedCategory}" — select one or more`;
  quickPick.canSelectMany = true;
  quickPick.matchOnDescription = true;
  quickPick.items = filtered.map((badge) => ({
    label: badge.name,
    description: badge.categories.filter((c) => c !== selectedCategory).join(', '),
    detail: badge.markdown,
    badge,
  }));

  quickPick.onDidAccept(() => {
    const selected = quickPick.selectedItems;
    if (selected.length > 0) {
      insertMarkdown(editor, selected);
    }
    quickPick.hide();
  });

  quickPick.onDidHide(() => quickPick.dispose());

  quickPick.show();
}
