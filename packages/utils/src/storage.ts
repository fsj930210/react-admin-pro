interface RapStorageOptions {
  prefix?: string;
  storageName?: 'localStorage' | 'sessionStorage';
  expiredKeyName?: string;
}
interface RapStorageValue<T> {
  value: T;
  [key: string]: T | Date;
}
const defaultOptions: RapStorageOptions = {
  prefix: '',
  storageName: 'localStorage',
  expiredKeyName: '__rap_storage_expired_key__',
};

class RapStorage {
  options: RapStorageOptions = defaultOptions;
  storage: Storage;
  constructor(options?: RapStorageOptions) {
		this.options = { ...defaultOptions, ...options };
    this.storage =
      this.options.storageName === 'localStorage'
        ? window.localStorage
        : window.sessionStorage;
  }
  config(options: RapStorageOptions) {
    this.options = { ...defaultOptions, ...options };
  }
  setItem<T>(key: string, value: T, expires: number = -1) {
    try {
      const { expiredKeyName, prefix } = this.options;
      const keyName = prefix + key;
      const val: RapStorageValue<T> = {
        value,
      };
      if (expires > 0) {
        val[expiredKeyName as string] = new Date(Date.now() + expires * 864e5);
      }
      this.storage.setItem(keyName, JSON.stringify(val));
    } catch (error: any) {
      console.error(error);
    }
  }
  getItem<T>(key: string): T | null {
    try {
      const { expiredKeyName, prefix } = this.options;
      const keyName = prefix + key;
      const stringVal = this.storage.getItem(keyName);
      if (!stringVal) return null;
      const val = JSON.parse(stringVal);
      const expiredDate = val[expiredKeyName as string];
      if (!expiredDate) {
        return val.value;
      } else {
        const now = Date.now();
        const expiredTime = expiredDate.getTime();
        if (expiredTime - now <= 0) {
          console.error('该缓存已过期');
          this.removeItem(key);
          return null;
        } else {
          return val.value;
        }
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  removeItem(key: string) {
    this.storage.removeItem(key);
  }
  clear() {
    this.storage.clear();
  }
}

export default new RapStorage();