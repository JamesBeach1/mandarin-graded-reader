import { feature, scenario, given, when, then, and, expect } from './bddRunner';
import { ToastStore } from '../../src/services/toastStore';

export async function runToastStoreAcceptanceTests() {
  await feature('FT-TOAST', 'In-App Toast Notification & Dialog Promises', async () => {
    await scenario('Queue and dismiss toast notifications with subscriber events', async () => {
      let notifiedCount = 0;
      let toastId = '';

      await given('a subscriber listening to ToastStore updates', () => {
        ToastStore.subscribe(() => {
          notifiedCount++;
        });
      });

      await when('ToastStore.success is triggered', () => {
        toastId = ToastStore.success('Story saved to library');
      });

      await then('the toast appears in active toasts with type success', () => {
        const toasts = ToastStore.getToasts();
        const found = toasts.find(t => t.id === toastId);
        expect(found).toBeDefined();
        expect(found?.type).toBe('success');
        expect(found?.message).toBe('Story saved to library');
        expect(notifiedCount).toBeGreaterThan(0);
      });

      await when('ToastStore.dismissToast is called', () => {
        ToastStore.dismissToast(toastId);
      });

      await then('the toast is removed from active list', () => {
        const toasts = ToastStore.getToasts();
        expect(toasts.some(t => t.id === toastId)).toBeFalsy();
      });
    });

    await scenario('Resolve promise-based app confirmation modals', async () => {
      let promiseResult: boolean | null = null;

      await given('an asynchronous confirmation dialog requested via ToastStore.confirm', () => {
        const confirmPromise = ToastStore.confirm({
          title: 'Delete Story',
          message: 'Are you sure you want to remove this story?'
        });

        confirmPromise.then(res => {
          promiseResult = res;
        });
      });

      await then('activeConfirm dialog state is populated', () => {
        const active = ToastStore.getActiveConfirm();
        expect(active).toBeDefined();
        expect(active?.options.title).toBe('Delete Story');
      });

      await when('user confirms the dialog via ToastStore.resolveConfirm(true)', async () => {
        ToastStore.resolveConfirm(true);
        // Wait microtask
        await new Promise(r => setTimeout(r, 10));
      });

      await then('the promise resolves to true and clears activeConfirm state', () => {
        expect(promiseResult).toBe(true);
        expect(ToastStore.getActiveConfirm()).toBeNull();
      });
    });

    await scenario('Resolve promise-based text input prompts', async () => {
      let promptResult: string | null = 'unresolved';

      await given('a prompt request for new island name', () => {
        ToastStore.prompt({
          title: 'Create Island',
          message: 'Enter title for this language island:'
        }).then(res => {
          promptResult = res;
        });
      });

      await when('user submits text via ToastStore.resolvePrompt', async () => {
        ToastStore.resolvePrompt('Tech & Coding');
        await new Promise(r => setTimeout(r, 10));
      });

      await then('the prompt promise resolves to the entered string', () => {
        expect(promptResult).toBe('Tech & Coding');
        expect(ToastStore.getActivePrompt()).toBeNull();
      });
    });
  });
}
