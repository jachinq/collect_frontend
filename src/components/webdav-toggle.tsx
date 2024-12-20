import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { Settings } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { ScrollArea } from "./ui/scroll-area"
import { useMediaQuery } from "@uidotdev/usehooks"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { toast } from "sonner";
import { cn } from "@/lib/utils"
import useWebDav from "@/store/webdavutils"
import { Textarea } from "./ui/textarea"
import { Input } from "./ui/input"
import { Confirm } from "./confirm"
import { useSync } from "@/hooks/use-sync"
import { Switch } from "./ui/switch"
import useConfig from "@/store/config"

export const WebDavToggle = () => {
  const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");

  const { initialized, setInitialized, client, buildClient, clientOptions, checkCanSync } = useWebDav();
  const [open, setOpen] = useState(false)
  const { handleSyncToWebDav, handleSyncFromWebDav } = useSync();
  const { config, setConfig } = useConfig();

  useEffect(() => {
    if (client == null) {
      buildClient(clientOptions);
    }
  }, []);

  useEffect(() => {
    // 如果有配置webdav服务器
    if (client && !initialized) {

      checkCanSync();

      // 每次启动时，自动从服务器同步一次数据，放到微队列中，避免阻塞主进程
      // 如果是第一次启动，或者距离上次同步时间超过1min，则同步一次数据
      const syncTimeString = localStorage.getItem("syncTime");
      const syncTime: number = syncTimeString ? parseInt(syncTimeString, 10) : 0;
      const now = new Date().getTime();
      if (now - syncTime > 1000 * 60) {
        console.log("has webdav client, start sync");
        handleSyncFromWebDav().then(ok => {
          if (ok) {
            toast.success("成功拉取最新数据");
          } else {
            toast.error("拉取最新数据失败");
          }
        }).catch(e => {
          toast.error("拉取最新数据失败", e.message);
        });
      }
      setInitialized(true);
    }
  }, [client]);

  const handleSync = async (syncFunc: () => Promise<boolean>) => {
    const ok = await syncFunc();
    if (ok) {
      toast.success("同步成功");
    } else {
      toast.error("同步失败");
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen} modal={true} >
        <DialogTrigger asChild>
          <Button variant="ghost">
            <div className="cursor-pointer flex items-center justify-start gap-2">
              <Settings className="" />
              <span className="sr-only">设置</span>
            </div>
          </Button>
        </DialogTrigger>
        <DialogDescription className="hidden"></DialogDescription>
        <DialogContent className="sm:max-w-[425px] p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>设置</DialogTitle>
          </DialogHeader>
          <ScrollArea className={isSmallDevice ? "max-h-[calc(100vh-65px)]" : "max-h-[calc(100vh-160px)]"} style={{
            overscrollBehavior: "contain", // 防止页面滚动
            scrollbarGutter: "stable", // 防止滚动条抖动
          }}>
            {
              client && (
                <>
                  <h2 className="pl-6 text-lg font-bold mb-4">数据同步</h2>
                  <div className="px-6 mb-4 flex gap-2">
                    <Confirm title="警告" message="此操作将会将本地的数据同步至 WebDav 服务器，确定执行吗？" onConfirm={() => handleSync(handleSyncToWebDav)} trigger={(<Button variant="ghost">同步至 WebDav</Button>)} />
                    <Confirm title="警告" message="此操作将会从 WebDav 服务器同步数据覆盖本地数据，确定执行吗？" onConfirm={() => handleSync(handleSyncFromWebDav)} trigger={(<Button variant="ghost">从 WebDav 同步</Button>)} />
                  </div>
                  <div className="px-6 mb-4 grid grid-cols-1 gap-2" >
                    <div>自动同步</div>
                    <div className="text-[0.8rem] text-muted-foreground">
                      是否开启自动同步，开启后会自动将本地的修改同步到 webdav 服务器，关闭后则需要手动点击右上角按钮进行同步（当数据有变化时）
                    </div>
                    <Switch defaultChecked={config.autoSync} onCheckedChange={(value) => setConfig({...config, autoSync: value })} ></Switch>
                  </div>
                  { config.autoSync && <div className="px-6 mb-4 grid grid-cols-1 gap-2" >
                    <div>自动同步间隔</div>
                    <div className="text-[0.8rem] text-muted-foreground">
                      自动同步的间隔时间，单位为豪秒
                    </div>
                    <Input defaultValue={config.autoSyncInterval} onChange={(e) => setConfig({...config, autoSyncInterval: parseInt(e.target.value)})} />
                  </div>}
                </>
              )
            }
            <h2 className="pl-6 text-lg font-bold mb-4">WebDav 连接设置</h2>
            <ProfileForm className="px-6 pb-6" setOpen={setOpen} />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>

  )
}

const formSchema = z.object({
  url: z.string().nonempty({ message: "请输入url" }),
  user: z.string().nonempty({ message: "请输入用户名" }),
  pwd: z.string().nonempty({ message: "请输入密码" }),
})

// 表单
const ProfileForm = ({ className, setOpen }:
  React.ComponentProps<"form"> &
  {
    setOpen: (open: boolean) => void
  }) => {
  const { testConnection, buildClient, clientOptions, setClientOptions } = useWebDav();

  // Define form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      ...clientOptions
    },
  })

  const onSubmit = (data: any) => {
    console.log(data);
    const saveData = { ...data };

    toast.success("Config saved", {
      description: <pre className="whitespace-pre-wrap">
        {JSON.stringify(saveData, null, 2)}
      </pre>
    })

    setClientOptions(saveData);
    setOpen(false);
  };

  return (
    <Form {...form}>
      <form className={cn("grid items-start gap-4", className)} onSubmit={
        form.handleSubmit(onSubmit)
      }>
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>URL</FormLabel>
              <FormDescription>
                如果不填写域名，则默认使用当前域名
                <br />
                例1，填写 /dav, 最终 URL 为 https://example.com/dav
                <br />
                例2，填写 https://example.com/dav, 最终 URL 为 https://example.com/dav
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
          name="user"
          render={({ field }) => (
            <FormItem>
              <FormLabel>用户</FormLabel>
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
          name="pwd"
          render={({ field }) => (
            <FormItem>
              <FormLabel>密码</FormLabel>
              <FormDescription></FormDescription>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
        <Button onClick={async (e) => {
          e.preventDefault();
          const url = form.getValues("url");
          const user = form.getValues("user");
          const pwd = form.getValues("pwd");
          buildClient({ url, user, pwd });
          const result = await testConnection();
          console.log(result);
          if (result) {
            toast.success("连接成功");
          } else {
            toast.error("连接失败");
          }
        }}>测试连接</Button>
      </form>

    </Form>
  )
}


