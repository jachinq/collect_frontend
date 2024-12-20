import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collect } from "@/const/def";
import React from "react";

// import { useEffect, useRef, useState } from "react";
import usePage from "@/store/collect-list";
// import { Skeleton } from "@/components/ui/skeleton";
import useSyncList, { SyncEventType } from "@/store/syncList";
import { removeUrlPath } from '@/lib/utils';

export const RichAvatar = ({ item }: React.HtmlHTMLAttributes<HTMLDivElement> & { item: Collect }) => {
  const { setPageItem } = usePage();
  // const imgRef = useRef<HTMLImageElement>(null);
  // const [loaded, setLoaded] = useState(false);
  const { addSyncTask } = useSyncList();

  // useEffect(() => {
  //   setLoaded(false); // 重置状态
  //   const img = document.createElement("img"); // 预加载图片
  //   img.src = item.cover || cover;
  //   img.onload = function () {
  //     // console.log("图片加载成功");
  //     setLoaded(true);
  //     if (imgRef?.current) {
  //       // console.log("移除骨架屏");
  //       imgRef.current.src = img.src
  //     }
  //   };
  //   img.onerror = function () {
  //     setLoaded(true);
  //     console.log("图片加载失败", item.name);
  //     img.src = cover;
  //   };

  // }, [item]);

  const handleOpenUrl = (item: Collect) => {
    item.open = (item.open || 0) + 1;
    const result = setPageItem(item);
    if (result.success && result.message === "update") {
      window.open(item.url, "_blank");
      addSyncTask({type: SyncEventType.SET_COLLECT, item});
    }
    
  }


  return <Avatar className="cursor-pointer hover:scale-105 transition-transform duration-200 ease-in-out" onClick={() => handleOpenUrl(item)}>
    <AvatarImage src={item.favicon || `${removeUrlPath(item.url)}/favicon.ico`} />
    <AvatarFallback>{item.name.slice(0, 1)}</AvatarFallback>
  </Avatar>
}