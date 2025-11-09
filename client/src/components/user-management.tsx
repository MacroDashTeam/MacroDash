import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Shield, ShieldOff, Trash2, RefreshCw } from 'lucide-react'
import { Card } from './ui/card'
import { Button } from './ui/button'

const API_BASE = import.meta.env.VITE_API_BASE_URL

interface User {
  id: number
  username: string
  email: string
  is_admin: boolean
  date_joined: string
  last_login: string | null
}

interface UsersResponse {
  status: string
  users: User[]
}

async function fetchUsers(): Promise<UsersResponse> {
  const res = await fetch(`${API_BASE}/api/admin/users/`, {
    credentials: 'include'
  })
  if (!res.ok) throw new Error('Failed to fetch users')
  return await res.json()
}

async function toggleAdminStatus(userId: number, isAdmin: boolean): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/users/`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, is_admin: isAdmin })
  })
  if (!res.ok) throw new Error('Failed to update user')
}

async function deleteUser(userId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/users/`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId })
  })
  if (!res.ok) throw new Error('Failed to delete user')
}

export default function UserManagement() {
  const queryClient = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery<UsersResponse>({
    queryKey: ['admin-users'],
    queryFn: fetchUsers,
  })

  const toggleAdminMutation = useMutation({
    mutationFn: ({ userId, isAdmin }: { userId: number; isAdmin: boolean }) =>
      toggleAdminStatus(userId, isAdmin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })

  const handleToggleAdmin = (user: User) => {
    if (confirm(`${user.is_admin ? 'Remove admin privileges from' : 'Grant admin privileges to'} ${user.username}?`)) {
      toggleAdminMutation.mutate({ userId: user.id, isAdmin: !user.is_admin })
    }
  }

  const handleDeleteUser = (user: User) => {
    if (confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
      deleteUserMutation.mutate(user.id)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading users...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 border-zinc-800 bg-zinc-900/50">
          <p className="text-red-400">Failed to load users. You may not have admin privileges.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 pt-12 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            User Management
          </h1>
          <p className="text-zinc-400 mt-2">
            Manage user accounts and admin privileges
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="border-zinc-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Total Users</p>
              <p className="text-2xl font-bold">{data?.users.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Shield className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Admins</p>
              <p className="text-2xl font-bold">
                {data?.users.filter(u => u.is_admin).length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6 border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Users className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Regular Users</p>
              <p className="text-2xl font-bold">
                {data?.users.filter(u => !u.is_admin).length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="p-6 border-zinc-800 bg-zinc-900/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-zinc-400 font-semibold">Username</th>
                <th className="text-left py-3 px-4 text-zinc-400 font-semibold">Email</th>
                <th className="text-left py-3 px-4 text-zinc-400 font-semibold">Role</th>
                <th className="text-left py-3 px-4 text-zinc-400 font-semibold">Joined</th>
                <th className="text-left py-3 px-4 text-zinc-400 font-semibold">Last Login</th>
                <th className="text-right py-3 px-4 text-zinc-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.users.map((user) => (
                <tr key={user.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="py-4 px-4">
                    <span className="font-medium">{user.username}</span>
                  </td>
                  <td className="py-4 px-4 text-zinc-400">{user.email}</td>
                  <td className="py-4 px-4">
                    {user.is_admin ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 rounded-md text-sm">
                        <Shield className="w-3 h-3" />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-700/50 text-zinc-400 rounded-md text-sm">
                        <ShieldOff className="w-3 h-3" />
                        User
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-zinc-400 text-sm">
                    {new Date(user.date_joined).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4 text-zinc-400 text-sm">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleAdmin(user)}
                        disabled={toggleAdminMutation.isPending}
                        className={`border-zinc-700 ${
                          user.is_admin
                            ? 'hover:border-orange-500 hover:text-orange-500'
                            : 'hover:border-purple-500 hover:text-purple-500'
                        }`}
                      >
                        {user.is_admin ? (
                          <>
                            <ShieldOff className="w-3 h-3 mr-1" />
                            Remove Admin
                          </>
                        ) : (
                          <>
                            <Shield className="w-3 h-3 mr-1" />
                            Make Admin
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteUser(user)}
                        disabled={deleteUserMutation.isPending}
                        className="border-zinc-700 hover:border-red-500 hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data?.users.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
              <p className="text-zinc-400">No users found</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
