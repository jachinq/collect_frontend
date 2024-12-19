import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import useDataset, { Dataset } from "@/store/dataset";
import { DatasetToggle } from "./dataset-toggle";
import usePage from "@/store/page";
import { Separator } from "./ui/separator";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  // Menu items.
  const { datasets, dataset, activeDataset } = useDataset();
  const { setFilterText } = usePage();

  const handleFilterTextChange = (item: Dataset) => {
    activeDataset(item);
    setTimeout(() => {
      setFilterText(item.filterText);
    }, 0);
  }
  return (
    <Sidebar title="数据集" >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold">数据集</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu defaultValue={dataset?.id || 1}>
              {datasets.map((item) => (
                <SidebarMenuItem key={item.id} data-active={item.id === dataset?.id}>
                  <SidebarMenuButton asChild onClick={handleFilterTextChange.bind(null, item)}
                    className={cn(dataset?.id === item.id && "bg-sidebar-accent text-sidebar-accent-foreground", "rounded-sm")}
                  >
                    <div className="flex items-center justify-between cursor-pointer">
                      <span>{item.name}</span>
                      {item.id !== 1 && (
                        <div className="flex items-center">
                          <DatasetToggle edit={true} dataset={item} />
                          <DatasetToggle isDel={true} dataset={item} />
                        </div>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <Separator />
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <DatasetToggle edit={false} />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
