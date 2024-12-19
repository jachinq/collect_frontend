import { Input } from "@/components/ui/input"
import usePage from "@/store/page"

export const Filter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const { filterText, setFilterText } = usePage();
  return (
    <div className={className} {...props}>
      <Input placeholder="搜索名称/url/描述/标签" defaultValue={filterText} onChange={(e) => setFilterText(e.target.value)} />
    </div>
  )
}