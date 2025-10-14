import { useEffect, useState, useCallback, useMemo } from "react";
import { getAllProducts, deleteProduct, getProduct } from "/src/services/api.js";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

/* ---------------- Empty State ---------------- */
const EmptyState = ({ message }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="flex flex-col items-center justify-center py-12 text-gray-500"
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.1, type: "spring", stiffness: 120 }}
      className="text-6xl mb-3"
    >
      📭
    </motion.div>
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="italic text-gray-400 text-lg"
    >
      {message}
    </motion.p>
  </motion.div>
);

/* ---------------- Main Component ---------------- */
export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const hasSelection = selectedIds.length > 0;

  /* ---------------- Load All Products ---------------- */
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllProducts();
      setProducts(data || []);
      setFiltered(data || []);
    } catch {
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  /* ---------------- Search Products ---------------- */
  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      if (!searchQuery.trim()) return setFiltered(products);

      const results = await getProduct(searchQuery.trim());
      setFiltered(results?.length ? results : []);
      if (!results?.length) toast("No matching products found.");
    } catch {
      toast.error("Search failed.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, products]);

  /* ---------------- Delete Logic ---------------- */
  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    setDeleting(id);
    try {
      await deleteProduct(id);
      toast.success("Product deleted successfully!");
      setSelectedIds((prev) => prev.filter((pid) => pid !== id));
      await loadProducts();
    } catch {
      toast.error("Failed to delete product.");
    } finally {
      setDeleting(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!hasSelection) return toast("No products selected.");
    if (!confirm(`Delete ${selectedIds.length} selected product(s)?`)) return;

    setLoading(true);
    try {
      await Promise.all(selectedIds.map((id) => deleteProduct(id)));
      toast.success(`${selectedIds.length} product(s) deleted.`);
      setSelectedIds([]);
      await loadProducts();
    } catch {
      toast.error("Failed to delete selected products.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Checkbox Logic ---------------- */
  const toggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.length === filtered.length ? [] : filtered.map((p) => p.id)
    );
  };

  const toggleSelect = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  /* ---------------- Derived Values ---------------- */
  const emptyMessage = useMemo(
    () =>
      searchQuery ? "No matching products found." : "No products available.",
    [searchQuery]
  );

  /* ---------------- Render ---------------- */
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

      {/* Search / Add / Bulk Delete */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-5xl bg-gray-900/80 backdrop-blur-lg border border-gray-800 rounded-2xl shadow-lg p-4 mb-8"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="flex w-full md:flex-1 gap-2">
            <input
              type="text"
              placeholder="🔍 Search product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="bg-gray-800 text-white placeholder-gray-400 border border-gray-700 px-3 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md disabled:opacity-50 font-medium shadow-sm transition text-sm whitespace-nowrap"
            >
              {loading ? (
                <Loader2 className="animate-spin h-4 w-4 inline-block mr-1" />
              ) : (
                "Search"
              )}
            </button>
          </div>

          {/* Add + Bulk Delete */}
          <div className="flex gap-2 w-full md:w-auto">
            <Link to="/add-product" className="flex-1 md:flex-none">
              <motion.button
                whileTap={{ scale: 0.96 }}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md font-medium shadow-sm transition text-sm w-full whitespace-nowrap"
              >
                ➕ Add Product
              </motion.button>
            </Link>

            {hasSelection && (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleBulkDelete}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md font-medium shadow-sm transition text-sm w-full md:w-auto disabled:opacity-50 whitespace-nowrap"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-4 w-4 inline-block mr-1" />
                ) : (
                  `🗑 Delete Selected (${selectedIds.length})`
                )}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ✅ Desktop Table */}
      <div className="hidden md:block w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-gray-900/80 backdrop-blur-lg border border-gray-800 rounded-2xl shadow-lg overflow-x-auto"
          style={{ maxHeight: "400px" }}
        >
          <table className="min-w-full text-sm">
            <thead className="bg-gray-800 text-gray-300 uppercase tracking-wide">
              <tr>
                <th className="px-3 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="accent-blue-500 w-4 h-4"
                  />
                </th>
                {["Item Name", "Description", "Category", "Quantity", "Price", "Unit", "Actions"].map((header) => (
                  <th key={header} className="px-4 py-3 text-left">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filtered.length ? (
                filtered.map((p) => (
                  <motion.tr
                    key={p.id}
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-gray-800 transition"
                  >
                    <td className="px-3 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        className="accent-blue-500 w-4 h-4"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-100" title={p.itemName}>
                      {p.itemName}
                    </td>
                    <td className="px-4 py-3 text-gray-400 max-w-[200px] truncate" title={p.description}>
                      {p.description}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{p.category}</td>
                    <td className="px-4 py-3 text-gray-400">{p.quantity}</td>
                    <td className="px-4 py-3 text-gray-400">₱{p.unitPrice}</td>
                    <td className="px-4 py-3 text-gray-400">{p.unit}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <Link to={`/update-product/${p.id}`}>
                          <button className="min-w-[90px] bg-yellow-500 hover:bg-yellow-600 text-white py-1.5 rounded font-semibold text-xs whitespace-nowrap">
                            ✏️ Edit
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deleting === p.id}
                          className="min-w-[90px] bg-red-600 hover:bg-red-700 text-white py-1.5 rounded font-semibold text-xs whitespace-nowrap disabled:opacity-50"
                        >
                          {deleting === p.id ? <Loader2 className="animate-spin h-3 w-3 mx-auto" /> : "🗑 Delete"}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">
                    <EmptyState message={emptyMessage} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden w-full max-w-5xl grid gap-4 mt-4">
        {filtered.length ? (
          filtered.map((p) => (
            <motion.div
              key={p.id}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.15 }}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(p.id)}
                    onChange={() => toggleSelect(p.id)}
                    className="accent-blue-500 w-5 h-5"
                  />
                  <h2 className="text-lg font-bold text-blue-400 leading-tight whitespace-nowrap text-ellipsis w-full">{p.itemName}</h2>
                </div>
              </div>
              <p className="px-4 py-3 text-gray-400 max-w-[360px] truncate" title={p.description}>
                {p.description}
              </p>
               {/* ✅ Info Section */}
                      <div className="text-gray-400 text-sm mt-2 space-y-1">
                        <div>📁 {p.category || "Uncategorized"}</div>
                        <div>📦 Qty: {p.quantity ?? 0}</div>
                        <div>💰 ₱{p.unitPrice ?? 0}</div>
                        <div>📐 {p.unit || "-"}</div>
                      </div>
              {/* ✅ Button Section */}
                      <div className="mt-4 flex justify-end gap-2">
                        <Link to={`/update-product/${p.id}`}>
                          <button className="w-[110px] bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded font-semibold text-sm flex items-center justify-center gap-1">
                            ✏️ Edit
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deleting === p.id}
                          className="w-[110px] bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold text-sm flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          {deleting === p.id ? (
                            <Loader2 className="animate-spin h-4 w-4 mx-auto" />
                          ) : (
                            <>
                              🗑 Delete
                            </>
                          )}
                        </button>
                      </div>
            </motion.div>
          ))
        ) : (
          <EmptyState message={emptyMessage} />
        )}
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
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
