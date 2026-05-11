import * as vscode from 'vscode';
import { Badge, ApiResponse } from '@/types';

export class BadgeApiClient {
  // Cache the Promise so concurrent callers share the same in-flight request.
  private fetchPromise: Promise<Badge[]> | null = null;

  private get baseUrl(): string {
    return vscode.workspace
      .getConfiguration('markdownBadges')
      .get<string>('apiUrl', 'https://markdown-badges.vercel.app/api');
  }

  getAllBadges(): Promise<Badge[]> {
    if (!this.fetchPromise) {
      this.fetchPromise = this.fetchAllBadges().catch((err: unknown) => {
        this.fetchPromise = null; // allow retry after failure
        throw err;
      });
    }
    return this.fetchPromise;
  }

  clearCache(): void {
    this.fetchPromise = null;
  }

  private async fetchAllBadges(): Promise<Badge[]> {
    const url = `${this.baseUrl}/badges?limit=all`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error ${response.status}: ${response.statusText}`);
    }

    const json = (await response.json()) as ApiResponse;

    if (!Array.isArray(json.data)) {
      throw new Error('Unexpected API response — "data" is not an array.');
    }

    return json.data;
  }
}
