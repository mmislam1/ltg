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

  const userSay: UserSay[] = [
    {
      rating: 5,
      location: "AutoPartsBD",
      img: "/Ellipse 7.png",
      title: "Freddie Deckow",
      occupation: "HR of AutoPartsBD",
      comment: "TruckTrack made our deliveries faster and more transparent!",
    },
    {
      rating: 4,
      location: "Baridhara",
      img: "/Ellipse 7.png",
      title: "Rahim ",
      occupation: "Customers",
      comment: "Customers are happier with real-time updates",
    },
    {
      rating: 3,
      location: "Dhaka",
      img: "/Ellipse 7.png",
      title: "Karim ",
      occupation: "Driver",
      comment: "Drivers love the live tracking and easy payment system!",
    },
  ];

  return (
    <div className="w-full bg-white font-sans flex flex-col min-h-screen pb-8">
      
      <main className="w-full flex flex-col items-center justify-start self-start ">
        <div className="flex flex-col md:flex-row justify-between gap-[75px] w-full h-[495px] bg-[#333333] md:px-[150px] pt-[32px] pb-[50px]">
          <div className="pt-10 pl-6 md:pr-20">
            <p className="title1 text-white">Simplify Your Parts Delivery </p>
            <p className="title1 text-[#C59325]">-Track, Manage, Deliver</p>
            <div className="flex flex-col items-start justify-start mt-10 md:mt-45 mr-6">
              <div className="flex flex-row items-center justify-between h-[60px] w-full md:w-[350px]">
                <Button size={60} text="Get Started" className="text1 px-10" />
                <a href="https/youtube.com" className="">
                  <h3 className=" text1 text-[#ffffff]">Watch Demo</h3>
                </a>
              </div>
            </div>
          </div>
          {isMobile==='d' && (<div className="">
            <RoundedImage
              src="/driver2.png"
              curvature={80}
              side="left"
              height={542}
              width={385}
            />
          </div>)}
        </div>

        <div className="flex w-full flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <div className="flex gap-4 m-10">
              <p className="title1 text-black">How it </p>
              <p className="title1 text-[#ddaa33]">Works</p>
            </div>
            <p className="text1 px-4 md:px-70">
              Order your truck parts, request a delivery, and get them at your
              doorstep - fast, reliable, and hassle-free
            </p>
          </div>
          <div className="flex  flex-col md:flex-row items-center justify-between px-[150px] m-10 flex-[1fr-1fr-1fr] md:h-[350px] gap-6  w-full ">
            <div className="flex flex-col h-full min-w-[350px] rounded-[10%] overflow-hidden shadow-xl">
              <div className="flex h-[35%] w-full bg-[#ddaa3344] items-center justify-center py-4">
                <Image
                  src={"/customerVector.png"}
                  alt={"customer Vector"}
                  width={72}
                  height={72}
                ></Image>
              </div>
              <div className="flex flex-col items-center justify-center flex-wrap">
                <h2 className="m-4 mb-6 font-semibold text-2xl">Customer</h2>
                <div className="flex flex-col justify-start items-start">
                  <ul className="list-disc marker:text-yellow-500 space-y-3 pb-8">
                    <li className="text-sm">
                      Order parts from a connected company
                    </li>
                    <li className="text-sm">
                      Submit delivery request with order ID
                    </li>
                    <li className="text-sm">
                      Track delivery live and get notifications
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex flex-col h-full min-w-[350px] rounded-[10%] overflow-hidden shadow-xl">
              <div className="flex h-[35%] w-full bg-[#ddaa3344] items-center justify-center py-4">
                <Image
                  src={"/driverVector.png"}
                  alt={"company Vector"}
                  width={72}
                  height={72}
                ></Image>
              </div>
              <div className="flex flex-col items-center justify-center">
                <h2 className="m-4 mb-6 font-semibold text-2xl">Driver</h2>
                <div className="flex flex-col justify-start items-start">
                  <ul className="list-disc marker:text-yellow-500 space-y-3 pb-8">
                    <li className="text-sm">
                      Accept delivery task from company.
                    </li>
                    <li className="text-sm">
                      Collect parts and follow delivery route
                    </li>
                    <li className="text-sm">
                      Update delivery status; get paid delivery
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex flex-col h-full min-w-[350px] rounded-[10%] overflow-hidden shadow-xl">
              <div className="flex h-[35%] w-full bg-[#ddaa3344] items-center justify-center py-4">
                <Image
                  src={"/companyVector.png"}
                  alt={"Company Vector"}
                  width={72}
                  height={72}
                ></Image>
              </div>
              <div className="flex flex-col items-center justify-center">
                <h2 className="m-4 mb-6 font-semibold text-2xl">Company</h2>
                <div className="flex flex-col justify-start items-start">
                  <ul className="list-disc marker:text-yellow-500 space-y-3 pb-8">
                    <li className="text-sm">
                      Receive customer delivery requests
                    </li>
                    <li className="text-sm">
                      Assign drivers and monitor progress
                    </li>
                    <li className="text-sm">
                      Access reports, analytics for all deliveries
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <Button
              text={"Join Now"}
              onClick={() => redirect("/auth/signup")}
              className="w-full md:w-[200px]"
            ></Button>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center bg-[#ddaa3344] w-full p-4 m-6">
          <div className="flex flex-row items-center justify-center gap-2 mt-4">
            <h1 className="text-4xl font-semibold">Key</h1>
            <h1 className="text-4xl text-[#ddaa33ff]  font-semibold">
              Features
            </h1>
          </div>
          <div className="flex flex-col justify-center items-center m-6 md:w-[40%]">
            <p className="text-2xl flex flex-col justify-center items-center">
              From order placement to successful delivery - everything managed
              in one smart platform
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 items-center justify-center py-4">
            <div className="flex flex-col items-center justify-start p-4 bg-white h-[227px] w-[354px] rounded-[100px] shadow-2xl">
              <div className="flex flex-col p-2 items-center justify-center w-full">
                <Image
                  src={"/kf1.png"}
                  alt={"Company Vector"}
                  width={50}
                  height={50}
                ></Image>
              </div>
              <div className="flex flex-row items-center justify-center gap-2 ">
                <h1 className="text-2xl font-semibold">Easy Order Placement</h1>
              </div>
              <div className="flex flex-col justify-center items-center m-2 w-full">
                <p className="text-lg flex flex-col justify-center items-center">
                  Customers can quickly submit delivery requests using the order
                  number{" "}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-start p-4 bg-white h-[227px] w-[354px] rounded-3xl shadow-2xl">
              <div className="flex flex-col p-2 items-center justify-center w-full">
                <Image
                  src={"/kf2.png"}
                  alt={"Company Vector"}
                  width={50}
                  height={50}
                ></Image>
              </div>
              <div className="flex flex-row items-center justify-center gap-2 ">
                <h1 className="text-2xl font-semibold">Real-Time Tracking</h1>
              </div>
              <div className="flex flex-col justify-center items-center m-2 w-full">
                <p className="text-lg flex flex-col justify-center items-center">
                  Customers and companies can track orders live with location
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-start p-4 bg-white h-[227px] w-[354px] rounded-[100px] shadow-2xl">
              <div className="flex flex-col p-2 items-center justify-center w-full">
                <Image
                  src={"/kf3.png"}
                  alt={"Company Vector"}
                  width={50}
                  height={50}
                ></Image>
              </div>
              <div className="flex flex-row items-center justify-center gap-2 ">
                <h1 className="text-2xl font-semibold">Driver Tools </h1>
              </div>
              <div className="flex flex-col justify-center items-center m-2 w-full">
                <p className="text-lg flex flex-col justify-center items-center">
                  Drivers get assigned jobs, see optimized routes, update status
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-start p-4 bg-white h-[227px] w-[354px] rounded-3xl shadow-2xl">
              <div className="flex flex-col p-2 items-center justify-center w-full">
                <Image
                  src={"/kf4.png"}
                  alt={"Company Vector"}
                  width={50}
                  height={50}
                ></Image>
              </div>
              <div className="flex flex-row items-center justify-center gap-2 ">
                <h1 className="text-2xl font-semibold">Company Dashboard</h1>
              </div>
              <div className="flex flex-col justify-center items-center m-2 w-full">
                <p className="text-lg flex flex-col justify-center items-center">
                  Companies manage all their deliveries, check driver activities
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-start p-4 bg-white h-[227px] w-[354px] rounded-[100px] shadow-2xl">
              <div className="flex flex-col p-2 items-center justify-center w-full">
                <Image
                  src={"/kf5.png"}
                  alt={"Company Vector"}
                  width={50}
                  height={50}
                ></Image>
              </div>
              <div className="flex flex-row items-center justify-center gap-2 ">
                <h1 className="text-2xl font-semibold">
                  Notifications & Alerts
                </h1>
              </div>
              <div className="flex flex-col justify-center items-center m-2 w-full">
                <p className="text-lg flex flex-col justify-center items-center">
                  Customers, drivers, and companies receive instant
                  notifications
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-start p-4 bg-white h-[227px] w-[354px] rounded-3xl shadow-2xl">
              <div className="flex flex-col p-2 items-center justify-center w-full">
                <Image
                  src={"/kf6.png"}
                  alt={"Company Vector"}
                  width={50}
                  height={50}
                ></Image>
              </div>
              <div className="flex flex-row items-center justify-center gap-2 ">
                <h1 className="text-2xl font-semibold">Secure Payments </h1>
              </div>
              <div className="flex flex-col justify-center items-center m-2 w-full">
                <p className="text-lg flex flex-col justify-center items-center">
                  Companies manage payments while drivers after completing jobs.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <Button
              text={"Watch Demo"}
              onClick={() =>
                window.open(
                  "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                  "_blank"
                )
              }
              className="w-full md:w-[200px] m-6"
            ></Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center justify-center w-[full]">
          {userSay.map((card,ii) => {
            return (
              <div key={ii} className="flex items-center justify-center p-4 py-6 bg-white shadow-2xl rounded-xl w-[360px] h-[415px]">
                <div className="flex flex-col items-center justify-start w-full h-full">
                  <div className="flex flex-row items-center justify-between w-full">
                    <div className="flex flex-row">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i}><Icon icon={i>=card.rating?FaRegStar:FaStar} className={'text-yellow-400 h-[13px]'} ></Icon></span>
                      ))}
                    </div>
                    <div className="flex flex-row"><p className="text-md">{card.location}</p></div>
                  </div>
                  <div className="flex items-center justify-between overflow-hidden h-[220px] ">
                    <Image
                      src={card.img}
                      alt={"Company Vector"}
                      width={250}
                      height={250}
                    ></Image>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex flex-col items-center justify-center gap-2 ">
                      <h1 className="text-2xl font-semibold">
                        {card.title}
                      </h1>
                      <h4 className="text-md text-gray-600">{card.occupation}</h4>
                    </div>
                    <div className="flex flex-col justify-center items-center m-2 w-full">
                      <p className="text-md flex flex-col justify-center items-center">
                        {card.comment}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      
    </div>
  );
}
