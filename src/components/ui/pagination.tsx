import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { ButtonProps, buttonVariants } from "@/components/ui/button"

const Pagination = ({ className, showTotal = true, onPageChange = () => {}, ...props }: React.ComponentProps<"nav"> & {
  total: number,
  limit: number,
  onPageChange: (page: number) => void,
  showTotal?: boolean,
}) => {
  const [currentPage, setCurrentPage] = React.useState(1);

  const totalPages = Math.ceil(props.total / props.limit)
  const startPage = Math.max(1, currentPage - 2)
  const endPage = Math.min(totalPages, currentPage + 2)
  const hasPrevious = currentPage > 1
  const hasNext = currentPage < totalPages
  const hasFirstEllipsis = startPage > 2
  const hasLastEllipsis = endPage <= totalPages - 2
  const hasFirst = startPage > 1
  const hasLast = endPage < totalPages

  const [pageList, setPageList] = React.useState<number[]>([]);

  React.useEffect(() => {
    const pageList = [];
    for (let i = startPage; i <= endPage; i++) {
      pageList.push(i);
    }
    setPageList(pageList);
    // console.log(pageList, totalPages);
  }, [currentPage, props.limit, props.total]);

  const handlePrevious = () => {
    handlePageChange(currentPage - 1);
    setCurrentPage(currentPage - 1);
  }

  const handleNext = () => {
    handlePageChange(currentPage + 1);
    setCurrentPage(currentPage + 1);
  }

  const handlePageChange = (page: number) => {
    onPageChange(page)
    setCurrentPage(page)
  }

  if (totalPages < 1) {
    return null
  }

  return (
    <div className={className}>
      <div className={"w-full flex flex-row items-center gap-2 justify-end"}>
        {showTotal && (
          <span className="text-sm text-[hsl(var(--muted-foreground))] text-nowrap">共 {props.total} 条</span>
        )}
        <nav
          role="navigation"
          aria-label="pagination"
          className={"flex justify-center"}
          {...props}
        >
          <PaginationContent>
            {hasPrevious && (<PaginationItem>
              <PaginationPrevious onClick={handlePrevious} />
            </PaginationItem>)}

            {hasFirst && (
              <PaginationItem>
                <PaginationLink
                  isActive={1 === currentPage}
                  onClick={() => handlePageChange(1)}
                >
                  1
                </PaginationLink>
              </PaginationItem>)}

            {hasFirstEllipsis && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>)}

            {
              pageList.map((page, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    isActive={page === currentPage}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))
            }
            {hasLastEllipsis && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>)}

            {hasLast && (
              <PaginationItem>
                <PaginationLink
                  isActive={totalPages === currentPage}
                  onClick={() => handlePageChange(totalPages)}
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            )}

            {hasNext && (<PaginationItem>
              <PaginationNext onClick={handleNext} />
            </PaginationItem>)}

          </PaginationContent>

        </nav>
      </div>
    </div>
  )
};

Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row flex-wrap items-center gap-1", className)}
    {...props}
  />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("select-none cursor-pointer", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className
    )}
    {...props}
  />
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    {/* <span>Previous</span> */}
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    {/* <span>Next</span> */}
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
