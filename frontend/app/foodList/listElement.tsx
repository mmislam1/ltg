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
    <div className={`flex h-20 w-full flex-row items-center justify-between p-2 ${border===true?'border-t border-line':''}`}>
      <div className={`h-full flex flex-col md:flex-row md:ml-4 p-2 items-start max-w-[80%] md:items-center md:w-[55%] md:justify-between justify-center `}>
        <div className=" text-md md:text-xl font-semibold truncate" style={{ maxWidth: '100%' }}>{title}</div>
        <div className="truncate text-sm text-muted md:text-lg" style={{ maxWidth: '100%' }}>{desc}</div>
      </div>
      <button type="button" className={`btn btn-icon mr-2 md:mr-8 ${selected===false?'btn-secondary':'btn-primary'}`} onClick={selectHandler} aria-label={selected ? `Remove ${title}` : `Add ${title}`} aria-pressed={selected}>
        {
          selected===false?<Plus/>:<CheckIcon/>
        }
      </button>
    </div>
  );
};

export default ListElement;
