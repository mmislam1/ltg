
'use client'

import React, {useEffect, useState} from 'react'
import ListElement from '../listElement'
import Meals from '../../components/meals'
import RingChart from '../../components/ringChart'
import { SearchCheck, SearchIcon } from 'lucide-react'
import { useAppSelector } from '../../store/hooks'
import { useParams } from 'next/navigation'

interface passedProps{
  type: string,
}

const FoodList = () => {
  const params=useParams()
  const charts=useAppSelector((state)=>state.activity.current.charts)
  const foods = useAppSelector((state) => state.foods.list )
  const [filtered, setFiltered]=useState(foods)
  const [query,setQuery]=useState('')

  const capitalize = (s: string | undefined) => {
    if (typeof s !== 'string' || s.length === 0) {
      return '';
    }
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const handleSubmit=()=>{

  }
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
},[query,foods])
  return (
    <div className='fc flex-col'>
        <div className="fc w-full flex-col p-4 bg-green-400">
          <h2 className="text-xl font-bold mb-3">{capitalize(params.type as string)}</h2>
          <div className="h-12 fc flex-row w-full bg-white rounded-full">
           <button className="fc m-2 ml-4" onClick={handleSearch}><SearchIcon /> </button> 
          <input className="h-12 w-full bg-white rounded-full p-4"  onChange={handleQuery}/>
          
          
          </div>
          <div className="fc flex-row">
            <button className="fc w-[25%] ">
              button 1
            </button>

          </div>
        </div>

        <div className="fc flex-col w-full px-3">
        {filtered.map((food,i) => { return <ListElement key={food.id} title={food.name} desc={`${food.nutrition.calories} cal`} border={i===0?false:true} selected={false}/>})}
        </div>
        
        
      <button
        onClick={handleSubmit}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 
                 bg-green-600 text-white w-77 md:max-w-2xl h-12 rounded-full 
                 shadow-xl hover:bg-green-500 transition duration-300 z-50 
                 flex items-center justify-center text-xl font-bold"
        aria-label="Add new item"
      >
        Done
      </button>
      </div>
  )
}

export default FoodList