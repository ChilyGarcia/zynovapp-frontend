"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { CategoryItem } from "./types"

interface CategoryCardProps extends CategoryItem {}

export function CategoryCard({ title, credits, imageSrc, bgColor }: CategoryCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-6 text-center">
        <div className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-3`}>
          <img src={imageSrc} alt={title} className="w-10 h-10 object-contain" />
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">{title}</h3>
        <p className="text-xs text-gray-500">{credits}</p>
      </CardContent>
    </Card>
  )
}


