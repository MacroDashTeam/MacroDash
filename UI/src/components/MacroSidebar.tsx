import { useState } from 'react'
import { 
  Home, 
  Search, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  Monitor,
  Settings
} from 'lucide-react'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

interface MacroSidebarProps {
  activeView: string
  onViewChange: (view: string) => void
}

export function MacroSidebar({ activeView, onViewChange }: MacroSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const sidebarButtons = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'catalogue', label: 'Catalogue', icon: BookOpen },
    { id: 'manage-displays', label: 'Manage Displays', icon: Monitor },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <TooltipProvider>
      <div 
        className={`h-screen bg-gradient-to-b from-slate-950 to-slate-900 border-r border-slate-700/50 transition-all duration-300 ease-in-out ${
          isExpanded ? 'w-64' : 'w-16'
        } flex flex-col shadow-2xl`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            {isExpanded && (
              <h2 className="text-white">MacroTracker Pro</h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </Button>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex-1 p-2 space-y-2">
          {sidebarButtons.map((button) => {
            const Icon = button.icon
            const isActive = activeView === button.id

            const buttonContent = (
              <Button
                key={button.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start gap-3 h-12 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                } ${!isExpanded ? 'px-3' : ''}`}
                onClick={() => onViewChange(button.id)}
              >
                <Icon size={20} />
                {isExpanded && <span>{button.label}</span>}
              </Button>
            )

            if (!isExpanded) {
              return (
                <Tooltip key={button.id}>
                  <TooltipTrigger asChild>
                    {buttonContent}
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{button.label}</p>
                  </TooltipContent>
                </Tooltip>
              )
            }

            return buttonContent
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50">
          {isExpanded && (
            <div className="text-slate-400 text-sm">
              <p>Market Status</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-slate-300">Markets Open</span>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}