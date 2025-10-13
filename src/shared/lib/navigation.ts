// Navigation service for non-React contexts (like API interceptors)
let navigateFunction: ((path: string) => void) | null = null;

export const setNavigateFunction = (navigate: (path: string) => void) => {
  navigateFunction = navigate;
};

export const navigateTo = (path: string) => {
  if (navigateFunction) {
    navigateFunction(path);
  } else {
    // Fallback to window.location only if Next.js router is not available
    if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  }
};

export const clearNavigateFunction = () => {
  navigateFunction = null;
};
