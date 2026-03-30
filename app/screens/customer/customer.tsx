import React from 'react'
import SidebarLayout from '../../components/layout/sidebar'
import CustomerList from '../../components/customers/customers'

type Props = {}

const Customer = (props: Props) => {
  return (
    <SidebarLayout subtitle='Customers'>
      <CustomerList />
    </SidebarLayout>
  )
}

export default Customer