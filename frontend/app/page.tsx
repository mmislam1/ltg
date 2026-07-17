"use client";

import Image from "next/image";
import Footer from "./components/footer";
import RoundedImage from "@/components/roundedImage";
import Navbar from "./components/navbar";
import Button from "@/components/button";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FaStar, FaRegStar } from "react-icons/fa"
import Icon from "@/components/icon";
import { useDeviceType } from "./hooks/useDeviceType";
import RingChart from "./components/ringChart";
import Meals from "./components/meals";
import FoodList from "./foodList/[type]/page";
import Water from "./components/water";
import NutritionChart from "./chart/page";
import NutritionDashboard from "./nutritionDashboard/page";
import BottomBar from "./components/botomBar";
import StepCounter from "./components/stepCounter";
import WeightUpdater from "./components/weightUpdater";

export default function Home() {

  const isMobile=useDeviceType()
  interface UserSay {
    rating: number;
    location: string;
    img: string;
    title: string;
    occupation: string;
    comment: string;
  }

  

  return (
    <div>
    <div className="w-full font-sans flex flex-col">
      {/*
      <Meals></Meals>
      <FoodList></FoodList>
      
      <NutritionChart/>
      
      */}
      <NutritionDashboard/>
      <Water></Water>
      <StepCounter />
      <WeightUpdater />
      <RingChart></RingChart>

    </div>
    
    </div>
  );
}
