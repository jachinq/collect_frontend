import { Collect, Result } from "@/const/def";
import { create } from "zustand";

const jsonData: Collect[] = [
  { id: 1, name: "Baidu", url: "https://www.baidu.com", description: "百度一下，你就知道", tags: ["搜索", "网页"], open: 1, create: "2022-01-01", update: "2022-01-01" },
  { id: 2, name: "Google", url: "https://www.google.com", description: "Google 搜索", tags: ["搜索", "网页"], open: 200, create: "2022-01-01", update: "2022-01-01" },
  { id: 3, name: "Bing", url: "https://www.bing.com", description: "必应搜索", tags: ["搜索", "网页"], open: 2, create: "2022-01-01", update: "2022-01-01" },
  { id: 4, name: "Yahoo", url: "https://www.yahoo.com", description: "雅虎搜索", tags: ["搜索", "网页", "常用"], open: 3, create: "2022-01-01", update: "2022-01-01" }
];

const LOCAL_STORAGE_KEY_LIST = "collect-list";
const collects = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_LIST) || JSON.stringify(jsonData));

const setLocalStorage = (item: PageState | any, set?: (arg: any) => void, callback?: (arg?: any) => void) => {
  localStorage.setItem(LOCAL_STORAGE_KEY_LIST, JSON.stringify(item.allList));
  set && set({ ...item });
  callback && callback();
};

interface PageState {
  initPage: (filterText?: string) => void;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  getPageSize: () => number;
  total: number;
  setTotal: (total: number) => void;
  getTotal: () => number;
  allList: any[];
  setAllList: (list: any[]) => void;

  filterList: any[];
  setFilterList: (list: any[]) => void;
  getFilterList: () => any[];

  // pageList: any[];
  // setPageList: (list: any[]) => void;
  getPageList: () => any[];
  setPageItem: (item: Collect, index?: number) => Result;
  delPageItem: (item: any) => Result;

  filterText: string;
  setFilterText: (text: string) => void;
  getFilterText: () => string;
  saveCollectLocal: (collectList?: Collect[]) => void;
}

const usePage = create<PageState>((set, get) => ({
  initPage: (filterText = "") => {
    const { pageSize, setPage, setPageSize, setTotal, setAllList, setFilterText } = get();
    const allList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_LIST) || JSON.stringify(jsonData));
    setAllList(allList);
    setPage(1);
    setPageSize(pageSize);
    setTotal(allList.length);
    setFilterText(filterText);
  },
  page: 1,
  setPage: (page) => set(() => ({ page })),
  pageSize: 20,
  setPageSize: (size) => set(() => ({ pageSize: size })),
  getPageSize: () => get().pageSize,
  total: 0,
  getTotal: () => get().total,
  setTotal: (total) => set(() => ({ total })),
  allList: collects,
  setAllList: (list) => set(() => ({ allList: list })),

  filterList: [],
  setFilterList: (list) => set(() => ({ filterList: list })),
  getFilterList: () => get().filterList,

  // pageList: [],
  // setPageList: (list) => set(() => ({ pageList: list })),
  getPageList: () => {
    const { page, pageSize } = get();
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return get().filterList.slice(start, end);
  },
  setPageItem: (item: Collect, index?: number): Result => {
    const { allList } = get();

    if (index) {
      if (!item) {
        return { success: false, message: "no collet" };
      }
      allList.splice(index, 0, item);
      setLocalStorage({ allList }, set);
      return { success: true, message: "add" };
    }

    index = allList.findIndex((i) => i.id === item.id);
    if (index === -1) {
      allList.unshift(item);
    } else {
      allList[index] = item;
    }
    if (index > -1) {
      set({ page: 1 }); // 重置页码到第一页
    }
    setLocalStorage({ allList }, set);
    return { success: true, message: index === -1 ? "add" : "update" };
  },
  delPageItem: (item): Result => {
    if (item === null || item === undefined) {
      return {
        success: false,
        message: "not collet item"
      };
    }
    const { allList } = get();
    const index = allList.findIndex((i) => i.id === item.id);
    if (index <= 0) {
      return {
        success: false,
        message: "not found"
      };
    }
    allList.splice(index, 1);
    setLocalStorage({ allList, total: allList.length }, set);
    return {
      success: true,
      message: "delete success",
      data: index
    };
  },

  filterText: "",
  setFilterText: (filterText) => {
    set(() => ({ filterText }));
    // const cost = new Date().getTime();
    if (get().filterText?.length > 0) {
      let filterText = get().filterText.toLowerCase();
      const filterFiled: any = {};
      // 标签过滤
      if (filterText.startsWith("tags: ")) {
        filterFiled["tags"] = filterText.slice(6).split(",");
      }
      // 名称过滤
      if (filterText.startsWith("name: ")) {
        filterFiled["name"] = filterText.slice(6);
      }
      // 链接过滤
      if (filterText.startsWith("url: ")) {
        filterFiled["url"] = filterText.slice(5);
      }
      // 描述过滤
      if (filterText.startsWith("desc: ")) {
        filterFiled["description"] = filterText.slice(6);
      }

      const searchAll = Object.keys(filterFiled).length === 0;
      const filterList = get().allList.filter((item: Collect) => {
        if (searchAll) {
          return item?.name?.toLowerCase().includes(filterText) ||
            item?.url?.toLowerCase().includes(filterText) ||
            item?.description?.toLowerCase().includes(filterText) ||
            item?.tags?.join(",").toLowerCase().includes(filterText);
        }

        if (filterFiled.tags) {
          const tags = item?.tags?.join(",").toLowerCase();
          return filterFiled?.tags?.every((tag: string) => tags.includes(tag));
        }
        if (filterFiled.name) {
          return item?.name?.toLowerCase().includes(filterFiled.name);
        }
        if (filterFiled.url) {
          return item?.url?.toLowerCase().includes(filterFiled.url);
        }
        if (filterFiled.description) {
          return item?.description?.toLowerCase().includes(filterFiled.description);
        }
        return true;
      });

      set({ filterList });
      get().setTotal(filterList.length); // 更新总数
      get().setPage(1); // 重置页码到第一页

    } else {
      set({ filterList: get().allList });
      get().setTotal(get().allList.length); // 更新总数
      get().setPage(1); // 重置页码到第一页
    }
    // console.log("filter time:", new Date().getTime() - cost);
  },
  getFilterText: () => get().filterText,
  saveCollectLocal: (collectList = get().allList) => {
    setLocalStorage({ allList: collectList }, set);
  }
}));
export default usePage;