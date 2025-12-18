"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircleIcon,
  BrainIcon,
  LightningIcon,
} from "@phosphor-icons/react";

interface AnimatedTextCycleProps {
  words: string[];
  interval?: number;
  className?: string;
}

function AnimatedTextCycle({
  words,
  interval = 3000,
  className = "",
}: AnimatedTextCycleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, interval);

    return () => clearInterval(timer);
  }, [interval, words.length]);

  const containerVariants = {
    hidden: {
      y: -20,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
      },
    },
    exit: {
      y: 20,
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <span className="relative inline-block">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={currentIndex}
          className={`inline-block font-light ${className}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {words[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
}: FeatureCardProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        delay: delay,
      },
    },
  };

  return (
    <motion.div
      className="group relative"
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="neuro-lg h-full border-2 border-black bg-white p-8 transition-all duration-300 hover:translate-x-2 hover:translate-y-2 hover:shadow-none dark:border-white/20 dark:bg-zinc-900">
        <div className="relative z-10">
          <div className="neuro-sm mb-6 flex h-16 w-16 items-center justify-center border-2 border-black bg-white text-black transition-colors duration-300 dark:border-white/20 dark:bg-zinc-800 dark:text-white">
            {icon}
          </div>

          <h3 className="font-excon mb-3 text-2xl font-bold text-black dark:text-white">
            {title}
          </h3>

          <p className="font-satoshi text-lg leading-relaxed text-gray-800 dark:text-gray-300">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function About() {
  const features = [
    {
      icon: (
        <CheckCircleIcon weight="duotone" className="text-primary h-6 w-6" />
      ),
      title: "Clarity Over Complexity",
      description:
        "Simplifies concepts for deeper and better understanding. We break down complex topics into digestible chunks.",
    },
    {
      icon: <BrainIcon weight="duotone" className="text-primary h-6 w-6" />,
      title: "Answers at Your Fingertips",
      description:
        "Our AI answers your questions instantly, helping you learn faster. Get immediate support whenever you need clarification.",
    },
    {
      icon: <LightningIcon weight="duotone" className="text-primary h-6 w-6" />,
      title: "Fast and Efficient Learning",
      description:
        "Accelerates learning with quick, focused resources. Study smarter with optimized content and streamlined processes.",
    },
  ];

  const animatedWords = ["smarter", "faster", "better", "easier"];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
      },
    },
  };

  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      <div className="absolute inset-0" />

      <div className="relative z-10 container mx-auto">
        <motion.div
          className="mb-16 text-center md:mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2
            className="font-regular mx-auto mb-6 max-w-4xl text-center text-4xl leading-tight tracking-tighter md:text-5xl lg:text-6xl"
            variants={titleVariants}
          >
            <span className="font-excon font-black">Learn </span>
            <span className="font-ranade relative">
              <AnimatedTextCycle
                words={animatedWords}
                interval={3000}
                className="text-primary"
              />
            </span>
            <span className="font-excon font-black"> with Notes Pal</span>
          </motion.h2>

          <motion.p
            className="text-secondary font-satoshi mx-auto max-w-3xl text-center text-lg leading-relaxed tracking-tight md:text-xl"
            variants={titleVariants}
          >
            Transform your learning experience with our innovative platform
            designed for modern students. Preparing for exams is challenging
            enough - let us simplify the process.
          </motion.p>
        </motion.div>

        <motion.div
          className="line-clamp-3 grid grid-cols-1 gap-8 p-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.1}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
