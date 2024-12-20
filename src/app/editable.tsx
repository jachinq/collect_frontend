import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Collect } from '@/const/def';
import { useEffect, useMemo, useState } from 'react';
import { useMediaQuery } from "@uidotdev/usehooks";
import { Accordion, AccordionItem, AccordionContent, AccordionTrigger } from '@/components/ui/accordion';
import usePage from '@/store/collect-list';
import { CollectToggle } from '@/components/collect-toggle';
// import { Cover } from "@/app/cover";
import { Tag } from "@/components/tag";
import useSyncList, { SyncEventType } from '@/store/syncList';
import { RichAvatar } from './rich-avatar';

interface MediaQuery {
  isSmallDevice: boolean;
}

export interface Column {
  key: string;
  title: string;
  className?: string;
  allowEdit?: boolean;
  render?: (value: any, { }: MediaQuery, callback: Function) => any;
}

export const defaultCollectColumns: Column[] = [
  {
    title: 'icon',
    key: 'icon',
    className: 'w-[40px]',
    allowEdit: false,
    render: (item: any, _, _callback: Function) => <RichAvatar item={item} />
  },
  // {
  //   title: 'Cover',
  //   key: 'cover',
  //   className: 'w-[100px]',
  //   render: (item: any, { isSmallDevice }, callback: Function) => <>
  //     <div className='rounded-lg overflow-hidden'>
  //       <Cover item={item} />
  //     </div>
  //     {isSmallDevice &&
  //       <div className='mt-4'>
  //         <Textarea defaultValue={item.cover} className='resize-none border-none px-4 pb-4 break-all bg-[hsl(var(--muted))]' onChange={(e) => callback && callback('cover', { ...item, cover: e.target.value })} />
  //       </div>
  //     }
  //   </>
  // },
  {
    title: 'Name',
    key: 'name',
    className: 'w-[150px]',
  },
  {
    title: 'Url',
    key: 'url',
    className: 'min-w-[300px]',
  },
  {
    title: 'Description',
    key: 'description',
    className: 'min-w-[100px]',
  },
  {
    title: 'Tags',
    key: 'tags',
    className: 'min-w-[120px]',
    render: (item: any, _, callback: Function) => {
      return <div className="flex flex-wrap">
        {
          item.tags?.map((tag: any, index: number) => tag && <Tag key={tag} className=" rounded-full m-1"
            value={tag}
            editable={true}
            setTag={(value: string) => {
              item.tags[index] = value;
              callback && callback("tags", item);
            }}
          // onInput={onInput}
          />)
        }
      </div>
    }


  },
  {
    title: 'Open',
    key: 'open',
    className: '',
    allowEdit: false,
    // render: (text: any) => <span>{text}</span>
  },
  {
    title: 'Create',
    key: 'create',
    className: 'w-[150px]',
    allowEdit: false,
  },
  {
    title: 'Update',
    key: 'update',
    className: 'w-[150px]',
    allowEdit: false,
  }
]

// 定义可编辑表格组件
const EditableTable = () => {

  const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");

  const columns = useMemo(() => {
    defaultCollectColumns.map((column: any) => {
      if (!column.className) {
        column.className = "";
      }
      if (column.allowEdit === null || column.allowEdit === undefined) {
        column.allowEdit = true;
      }
      if (column.allowEdit) {
        column.className += " cursor-pointer";
      }
    });
    return defaultCollectColumns
  }, []);
  const { getPageList, setPageItem, setPageSize } = usePage();
  const { addSyncTask } = useSyncList();

  useEffect(() => {
    setPageSize(8);
    // if (isSmallDevice) {
    // } 
  }, []);

  const [ rowChange, setRowChange ] = useState(false);

  // 处理输入框的变化
  const handleChange = (row: Collect, key: string, value: string) => {
    row[key] = value;
    setPageItem(row);
    setRowChange(true);
  };

  // 当组件失去焦点时，处理提交
  const onSumbit = (row: Collect) => {
    if (!rowChange) return;
    setRowChange(false);
    row["update"] = new Date().toLocaleDateString();
    addSyncTask({type: SyncEventType.SET_COLLECT, item: row});
  }

  const callbackRender = (key: string, value: Collect) => {
    if (key === "tags") {
      value.update = new Date().toLocaleDateString();
      setPageItem(value);
      addSyncTask({type: SyncEventType.SET_COLLECT, item: value});
    }
    if (key === "cover") {
      value.update = new Date().toLocaleDateString();
      setPageItem(value);
      addSyncTask({type: SyncEventType.SET_COLLECT, item: value});
    }
  }

  if (isSmallDevice) {
    return <>
      {getPageList().length === 0 && <div className="text-center py-10">暂无数据</div>}

      <Accordion type="single" collapsible className="w-full">
        {getPageList().map((row: any, index: number) => (
          <AccordionItem key={row.id} value={row.id}>
            <AccordionTrigger className='px-4 py-2 w-[calc(100vw-40px)] text-xl'>{index + 1}.{row.name || 'None'}</AccordionTrigger>
            <AccordionContent className='px-4 py-2'>
              {
                columns.map((column: any) => (
                  <div className='grid grid-cols-2 gap-4 mb-2' key={column.key} >
                    <div className='font-bold'>{column.title}</div>
                    <div className='rounded-md'>
                      {
                        // 优先使用 render 函数渲染
                        column.render ? column.render(row, { isSmallDevice }, callbackRender) :
                          // 根据是否允许编辑显示不同的组件
                          column.allowEdit ?
                            <Textarea
                              // type="text"
                              value={row[column.key]}
                              onChange={(e) => handleChange(row, column.key, e.target.value)}
                              className='resize-none border-none px-4 py-4  bg-[hsl(var(--muted))]'
                              onBlur={() => onSumbit(row)}
                            /> :
                            <span className='px-4 py-2'>{row[column.key]}</span>
                      }
                    </div>
                  </div>
                ))
              }
              <div className='grid grid-cols-1'>
                <CollectToggle isDel={true} collect={row} variant='destructive' />
              </div>
            </AccordionContent>

          </AccordionItem>
        ))
        }
      </Accordion>
    </>
  }

  return (<>
    <ScrollArea>
      <Table>
        <TableHeader>
          <TableRow>
            {
              columns.map((column: any) => (
                <TableHead key={column.key} className={column.className}>{column.title}</TableHead>
              ))
            }
            <TableHead className='w-[120px]'>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {
            getPageList().map((row: any, index: number) => (
              <TableRow key={index}>
                {
                  columns.map((column: any) => (
                    <TableCell key={column.key} className="p-0">
                      {
                        // 优先使用 render 函数渲染
                        column.render ? column.render(row, { isSmallDevice }, callbackRender) :
                          // 根据是否允许编辑显示不同的组件
                          column.allowEdit ?
                            <Textarea
                              // type="text"
                              value={row[column.key]}
                              onChange={(e) => handleChange(row, column.key, e.target.value)}
                              className='resize-none border-none px-4 py-4'
                              onBlur={() => onSumbit(row)}
                            /> :
                            <span>{row[column.key]}</span>
                      }

                    </TableCell>
                  ))
                }
                <TableCell className='w-[120px] p-0'>
                  <div className='flex items-center justify-center gap-2'>
                    <CollectToggle isDel={true} collect={row} className='text-destructive p-1' />
                    <CollectToggle edit={true} collect={row} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          }
        </TableBody>
      </Table>
      {getPageList().length === 0 &&
        <div className='text-center p-10 w-full text-gray-400'>
          暂无数据
        </div>}

      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  </>
  );
};

export default EditableTable;