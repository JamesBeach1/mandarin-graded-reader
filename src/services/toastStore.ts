export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
}

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export interface PromptDialogOptions {
  title: string;
  message: string;
  defaultValue?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
}

type Listener = () => void;

class ToastStoreManager {
  private toasts: ToastItem[] = [];
  private activeConfirm: {
    id: string;
    options: ConfirmDialogOptions;
    resolve: (val: boolean) => void;
  } | null = null;
  private activePrompt: {
    id: string;
    options: PromptDialogOptions;
    resolve: (val: string | null) => void;
  } | null = null;
  private listeners: Set<Listener> = new Set();

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(l => l());
  }

  public getToasts(): ToastItem[] {
    return this.toasts;
  }

  public getActiveConfirm() {
    return this.activeConfirm;
  }

  public getActivePrompt() {
    return this.activePrompt;
  }

  public addToast(type: ToastItem['type'], message: string, title?: string, duration = 3500): string {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const item: ToastItem = { id, type, message, title, duration };
    this.toasts.push(item);
    this.notify();

    if (duration > 0) {
      setTimeout(() => {
        this.dismissToast(id);
      }, duration);
    }

    return id;
  }

  public dismissToast(id: string): void {
    const prevLen = this.toasts.length;
    this.toasts = this.toasts.filter(t => t.id !== id);
    if (this.toasts.length !== prevLen) {
      this.notify();
    }
  }

  public success(message: string, title?: string, duration = 3500): string {
    return this.addToast('success', message, title, duration);
  }

  public error(message: string, title?: string, duration = 4500): string {
    return this.addToast('error', message, title, duration);
  }

  public info(message: string, title?: string, duration = 3500): string {
    return this.addToast('info', message, title, duration);
  }

  public warning(message: string, title?: string, duration = 4000): string {
    return this.addToast('warning', message, title, duration);
  }

  /**
   * Prompts the user with an app-native confirmation modal.
   * Returns a promise that resolves to true (confirmed) or false (cancelled).
   */
  public confirm(options: ConfirmDialogOptions): Promise<boolean> {
    return new Promise((resolve) => {
      // If a confirmation is already open, resolve previous as false
      if (this.activeConfirm) {
        this.activeConfirm.resolve(false);
      }

      this.activeConfirm = {
        id: `confirm-${Date.now()}`,
        options,
        resolve: (val: boolean) => {
          this.activeConfirm = null;
          this.notify();
          resolve(val);
        }
      };
      this.notify();
    });
  }

  public resolveConfirm(val: boolean): void {
    if (this.activeConfirm) {
      this.activeConfirm.resolve(val);
    }
  }

  /**
   * Prompts the user with an app-native text input modal.
   * Returns a promise that resolves to string value or null if cancelled.
   */
  public prompt(options: PromptDialogOptions): Promise<string | null> {
    return new Promise((resolve) => {
      if (this.activePrompt) {
        this.activePrompt.resolve(null);
      }

      this.activePrompt = {
        id: `prompt-${Date.now()}`,
        options,
        resolve: (val: string | null) => {
          this.activePrompt = null;
          this.notify();
          resolve(val);
        }
      };
      this.notify();
    });
  }

  public resolvePrompt(val: string | null): void {
    if (this.activePrompt) {
      this.activePrompt.resolve(val);
    }
  }
}

export const ToastStore = new ToastStoreManager();
