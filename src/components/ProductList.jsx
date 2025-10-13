import { useEffect, useState, useCallback } from "react";
import { getAllProducts, deleteProduct, getProduct } from "/src/services/api.js";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

// ✅ Animated Empty State Component
const EmptyState = ({ message }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.6 }}
    className="flex flex-col items-center justify-center py-12 text-gray-500"
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
      className="text-6xl mb-3"
    >
      📭
    </motion.div>
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="italic text-gray-400 text-lg"
    >
      {message}
    </motion.p>
  </motion.div>
);

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const allProducts = await getAllProducts();
      setProducts(allProducts || []);
      setFilteredProducts(allProducts || []);
    } catch {
      toast.error("Failed to load products.");
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      if (!searchQuery.trim()) {
        setFilteredProducts(products);
      } else {
        const results = await getProduct(searchQuery);
        setFilteredProducts(results && results.length > 0 ? results : []);
        if (!results || results.length === 0)
          toast("No matching products found.");
      }
    } catch {
      toast.error("Search failed.");
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, products]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    setDeleteLoadingId(id);
    try {
      await deleteProduct(id);
      toast.success("Product deleted successfully!");
      await loadProducts();
    } catch {
      toast.error("Failed to delete product.");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-10 px-4">
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
          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="🔍 Search product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800 text-white placeholder-gray-400 border border-gray-700 px-4 py-2.5 rounded-md w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
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

      {/* Content wrapper */}
      <div className="w-full max-w-5xl">
        {loading && (
          <div className="w-full mb-4 text-center text-gray-300">Loading...</div>
        )}

        {/* Desktop Table */}
        <div className="hidden md:block mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gray-900/80 backdrop-blur-lg border border-gray-800 rounded-2xl shadow-lg overflow-x-auto"
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
                            disabled={deleteLoadingId === product.id}
                            className="bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 disabled:opacity-50 font-semibold transition"
                          >
                            {deleteLoadingId === product.id ? (
                              <div className="flex items-center gap-1">
                                <Loader2 className="animate-spin h-4 w-4" />
                                <span>Deleting...</span>
                              </div>
                            ) : (
                              "🗑 Delete"
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">
                      <EmptyState
                        message={
                          searchQuery
                            ? "No matching products found."
                            : "No products available."
                        }
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </motion.div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden grid gap-4 mb-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.12 }}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-md"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold text-blue-400 mb-1">
                      {product.itemName}
                    </h2>
                    <p className="text-gray-400 text-sm mb-2 line-clamp-3">
                      {product.description}
                    </p>
                    <div className="text-gray-400 text-sm space-y-1">
                      <div>
                        📁{" "}
                        <span className="font-medium text-gray-200">
                          {product.category}
                        </span>
                      </div>
                      <div>
                        📦{" "}
                        <span className="font-medium text-gray-200">
                          Qty: {product.quantity}
                        </span>
                      </div>
                      <div>
                        💰{" "}
                        <span className="font-medium text-gray-200">
                          ₱{product.unitPrice}
                        </span>
                      </div>
                      <div>
                        📐{" "}
                        <span className="font-medium text-gray-200">
                          {product.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link to={`/update-product/${product.id}`} className="flex-1">
                    <button className="w-full bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 font-semibold">
                      ✏️ Edit
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={deleteLoadingId === product.id}
                    className="w-28 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 disabled:opacity-50 font-semibold"
                  >
                    {deleteLoadingId === product.id ? (
                      <div className="flex items-center justify-center gap-1">
                        <Loader2 className="animate-spin h-4 w-4" />
                        <span>...</span>
                      </div>
                    ) : (
                      "🗑 Delete"
                    )}
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <EmptyState
              message={
                searchQuery
                  ? "No matching products found."
                  : "No products available."
              }
            />
          )}
        </div>

        {/* Reset Search */}
        {filteredProducts.length === 0 && searchQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-center"
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
      </div>

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
