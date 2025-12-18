"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowRightIcon, BookOpenIcon, StarIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Link } from "next-view-transitions";
import Image from "next/image";
import HandDrawnArrow from "../svgs/HandDrawnArrow";
import Science from "../svgs/Science";
import Cap from "../svgs/Cap";

interface Testimonial {
  name: string;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    name: "John Doe",
    image: "/avatar/1.jpg",
  },
  {
    name: "John Doe",
    image: "/avatar/2.jpg",
  },
  {
    name: "John Doe",
    image: "/avatar/3.jpg",
  },
  {
    name: "John Doe",
    image: "/avatar/4.jpg",
  },
  {
    name: "John Doe",
    image: "/avatar/5.jpg",
  },
  {
    name: "John Doe",
    image: "/avatar/6.jpg",
  },
  {
    name: "John Doe",
    image: "/avatar/7.jpg",
  },
];

export default function HeroSection() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["smart", "fast", "efficient", "quick", "effective"],
    [],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full py-12">
      <div className="container mx-auto px-4">
        {/* Paper Card Container */}
        <div className="neuro-xl relative flex flex-col items-center justify-center gap-8 border-2 border-black bg-white p-8 py-16 md:p-16 lg:py-24">

          {/* Decorative Elements */}
          <Science className="absolute top-4 left-4 size-16 opacity-20 md:size-32 md:opacity-100" />
          <Cap className="absolute right-4 bottom-4 size-16 opacity-20 md:size-32 md:opacity-100" />

          {/* Badge */}
          <div>
            <div className="neuro-sm inline-flex items-center gap-2 px-4 py-2 text-sm font-bold">
              Now it is time to study{" "}
              <ArrowRightIcon weight="bold" className="size-4" />
            </div>
          </div>

          {/* Main Headline */}
          <div className="flex flex-col gap-6 text-center">
            <h1 className="font-ranade max-w-4xl text-5xl font-black tracking-tight text-black md:text-7xl lg:text-8xl">
              Your all-in-one <br className="hidden md:block" />
              <span className="relative inline-block">
                learning platform
                <HandDrawnArrow className="absolute -right-8 -bottom-8 size-12 rotate-12 md:-right-16 md:size-24" />
              </span>
            </h1>

            {/* Rotating Text */}
            <div className="font-excon flex h-16 items-center justify-center text-3xl font-bold text-black md:text-5xl">
              <span className="mr-3">is</span>
              <span className="relative flex h-full w-[200px] items-center text-left">
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute left-0 text-red-600 underline decoration-4 underline-offset-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={
                      titleNumber === index
                        ? { y: 0, opacity: 1 }
                        : { y: -20, opacity: 0 }
                    }
                    transition={{ duration: 0.5, ease: "circOut" }}
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </div>

            <p className="font-satoshi mx-auto max-w-2xl text-lg font-medium leading-relaxed text-gray-800 md:text-xl">
              Preparing for exams is already challenging enough. <br className="hidden md:block" />
              Avoid further complications by ditching outdated study methods.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/notes">
              <Button
                size="lg"
                className="neuro-button h-14 w-full text-lg sm:w-auto"
              >
                Visit Notes <BookOpenIcon weight="fill" className="ml-2 size-5" />
              </Button>
            </Link>
            <Link href="/premium">
              <Button
                size="lg"
                className="neuro-button-sm h-14 w-full border-2 border-black bg-white text-lg font-bold text-black hover:bg-gray-50 sm:w-auto"
              >
                Purchase Premium{" "}
                <StarIcon weight="fill" className="ml-2 size-5 text-yellow-500" />
              </Button>
            </Link>
          </div>

          {/* Testimonials */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="flex -space-x-4">
              {testimonials.map((testimonial, i) => (
                <div key={i} className="relative transition-transform hover:z-10 hover:scale-110">
                  <Image
                    src={testimonial.image}
                    alt="User"
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full border-2 border-black bg-gray-200"
                  />
                </div>
              ))}
            </div>
            <p className="font-excon text-sm font-bold text-black">
              Trusted by <span className="underline decoration-2">1000+ students</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

