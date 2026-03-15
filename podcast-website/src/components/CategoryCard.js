import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function CategoryCard({ category }) {
  const slugify = (text) =>
    text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="relative group rounded-2xl overflow-hidden h-[400px] cursor-pointer"
    >
      <Link to={`/category/${category.slug || slugify(category.name)}`} className="block h-full">
        <div className="absolute inset-0">
          <img
            src={category.image || "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&auto=format"}
            alt={`${category.name} background`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-red-900 via-red-900/80 to-transparent group-hover:from-red-800 group-hover:via-red-800/80 transition-all duration-300"></div>
        </div>

        <div className="relative h-full flex flex-col justify-end p-6 z-10">
          <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">{category.name}</h3>
          <p className="text-gray-200 mb-4 drop-shadow-md text-lg">{category.description}</p>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-red-600/80 backdrop-blur-sm rounded-full text-sm text-white border border-red-500/30">
              {category.episodeCount} Episodes
            </span>
            <motion.div initial={{ opacity: 0, x: -10 }} whileHover={{ opacity: 1, x: 0 }} className="text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default CategoryCard;