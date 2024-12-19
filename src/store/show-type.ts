import { create } from "zustand";

interface ShowTypeState {
    showType: string;
    setShowType: (showType: string) => void;
    getShowType: () => string;
}

type ShowType = "card" | "table";

const showTypeStr = localStorage.getItem("showType");
// 判断是否为有效的类型
if (showTypeStr === null || (showTypeStr !== "card" && showTypeStr !== "table")) {
    localStorage.setItem("showType", "card");
}
const showType: ShowType = localStorage.getItem("showType") as ShowType;


const useShowType = create<ShowTypeState>((set, get) => ({
    showType: showType || "Card",
    setShowType: (showType: string) => set(() => {
        localStorage.setItem("showType", showType)
        return { showType };
    }),
    getShowType: () => get().showType
}));
export default useShowType;