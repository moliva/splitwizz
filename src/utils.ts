
export function copyToClipboard(value: string): void {
  navigator.clipboard.writeText(value)
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
