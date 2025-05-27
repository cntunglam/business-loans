interface StoragePayload<T> {
  value: T;
  expiry: number;
}

export const saveToLocalStorage = <T>(key: string, value: T, expiry: number) => {
  const payload: StoragePayload<T> = {
    value,
    expiry: Date.now() + expiry,
  };

  localStorage.setItem(key, JSON.stringify(payload));
};

export const getFromLocalStorage = <T>(key: string): T | undefined => {
  const payload = localStorage.getItem(key);

  if (!payload) {
    return undefined;
  }

  const parsedPayload: StoragePayload<T> = JSON.parse(payload);

  if (parsedPayload.expiry < Date.now()) {
    localStorage.removeItem(key);
    return undefined;
  }

  return parsedPayload.value;
};
