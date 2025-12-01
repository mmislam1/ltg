import React from 'react'
import ListElement from './listElement'
import Meals from '../components/meals'
import RingChart from '../components/ringChart'

const List = () => {

  return (
      <div><ListElement />
      <RingChart/>
      <Meals/>
      </div>
  )
}

export default List