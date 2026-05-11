import * as vscode from 'vscode';

import { BadgeApiClient } from '@/api';
import { Badge } from '@/types';
import { BadgeQuickPickItem, insertMarkdown } from '@/commands/shared';

function toBadgeItems(badges: Badge[]): BadgeQuickPickItem[] {
  return badges.map((badge) => ({
    label: badge.name,
    description: badge.categories.join(', '),
    detail: badge.markdown,
    badge,
  }));
}

function filterBadges(badges: Badge[], query: string): Badge[] {
  if (!query) {
    return badges;
  }
  const lower = query.toLowerCase();
  return badges.filter(
    (b) =>
      b.name.toLowerCase().includes(lower) ||
      b.categories.some((c) => c.toLowerCase().includes(lower))
  );
}

export async function insertBadge(client: BadgeApiClient): Promise<void> {
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

  const quickPick = vscode.window.createQuickPick<BadgeQuickPickItem>();
  quickPick.placeholder = 'Search badges by name or category…';
  quickPick.matchOnDescription = true;
  quickPick.matchOnDetail = false;
  quickPick.canSelectMany = true;
  quickPick.items = toBadgeItems(allBadges);

  const selectedIds = new Set<string>();
  let suppressSelectionEvent = false;

  const updateTitle = () => {
    quickPick.title = selectedIds.size > 0
      ? `${selectedIds.size} badge${selectedIds.size === 1 ? '' : 's'} selected`
      : undefined;
  };

  quickPick.onDidChangeSelection((selected) => {
    if (suppressSelectionEvent) {
      return;
    }
    // Sync selection state: for currently visible items, replace with what the user has checked.
    // This is needed because VS Code resets selectedItems when quickPick.items is reassigned.
    const visibleIds = new Set(quickPick.items.map((i) => i.badge.id));
    for (const id of [...selectedIds]) {
      if (visibleIds.has(id)) {
        selectedIds.delete(id);
      }
    }
    for (const item of selected) {
      selectedIds.add(item.badge.id);
    }
    updateTitle();
  });

  let filterDebounce: ReturnType<typeof setTimeout> | undefined;

  quickPick.onDidChangeValue((query) => {
    clearTimeout(filterDebounce);
    filterDebounce = setTimeout(() => {
      const newItems = toBadgeItems(filterBadges(allBadges, query));
      suppressSelectionEvent = true;
      quickPick.items = newItems;
      quickPick.selectedItems = newItems.filter((i) => selectedIds.has(i.badge.id));
      suppressSelectionEvent = false;
      updateTitle();
    }, 150);
  });

  quickPick.onDidAccept(() => {
    if (selectedIds.size > 0) {
      const allItems = toBadgeItems(allBadges.filter((b) => selectedIds.has(b.id)));
      insertMarkdown(editor, allItems);
    }
    quickPick.hide();
  });

  quickPick.onDidHide(() => {
    clearTimeout(filterDebounce);
    quickPick.dispose();
  });

  quickPick.show();
}
