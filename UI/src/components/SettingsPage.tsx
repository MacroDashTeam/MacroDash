import { useState } from 'react'
import { User, Bell, Palette, Shield, Database, Globe, Download, Upload, LogOut, Save, Eye, EyeOff, Moon, Sun, Monitor, Smartphone, Mail, Phone, Calendar, DollarSign, BarChart3, TrendingUp, Clock, Settings as SettingsIcon } from 'lucide-react'
import { Button } from './ui/button'

// Add the interface for props
interface SettingsPageProps {
  onSignOut?: () => void
}

export function SettingsPage({ onSignOut }: SettingsPageProps) {
  // Account Settings State
  const [accountSettings, setAccountSettings] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Investment Analytics Corp',
    jobTitle: 'Senior Financial Analyst',
    timezone: 'America/New_York',
    language: 'English (US)',
    currency: 'USD'
  })

  // Appearance Settings State
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'dark',
    accentColor: 'blue',
    fontSize: 'medium',
    sidebarWidth: 'medium',
    chartStyle: 'modern',
    gridDensity: 'comfortable',
    animations: true,
    reducedMotion: false
  })

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketAlerts: true,
    newsUpdates: true,
    priceAlerts: true,
    portfolioUpdates: false,
    weeklyReports: true,
    marketOpen: true,
    marketClose: false,
    earningsAlerts: true
  })

  // Data & Privacy Settings State
  const [dataSettings, setDataSettings] = useState({
    dataRetention: '2years',
    shareAnalytics: false,
    cookiePreferences: 'necessary',
    autoSync: true,
    cloudBackup: true,
    exportFormat: 'csv',
    cacheSize: 'medium',
    offlineMode: false
  })

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30min',
    loginAlerts: true,
    deviceTracking: true,
    ipWhitelist: false,
    apiKeyAccess: false,
    auditLogs: true,
    passwordStrength: 'strong'
  })

  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('account')

  const tabs = [
    { id: 'account', name: 'Account', icon: <User size={18} /> },
    { id: 'appearance', name: 'Appearance', icon: <Palette size={18} /> },
    { id: 'notifications', name: 'Notifications', icon: <Bell size={18} /> },
    { id: 'security', name: 'Security', icon: <Shield size={18} /> },
    { id: 'data', name: 'Data & Privacy', icon: <Database size={18} /> }
  ]

  const handleAccountChange = (field: string, value: string) => {
    setAccountSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleAppearanceChange = (field: string, value: string | boolean) => {
    setAppearanceSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleDataChange = (field: string, value: string | boolean) => {
    setDataSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSecurityChange = (field: string, value: string | boolean) => {
    setSecuritySettings(prev => ({ ...prev, [field]: value }))
  }

  // Add sign out handler
  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut()
    }
  }

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'light': return <Sun size={16} />
      case 'dark': return <Moon size={16} />
      case 'system': return <Monitor size={16} />
      default: return <Moon size={16} />
    }
  }

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
            <input
              type="text"
              value={accountSettings.firstName}
              onChange={(e) => handleAccountChange('firstName', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
            <input
              type="text"
              value={accountSettings.lastName}
              onChange={(e) => handleAccountChange('lastName', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email"
              value={accountSettings.email}
              onChange={(e) => handleAccountChange('email', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
            <input
              type="tel"
              value={accountSettings.phone}
              onChange={(e) => handleAccountChange('phone', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Company</label>
            <input
              type="text"
              value={accountSettings.company}
              onChange={(e) => handleAccountChange('company', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Job Title</label>
            <input
              type="text"
              value={accountSettings.jobTitle}
              onChange={(e) => handleAccountChange('jobTitle', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Regional Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Timezone</label>
            <select
              value={accountSettings.timezone}
              onChange={(e) => handleAccountChange('timezone', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="UTC">UTC</option>
              <option value="Europe/London">London (GMT)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Language</label>
            <select
              value={accountSettings.language}
              onChange={(e) => handleAccountChange('language', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="English (US)">English (US)</option>
              <option value="English (UK)">English (UK)</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Japanese">Japanese</option>
              <option value="Chinese">Chinese</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Currency</label>
            <select
              value={accountSettings.currency}
              onChange={(e) => handleAccountChange('currency', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-600/30">
        <div className="flex gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Save size={16} className="mr-2" />
            Save Changes
          </Button>
          <Button variant="outline" className="border-slate-600/50 text-slate-300 hover:bg-slate-700/50">
            Reset to Default
          </Button>
        </div>
      </div>
    </div>
  )

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Theme & Display</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Color Theme</label>
            <div className="space-y-2">
              {['light', 'dark', 'system'].map((theme) => (
                <label key={theme} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value={theme}
                    checked={appearanceSettings.theme === theme}
                    onChange={(e) => handleAppearanceChange('theme', e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    {getThemeIcon(theme)}
                    <span className="text-slate-300 capitalize">{theme}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Accent Color</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { name: 'blue', color: 'bg-blue-500' },
                { name: 'green', color: 'bg-green-500' },
                { name: 'purple', color: 'bg-purple-500' },
                { name: 'orange', color: 'bg-orange-500' }
              ].map((accent) => (
                <button
                  key={accent.name}
                  onClick={() => handleAppearanceChange('accentColor', accent.name)}
                  className={`w-12 h-12 rounded-lg ${accent.color} border-2 ${
                    appearanceSettings.accentColor === accent.name 
                      ? 'border-white' 
                      : 'border-transparent'
                  } hover:border-slate-300 transition-colors`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Layout & Typography</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Font Size</label>
            <select
              value={appearanceSettings.fontSize}
              onChange={(e) => handleAppearanceChange('fontSize', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Sidebar Width</label>
            <select
              value={appearanceSettings.sidebarWidth}
              onChange={(e) => handleAppearanceChange('sidebarWidth', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="narrow">Narrow</option>
              <option value="medium">Medium</option>
              <option value="wide">Wide</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Chart Style</label>
            <select
              value={appearanceSettings.chartStyle}
              onChange={(e) => handleAppearanceChange('chartStyle', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Grid Density</label>
            <select
              value={appearanceSettings.gridDensity}
              onChange={(e) => handleAppearanceChange('gridDensity', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="compact">Compact</option>
              <option value="comfortable">Comfortable</option>
              <option value="spacious">Spacious</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Motion & Accessibility</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={appearanceSettings.animations}
              onChange={(e) => handleAppearanceChange('animations', e.target.checked)}
              className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-slate-300">Enable animations</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={appearanceSettings.reducedMotion}
              onChange={(e) => handleAppearanceChange('reducedMotion', e.target.checked)}
              className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-slate-300">Reduce motion for accessibility</span>
          </label>
        </div>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">General Notifications</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-slate-400" />
              <div>
                <span className="text-slate-300">Email Notifications</span>
                <p className="text-sm text-slate-400">Receive notifications via email</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.emailNotifications}
              onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
              className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <Smartphone size={18} className="text-slate-400" />
              <div>
                <span className="text-slate-300">Push Notifications</span>
                <p className="text-sm text-slate-400">Receive push notifications on your device</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.pushNotifications}
              onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
              className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Market Alerts</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <TrendingUp size={18} className="text-slate-400" />
              <div>
                <span className="text-slate-300">Market Alerts</span>
                <p className="text-sm text-slate-400">Major market movements and volatility alerts</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.marketAlerts}
              onChange={(e) => handleNotificationChange('marketAlerts', e.target.checked)}
              className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <DollarSign size={18} className="text-slate-400" />
              <div>
                <span className="text-slate-300">Price Alerts</span>
                <p className="text-sm text-slate-400">Stock price threshold notifications</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.priceAlerts}
              onChange={(e) => handleNotificationChange('priceAlerts', e.target.checked)}
              className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <BarChart3 size={18} className="text-slate-400" />
              <div>
                <span className="text-slate-300">Earnings Alerts</span>
                <p className="text-sm text-slate-400">Company earnings announcements and results</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.earningsAlerts}
              onChange={(e) => handleNotificationChange('earningsAlerts', e.target.checked)}
              className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">News & Reports</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <Globe size={18} className="text-slate-400" />
              <div>
                <span className="text-slate-300">News Updates</span>
                <p className="text-sm text-slate-400">Breaking financial news and market updates</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.newsUpdates}
              onChange={(e) => handleNotificationChange('newsUpdates', e.target.checked)}
              className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-slate-400" />
              <div>
                <span className="text-slate-300">Weekly Reports</span>
                <p className="text-sm text-slate-400">Weekly market summary and portfolio performance</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.weeklyReports}
              onChange={(e) => handleNotificationChange('weeklyReports', e.target.checked)}
              className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Authentication</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-slate-300">Two-Factor Authentication</span>
              <p className="text-sm text-slate-400">Add an extra layer of security to your account</p>
            </div>
            <input
              type="checkbox"
              checked={securitySettings.twoFactorAuth}
              onChange={(e) => handleSecurityChange('twoFactorAuth', e.target.checked)}
              className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Session Timeout</label>
            <select
              value={securitySettings.sessionTimeout}
              onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
              className="w-full max-w-xs px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="15min">15 minutes</option>
              <option value="30min">30 minutes</option>
              <option value="1hour">1 hour</option>
              <option value="4hours">4 hours</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Activity Monitoring</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-slate-300">Login Alerts</span>
              <p className="text-sm text-slate-400">Get notified of new login attempts</p>
            </div>
            <input
              type="checkbox"
              checked={securitySettings.loginAlerts}
              onChange={(e) => handleSecurityChange('loginAlerts', e.target.checked)}
              className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-slate-300">Device Tracking</span>
              <p className="text-sm text-slate-400">Monitor devices accessing your account</p>
            </div>
            <input
              type="checkbox"
              checked={securitySettings.deviceTracking}
              onChange={(e) => handleSecurityChange('deviceTracking', e.target.checked)}
              className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-slate-300">Audit Logs</span>
              <p className="text-sm text-slate-400">Keep detailed logs of account activity</p>
            </div>
            <input
              type="checkbox"
              checked={securitySettings.auditLogs}
              onChange={(e) => handleSecurityChange('auditLogs', e.target.checked)}
              className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">API & Access</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-slate-300">API Key Access</span>
              <p className="text-sm text-slate-400">Allow third-party applications to access your data</p>
            </div>
            <input
              type="checkbox"
              checked={securitySettings.apiKeyAccess}
              onChange={(e) => handleSecurityChange('apiKeyAccess', e.target.checked)}
              className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-slate-300">IP Whitelist</span>
              <p className="text-sm text-slate-400">Restrict access to specific IP addresses</p>
            </div>
            <input
              type="checkbox"
              checked={securitySettings.ipWhitelist}
              onChange={(e) => handleSecurityChange('ipWhitelist', e.target.checked)}
              className="rounded border-slate-600 text-blue-600 text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>
    </div>
  )

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Data Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Data Retention Period</label>
            <select
              value={dataSettings.dataRetention}
              onChange={(e) => handleDataChange('dataRetention', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="6months">6 months</option>
              <option value="1year">1 year</option>
              <option value="2years">2 years</option>
              <option value="5years">5 years</option>
              <option value="indefinite">Indefinite</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Export Format</label>
            <select
              value={dataSettings.exportFormat}
              onChange={(e) => handleDataChange('exportFormat', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="excel">Excel</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Privacy & Sharing</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-slate-300">Share Analytics Data</span>
              <p className="text-sm text-slate-400">Help improve our service by sharing anonymous usage data</p>
            </div>
            <input
              type="checkbox"
              checked={dataSettings.shareAnalytics}
              onChange={(e) => handleDataChange('shareAnalytics', e.target.checked)}
              className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Cookie Preferences</label>
            <select
              value={dataSettings.cookiePreferences}
              onChange={(e) => handleDataChange('cookiePreferences', e.target.value)}
              className="w-full max-w-xs px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="necessary">Necessary only</option>
              <option value="functional">Functional</option>
              <option value="analytics">Analytics</option>
              <option value="all">All cookies</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Sync & Backup</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-slate-300">Auto Sync</span>
              <p className="text-sm text-slate-400">Automatically sync data across devices</p>
            </div>
            <input
              type="checkbox"
              checked={dataSettings.autoSync}
              onChange={(e) => handleDataChange('autoSync', e.target.checked)}
              className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-slate-300">Cloud Backup</span>
              <p className="text-sm text-slate-400">Backup your data to secure cloud storage</p>
            </div>
            <input
              type="checkbox"
              checked={dataSettings.cloudBackup}
              onChange={(e) => handleDataChange('cloudBackup', e.target.checked)}
              className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-slate-300">Offline Mode</span>
              <p className="text-sm text-slate-400">Cache data for offline access</p>
            </div>
            <input
              type="checkbox"
              checked={dataSettings.offlineMode}
              onChange={(e) => handleDataChange('offlineMode', e.target.checked)}
              className="rounded border-slate-600 text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-600/30">
        <div className="flex gap-3">
          <Button variant="outline" className="border-blue-600/50 text-blue-400 hover:bg-blue-600/10">
            <Download size={16} className="mr-2" />
            Export My Data
          </Button>
          <Button variant="outline" className="border-green-600/50 text-green-400 hover:bg-green-600/10">
            <Upload size={16} className="mr-2" />
            Import Data
          </Button>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account': return renderAccountSettings()
      case 'appearance': return renderAppearanceSettings()
      case 'notifications': return renderNotificationSettings()
      case 'security': return renderSecuritySettings()
      case 'data': return renderDataSettings()
      default: return renderAccountSettings()
    }
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-y-auto">
    <div className="p-6">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-medium text-white mb-2">Settings</h1>
          <p className="text-slate-400">Manage your account, preferences, and privacy settings</p>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 h-[calc(100vh-200px)]">
          
          {/* Left Sidebar - Navigation */}
          <div className="bg-slate-800/60 backdrop-blur-md rounded-xl border border-slate-600/30 shadow-2xl">
            <div className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                      activeTab === tab.id
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    {tab.icon}
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-8 border-t border-slate-600/30">
                <Button 
                  onClick={handleSignOut}
                  variant="outline" 
                  className="w-full border-red-600/50 text-red-400 hover:bg-red-600/10 hover:border-red-500"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="bg-slate-800/60 backdrop-blur-md rounded-xl border border-slate-600/30 shadow-2xl">
            <div className="p-6 h-full overflow-y-auto">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
