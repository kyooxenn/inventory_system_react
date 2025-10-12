import { useEffect, useState, useCallback } from "react";
import { getAllProducts, deleteProduct, getProduct } from "../api";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

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
      toast.success("Product deleted successfully!");
      loadProducts();
    } catch {
      toast.error("Failed to delete product.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-center items-center py-10 px-4">
      {/* Header */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold text-blue-400 drop-shadow-lg">
          📦 Product Inventory
        </h1>
        <Link
          to="/"
          className="text-gray-300 hover:text-blue-400 transition font-medium"
        >
          🧭 Back to Dashboard
        </Link>
      </div>

      {/* Search & Add Product */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl bg-gray-900/80 backdrop-blur-lg border border-gray-800 rounded-2xl shadow-lg p-6 mb-8"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="🔍 Search product by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800 text-white placeholder-gray-400 border border-gray-700 px-4 py-2.5 rounded-md w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-md hover:bg-blue-700 disabled:opacity-50 font-semibold shadow-md transition"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>Searching...</span>
                </div>
              ) : (
                "Search"
              )}
            </button>
          </div>

          {/* Add Product Button */}
          <Link to="/add-product">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="bg-green-600 text-white px-5 py-2.5 rounded-md hover:bg-green-700 font-semibold shadow-md transition"
            >
              ➕ Add Product
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-5xl bg-gray-900/80 backdrop-blur-lg border border-gray-800 rounded-2xl shadow-lg overflow-hidden"
      >
        <table className="min-w-full text-sm">
          <thead className="bg-gray-800 text-gray-300 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Item Name</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Quantity</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Unit</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <motion.tr
                  key={product.id}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  className="hover:bg-gray-800 transition"
                >
                  <td className="px-4 py-3 font-medium text-gray-100">
                    {product.itemName}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {product.description}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {product.category}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {product.quantity}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    ₱{product.unitPrice}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{product.unit}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <Link to={`/update-product/${product.id}`}>
                        <button className="bg-yellow-500 text-white px-3 py-1.5 rounded-md hover:bg-yellow-600 font-semibold transition">
                          ✏️ Edit
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={loading}
                        className="bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 disabled:opacity-50 font-semibold transition"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-8 text-gray-500 italic"
                >
                  {searchQuery
                    ? "No matching products found."
                    : "No products available."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Reset Search */}
      {filteredProducts.length === 0 && searchQuery && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-center"
        >
          <button
            onClick={() => {
              setSearchQuery("");
              setFilteredProducts(products);
            }}
            className="text-blue-400 hover:underline font-medium"
          >
            🔄 Reset Search
          </button>
        </motion.div>
      )}

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mt-10 text-gray-500 text-sm text-center"
      >
        © 2025 Norbs | Built with{" "}
        <span className="text-blue-400">React</span> +{" "}
        <span className="text-teal-400">Tailwind</span> +{" "}
        <span className="text-pink-400">Motion</span>
      </motion.footer>
    </div>
  );
}
