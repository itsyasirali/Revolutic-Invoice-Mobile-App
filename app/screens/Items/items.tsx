import React from 'react'
import SidebarLayout from '../../components/layout/sidebar'
import ItemList from '../../components/items/ItemList'

type Props = Record<string, never>

const Items = (props: Props) => {
  return (
    <SidebarLayout subtitle='Items'>
      <ItemList />
    </SidebarLayout>
  )
}

export default Items
