export const mockApiResponse = <T,>(data: T, status = 200) => ({
  data,
  status,
});

export const createMockFetch = (response: unknown, status = 200) => {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(response),
  };
};

export const waitForLoadingToFinish = async () => {
  return new Promise((resolve) => setTimeout(resolve, 100));
};

export const mockIntersectionObserver = () => {
  class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | null = null;
    readonly rootMargin: string = '';
    readonly thresholds: ReadonlyArray<number> = [];
    private callback: IntersectionObserverCallback;
    private options: IntersectionObserverInit;

    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      this.callback = callback;
      this.options = options || {};
    }

    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
};
