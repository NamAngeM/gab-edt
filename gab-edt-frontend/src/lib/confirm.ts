type ConfirmRequest = { message: string; defaultValue?: string; destructive?: boolean };
type ConfirmHandler = (request: ConfirmRequest) => Promise<string | null>;

let handler: ConfirmHandler | null = null;

export function setConfirmHandler(next: ConfirmHandler | null) {
  handler = next;
}

export async function confirmAction(message: string, options: { destructive?: boolean } = {}): Promise<boolean> {
  if (!handler) return window.confirm(message);
  return (await handler({ message, destructive: options.destructive ?? true })) !== null;
}

export async function promptAction(message: string, defaultValue = ""): Promise<string | null> {
  if (!handler) return window.prompt(message, defaultValue);
  return handler({ message, defaultValue });
}
