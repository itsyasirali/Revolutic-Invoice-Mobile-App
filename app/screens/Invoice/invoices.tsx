import React from 'react'
import SidebarLayout from '../../components/layout/sidebar'
import InvoiceList from '../../components/invoices/InvoiceList'

type Props = Record<string, never>

const Invoices = (props: Props) => {
  return (
    <SidebarLayout subtitle='Invoices'>
      <InvoiceList />
    </SidebarLayout>
  )
}

export default Invoices
