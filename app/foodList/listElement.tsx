import { CheckCheckIcon, CheckIcon, Plus } from "lucide-react";
import React from "react";

interface ListElementProps {
  selected?: boolean;
  title?: string,
  desc?: string,
  border?: boolean,
}

const ListElement: React.FC<ListElementProps> = ({ selected = false , title='Title not available', desc='Description not available', border=true}) => {
  return (
    <div className={`flex flex-row justify-between items-center h-20  p-2 ${border===true?'border-b border-gray-300':''}`}>
      <div className={`h-full flex flex-col md:flex-row md:ml-4 p-2 items-start md:items-center md:w-[55%] md:justify-between justify-center `}>
        <div className="fc text-md font-semibold ">{title}</div>
        <div className="fc text-sm text-gray-500 ">{desc}</div>
      </div>
      <div className={`fc h-12 w-12 mr-2 md:mr-8 rounded-full ${selected===false?'bg-gray-300':'bg-green-400'} `}>
        {
          selected===false?<Plus/>:<CheckIcon color='#fff'/>
        }
      </div>
    </div>
  );
};

export default ListElement;
