
'use client'

import React, {useMemo, useState} from 'react'
import ListElement from '../listElement'
import { SearchIcon } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { useParams } from 'next/navigation'
import { Food } from '@/app/store/features/foodSlice'
import { addMeal } from '@/app/store/features/activitySlice'
import { useRouter } from 'next/navigation'

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
  const router=useRouter()
  const isMealType = (value: unknown): value is MealType =>
    typeof value === "string" &&
    ["Breakfast", "Lunch", "Dinner", "Snack"].includes(value);
  const params = useParams()
  const foods = useAppSelector((state) => state.foods.list )
  const dispatch = useAppDispatch()
  const [query,setQuery]=useState('')
  const [meal, setMeal] = useState<Meal>({ id: crypto.randomUUID(), mealType: isMealType(params.type)?params.type:undefined , list: [] })
  


  

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
    
    router.replace('/chart')
    setMeal({ id: crypto.randomUUID(), mealType: undefined, list: [] })
  }
  const handleQuery = (e: React.ChangeEvent<HTMLInputElement>)=>{
    setQuery(e.target.value)
  }
  const filtered = useMemo(
    () => foods.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    ),
    [foods, query],
  )

/*

useEffect(()=>{
    if(!meal.mealType){
      router.push('/addMeal')
    }
  },[meal.mealType])
  
  */

  return (
    <div className='fc flex-col'>
        <div className="fc w-full flex-col bg-brand px-4">
          <h2 className="my-2 text-xl font-bold text-on-brand">{capitalize(params.type as string)}</h2>
          <div className="relative mx-4 mb-4 w-full">
            <label className="sr-only" htmlFor="food-search">Search foods</label>
            <SearchIcon className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" size={20} aria-hidden="true" />
            <input
              id="food-search"
              name="food-search"
              type="search"
              className="form-control rounded-full pl-12"
              placeholder="Search foods"
              value={query}
              onChange={handleQuery}
            />
          </div>
        </div>


      <div className="fc w-full flex-row rounded-b-lg bg-brand">
        <button type="button" className="btn w-[25%] rounded-t-none rounded-br-none text-xs text-on-brand hover:bg-brand-soft hover:text-brand-active md:text-base">
          All
        </button>

        <button type="button" className="btn w-[25%] rounded-none text-xs text-on-brand hover:bg-brand-soft hover:text-brand-active md:text-base">
          Recipes
        </button>

        <button type="button" className="btn w-[25%] rounded-none text-xs text-on-brand hover:bg-brand-soft hover:text-brand-active md:text-base">
          Create 
        </button>

        <button type="button" className="btn w-[25%] rounded-t-none rounded-bl-none text-xs text-on-brand hover:bg-brand-soft hover:text-brand-active md:text-base">
          Favourites
        </button>

      </div>

        <div className="fc flex-col w-full px-3">
        {filtered.map((food,i) => { return <ListElement key={food.id} id={food.id} title={food.name} desc={`${food.nutrition.calories} cal`} border={i===0?false:true} selected={meal.list?.some((item)=>item.foodItem?.id===food.id)} addItem={addItem} removeItem={removeItem}/>})}
        </div>
        
        
      <button
        type="button"
        onClick={handleSubmit}
        className="btn btn-primary fixed bottom-18 left-1/2 z-50 w-77 -translate-x-1/2 rounded-full shadow-xl md:max-w-2xl"
      >
        Done
      </button>
      </div>
  )
}

export default FoodList
