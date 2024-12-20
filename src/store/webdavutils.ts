import { createClient, FileStat, WebDAVClient } from "webdav";
import { create } from "zustand";

const file_path = "collect_v2.json";
const default_data = {};

const webdav_url = localStorage.getItem("webdav_url") || "dav/webdav/app";
const webdav_user = localStorage.getItem("webdav_user");
const webdav_pwd = localStorage.getItem("webdav_pwd");

// webdav_url 如果不是以 http 或者 https 开头，则默认在前面拼接上当前域名
const getFinalUrl = (): string => {
  let finalUrl = webdav_url || "";
  if (webdav_url && !webdav_url.startsWith("http")) {
    const current_url = window.location.href;
    // console.log("current_url", current_url);
    const current_domain = current_url.split("/")[2];
    // console.log("current_domain", current_domain);
    const protocol = window.location.protocol;
    if (webdav_url.startsWith("/")) {
      finalUrl = `${protocol}//${current_domain}${webdav_url}`;
    } else {
      finalUrl = `${protocol}//${current_domain}/${webdav_url}`;
    }
    console.log("finalUrl", finalUrl);
  }
  return finalUrl;
}

export interface ClientOptions {
  url: string;
  user: string;
  pwd: string;
}

const clientOptions: ClientOptions = {
  url: webdav_url || "",
  user: webdav_user || "",
  pwd: webdav_pwd || ""
}

const buildClient = ({ url, user, pwd }: ClientOptions): any | null => {
  if (!url) {
    // console.error("url is null or undefined");
    return null;
  }
  if (!user) {
    // console.error("user is null or undefined");
    return null;
  }
  if (!pwd) {
    // console.error("pwd is null or undefined");
    return null;
  }
  url = getFinalUrl();
  const client = createClient(url, {
    username: user,
    password: pwd
  });
  return client;
}

// 获取目录内容
// const directoryItems = await client.getDirectoryContents("/");
// console.log(directoryItems);


// 测试连接
const testConnection = async (client: WebDAVClient | null): Promise<boolean> => {
  if (!client) {
    // console.log("client is null or undefined");
    return false;
  }
  return await client.exists("/");
};

// 读取数据
const readData = async (client: WebDAVClient): Promise<any> => {
  const exist = await client.exists(file_path);
  if (exist) {
    const contents = await client.getFileContents(file_path);
    const decoder = new TextDecoder('utf-8');
    let string = decoder.decode(contents);
    if (!string) {
      string = "[]";
    }
    const json = JSON.parse(string);
    return json;
  } else { // 创建文件
    const ok = await client.putFileContents(file_path, JSON.stringify(default_data));
    if (!ok) {
      console.error("create default webdav file failed", file_path);
    }
  }
  return [];
}

// 新增数据
const syncData = async (client: WebDAVClient, data: any): Promise<boolean> => {
  if (!data) {
    console.log("no data to save");
    return false;
  }

  const ok = await client.putFileContents(file_path, JSON.stringify(data));
  return ok;
}

const checkFile = async (client: WebDAVClient): Promise<FileStat> => {
  const stat = await client.stat(file_path) as FileStat;
  // const { lastmod } = stat;
  // const now = new Date().getTime();
  // const diff = now - new Date(lastmod).getTime();
  // if (diff > 1000 * 60 * 60 * 24) { // 超过1天，认为文件过期
  //   console.log("webdav file is expired, need to update");
  //   return false;
  // }
  return stat;
}

interface WebDavState {
  initialized: boolean;
  setInitialized: (initialized: boolean) => void;
  client: any | null;
  clientOptions: ClientOptions;
  setClientOptions: (options: ClientOptions) => void;
  buildClient: (options: ClientOptions) => any | null;
  testConnection: () => Promise<boolean>;
  readData: () => Promise<any>;
  syncData: (data?: any) => Promise<boolean>;
  checkCanSync: () => Promise<boolean>; // 检查是否可以同步数据至服务器
}

const useWebDav = create<WebDavState>((set, get) => ({
  initialized: false,
  setInitialized: (initialized) => set({ initialized }),
  client: null,
  clientOptions,
  setClientOptions: (options) => {
    set({ clientOptions: options });
    localStorage.setItem("webdav_url", options.url);
    localStorage.setItem("webdav_user", options.user);
    localStorage.setItem("webdav_pwd", options.pwd);
    const client = get().buildClient(options);
    if (client) { // 保存配置时，重新连接，成功的话则更新client
      set({ client });
    }
  },
  buildClient: (options) => {
    const client = buildClient(options);
    set({ client });
    return client;
  },
  testConnection: async () => {
    const client = get().client;
    const ok = await testConnection(client);
    set({ client });
    return ok;
  },
  readData: async () => {
    const client = get().client;
    const data = await readData(client);
    return data;
  },
  syncData: async (data) => {
    const client = get().client;
    if (client) {
      try {
        if (!data) {
          const datasets = localStorage.getItem("datasets");
          const collectList = localStorage.getItem("collect-list");
          if (datasets && collectList) {
            data = { datasets: JSON.parse(datasets), collectList: JSON.parse(collectList) };
          }
        }
      } catch (error) {
        console.error("syncData error", error);
        return false;
      }
      if (!data) {
        console.log("no data to save");
        return false;
      }

      const ok = await syncData(client, data);
      return ok;
    }
    return false;
  },
  checkCanSync: async () => { 
    const client = get().client;
    if (client) {
      const stat = await checkFile(client);
      const { lastmod } = stat;
      const serverTime = new Date(lastmod).getTime();      
      const localTime = localStorage.getItem("local_opt_time") || ""; // 获取本地操作时间
      let localTimeNum = 0;
      if (localTime !== "") {
        localTimeNum = new Date(localTime).getTime();
      }

      return serverTime < localTimeNum; // 服务器时间比本地时间早，说明本地数据可以安全覆盖到服务器
    }
    return false;
  }
}));
export default useWebDav;