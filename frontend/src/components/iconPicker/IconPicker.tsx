import { useState, useRef, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { iconOptions, getAreaIcon } from "./iconOptions"


interface IconPickerProps {
  selectedIcon: string
  onSelect: (icon: string) => void
}

const IconPicker = ({ selectedIcon, onSelect }: IconPickerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const SelectedIcon = getAreaIcon(selectedIcon)
  const ArrowIcon = isOpen ? ChevronUp : ChevronDown

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
        <SelectedIcon size={20} />
        <ArrowIcon size={12} className="icon-picker-arrow" />
      </button>

      {isOpen && (
        <div className="icon-picker-dropdown">
          {iconOptions.map(icon => {
            const OptionIcon = getAreaIcon(icon)
            return (
              <button
                key={icon}
                type="button"
                className={`icon-picker-option ${selectedIcon === icon ? "selected" : ""}`}
                onClick={() => handleSelect(icon)}
                aria-label={`Select icon ${icon}`}
              >
                <OptionIcon size={18} />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default IconPicker
