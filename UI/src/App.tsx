import { useState } from 'react'
import { MacroSidebar } from './components/MacroSidebar'
import { DashboardHome } from './components/DashboardHome'
import { SearchPage } from './components/SearchPage'
import { CataloguePage } from './components/CataloguePage'
import { ManageDisplaysPage } from './components/ManageDisplaysPage'
import { SettingsPage } from './components/SettingsPage'
import { SignInPage } from './components/SignInPage'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeView, setActiveView] = useState('home')

  const handleSignIn = () => {
    setIsAuthenticated(true)
  }

  const handleSignOut = () => {
    setIsAuthenticated(false)
    setActiveView('home')
  }

  // Show sign-in page if not authenticated
  if (!isAuthenticated) {
    return <SignInPage onSignIn={handleSignIn} />
  }

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <DashboardHome />
      case 'search':
        return <SearchPage />
      case 'catalogue':
        return <CataloguePage />
      case 'manage-displays':
        return <ManageDisplaysPage />
      case 'settings':
        return <SettingsPage onSignOut={handleSignOut} />
      default:
        return <DashboardHome />
    }
  }

  return (
    <div className="flex h-screen w-screen bg-slate-900 overflow-hidden">
      <MacroSidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1 h-full overflow-hidden">
        {renderView()}
      </div>
    </div>
  )
}

export default App
