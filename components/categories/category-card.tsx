"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { CategoryItem } from "./types"
import { useRouter } from "next/navigation"

interface CategoryCardProps extends CategoryItem {}

export function CategoryCard({ id, title, credits, imageSrc, bgColor }: CategoryCardProps) {
  const router = useRouter()

  const handleClick = () => {
    if (id === "labs") {
      router.push("/labs")
    }
  }

  return (
    <Card onClick={handleClick} className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-4 text-center">
        <div className={`w-14 h-14 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-2`}>
          <img src={imageSrc} alt={title} className="w-8 h-8 object-contain" />
        </div>
        <h3 className="text-[13px] font-medium text-gray-900 mb-0.5">{title}</h3>
        <p className="text-[11px] text-gray-500">{credits}</p>
      </CardContent>
    </Card>
  )
}


