import { Collect, Result } from "@/const/def";
import usePage from "@/store/collect-list";
import useConfig, { Config, DEFAULT_CONFIG } from "@/store/config";
import useDataset, { Dataset, defaultDatasets } from "@/store/dataset";
import useSyncList, { SyncEventType, SyncTask } from "@/store/syncList";
import useWebDav from "@/store/webdavutils";

export function useSync() {
  const { syncData, readData } = useWebDav();
  const { allList, initPage, saveCollectLocal, setPageItem, delPageItem } = usePage();
  const { datasets, activeDataset, saveDatasetLocal, setDataset, removeDataset } = useDataset();
  const { list } = useSyncList();
  const { config, setConfig } = useConfig();

  const handleSyncToWebDav = async () => {
    // 实现同步功能
    let datasetsSave = datasets;
    if (datasets === undefined || activeDataset === undefined) {
      datasetsSave = defaultDatasets;
    }
    const data = {
      datasets: datasetsSave,
      collectList: allList,
      config,
    }
    const ok = await syncData(data);
    console.log("sync to webdav", ok, data);
    if (ok) {
      return true;
    }
    return false;
  }

  const handleSyncFromWebDav = async () => {
    // 实现从 WebDav 同步功能
    const data: {
      datasets: Dataset[],
      collectList: Collect[],
      config: Config,
    } = await readData();
    console.log("sync from webdav", data);
    if (data) {
      const { datasets = defaultDatasets, collectList = [], config = DEFAULT_CONFIG } = data;
      // console.log(datasets, collectList);
      saveCollectLocal(collectList);
      saveDatasetLocal(datasets);
      setConfig(config);

      initPage();
      // if (datasets && datasets.length > 0) {
      //   // activeDataset(datasets[0]);
      // }
      handleTaskList(); // 处理本地任务列表
      localStorage.setItem("syncTime", new Date().toString());
      return true;
    }
    return false;
  }

  const handleTaskList = () => {
    if (list.length === 0) { // 没有任务
      return;
    }
    list.forEach((task) => {
      handleTask(task);
    });
  }

  const handleTask = (task: SyncTask) => {
    let result: Result | null = null;
    switch (task.type) {
      case SyncEventType.ADD_COLLECT:
      case SyncEventType.SET_COLLECT:
      case SyncEventType.UNDO_DEL_COLLECT:
        result = setPageItem(task.item as Collect, task.undoIndex);
        break;
      case SyncEventType.DEL_COLLECT:
        result = delPageItem(task.item as Collect);
        break;
      case SyncEventType.ADD_DATASET:
      case SyncEventType.SET_DATASET:
      case SyncEventType.UNDO_DEL_DATASET:
        result = setDataset(task.item as Dataset, task.undoIndex);
        break;
      case SyncEventType.DEL_DATASET:
        result = removeDataset(task.item as Dataset);
        break;
      default:
        break;
    }
    if (result) {
      if (result.success) {
        console.log("run local task success", task, result);
        task.status = "done";
      } else {
        console.log("run local task failed", task, result);
        task.status = "error";
      }
    }
  }

  return {
    handleSyncToWebDav,
    handleSyncFromWebDav,
  }
}
