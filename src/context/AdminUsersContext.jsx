import { createContext, useContext, useState } from 'react'
import { mockUsers } from '../mock/data'

const AdminUsersContext = createContext(null)

export function AdminUsersProvider({ children }) {
  const [users, setUsers] = useState(mockUsers)

  const toggleUserStatus = (id) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== id) return u
      return { ...u, status: u.status === 'active' ? 'suspended' : 'active' }
    }))
  }

  // Bulk verify all documents — ready to replace body with: await api.patch(`/hosts/${userId}/docs/verify-all`)
  const verifyAllDocs = (userId) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u
      return {
        ...u,
        documents: u.documents.map(d => ({ ...d, status: 'verified', rejectionReason: null })),
      }
    }))
  }

  // Bulk reject all documents with reason — ready to replace body with: await api.patch(`/hosts/${userId}/docs/reject-all`, { reason })
  const rejectAllDocs = (userId, reason) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u
      return {
        ...u,
        documents: u.documents.map(d => ({ ...d, status: 'rejected', rejectionReason: reason })),
      }
    }))
  }

  // Toggle physical verification — ready to replace body with: await api.patch(`/hosts/${userId}/physical-verification`)
  const togglePhysicalVerification = (userId) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u
      return { ...u, physicalVerified: !u.physicalVerified }
    }))
  }

  // Set Top Host badge — ready to replace body with: await api.patch(`/hosts/${userId}/badges`, { isTopHost: value })
  const setTopHost = (userId, value) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u
      return { ...u, isTopHost: value }
    }))
  }

  // Set Most Popular badge — ready to replace body with: await api.patch(`/hosts/${userId}/badges`, { isMostPopular: value })
  const setMostPopular = (userId, value) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u
      return { ...u, isMostPopular: value }
    }))
  }

  // Look up admin-managed badge flags by host name — API-ready: replace with GET /hosts?name=
  const getHostBadgesByName = (name) => {
    const user = users.find(u => u.role === 'host' && u.name === name)
    if (!user) return { physicalVerified: false, isTopHost: false, isMostPopular: false }
    return {
      physicalVerified: !!user.physicalVerified,
      isTopHost: !!user.isTopHost,
      isMostPopular: !!user.isMostPopular,
    }
  }

  const getOverallDocStatus = (user) => {
    if (!user.documents?.length) return null
    if (user.documents.every(d => d.status === 'verified')) return 'verified'
    if (user.documents.some(d => d.status === 'rejected')) return 'rejected'
    return 'pending'
  }

  return (
    <AdminUsersContext.Provider value={{
      users,
      toggleUserStatus,
      verifyAllDocs,
      rejectAllDocs,
      togglePhysicalVerification,
      setTopHost,
      setMostPopular,
      getHostBadgesByName,
      getOverallDocStatus,
    }}>
      {children}
    </AdminUsersContext.Provider>
  )
}

export const useAdminUsers = () => useContext(AdminUsersContext)
