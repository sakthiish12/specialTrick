"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ProjectFiltersProps {
  categories: string[]
  onFilterChange: (selectedCategories: string[]) => void
}

export function ProjectFilters({ categories, onFilterChange }: ProjectFiltersProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const toggleCategory = (category: string) => {
    const newSelection = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category]
    
    setSelectedCategories(newSelection)
    onFilterChange(newSelection)
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map(category => (
        <Badge 
          key={category}
          variant={selectedCategories.includes(category) ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => toggleCategory(category)}
        >
          {category}
        </Badge>
      ))}
      {selectedCategories.length > 0 && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            setSelectedCategories([])
            onFilterChange([])
          }}
        >
          Clear filters
        </Button>
      )}
    </div>
  )
}
