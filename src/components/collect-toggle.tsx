import { Button, ButtonProps } from "./ui/button";
import { BookmarkPlusIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input"
import React, { useEffect, useState } from "react";
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
import usePage from "@/store/collect-list";
import { Collect, DEFAULT_COLLECT } from "@/const/def";
import useSyncList, { SyncEventType } from "@/store/syncList";

interface Config {
  title: string
  btn: React.ReactNode
}

export const CollectToggle = ({ edit = false, isDel = false, collect, className, variant = 'link' }:
  React.HTMLAttributes<HTMLDivElement> &
  {
    variant?: ButtonProps["variant"],
    edit?: boolean,
    isDel?: boolean,
    collect?: Collect
  }) => {

  const { delPageItem, setPageItem } = usePage();
  const { addSyncTask } = useSyncList();

  if (isDel) {
    const onDel = (collect: Collect) => {
      const result = delPageItem(collect);
      if (result.success) {
        addSyncTask({type: SyncEventType.DEL_COLLECT, item: collect});
        toast.success("删除成功", {
          duration: 10000,
          action: {
            label: "Undo",
            onClick: () => {
              console.log('Undo delete collect', 'index=', result.data, 'delete item=', collect);
              setPageItem(collect, result.data);
              addSyncTask({type: SyncEventType.UNDO_DEL_COLLECT, item: collect, undoIndex: result.data});
            }
          }
        });
      } else {
        toast.error("删除失败", {
          description: <pre className="whitespace-pre-wrap">
            {JSON.stringify(collect, null, 2)}
          </pre>
        });
      }
    }
    return <Popover>
      <PopoverTrigger asChild>
        <Button variant={variant} className={cn(className)}>删除</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p>确定删除吗？</p>
        <div className='flex justify-end'>
          <PopoverClose asChild>
            <div>
              <Button variant="secondary" className='mr-2'>取消</Button>
              <Button variant="destructive" onClick={() => onDel(collect as any)}>确定</Button>
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
    let title = "Add Collect"
    let btn = <Button variant="ghost"><BookmarkPlusIcon className="h-[1.2rem] w-[1.2rem]" /><span className="sr-only">{config.title}</span></Button>;
    if ((collect && collect.id && collect.id > 0) || edit) {
      title = "Edit Collect";
      btn = <Button variant='link' className='p-1'>编辑</Button>;
    }
    setConfig({ title, btn, })
  }, [collect, edit])

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={true} >
      <DialogTrigger asChild>
        {config.btn}
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
          <ProfileForm className="px-6 pb-6" collect={collect} setOpen={setOpen} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}


const formSchema = z.object({
  name: z.string().nonempty({ message: "请输入名称" })
    .max(150, { message: "名称不能超过150个字符" }),
  url: z.string().url({ message: "请输入正确的网址" }),
  description: z.union([
    z.string().max(1000, { message: "描述不能超过1000个字符" }),
    z.undefined(),
    z.literal("").optional()]),
  tags: z.union([
    z.string().max(150, { message: "标签不能超过150个字符" }),
    z.undefined(),
    z.literal("").optional()]),
  // cover: z.union([
  //   z.literal("").optional(),
  //   z.undefined(),
  //   z.string()
  // ]),
  favicon: z.union([
    z.literal("").optional(),
    z.undefined(),
    z.string()
  ]),
})

// 表单
export const ProfileForm = ({ className, collect, setOpen }: React.ComponentProps<"form"> & { collect?: Collect, setOpen: (open: boolean) => void }) => {
  const { getPageList, setPageItem } = usePage();
  const { addSyncTask } = useSyncList();

  // Define form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      ...DEFAULT_COLLECT,
      ...collect,
      tags: collect?.tags.join("\n")
    },
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const saveData: Collect = {
      ...DEFAULT_COLLECT,
      ...collect,
      ...data,
      tags: data?.tags?.split("\n") || []
    };
    let syncType = SyncEventType.SET_COLLECT;
    if (saveData.id === -1) {
      // 找到最大id + 1
      const maxId = Math.max(...getPageList().map(c => c.id))
      saveData.id = maxId + 1;
      syncType = SyncEventType.ADD_COLLECT;
    }
    console.log(saveData);
    toast.success("Collect saved:", {
      description: <pre className="whitespace-pre-wrap">
        {JSON.stringify(saveData, null, 2)}
      </pre>
    })

    setPageItem(saveData)
    addSyncTask({type: syncType, item: saveData});
    setOpen(false)
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
            </FormItem>)}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Url</FormLabel>
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
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>标签</FormLabel>
              <FormDescription>
                多个标签请换行分隔
              </FormDescription>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <FormField
          control={form.control}
          name="cover"
          render={({ field }: any) => (
            <FormItem>
              <FormLabel>封面</FormLabel>
              <FormDescription>
                可以是图片链接或base64编码
              </FormDescription>
              <FormControl>
                <Textarea {...field} className="break-all" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}
        <FormField
          control={form.control}
          name="favicon"
          render={({ field }: any) => (
            <FormItem>
              <FormLabel>图标</FormLabel>
              <FormDescription>
                可以是图片链接或base64编码
                <br />
                留空则默认使用网址的favicon
              </FormDescription>
              <FormControl>
                <Textarea {...field} className="break-all" />
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


