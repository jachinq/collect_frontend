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

interface DatasetState {
  dataset: Dataset,
  datasets: Dataset[],
  setDataset: (dataset: Dataset) => string,
  removeDataset: (dataset?: Dataset) => void,
  activeDataset: (dataset: Dataset) => void,
  saveDatasetLocal: (datasets: Dataset[]) => void,
}

const datasetIndex = initialDatasets.findIndex((d: Dataset) => d?.id?.toString() === dataset);
const initialDataset: Dataset = initialDatasets[datasetIndex] || initialDatasets[0];

const useDataset = create<DatasetState>((set, get) => ({
  dataset: initialDataset,
  datasets: initialDatasets,
  setDataset: (dataset: Dataset) => {
    const datasets = get().datasets;
    const index = datasets.findIndex((item) => item.id === dataset.id);
    if (index === -1) {
      datasets.push(dataset);
    } else {
      datasets[index] = dataset;
    }
    set({ datasets });
    localStorage.setItem(LOCAL_STORAGE_KEY_LIST, JSON.stringify(datasets));
    return index === -1 ? "add" : "update";
  },
  removeDataset: (dataset?: Dataset) => {
    const datasets = get().datasets.filter((d) => d.id !== dataset?.id);
    set(() => ({ datasets }));
    localStorage.setItem(LOCAL_STORAGE_KEY_LIST, JSON.stringify(datasets));
  },
  activeDataset: (dataset: Dataset) => {
    localStorage.setItem(LOCAL_STORAGE_KEY_ACTIVE, dataset.id.toString());
    set(() => ({ dataset }));
  },
  saveDatasetLocal: (datasets: Dataset[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY_LIST, JSON.stringify(datasets));
  },
}));
export default useDataset;