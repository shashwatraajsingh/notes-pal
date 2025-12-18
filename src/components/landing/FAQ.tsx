"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CaretDownIcon } from "@phosphor-icons/react";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  delay?: number;
}

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
  delay = 0,
}: FAQItemProps) {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: delay,
      },
    },
  };

  const contentVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
      height: "auto",
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeInOut" as const,
      },
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut" as const,
      },
    },
  };

  return (
    <motion.div
      className="neuro-sm mb-4 overflow-hidden border-2 border-black bg-white dark:border-white/20 dark:bg-zinc-900"
      variants={itemVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-gray-50 hover:cursor-pointer dark:hover:bg-zinc-800"
      >
        <h3 className="font-excon text-lg font-bold text-black dark:text-white">
          {question}
        </h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <CaretDownIcon className="h-5 w-5 text-black dark:text-white" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="overflow-hidden"
          >
            <div className="border-t-2 border-black px-6 pt-4 pb-6 dark:border-white/20">
              <p className="font-satoshi text-lg leading-relaxed text-gray-800 dark:text-gray-300">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const faqData = [
  {
    question: "How do I access the notes and study materials?",
    answer:
      "Simply sign up for a free account and browse our comprehensive collection of notes. Premium users get access to additional features like topper notes, practice quizzes, and interactive flashcards.",
  },
  {
    question: "Are the notes updated regularly?",
    answer:
      "Yes, our content team regularly updates notes to match current curriculum standards and exam patterns.",
  },
  {
    question: "Can I download the notes for offline study?",
    answer: "No, currently, notes are available for online viewing.",
  },
  {
    question: "How accurate are the practice quizzes?",
    answer:
      "Our practice quizzes are carefully crafted by subject matter experts and are regularly updated to reflect current exam patterns.",
  },
  {
    question: "Is Premium refundable?",
    answer: "No, Premium is not refundable.",
  },
  {
    question: "How can I get help if I have questions about the content?",
    answer:
      "You can reach out to our support team through the report button on the top right corner of the page under the user profile.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
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

export default function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index],
    );
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
            className="font-regular font-excon mx-auto mb-6 max-w-4xl text-center text-4xl leading-tight font-black tracking-tighter md:text-5xl lg:text-6xl"
            variants={titleVariants}
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            className="text-secondary font-satoshi mx-auto max-w-3xl text-center text-lg leading-relaxed tracking-tight md:text-xl"
            variants={titleVariants}
          >
            Everything you need to know about Notes Pal
          </motion.p>
        </motion.div>

        <motion.div
          className="mx-auto max-w-4xl space-y-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {faqData.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openItems.includes(index)}
              onToggle={() => toggleItem(index)}
              delay={index * 0.1}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
