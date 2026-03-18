import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import API from "../services/api";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const menuItems = [{ name: "Home", path: "/" }, ...categories.map(cat => ({ name: cat.name, path: `/category/${cat.slug}` }))];

  return (
    <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 100, damping: 20 }} className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🎙️</span>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-stone-300 to-red-600">
                FACTS ARE FACTS
              </span>
            </Link>
          </motion.div>

          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item, index) => (
              <motion.div key={item.name} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ y: -2 }}>
                <Link to={item.path} className="text-gray-300 hover:text-white transition-colors relative group">
                  {item.name}
                  <motion.div initial={{ width: 0 }} whileHover={{ width: "100%" }} className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500" />
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="md:hidden">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white">
              {isOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>

        <motion.div initial={false} animate={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="md:hidden overflow-hidden">
          <div className="py-4 space-y-2">
            {menuItems.map((item, index) => (
              <motion.div key={item.name} initial={{ x: -20, opacity: 0 }} animate={isOpen ? { x: 0, opacity: 1 } : {}} transition={{ delay: index * 0.1 }}>
                <Link to={item.path} onClick={() => setIsOpen(false)} className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  {item.name}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
}

export default Navbar;