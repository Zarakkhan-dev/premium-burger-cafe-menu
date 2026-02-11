"use client";

import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string; // category name (e.g., "Burger")
  categoryId: string; // keep for potential filtering
  image: string;
  calories?: string;
}

interface ApiProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  calories: string;
  category: {
    _id: string;
    name: string;
  };
  image: string;
  // other fields ignored
}

export function Menu() {
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get<ApiProduct[]>("/api/menu");

        // Map API response to MenuItem format
        const mappedItems: MenuItem[] = response.data.map((item) => ({
          id: item._id,
          name: item.name,
          description: item.description,
          // Convert price from cents to dollars (if your API uses smallest unit)
          price: item.price / 100, // adjust if your price is already in dollars
          category: item.category.name,
          categoryId: item.category._id,
          // Use placeholder if no image
          image:
            item.image ||
            "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=400&fit=crop",
          calories: item.calories ? `${item.calories}kcal` : undefined,
        }));

        setProducts(mappedItems);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load menu. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Group products by category name
  const groupedProducts = products.reduce<Record<string, MenuItem[]>>(
    (acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    },
    {},
  );

  // Get sorted category names (you can sort alphabetically or by custom order)
  const categories = Object.keys(groupedProducts).sort();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#4a6741] pt-48 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-white text-xl">Loading menu...</div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#4a6741] pt-48 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-red-300 text-xl">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#4a6741] pt-48 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {categories.length === 0 ? (
          <div className="text-center text-white text-xl">
            No products found
          </div>
        ) : (
          categories.map((category, index) => {
            const items = groupedProducts[category];
            return (
              <section
                key={category}
                className="mb-16 animate-fade-in"
                style={{
                  animationDelay: `${index * 0.2}s`,
                }}
              >
                <h2 className="text-white text-2xl font-light tracking-wide mb-2">
                  {category}
                </h2>
                <div className="h-px bg-white/30 mb-8"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {items.map((item, itemIndex) => (
                    <div
                      key={item.id}
                      className="group cursor-pointer transition-all duration-300 hover:transform hover:scale-105"
                      style={{
                        animation: `fadeInUp 0.8s ease-out forwards`,
                        animationDelay: `${index * 0.2 + itemIndex * 0.15}s`,
                      }}
                    >
                      {/* Image */}
                      <div className="relative h-56 md:h-64 mb-4 overflow-hidden rounded-lg shadow-lg">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                      </div>

                      {/* Content */}
                      <div className="space-y-3 p-2">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="text-white text-lg font-light leading-tight flex-1">
                            {item.name}
                          </h3>
                          <span className="text-white/90 text-base font-light whitespace-nowrap ml-2 pt-1">
                            ${item.price.toFixed(2)}
                          </span>
                        </div>

                        <p className="text-white/75 text-sm font-light leading-relaxed">
                          {item.description}
                        </p>

                        {item.calories && (
                          <p className="text-white/60 text-xs font-light pt-2 border-t border-white/20">
                            {item.calories}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>

      {/* Footer  */}
      <footer className="bg-[#4a6741] border-t border-white/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-white text-sm font-light">
            <p>
              Copyright © 2026 - Powered by Devverse IT Solutions – All Rights
              Reserved.
            </p>
            <p>Premium Burger & Cafe</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
