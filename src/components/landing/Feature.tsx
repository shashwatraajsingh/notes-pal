"use client";

import {
  BookOpenIcon,
  LightningIcon,
  BrainIcon,
  ClockIcon,
  MedalIcon,
  ChatCenteredDotsIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import React from "react";
import Image from "next/image";

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

const features = [
  {
    icon: <BookOpenIcon weight="duotone" className="h-6 w-6" />,
    title: "Comprehensive Notes",
    description:
      "Concise, well-structured notes that simplify complex concepts for better understanding.",
  },
  {
    icon: <LightningIcon weight="duotone" className="h-6 w-6" />,
    title: "Quick One-Shots",
    description:
      "Rapid review materials for last-minute preparation and key concept reinforcement.",
  },
  {
    icon: <BrainIcon weight="duotone" className="h-6 w-6" />,
    title: "Interactive Flashcards",
    description:
      "Effective memory tools to master terminology and key concepts through active recall.",
  },
  {
    icon: <ClockIcon weight="duotone" className="h-6 w-6" />,
    title: "Practice Quizzes",
    description:
      "Self-assessment tools to test your knowledge and identify areas for improvement.",
  },
  {
    icon: <MedalIcon weight="duotone" className="h-6 w-6" />,
    title: "Topper Notes",
    description:
      "Access handwritten notes from top-performing students to understand winning strategies.",
  },
  {
    icon: <ChatCenteredDotsIcon weight="duotone" className="h-6 w-6" />,
    title: "AI Study Assistant",
    description:
      "Get instant answers to your questions with our intelligent AI chatbot (coming soon).",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export default function Features() {
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
          <h2 className="font-regular font-excon relative mx-auto mb-6 max-w-4xl text-center text-4xl leading-tight font-black tracking-tighter md:text-5xl lg:text-6xl">
            Features of Notes Pal
            <Image
              width={50}
              height={50}
              src="/doodles/quiz.svg"
              alt="Notes Pal"
              className="absolute -top-16 left-0 size-16 md:-top-20 md:size-28"
            />
          </h2>
          <p className="text-secondary font-satoshi mx-auto max-w-3xl text-center text-lg leading-relaxed tracking-tight md:text-xl">
            Everything you need to excel in your studies, all in one place
          </p>
        </motion.div>
        <motion.div
          className="mx-4 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-12"
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
