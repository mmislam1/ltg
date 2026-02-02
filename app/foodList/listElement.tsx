'use client'
import { CheckCheckIcon, CheckIcon, Plus } from "lucide-react";
import React, { useState,useEffect } from "react";

interface ListElementProps {
  removeItem : (id:string)=>void,
  id: string,
  addItem: (id:string)=>void,
  title?: string,
  desc?: string,
  border?: boolean,
  selected?: boolean,
}

const ListElement: React.FC<ListElementProps> = ({ removeItem,addItem, selected, id, title='Title not available', desc='Description not available', border=true}) => {

  const [itemSelected, setItemSelected]=useState<boolean>(false)

  const selectHandler=()=>{
    
    if(!selected){ 
      addItem(id)
    //setItemSelected(true)
    }
    else{
      removeItem(id)
      //setItemSelected(false)

    }
   }

  /*useEffect(() => {
    setItemSelected(selected);
  }, [selected]);*/


  return (
    <div className={`flex w-full flex-row justify-between items-center h-20  p-2 ${border===true?'border-t border-gray-300':''}`}>
      <div className={`h-full flex flex-col md:flex-row md:ml-4 p-2 items-start md:items-center md:w-[55%] md:justify-between justify-center `}>
        <div className="fc text-md md:text-xl font-semibold ">{title}</div>
        <div className="fc text-sm md:text-lg text-gray-500 ">{desc}</div>
      </div>
      <button className={`fc h-10 w-10 mr-2 md:mr-8 rounded-full transition-all duration-500 ease-in-out ${selected===false?'bg-gray-300':'bg-green-400'} `} onClick={selectHandler}>
        {
          selected===false?<Plus/>:<CheckIcon color='#fff'/>
        }
      </button>
    </div>
  );
};

export default ListElement;
