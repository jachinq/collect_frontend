import { createContext, useContext, useState } from "react";

export type ShowType = "Card" | "Table";

type ShowTypeState = {
    showType: ShowType
    setShowType: (showType: ShowType) => void
}

const initialState: ShowTypeState = {
    showType: "Card",
    setShowType: () => null,
}

const ShowTypeProviderContext = createContext<ShowTypeState>(initialState)

export function ShowTypeProvider({
    children,
    defaultTheme = "Card",
    storageKey = "showType",
    ...props
}: any) {
    const [showType, setShowType] = useState<ShowType>(
        () => (localStorage.getItem(storageKey) as ShowType) || defaultTheme
    )

    const value = {
        showType,
        setShowType: (showType: ShowType) => {
            localStorage.setItem(storageKey, showType)
            setShowType(showType)
        },
    }

    return (
        <ShowTypeProviderContext.Provider {...props} value={value}>
            {children}
        </ShowTypeProviderContext.Provider>
    )
}

export const useShowType = () => {
    const context = useContext(ShowTypeProviderContext)

    if (context === undefined)
        throw new Error("useShowType must be used within a ShowTypeProviderContext")

    return context
}

