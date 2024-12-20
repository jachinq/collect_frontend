import { Tag } from "@/components/tag";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Cover } from "./cover";
import "@/styles/data-card.css";
import usePage from "@/store/collect-list";
import { CollectToggle } from "@/components/collect-toggle";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DeleteIcon, EditIcon, MoreHorizontal } from "lucide-react";
import { Tooltip } from "@radix-ui/react-tooltip";
import { TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RichAvatar } from "./rich-avatar";
import { useMediaQuery } from "@uidotdev/usehooks";
import { useEffect } from "react";

export const DataCard = () => {
  // const { collectList, setCollectList } = useCollectList();
  const { getPageList, setPageSize } = usePage();
  const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");
  useEffect(() => {
    if (isSmallDevice) {
      setPageSize(4);
    } else {
      setPageSize(24);
    }
  }, []);

  return (
    <>
      {getPageList().length === 0 && <div className="text-center py-10">暂无数据</div>}
      <div className="card-container grid gap-4">
        {
          getPageList().map((item, index) => (
            <Card key={index}>
              <CardHeader className="p-4">
                <CardTitle className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 w-[calc(100%-32px)]">
                    <RichAvatar item={item} />

                    {/* <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                      {item.name}
                    </span> */}
                    <Tooltip>
                      <TooltipTrigger className="break-keep overflow-hidden" asChild>
                        <span>{item.name}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span className="break-keep overflow-hidden">{item.name}<span className="ml-1 text-muted-foreground text-xs">打开{item.open}次</span></span>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <Popover>
                    <PopoverTrigger>
                      <MoreHorizontal className="w-[16px] h-[16px] rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
                    </PopoverTrigger>
                    <PopoverContent className="w-[content-width] px-4 py-2 flex flex-col">
                      {/* <PopoverClose> */}
                      <div className="flex items-center justify-between">
                        <EditIcon className="w-[16px] h-[16px]" />
                        <CollectToggle collect={item} edit={true} />
                      </div>
                      <div className="flex items-center justify-between">
                        <DeleteIcon className="w-[16px] h-[16px] text-destructive " />
                        <CollectToggle collect={item} isDel={true} className='text-destructive p-1' />
                      </div>

                      {/* </PopoverClose> */}
                    </PopoverContent>
                  </Popover>
                </CardTitle>
              </CardHeader>
              <CardContent className="py-0">
                {/* <Cover item={item} /> */}

                <CardDescription className="break-all">
                  {!item.description && "No description"}
                  {
                    item.description && item.description.length > 50 ?
                      <span>
                        {item.description.slice(0, 50)}...
                      </span>
                      :
                      item.description
                  }
                </CardDescription>
              </CardContent>
              <CardFooter className="flex flex-wrap p-4">
                {item.tags?.map((tag: string, index: number) => (
                  <Tag key={index} className=" rounded-full m-1" value={tag}>
                  </Tag>
                ))}
              </CardFooter>
            </Card>
          ))
        }
      </div>

    </>
  )
}