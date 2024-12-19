import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { CollectToggle } from "@/components/collect-toggle"
import { ModeToggle } from "@/components/mode-toggle"
import { WebDavToggle } from "@/components/webdav-toggle"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider defaultOpen={false}>
            <AppSidebar/>
            <main className="w-full">
                <div className="header inline">
                    <SidebarTrigger />
                    <CollectToggle />
                    <ModeToggle />
                    <WebDavToggle/>
                </div>
                {children}
            </main>
            <Toaster />
        </SidebarProvider>
    )
}
