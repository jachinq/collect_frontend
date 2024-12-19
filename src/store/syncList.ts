import { create } from "zustand";

interface SyncListState {
  addTime: number;
  list: any[];
  addSyncTask: (item: any) => void;
  startSync: (task: Function) => void;
}


const useSyncList = create<SyncListState>((set, get) => ({
  addTime: 0,
  list: [],
  addSyncTask: (item: any) => {
    try {
      const oldTime = get().addTime;
      const now = new Date().getTime();
      if (now - oldTime > 3000) {
        set({ addTime: now, list: [...get().list, item] });
        // console.log("addSyncTask", item);
      }
    } catch (error) {
      console.log("addSyncTask error", error);
    }
  
  },
  startSync: (task: Function) => {
    // 监听 list 任务列表，取出来逐个执行，定时不断执行
    setInterval(() => {
      const list = get().list;
      if (list.length === 0) {
        return;
      }
      // 取出第一个任务
      const taskItem = list.shift();
      if (taskItem) {
        task();
      }
      // 重新设置 list
      set({ list });
    }, 6 * 1000);
  }
}));
export default useSyncList;