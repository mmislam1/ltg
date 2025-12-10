import React from 'react'
import ListElement from './listElement'
import Meals from '../components/meals'
import RingChart from '../components/ringChart'

const FoodList = () => {

  return (
      <div>
        <ListElement selected={true}/>
        <ListElement selected={false} />
        <ListElement selected={true} />
      
      </div>
  )
}

export default FoodList