// Main Layout - Default layout for authenticated users
import React from 'react'
import { Header, Footer } from '../shared/components'

export const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
      <Footer />
    </div>
  )
}

export default MainLayout
