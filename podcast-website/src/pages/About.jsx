import React from "react";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import {
  SparklesIcon,
  MicrophoneIcon,
  HeartIcon,
  AcademicCapIcon,
  GlobeIcon,
  BookOpenIcon,
  SpeakerphoneIcon
} from "@heroicons/react/outline";

function About() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const values = [
    {
      icon: <HeartIcon className="w-8 h-8 text-red-500" />,
      title: "Passion",
      description: "We pour our hearts into every episode, bringing you content that matters."
    },
    {
      icon: <AcademicCapIcon className="w-8 h-8 text-red-500" />,
      title: "Knowledge",
      description: "Committed to delivering well-researched, factual, and educational content."
    },
    {
      icon: <GlobeIcon className="w-8 h-8 text-red-500" />,
      title: "Diversity",
      description: "Celebrating diverse voices and perspectives from around the world."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 overflow-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-red-500/20 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
            }}
            animate={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              transition: {
                duration: Math.random() * 20 + 20,
                repeat: Infinity,
                ease: "linear"
              }
            }}
          />
        ))}
      </div>

      <Navbar />

      {/* Hero Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative px-4 pt-20 pb-12 mx-auto max-w-7xl"
      >
        <motion.div
          variants={itemVariants}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            About <span className="text-red-500">Facts Are Facts</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Facts Are Facts is a platform uncovering untold political stories, hidden chapters of history, 
            and perspectives often missing from mainstream narratives.
          </p>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-red-600/20 to-red-700/10 backdrop-blur-lg rounded-2xl p-8 mb-16 border border-red-500/20 shadow-lg shadow-red-500/10"
        >
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="p-3 bg-red-600/20 rounded-xl flex-shrink-0">
              <SpeakerphoneIcon className="w-12 h-12 text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <BookOpenIcon className="w-6 h-6 text-red-500" />
                Our Mission
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                Facts Are Facts is a platform uncovering untold political stories, hidden chapters of history, 
                and perspectives often missing from mainstream narratives. We are dedicated to bringing you 
                authentic, engaging, and thought-provoking content that informs, inspires, and connects.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Values Section */}
        <motion.div
          variants={itemVariants}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <SparklesIcon className="w-8 h-8 text-red-500" />
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-red-600/10 to-red-700/5 backdrop-blur-lg rounded-xl p-6 border border-red-500/20 hover:border-red-500/50 transition-all duration-300"
              >
                <div className="p-3 bg-red-600/20 rounded-xl inline-block mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-4">Join Our Community</h2>
          <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
            Be part of our growing community of listeners, thinkers, and storytellers.
            Together, we uncover the stories that matter.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <motion.a
              href="/contact"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Get in Touch
            </motion.a>
            <motion.a
              href="/"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              Explore Episodes
            </motion.a>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating elements */}
      <div className="fixed bottom-10 right-10 pointer-events-none z-50">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-4xl bg-red-600/20 backdrop-blur-lg p-3 rounded-full text-red-500"
        >
          📖
        </motion.div>
      </div>
    </div>
  );
}

export default About;