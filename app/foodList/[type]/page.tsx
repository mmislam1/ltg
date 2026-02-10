
'use client'

import React, {useEffect, useState} from 'react'
import ListElement from '../listElement'
import Meals from '../../components/meals'
import RingChart from '../../components/ringChart'
import { SearchCheck, SearchIcon } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { useParams } from 'next/navigation'
import { Food } from '@/app/store/features/foodSlice'
import { addMeal } from '@/app/store/features/activitySlice'

interface passedProps{
  type: "Breakfast" | "Lunch" | "Dinner" | "Snack" | undefined,
}
export interface ListItems {
  foodItem: Food | undefined;
  quantity: number;
}
type MealType= "Breakfast" | "Lunch" | "Dinner" | "Snack" | undefined;
export interface Meal {
  id: string;
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack" | undefined;
  list: ListItems[] | [];
}
const FoodList = () => {
  
  const isMealType = (value: unknown): value is MealType =>
    typeof value === "string" &&
    ["Breakfast", "Lunch", "Dinner", "Snack"].includes(value);
  const params = useParams()
  const charts=useAppSelector((state)=>state.activity.current.chart)
  const foods = useAppSelector((state) => state.foods.list )
  const dispatch = useAppDispatch()
  const [filtered, setFiltered]=useState(foods)
  const [query,setQuery]=useState('')
  const [meal, setMeal] = useState<Meal>({ id: crypto.randomUUID(), mealType: isMealType(params.type)?params.type:"Breakfast", list: [] })
  


  

  const capitalize = (s: string | undefined) => {
    if (typeof s !== 'string' || s.length === 0) {
      return '';
    }
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const addItem=(id:string)=>{
    if (foods.some((item) => item.id===id)){
      setMeal({...meal,list:[...meal.list,{foodItem:foods.find((item) => { return item.id===id}), quantity: 1}]})
      }
  }
  const removeItem=(id: string) => {
    if (meal.list?.some((item) => item.foodItem?.id === id)) {
      setMeal({...meal, list: meal.list?.filter((item) => { return item.foodItem?.id !== id })})
    }
  }

  const handleSubmit=()=>{
    dispatch(addMeal(meal))
    setMeal({ id: crypto.randomUUID(), mealType: isMealType(params.type) ? params.type : "Breakfast", list: [] })
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

console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',charts.meals)
  return (
    <div className='fc flex-col'>
        <div className="fc w-full px-4 flex-col bg-green-700">
          <h2 className="text-xl text-white font-bold my-2">{capitalize(params.type as string)}</h2>
          <div className="h-12 fc flex-row w-full bg-white rounded-full mb-4 mx-4">
           <button className="fc m-2 ml-4" onClick={handleSearch}><SearchIcon /> </button> 
          <input className="h-12 w-full bg-white rounded-full p-4"  onChange={handleQuery}/>
          
          
          </div>
        
        </div>


      <div className="fc flex-row w-full bg-green-700 rounded-b-lg">
        <button className="fc w-[25%] text-white text-xs md:text-lg font-semibold active:bg-green-400 hover:bg-green-400 hover:text-black p-1 rounded-bl-lg">
          All
        </button>

        <button className="fc w-[25%] text-white text-xs md:text-lg font-semibold active:bg-green-400 hover:bg-green-400 hover:text-black p-1">
          Recipes
        </button>

        <button className="fc w-[25%] text-white text-xs md:text-lg font-semibold active:bg-green-400 hover:bg-green-400 hover:text-black p-1">
          Create 
        </button>

        <button className="fc w-[25%] text-white text-xs md:text-lg font-semibold active:bg-green-400 hover:bg-green-400 hover:text-black p-1 rounded-br-lg">
          Favourites
        </button>

      </div>

        <div className="fc flex-col w-full px-3">
        {filtered.map((food,i) => { return <ListElement key={food.id} id={food.id} title={food.name} desc={`${food.nutrition.calories} cal`} border={i===0?false:true} selected={meal.list?.some((item)=>item.foodItem?.id===food.id)} addItem={addItem} removeItem={removeItem}/>})}
        </div>
        
        
      <button
        onClick={handleSubmit}
        className="fixed bottom-25 left-1/2 -translate-x-1/2 
                 bg-green-600 text-white w-77 md:max-w-2xl h-11 rounded-full 
                 shadow-xl hover:bg-green-500 transition duration-300 z-50 
                 flex items-center justify-center text-lg font-bold"
        aria-label="Add new item"
      >
        Done
      </button>
      </div>
  )
}

export default FoodList