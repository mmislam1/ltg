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
    <div className="w-full font-sans flex flex-col p-8 bg-green-500">
      
      <h1 className="font-semibold text-8xl">Wasdjfhsikdf</h1>
    </div>
  );
}
