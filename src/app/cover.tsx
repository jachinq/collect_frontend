import cover from "@/assets/cover.webp";
import { useEffect, useRef, useState } from "react";

import { Collect } from "@/const/def";
import usePage from "@/store/page";
import { Skeleton } from "@/components/ui/skeleton";
import useSyncList from "@/store/syncList";

export const Cover = ({ item }: any) => {

  const { setPageItem } = usePage();
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const { addSyncTask } = useSyncList();

  useEffect(() => {
    setLoaded(false); // 重置状态
    const img = document.createElement("img"); // 预加载图片
    img.src = item.cover || cover;
    img.onload = function () {
      // console.log("图片加载成功");
      setLoaded(true);
      if (imgRef?.current) {
        // console.log("移除骨架屏");
        imgRef.current.src = img.src
      }
    };
    img.onerror = function () {
      setLoaded(true);
      console.log("图片加载失败", item.name);
      img.src = cover;
    };

  }, [item]);

  const handleOpenUrl = (item: Collect) => {
    item.open = (item.open || 0) + 1;
    const success = setPageItem(item) === "update";
    if (success) {
      window.open(item.url, "_blank");
      addSyncTask(item);
    }
    
  }

  return (
    <div className="rounded-lg overflow-hidden relative box-border hover:scale-105 cursor-pointer transition-transform duration-200 ease-in-out" style={{ borderRadius: "4px" }}
    >
      {!loaded && <Skeleton className="w-full h-[124px]" />}
      {loaded && <img ref={imgRef}
        src={item.cover || cover}
        width="100%" height="100%" alt="cover"
        className="block object-cover"
        onClick={() => handleOpenUrl(item)} />}
    </div>
  )
}