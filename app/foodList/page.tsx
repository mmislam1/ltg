
'use client'

import React, {useEffect, useState} from 'react'
import ListElement from './listElement'
import Meals from '../components/meals'
import RingChart from '../components/ringChart'
import { SearchCheck, SearchIcon } from 'lucide-react'
import { useAppSelector } from '../store/hooks'

const FoodList = () => {
  const foods = useAppSelector((state) => state.foods.list )
  const [filtered, setFiltered]=useState(foods)
  const [query,setQuery]=useState('')
  const handleQuery = (e: React.ChangeEvent<HTMLInputElement>)=>{
    setQuery(e.target.value)
    /*setFiltered(foods.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase())) */
  }
  const handleSearch = ()=>{

  }
  useEffect(() => {
    setFiltered(
      foods.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      )
    );
},[query])
  return (
    <div className='fc flex-col'>
        <div className="fc w-full flex-col p-4 bg-green-400">
          <h2 className="text-xl font-semibold mb-3"></h2>
          <div className="h-12 fc flex-row w-full bg-white rounded-full">
           <button className="fc m-2 ml-4" onClick={handleSearch}><SearchIcon /> </button> 
          <input className="h-12 w-full bg-white rounded-full p-4"  onChange={handleQuery}/>
          
          
          </div>
          <div className="fc flex-row">

          </div>
        </div>
        <ListElement selected={true}/>
        <ListElement selected={false} />
        <ListElement selected={true} />
      
      </div>
  )
}

export default FoodList