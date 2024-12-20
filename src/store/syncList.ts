import { Collect } from "@/const/def";
import { create } from "zustand";
import { Dataset } from "./dataset";

const LOCAL_STORAGE_KEY_LIST = "sync_list";
const LOCAL_STORAGE_KEY_TIME = "local_opt_time";

interface SyncListState {
  optTime: string; // 本地有操作的时间
  list: SyncTask[];
  addSyncTask: (task: SyncTask) => void;
  startSync: (task: Function) => void;
  clearSyncList: () => void;
}

export enum SyncEventType {
  SET_COLLECT = "set_collect", // 编辑收藏
  ADD_COLLECT = "add_collect", // 添加收藏
  DEL_COLLECT = "del_collect", // 删除收藏
  UNDO_DEL_COLLECT = "undo_del_collect", // 撤销删除收藏
  SET_DATASET = "set_dataset", // 编辑数据集
  ADD_DATASET = "add_dataset", // 添加数据集
  DEL_DATASET = "del_dataset", // 删除数据集
  UNDO_DEL_DATASET = "undo_del_dataset", // 撤销删除数据集
}
export interface SyncTask {
  type: SyncEventType;
  item: Collect | Dataset;
  undoIndex?: number; // 撤销索引
  status?: "error" | "done"; // 状态
}

// get from local storage
const localList = localStorage.getItem(LOCAL_STORAGE_KEY_LIST) || "[]";
const list = JSON.parse(localList) as SyncTask[];

const useSyncList = create<SyncListState>((set, get) => ({
  optTime: localStorage.getItem(LOCAL_STORAGE_KEY_TIME) || "",
  list: list,
  addSyncTask: (task: SyncTask) => {
    try {
      const list = get().list;
      let hit = false;
      list.forEach((item) => {
        if (item.type === task.type && item.item.id === task.item.id) {
          item.item = task.item; // 多次同类型的任务，只保留最后一次
          hit = true;
          return;
        }
      })
      // 撤销删除的任务，把删除任务找出来移除掉
      if (task.type === SyncEventType.UNDO_DEL_COLLECT 
          || task.type === SyncEventType.UNDO_DEL_DATASET) {
        const index = list.findIndex((item) => item.item.id === task.item.id && (
          task.type === SyncEventType.UNDO_DEL_COLLECT && item.type === SyncEventType.DEL_COLLECT
          || task.type === SyncEventType.UNDO_DEL_DATASET && item.type === SyncEventType.DEL_DATASET
        ));
        if (index >= 0) {
          list.splice(index, 1);
          hit = true;
        }
      }
      if (!hit) {
        list.push({ status: "done", ...task, });
      }
      const optTime = new Date().toLocaleString();
      set({ list: [...list], optTime });
      localStorage.setItem(LOCAL_STORAGE_KEY_LIST, JSON.stringify(list));
      localStorage.setItem(LOCAL_STORAGE_KEY_TIME, optTime);
    } catch (error) {
      console.log("addSyncTask error", error);
    }

  },
  startSync: (_task: Function) => {
    // TODO
    // get().list.forEach((item) => {
    //   task(item);
    // });

    // 监听 list 任务列表，取出来逐个执行，定时不断执行
    // setInterval(() => {
    // const list = get().list;
    // if (list.length === 0) {
    //   return;
    // }
    // // 取出第一个任务
    // const taskItem = list.shift();
    // if (taskItem) {
    //   task();
    // }
    // // 重新设置 list
    // set({ list });
    // }, 6 * 1000);
  },
  clearSyncList: () => {
    set({ list: [] });
    localStorage.setItem(LOCAL_STORAGE_KEY_LIST, "[]");
  },
}));
export default useSyncList;