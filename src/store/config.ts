import { create } from "zustand";

export interface Config {
  autoSync: boolean;
  autoSyncInterval: number;
}
export const DEFAULT_CONFIG: Config = {
  autoSync: true,
  autoSyncInterval: 300,
};

interface ConfigState {
  config: Config;
  setConfig: (config: Config) => void;
}

const configStore = JSON.parse(localStorage.getItem("config") || "{}");
const config = { ...DEFAULT_CONFIG, ...configStore };

const setLocalStorageConfig = (config: any) => {
  localStorage.setItem("config", JSON.stringify(config));
}

const useConfig = create<ConfigState>((set) => ({
  config: config,
  setConfig: (config: any) => {
    set({ config });
    setLocalStorageConfig(config);
  }
}));

export default useConfig;