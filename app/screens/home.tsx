import React from 'react'
import SidebarLayout from '../components/layout/sidebar'
import Dashboard from '../components/home/Dashboard'

const Home = () => {
  return (
    <SidebarLayout subtitle='Dashboard'>
      <Dashboard />
    </SidebarLayout>
  )
}

export default Home