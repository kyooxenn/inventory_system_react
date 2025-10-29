/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
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
  const [pageTransitioning, setPageTransitioning] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [category, setCategory] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  const PRODUCT_TYPES = [
    "Books", "Movies", "Music", "Games", "Electronics", "Computers", "Home",
    "Garden", "Tools", "Grocery", "Health", "Beauty", "Toys", "Kids", "Baby",
    "Clothing", "Shoes", "Jewelery", "Sports", "Outdoors", "Automotive", "Industrial"
  ];

  /* Pagination */
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;
  const hasSelection = selectedIds.length > 0;

  /* ---------------- Load All Products ---------------- */
  const loadProducts = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      const data = await getAllProducts(page, productsPerPage);
      setProducts(data?.content || []);
      setFiltered(data?.content || []);
      setTotalPages(data?.totalPages || 1);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------------- Initial Load ---------------- */
  useEffect(() => {
    loadProducts(0);
  }, [loadProducts]);

  /* ---------------- Search Products ---------------- */
  const handleSearch = useCallback(async () => {
    setPageTransitioning(true);
    try {
      if (!searchQuery.trim() && !category.trim()) {
        setIsSearching(false);
        setCurrentPage(1);
        await loadProducts(0);
        return;
      }

      setIsSearching(true);
      setCurrentPage(1);

      const delay = (ms) => new Promise((res) => setTimeout(res, ms));
      await delay(300);

      const results = await getProduct(searchQuery.trim(), category.trim(), 0, productsPerPage);
      setFiltered(results?.content || []);
      setTotalPages(results?.totalPages || 1);
      if (!results?.content?.length) toast("No matching products found.");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Search failed.");
    } finally {
      setLoading(false);
      setTimeout(() => setPageTransitioning(false), 200);
    }
  }, [searchQuery, category, loadProducts]);

  /* ---------------- Delete Logic ---------------- */
  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    setDeleting(id);
    try {
      await deleteProduct(id);
      toast.success("Product deleted successfully!");
      setSelectedIds((prev) => prev.filter((pid) => pid !== id));

      if (isSearching) {
        const results = await getProduct(searchQuery.trim(), category.trim(), currentPage - 1, productsPerPage);
        setFiltered(results?.content || []);
        setTotalPages(results?.totalPages || 1);
        if (!results?.content?.length && currentPage > 1) setCurrentPage(currentPage - 1);
      } else {
        await loadProducts(currentPage - 1);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to delete product.");
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
      if (isSearching) {
        const results = await getProduct(searchQuery.trim(), category.trim(), currentPage - 1, productsPerPage);
        setFiltered(results?.content || []);
        setTotalPages(results?.totalPages || 1);
        if (!results?.content?.length && currentPage > 1) setCurrentPage(currentPage - 1);
      } else {
        await loadProducts(currentPage - 1);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to delete selected products.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Pagination Logic ---------------- */
  const currentProducts = filtered;

  const handlePageChange = async (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPageTransitioning(true);
    setCurrentPage(newPage);
    setSelectedIds([]);

    const delay = (ms) => new Promise((res) => setTimeout(res, ms));
    await delay(300);

    try {
      if (isSearching) {
        setLoading(true);
        const results = await getProduct(searchQuery.trim(), category.trim(), newPage - 1, productsPerPage);
        setFiltered(results?.content || []);
        setTotalPages(results?.totalPages || 1);
      } else {
        await loadProducts(newPage - 1);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to load page.");
    } finally {
      setLoading(false);
      setTimeout(() => setPageTransitioning(false), 200);
    }
  };

  /* ---------------- Checkbox Logic ---------------- */
  const headerCheckboxRef = useRef(null);
  const currentPageIds = currentProducts.map((p) => p.id);
  const allSelectedOnPage = currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.includes(id));
  const someSelectedOnPage = currentPageIds.some((id) => selectedIds.includes(id)) && !allSelectedOnPage;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someSelectedOnPage;
    }
  }, [someSelectedOnPage]);

  const toggleSelectAll = () => {
    if (allSelectedOnPage) {
      setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    } else {
      setSelectedIds((prev) => {
        const s = new Set(prev);
        currentPageIds.forEach((id) => s.add(id));
        return Array.from(s);
      });
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  /* ---------------- Derived Values ---------------- */
  const emptyMessage = useMemo(
    () => (searchQuery ? "No matching products found." : "No products available."),
    [searchQuery]
  );

  /* ---------------- Render ---------------- */
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-10 px-4">
      {/* Header */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold text-blue-400 drop-shadow-lg">📦 Product Inventory</h1>
        <Link to="/" className="text-gray-300 hover:text-blue-400 transition font-medium">
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
          <div className="flex w-full md:flex-1 gap-2">
            <input
              type="text"
              placeholder="🔍 Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="bg-gray-800 text-white placeholder-gray-400 border border-gray-700 px-3 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-gray-800 text-white border border-gray-700 px-3 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">📁 All Categories</option>
              {PRODUCT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md disabled:opacity-50 font-medium shadow-sm transition text-sm whitespace-nowrap"
            >
              {loading ? <Loader2 className="animate-spin h-4 w-4 inline-block mr-1" /> : "Search"}
            </button>
          </div>

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
      <div className="hidden md:block w-full max-w-5xl relative">
        {(loading || pageTransitioning) && (
          <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center backdrop-blur-sm z-10 rounded-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Loader2 className="animate-spin h-8 w-8 text-blue-400" />
            </motion.div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`bg-gray-900/80 backdrop-blur-lg border border-gray-800 rounded-2xl shadow-lg overflow-x-auto transition-opacity ${
            loading || pageTransitioning ? "opacity-0" : "opacity-100"
          }`}
          style={{ maxHeight: "420px" }}
        >
          <table className="min-w-full text-sm relative">
            <thead className="bg-gray-800 text-gray-300 uppercase tracking-wide">
              <tr>
                <th className="px-3 py-3 text-left">
                  <input
                    type="checkbox"
                    ref={headerCheckboxRef}
                    checked={allSelectedOnPage}
                    onChange={toggleSelectAll}
                    className="accent-blue-500 w-4 h-4"
                  />
                </th>
                {["Item Name", "Description", "Category", "Quantity", "Price", "Unit", "Actions"].map(
                  (header) => (
                    <th key={header} className="px-4 py-3 text-left">
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-700">
              {currentProducts.length ? (
                currentProducts.map((p) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.01 }}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-4 gap-3">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-800 text-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-700"
            >
              ⬅ Prev
            </button>
            <span className="text-gray-400 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-800 text-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-700"
            >
              Next ➡
            </button>
          </div>
        )}
      </div>

      {/* ✅ Mobile Cards */}
      <div className="md:hidden w-full max-w-5xl grid gap-4 mt-4 relative">
        {(loading || pageTransitioning) && (
          <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center backdrop-blur-sm z-10 rounded-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Loader2 className="animate-spin h-8 w-8 text-blue-400" />
            </motion.div>
          </div>
        )}

        {currentProducts.length ? (
          currentProducts.map((p) => (
            <motion.div
              key={p.id}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.15 }}
              className={`bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-md transition-opacity ${
                loading || pageTransitioning ? "opacity-0" : "opacity-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(p.id)}
                    onChange={() => toggleSelect(p.id)}
                    className="accent-blue-500 w-5 h-5"
                  />
                  <h2 className="text-lg font-bold text-blue-400 leading-tight whitespace-nowrap text-ellipsis w-full">
                    {p.itemName}
                  </h2>
                </div>
              </div>
              <p className="px-4 py-3 text-gray-400 max-w-[360px] truncate" title={p.description}>
                {p.description}
              </p>
              <div className="text-gray-400 text-sm mt-2 space-y-1">
                <div>📁 {p.category || "Uncategorized"}</div>
                <div>📦 Qty: {p.quantity ?? 0}</div>
                <div>💰 ₱{p.unitPrice ?? 0}</div>
                <div>📐 {p.unit || "-"}</div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
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
                  {deleting === p.id ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : "🗑 Delete"}
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <EmptyState message={emptyMessage} />
        )}

        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 gap-3">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-800 text-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-700"
            >
              ⬅ Prev
            </button>
            <span className="text-gray-400 text-sm">
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-800 text-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-700"
            >
              Next ➡
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="mt-10 text-gray-500 text-sm text-center"
      >
        © {new Date().getFullYear()} Norbert Jon Bobila |{" "}
        <span className="text-blue-400">All rights reserved.</span>
      </motion.footer>
    </div>
  );
}
