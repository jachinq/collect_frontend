import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/sonner"
import { CollectToggle } from "@/components/collect-toggle"
import { ModeToggle } from "@/components/mode-toggle"
import { WebDavToggle } from "@/components/webdav-toggle"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider defaultOpen={false}>
            <AppSidebar />
            <main className="w-full">
                <div className="header inline">
                    <SidebarTrigger />
                    <CollectToggle />
                    <ModeToggle />
                    <WebDavToggle />
                </div>
                {children}
            </main>
            <Toaster position="top-center" richColors
            // expand={true}
            // duration={10000}
            />
        </SidebarProvider>
    )
}
