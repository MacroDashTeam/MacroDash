import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useState } from 'react'
import { Key, Database, Brain, Lock, CheckCircle, AlertCircle, ExternalLink, User as UserIcon, LogOut, Bell } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface User {
  id: number
  username: string
  email: string
}

interface SettingsProps {
  user?: User
  onSignOut?: () => void
}

export default function Settings({ user, onSignOut }: SettingsProps) {
  const [showKeys, setShowKeys] = useState(false)
  const queryClient = useQueryClient()

  // Fetch user preferences
  const { data: preferencesData, isLoading: preferencesLoading } = useQuery({
    queryKey: ['user-preferences'],
    queryFn: async () => {
      const res = await fetch('/api/preferences/')
      if (!res.ok) throw new Error('Failed to fetch preferences')
      return res.json()
    },
    enabled: !!user,
  })

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch('/api/preferences/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update preferences')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] })
    },
  })

  const preferences = preferencesData?.data || {}

  const apiKeys = [
    {
      name: 'FRED_API_KEY',
      label: 'FRED API Key',
      icon: Database,
      description: 'Federal Reserve Economic Data for economic indicators',
      required: false,
      helpUrl: 'https://fred.stlouisfed.org/docs/api/api_key.html',
      placeholder: 'your_fred_api_key_here'
    },
    {
      name: 'ALPHA_VANTAGE_API_KEY',
      label: 'Alpha Vantage API Key',
      icon: Database,
      description: 'Stock news with sentiment analysis (fallback to Yahoo Finance)',
      required: false,
      helpUrl: 'https://www.alphavantage.co/support/#api-key',
      placeholder: 'your_alpha_vantage_api_key_here'
    },
    {
      name: 'OPENAI_API_KEY',
      label: 'OpenAI API Key',
      icon: Brain,
      description: 'AI-powered chatbot, insights, and news sentiment classification',
      required: true,
      helpUrl: 'https://platform.openai.com/api-keys',
      placeholder: 'sk-...'
    },
    {
      name: 'SECRET_KEY',
      label: 'Django Secret Key',
      icon: Lock,
      description: 'Django security key (auto-generated)',
      required: true,
      helpUrl: null,
      placeholder: 'your_secret_key_here'
    }
  ]

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-zinc-400">
            Configure API keys and application settings
          </p>
        </div>

        {/* User Account Section */}
        {user && (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Account Information
              </CardTitle>
              <CardDescription>Your account details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-zinc-400">Username</label>
                  <p className="text-white mt-1">{user.username}</p>
                </div>
                <div>
                  <label className="text-sm text-zinc-400">Email</label>
                  <p className="text-white mt-1">{user.email}</p>
                </div>
              </div>
              {onSignOut && (
                <div className="pt-4 border-t border-zinc-800">
                  <Button
                    onClick={onSignOut}
                    variant="outline"
                    className="border-red-900/50 bg-red-950/20 text-red-400 hover:bg-red-900/30 hover:text-red-300"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notifications Section */}
        {user && (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {preferencesLoading ? (
                <p className="text-zinc-400 text-sm">Loading preferences...</p>
              ) : (
                <div className="space-y-4">
                  {/* AI Agent Reports Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 hover:border-zinc-700 transition">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        AI Agent Reports
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        Receive autonomous portfolio analysis and news synthesis every 6 hours
                      </p>
                    </div>
                    <Checkbox
                      checked={preferences.agent_notifications || false}
                      onCheckedChange={(checked) => {
                        updatePreferencesMutation.mutate({
                          agent_notifications: checked,
                        })
                      }}
                      disabled={updatePreferencesMutation.isPending}
                    />
                  </div>

                  {/* Other notification toggles */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 hover:border-zinc-700 transition">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        Email Alerts
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        Receive email notifications
                      </p>
                    </div>
                    <Checkbox
                      checked={preferences.email_alerts !== false}
                      onCheckedChange={(checked) => {
                        updatePreferencesMutation.mutate({
                          email_alerts: checked,
                        })
                      }}
                      disabled={updatePreferencesMutation.isPending}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 hover:border-zinc-700 transition">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        Price Alert Notifications
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        Get notified when price alerts are triggered
                      </p>
                    </div>
                    <Checkbox
                      checked={preferences.price_alert_notifications !== false}
                      onCheckedChange={(checked) => {
                        updatePreferencesMutation.mutate({
                          price_alert_notifications: checked,
                        })
                      }}
                      disabled={updatePreferencesMutation.isPending}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 hover:border-zinc-700 transition">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        News Notifications
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        Get notified about important news
                      </p>
                    </div>
                    <Checkbox
                      checked={preferences.news_notifications || false}
                      onCheckedChange={(checked) => {
                        updatePreferencesMutation.mutate({
                          news_notifications: checked,
                        })
                      }}
                      disabled={updatePreferencesMutation.isPending}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Important Notice */}
        <Card className="bg-amber-950/20 border-amber-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-500">
              <AlertCircle className="w-5 h-5" />
              Server-Side Configuration Required
            </CardTitle>
          </CardHeader>
          <CardContent className="text-amber-200/80 space-y-2">
            <p>
              API keys must be configured on the server in the <code className="bg-amber-900/30 px-2 py-1 rounded">.env</code> file.
              This interface shows what needs to be configured.
            </p>
            <p className="text-sm">
              Location: <code className="bg-amber-900/30 px-2 py-1 rounded">/server/.env</code>
            </p>
          </CardContent>
        </Card>

        {/* API Keys Configuration */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">API Keys</CardTitle>
            <CardDescription>
              Configure external API keys for data sources and services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {apiKeys.map((key) => (
              <div key={key.name} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <key.icon className={`w-5 h-5 mt-1 ${key.required ? 'text-blue-500' : 'text-zinc-500'}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-white">
                          {key.label}
                        </label>
                        {key.required && (
                          <span className="text-xs bg-blue-950/50 text-blue-400 px-2 py-0.5 rounded">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        {key.description}
                      </p>
                    </div>
                  </div>
                  {key.helpUrl && (
                    <a
                      href={key.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <Input
                  type={showKeys ? 'text' : 'password'}
                  placeholder={key.placeholder}
                  className="bg-zinc-800/50 border-zinc-700 text-white font-mono text-sm"
                  disabled
                />
              </div>
            ))}

            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
              <Button
                variant="outline"
                onClick={() => setShowKeys(!showKeys)}
                className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
              >
                <Key className="w-4 h-4 mr-2" />
                {showKeys ? 'Hide' : 'Show'} Keys
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features Information */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Feature Availability</CardTitle>
            <CardDescription>
              What works with and without API keys
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Works Without API Keys</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Stock prices, financials, analyst recommendations (via Yahoo Finance)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Key className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Requires FRED API Key</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Economic indicators (GDP, unemployment, inflation, interest rates)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Key className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Requires Alpha Vantage API Key</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Advanced news sentiment (falls back to Yahoo Finance + AI)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Requires OpenAI API Key</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    AI chatbot, market insights, and news sentiment classification
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-zinc-300">
            <div className="space-y-2">
              <p className="font-medium">1. Create a .env file</p>
              <pre className="bg-zinc-950/50 p-4 rounded border border-zinc-800 overflow-x-auto">
                <code className="text-xs text-zinc-400">
{`# Navigate to server directory
cd server

# Copy the example file
cp .env.example .env

# Edit with your API keys
nano .env`}
                </code>
              </pre>
            </div>

            <div className="space-y-2">
              <p className="font-medium">2. Add your API keys to .env</p>
              <pre className="bg-zinc-950/50 p-4 rounded border border-zinc-800 overflow-x-auto">
                <code className="text-xs text-zinc-400">
{`FRED_API_KEY=your_fred_api_key_here
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
OPENAI_API_KEY=sk-your_openai_key_here
SECRET_KEY=your_django_secret_key_here`}
                </code>
              </pre>
            </div>

            <div className="space-y-2">
              <p className="font-medium">3. Restart the backend server</p>
              <pre className="bg-zinc-950/50 p-4 rounded border border-zinc-800 overflow-x-auto">
                <code className="text-xs text-zinc-400">
{`# Kill existing server
lsof -ti:8000 | xargs kill -9

# Start the server
python manage.py runserver`}
                </code>
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
