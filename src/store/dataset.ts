import { Result } from "@/const/def";
import { create } from "zustand";

export const defaultDatasets: Dataset[] = [
  {
    id: 1,
    name: "全部",
    description: "所有数据集",
    filterText: "",
  },
  {
    id: 2,
    name: "常用",
    description: "测试",
    filterText: "tags: 常用",
  }];

const LOCAL_STORAGE_KEY_ACTIVE = "dataset";
const LOCAL_STORAGE_KEY_LIST = "datasets";
const dataset = localStorage.getItem(LOCAL_STORAGE_KEY_ACTIVE) || "1";
const localList = localStorage.getItem(LOCAL_STORAGE_KEY_LIST) || JSON.stringify(defaultDatasets);
const initialDatasets = JSON.parse(localList);


export interface Dataset {
  id: number,
  name: string,
  description: string,
  filterText: string,
};

export const DEFAULT_DATASET = {
  id: -1,
  name: "",
  description: "",
  filterText: "",
};

const setLocalStorage = (item: DatasetState | any, set: (arg: any) => void) => {
  localStorage.setItem(LOCAL_STORAGE_KEY_LIST, JSON.stringify(item.datasets));
  set && set({ ...item });
};

interface DatasetState {
  dataset: Dataset,
  datasets: Dataset[],
  setDataset: (dataset: Dataset, index?: number) => Result,
  removeDataset: (dataset?: Dataset) => Result,
  activeDataset: (dataset: Dataset) => void,
  saveDatasetLocal: (datasets: Dataset[]) => void,
}

const datasetIndex = initialDatasets.findIndex((d: Dataset) => d?.id?.toString() === dataset);
const initialDataset: Dataset = initialDatasets[datasetIndex] || initialDatasets[0];

const useDataset = create<DatasetState>((set, get) => ({
  dataset: initialDataset,
  datasets: initialDatasets,
  setDataset: (dataset: Dataset, index?: number): Result => {
    if (index) {
      if (!dataset) {
        return { success: false, message: "no dataset" };
      }
      // 把dataset插入到index位置
      const datasets = get().datasets;
      datasets.splice(index, 0, dataset);
      setLocalStorage(get(), set);
      return { success: true, message: "add" };
    }

    const datasets = get().datasets;
    index = datasets.findIndex((item) => item.id === dataset.id);
    if (index === -1) {
      datasets.push(dataset);
    } else {
      datasets[index] = dataset;
    }
    setLocalStorage(get(), set);
    return { success: true, message: index === -1 ? "add" : "update" };
  },
  removeDataset: (dataset?: Dataset): Result => {
    if (!dataset) {
      return {
        success: false,
        message: "no dataset",
      };
    }
    const index = get().datasets.findIndex(d => d.id === dataset?.id);
    if (index <= 1) {
      return {
        success: false,
        message: "not found",
      };
    }
    const datasets = get().datasets;
    datasets.splice(index, 1);
    setLocalStorage(get(), set);
    return {
      success: true,
      message: "success",
      data: index,
    };
  },
  activeDataset: (dataset: Dataset) => {
    localStorage.setItem(LOCAL_STORAGE_KEY_ACTIVE, dataset.id.toString());
    set(() => ({ dataset }));
  },
  saveDatasetLocal: (datasets: Dataset[]) => {
    setLocalStorage({ datasets }, set);
  },
}));
export default useDataset;