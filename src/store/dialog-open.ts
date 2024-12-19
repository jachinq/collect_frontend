import { Collect } from "@/const/def";
import { create } from "zustand";

interface DialogOpen {
    open: boolean;
    setOpen: (open: boolean) => void;
    getOpen: () => boolean;
    formCollect: Collect | null;
    setFormCollect: (collect: Collect) => void;
}

const useDialogOpen = create<DialogOpen>((set, get) => ({
    open: false,
    setOpen: (open) => set(() => ({ open })),
    getOpen: () => get().open,
    formCollect: null,
    setFormCollect: (collect: Collect) => set(() => {
        return { formCollect: collect };
    })
}));
export default useDialogOpen;