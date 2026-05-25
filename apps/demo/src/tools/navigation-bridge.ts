import type { NavigateFunction } from 'react-router';

export let navigateRef: NavigateFunction | null = null;

export function publishNavigate(n: NavigateFunction | null): void {
  navigateRef = n;
}
