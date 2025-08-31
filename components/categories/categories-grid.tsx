"use client"

import { CategoryCard } from "./category-card"
import { categories } from "./data"

export function CategoriesGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {categories.map((cat) => (
        <CategoryCard key={cat.id} {...cat} />
      ))}
    </div>
  )
}


