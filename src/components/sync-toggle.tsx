import { FolderSyncIcon, LoaderIcon } from "lucide-react"
import { Button } from "./ui/button"
import useSyncList from "@/store/syncList"
import { Confirm } from "./confirm";
import { useSync } from "@/hooks/use-sync";
import { toast } from "sonner";
import useWebDav from "@/store/webdavutils";
import { useEffect } from "react";
import useConfig from "@/store/config";

export const SyncToggle = () => {
  const { list, clearSyncList } = useSyncList();
  const { handleSyncToWebDav } = useSync();
  const { client } = useWebDav();
  const { config } = useConfig();

  useEffect(() => {
    if (config.autoSync && client !== null && list.length > 0) {
      console.log("auto sync start...");
      const taskId = setInterval(() => {
        startSync(false).then((ok) => {
          if (ok) {
            clearInterval(taskId);
            console.log("auto sync end...");
          }
        });
      }, config.autoSyncInterval);
    }
  }, [client, list, config]);

  if (!list || list.length === 0 || client === null) return null;

  const startSync = async (needToast: boolean = true): Promise<boolean> => {
    const result = await handleSyncToWebDav();
    if (!result) { // 同步数据到服务器，清空本地任务列表
      return false;
    }
    clearSyncList();

    const errorTasks = list.filter(task => task.status === "error");
    let allCount = list.length;
    let errorCount = errorTasks.length;
    errorTasks.forEach(task => {
      needToast && toast.error("执行失败的任务", {
        description: <div>
          <p>{task.type}</p>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(task.item, null, 2)}
          </pre>
        </div>
      });
    });

    if (needToast) {
      if (errorCount === 0) {
        toast.success("同步成功", {
          description: `共执行 ${allCount} 个本地任务`
        });
      } else {
        toast.error("同步失败", {
          description: `共执行 ${allCount} 个本地任务，其中失败 ${errorCount} 个`
        });
      }
    } else {
      console.log(`共执行 ${allCount} 个本地任务，其中失败 ${errorCount} 个`);
      if (errorCount > 0) {
        console.log("失败的任务：", errorTasks);
      }
    }
    return true;
  }

  return <Confirm title="警告"
    message="此操作将会将本地的数据同步至 WebDav 服务器，确定执行吗？"
    onConfirm={() => startSync(true)}
    trigger={(
      <Button variant="ghost" className="fixed top-0 right-0">
        { config.autoSync && <LoaderIcon className="animate-spin" />}
        { !config.autoSync && <FolderSyncIcon />}
      </Button>
    )} />

  // return <>
  // <Button variant="ghost" className="fixed top-0 right-0" 
  //   onClick={() => startSync((task: SyncTask) => {
  //   console.log(task.type, task.item.name, task.undoIndex);
  // })}>
  //   <FolderSyncIcon />
  // </Button>
  // </>
}