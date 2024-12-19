import { Collect } from "@/const/def";
import { create } from "zustand";

interface CollectListState {
    collectList: Collect[];
    setCollectList: (collectList: any[]) => void;
    getCollectList: () => any[];
    setCollect: (collect: Collect) => string;
}

const useCollectList = create<CollectListState>((set, get) => ({
    collectList: [],
    setCollectList: (collectList: any[]) => set({ collectList }),
    getCollectList: () => get().collectList,
    setCollect: (collect: Collect) => {
        const collectList = get().collectList;
        const index = collectList.findIndex((item) => item.id === collect.id);
        if (index === -1) {
            collectList.unshift(collect);
        } else {
            collectList[index] = collect;
        }
        set({ collectList });
        return index === -1? "add" : "update";
    },
}));
export default useCollectList;