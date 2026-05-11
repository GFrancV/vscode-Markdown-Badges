import { Badge, ApiResponse } from '@/types';

const API_URL = 'https://markdown-badges.vercel.app/api';
const FETCH_TIMEOUT_MS = 15_000;

function isBadge(obj: unknown): obj is Badge {
  if (typeof obj !== 'object' || obj === null) return false;
  const b = obj as Record<string, unknown>;
  return (
    typeof b.id === 'string' &&
    typeof b.name === 'string' &&
    typeof b.url === 'string' &&
    typeof b.markdown === 'string' &&
    Array.isArray(b.categories) &&
    (b.categories as unknown[]).every((c) => typeof c === 'string')
  );
}

export class BadgeApiClient {
  // Cache the Promise so concurrent callers share the same in-flight request.
  private fetchPromise: Promise<Badge[]> | null = null;

  getAllBadges(): Promise<Badge[]> {
    if (!this.fetchPromise) {
      this.fetchPromise = this.fetchAllBadges().catch((err: unknown) => {
        this.fetchPromise = null;
        throw err;
      });
    }
    return this.fetchPromise;
  }

  clearCache(): void {
    this.fetchPromise = null;
  }

  private async fetchAllBadges(): Promise<Badge[]> {
    const response = await fetch(`${API_URL}/badges?limit=all`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`API error ${response.status}: ${response.statusText}`);
    }

    const json = (await response.json()) as ApiResponse;

    if (!Array.isArray(json.data)) {
      throw new Error('Unexpected API response — "data" is not an array.');
    }

    const valid = json.data.filter(isBadge);
    if (valid.length !== json.data.length) {
      console.warn(
        `Markdown Badges: discarded ${json.data.length - valid.length} malformed badge(s) from API response.`
      );
    }

    return valid;
  }
}
