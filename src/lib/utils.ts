import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// 去掉 url 中的路径，返回 协议+域名
export const removeUrlPath = (url: string): string => {
    try {
        // 创建一个新的URL对象
        const urlObj = new URL(url);
        // 返回协议加上域名
        return urlObj.protocol + '//' + urlObj.hostname;
    } catch (e) {
        // 如果传入的url格式不正确，返回错误信息
        return "";
    }
}