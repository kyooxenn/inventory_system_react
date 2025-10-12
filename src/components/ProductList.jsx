import { useEffect, useState, useCallback } from "react";
import { getAllProducts, deleteProduct, getProduct } from "../api";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const allProducts = await getAllProducts();
      setProducts(allProducts);
      setFilteredProducts(allProducts);
    } catch {
      toast.error("Failed to load products.");
    }
    setLoading(false);
  };

  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      if (!searchQuery.trim()) {
        setFilteredProducts(products);
      } else {
        const results = await getProduct(searchQuery);
        setFilteredProducts(results.length > 0 ? results : []);
        if (results.length === 0) toast("No matching products found.");
      }
    } catch {
      toast.error("Search failed.");
      setFilteredProducts([]);
    }
    setLoading(false);
  }, [searchQuery, products]);

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteProduct(id);
      toast.success("Product deleted.");
      loadProducts();
    } catch {
      toast.error("Failed to delete product.");
    }
    setLoading(false);
  };

  return (
    <>
      <div className="max-w-6xl mx-auto p-6 mt-10 text-gray-800 pb-24">
        <h2 className="text-4xl font-extrabold mb-8 text-center text-white drop-shadow-lg">
          📦 Inventory Management
        </h2>

        {/* Search & Add */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search products by item name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800 text-white placeholder-gray-400 border border-gray-600 px-4 py-2 rounded-md w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2"
                >
                  <div className="animate-spin h-5 w-5 border-t-2 border-white border-opacity-50 rounded-full"></div>
                  <span className="text-white animate-pulse">Searching...</span>
                </motion.div>
              ) : (
                "Search"
              )}
            </button>
          </div>
          <Link to="/add-product">
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
              ➕ Add Product
            </button>
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100 text-gray-700 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left whitespace-nowrap">Item Name</th>
                <th className="px-4 py-3 text-left whitespace-nowrap">Description</th>
                <th className="px-4 py-3 text-left whitespace-nowrap">Category</th>
                <th className="px-4 py-3 text-left whitespace-nowrap">Quantity</th>
                <th className="px-4 py-3 text-left whitespace-nowrap">Price</th>
                <th className="px-4 py-3 text-left whitespace-nowrap">Unit</th>
                <th className="px-4 py-3 text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition h-[72px] align-middle">
                  <td className="px-4 py-3 text-gray-800 font-medium align-middle">{product.itemName}</td>
                  <td className="px-4 py-3 text-gray-600 align-middle">{product.description}</td>
                  <td className="px-4 py-3 text-gray-600 align-middle">{product.category}</td>
                  <td className="px-4 py-3 text-gray-600 align-middle">{product.quantity}</td>
                  <td className="px-4 py-3 text-gray-600 align-middle">{product.unitPrice} PHP</td>
                  <td className="px-4 py-3 text-gray-600 align-middle">{product.unit}</td>
                  <td className="px-4 py-3 text-center align-middle">
                    <div className="flex gap-2 items-center justify-center">
                      <Link to={`/update-product/${product.id}`}>
                        <button className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition whitespace-nowrap">
                          ✏️ Edit
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={loading}
                        className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 disabled:opacity-50 transition whitespace-nowrap"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* No Results */}
        {filteredProducts.length === 0 && searchQuery && (
          <div className="mt-8 text-center">
            <p className="text-gray-500 mb-2">No matching products found.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setFilteredProducts(products);
              }}
              className="text-blue-600 hover:underline"
            >
              🔄 Reset Search
            </button>
          </div>
        )}
      </div>

      {/* Sticky Animated Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed bottom-0 left-0 w-full bg-gray-900 text-gray-400 text-sm py-3 text-center shadow-inner"
      >
        © 2025 Norbs | Built with <span className="text-blue-400">React</span> + <span className="text-teal-400">Tailwind</span> + <span className="text-pink-400">Motion</span>
      </motion.footer>
    </>
  );
}
