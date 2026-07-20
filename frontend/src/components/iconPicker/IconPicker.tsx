import { useState, useRef, useEffect } from "react";

export const iconOptions = ["💻", "🧩", "🎨", "📚", "🏋️", "💼", "🚀", "🔥", "⭐", "🎯", "📈", "🧠"]

interface IconPickerProps {
  selectedIcon: string
  onSelect: (icon: string) => void
}

const IconPicker = ({ selectedIcon, onSelect }: IconPickerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (icon: string) => {
    onSelect(icon)
    setIsOpen(false)
  }

  return (
    <div className="icon-picker" ref={containerRef}>
      <button
        type="button"
        className="icon-picker-trigger"
        onClick={() => setIsOpen(prev => !prev)}
        aria-label="Select icon"
      >
        <span>{selectedIcon}</span>
        <span className="icon-picker-arrow">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="icon-picker-dropdown">
          {iconOptions.map(icon => (
            <button
              key={icon}
              type="button"
              className={`icon-picker-option ${selectedIcon === icon ? "selected" : ""}`}
              onClick={() => handleSelect(icon)}
              aria-label={`Select icon ${icon}`}
            >
              {icon}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default IconPicker
