// <div className='flex flex-wrap gap-1'>
//   {item.tags.map((tag: any) => <span key={tag} className='bg-gray-200 text-gray-800 rounded-full px-2 py-1 text-xs'>{tag}</span>)}
// </div>


import * as React from "react"

import { cn } from "@/lib/utils"
import { Input } from "./ui/input";

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> { }

const colorMap: any = {

}

// 随机生成一对背景和前景色
function generateColors(): Color {
  const bgColor = getRandomColorHSL();
  const fgColor = getForegroundColor(bgColor);
  return { bgColor, fgColor }
}

// 生成随机 HSL 颜色
function getRandomColorHSL(): string {
  const hue = Math.floor(Math.random() * 360); // 色相 [0, 360)
  const saturation = Math.floor(Math.random() * 100); // 饱和度 [0, 100)
  const lightness = Math.floor(Math.random() * 31) + 40; // 亮度 [40, 70) - 避免太暗
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// 根据背景色生成前景色
function getForegroundColor(backgroundColor: string): string {
  const hslValues: any = backgroundColor.match(/(\d+), (\d+)%, (\d+)%/);
  // 计算明亮度值
  const lightness = parseInt(hslValues[3], 10);
  // 确保前景色比背景色明亮
  const newLightness = lightness < 60 ? lightness + 60 : lightness - 30; // 使前景色的亮度增加

  return `hsl(${hslValues[1]}, ${hslValues[2]}%, ${newLightness}%)`;
}

type Color = {
  bgColor: string
  fgColor: string
}

// 获取颜色
const getColor = (value: string): Color => {
  if (colorMap[value]) {
    return colorMap[value]
  }
  const color = generateColors();
  colorMap[value] = color
  // console.log(colorMap)
  return color
}

// 调整输入框宽度
function adjustWidth(input: any) {
  const canvas = document.createElement('canvas');
  const context: any = canvas.getContext('2d');
  context.font = getComputedStyle(input).font; // 获取输入框的字体样式
  const textWidth = context.measureText(input.value).width; // 测量文本宽度

  input.style.width = textWidth + 'px'; // 设置输入框宽度，加一些间距
}

interface Data {
  value: string
  editable?: boolean
  setTag?: (value: string) => void
  className?: string
  [key: string]: any
}

export const Tag = ({ value, editable, setTag, className }: Data) => {
  const [backgroundColor, setBackgroundColor] = React.useState('');
  const [color, setColor] = React.useState('');
  const refreshColor = (value: string) => {
    const color = getColor(value)
    setBackgroundColor(color.bgColor)
    setColor(color.fgColor)
    // console.log(color)
  }
  React.useEffect(() => {
    refreshColor(value);
    const inputs = document.querySelectorAll('.tag-input');
    inputs.forEach((input: any) => {
      adjustWidth(input);
    });
  }, [value])


  return (
    <div
      className={cn("inline-flex items-center rounded-md border text-xs transition--colors px-0 py-0.5 font-normal", className)}
      style={{ backgroundColor, color }}
    >

      {editable &&
        <Input defaultValue={value} className="tag-input p-0 mx-2 my-0 h-4 focus:outline-none"
          style={{
            border: 'none', outline: 'none', backgroundColor: 'transparent', color: 'inherit'
          }}
          onChange={(e) => {
            adjustWidth(e.target);
            refreshColor(e.target.value);
          }}
          onBlur={(e) => {
            setTag && setTag(e.target.value);
          }}
          // {...props}
        />
      }
      {!editable &&
        <span className="flex-1 p-0 mx-2 my-0 h-4 cursor-default break-keep">{value}</span>
      }

    </div>
  )
}
