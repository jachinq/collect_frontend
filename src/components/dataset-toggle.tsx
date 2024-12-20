import { Button } from "./ui/button";
import { DeleteIcon, EditIcon, PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { useMediaQuery } from "@uidotdev/usehooks";
import { Popover, PopoverContent, PopoverClose, PopoverTrigger, } from "@/components/ui/popover"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { toast } from "sonner";
import { DialogDescription } from "@radix-ui/react-dialog";
import useDataset, { Dataset, DEFAULT_DATASET } from "@/store/dataset";
import useSyncList, { SyncEventType } from "@/store/syncList";

interface Config {
  title: string
  icon: React.ReactNode
}

export const DatasetToggle = ({ edit = false, isDel = false, dataset }: React.HTMLAttributes<HTMLDivElement> & { edit?: boolean, dataset?: Dataset, isDel?: boolean }) => {
  const { removeDataset, setDataset } = useDataset();
  const { addSyncTask } = useSyncList();

  if (isDel) {

    const onDel = (item: Dataset) => {
      const result = removeDataset(item);
      console.log("del dataset", result);
      if (result.success) {
        addSyncTask({type: SyncEventType.DEL_DATASET, item});
        toast.success("删除成功", {
          duration: 10000,
          action: {
            label: "Undo",
            onClick: () => {
              console.log('Undo delete dataset', 'index=', result.data, 'delete item=', item);
              setDataset(item, result.data);
              addSyncTask({type: SyncEventType.UNDO_DEL_DATASET, item, undoIndex: result.data});
            }
          },
        });
      } else {
        toast.error("删除失败");
      }
    }

    return <Popover>
      <PopoverTrigger asChild>
        <Button variant="link" className="text-destructive p-1">
          <DeleteIcon className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 " />
          <span className="sr-only">删除</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <p>确定删除吗？</p>
        <div className='flex justify-end'>
          <PopoverClose asChild>
            <div>
              <Button variant="secondary" size="sm" className='mr-2'>取消</Button>
              <Button variant="destructive" size="sm" onClick={() => { onDel(dataset as any) }}>确定</Button>
            </div>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  }

  const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");
  const [open, setOpen] = useState(false);

  const [config, setConfig] = useState({} as Config);

  useEffect(() => {
    let title = "Add Dataset"
    let icon =
      <Button variant="ghost" className="w-full">
        <div className="cursor-pointer flex items-center justify-start gap-2">
          <PlusCircle className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 " />
          <span>新增数据集</span>
        </div>
      </Button>

    if (edit) {
      title = "Edit Dataset"
      icon = <Button variant="link" className="p-1">
        <EditIcon className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
        <span className="sr-only">编辑</span>
      </Button>

    }
    setConfig({ title, icon, })
  }, [edit])

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={true} >
      <DialogTrigger asChild>
        {config.icon}
      </DialogTrigger>
      <DialogDescription className="hidden"></DialogDescription>
      <DialogContent className="sm:max-w-[425px] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{config.title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className={isSmallDevice ? "max-h-[calc(100vh-65px)]" : "max-h-[calc(100vh-160px)]"} style={{
          overscrollBehavior: "contain", // 防止页面滚动
          scrollbarGutter: "stable", // 防止滚动条抖动
        }}>
          <ProfileForm className="px-6 pb-6" dataset={dataset} setOpen={setOpen} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

const formSchema = z.object({
  // id: z.string().nonempty({ message: "请输入id" }),
  name: z.string().nonempty({ message: "请输入名称" })
    .max(150, { message: "名称不能超过150个字符" }),
  description: z.union([
    z.string().max(1000, { message: "描述不能超过1000个字符" }),
    z.undefined(),
    z.literal("").optional()]),
  filterText: z.union([
    z.string().max(1000, { message: "条件不能超过1000个字符" }),
    z.literal("").optional()]),
})

// 表单
export const ProfileForm = ({ className, dataset, setOpen }:
  React.ComponentProps<"form"> &
  {
    dataset?: Dataset,
    setOpen: (open: boolean) => void
  }) => {
  const { setDataset, datasets } = useDataset();
  const { addSyncTask } = useSyncList();

  // Define form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      ...DEFAULT_DATASET,
      ...dataset,
    },
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const saveData: Dataset = { ...DEFAULT_DATASET, ...dataset, ...data };
    let syncType = SyncEventType.SET_DATASET;
    if (saveData?.id === null || saveData?.id === undefined
      || (saveData?.id && saveData?.id <= 0)) {
      // 找到最大id + 1
      const maxId = Math.max(...datasets.map(c => c.id)) || datasets.length;
      saveData.id = maxId + 1;
      syncType = SyncEventType.ADD_DATASET;
    }

    toast.success("Dataset saved", {
      description: <pre className="whitespace-pre-wrap">
        {JSON.stringify(saveData, null, 2)}
      </pre>
    })

    setDataset(saveData);
    addSyncTask({type: syncType, item: saveData});
    setOpen(false);
  };

  return (
    <Form {...form}>
      <form className={cn("grid items-start gap-4", className)} onSubmit={
        form.handleSubmit(onSubmit)
      }>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>名称</FormLabel>
              <FormDescription>
              </FormDescription>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>描述</FormLabel>
              <FormDescription>
              </FormDescription>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="filterText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>条件</FormLabel>
              <FormDescription>
                搜索名称/url/描述/标签
                <br />
                专项搜索语法：（注意空格）
                <br />
                - 搜索名称：name: xxx
                <br />
                - 搜索url：url: xxx
                <br />
                - 搜索描述：description: xxx
                <br />
                - 搜索标签：tags: xxx
              </FormDescription>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />



        <Button type="submit">Submit</Button>
      </form>

    </Form>
  )
}


