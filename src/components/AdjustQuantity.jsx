import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAllProducts, updateProduct } from "/src/services/api.js";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

export default function AdjustQuantity() {
  const { type } = useParams(); // "increase" or "decrease"
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(""); // New: for category filter

  // ✅ Product types (same as in ProductList)
  const PRODUCT_TYPES = [
    "Books", "Movies", "Music", "Games", "Electronics", "Computers", "Home",
    "Garden", "Tools", "Grocery", "Health", "Beauty", "Toys", "Kids", "Baby",
    "Clothing", "Shoes", "Jewelery", "Sports", "Outdoors", "Automotive", "Industrial"
  ];

  // ✅ Filtered products based on selected category
  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  // ✅ Derived state (no need for separate selectedProduct)
  const selectedProduct = useMemo(
    () => filteredProducts.find((p) => p.id === selectedId) || null,
    [selectedId, filteredProducts]
  );

  // ✅ Load all products by fetching all pages
  useEffect(() => {
    (async () => {
      try {
        let allProducts = [];
        let page = 0;
        let totalPages = 1;

        // Fetch all pages to get all products
        while (page < totalPages) {
          const data = await getAllProducts(page, 1000);  // Large size to minimize requests
          allProducts = [...allProducts, ...(data?.content || [])];
          totalPages = data?.totalPages || 1;
          page++;
        }

        setProducts(allProducts);
      } catch {
        toast.error("Failed to load products.");
      }
    })();
  }, []);

  // ✅ Handle quantity adjustment
  const handleAdjust = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return toast.error("Please select a product.");
    if (!amount || isNaN(amount) || amount <= 0)
      return toast.error("Enter a valid quantity amount.");

    const value = parseInt(amount);
    const newQuantity =
      type === "increase"
        ? selectedProduct.quantity + value
        : selectedProduct.quantity - value;

    if (type === "decrease" && newQuantity <= 0)
      return toast.error(
        "Quantity cannot be reduced to zero. Please restock or remove this product instead."
      );

    setLoading(true);
    try {
      await updateProduct(selectedProduct.id, {
        ...selectedProduct,
        quantity: newQuantity,
      });
      toast.success(
        `Quantity ${type === "increase" ? "increased" : "decreased"} successfully!`
      );
      navigate("/");
    } catch(err) {
      toast.error(err.message ||"Failed to adjust quantity.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Shared styles (memoized)
  const colorTheme = type === "increase" ? "green" : "red";
  const actionText = type === "increase" ? "Increase" : "Decrease";

  const inputClass =
    "w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-4 text-white focus:ring-2 focus:ring-blue-500 text-lg";

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-900 w-full max-w-4xl p-10 rounded-3xl shadow-2xl border border-gray-800"
      >
        <h1
          className={`text-4xl font-extrabold text-center mb-10 text-${colorTheme}-400`}
        >
          {type === "increase" ? "⬆️ Increase Quantity" : "⬇️ Decrease Quantity"}
        </h1>

        <form onSubmit={handleAdjust} className="space-y-8">
          {/* ✅ Selected Product Details */}
          <AnimateSelectedProduct product={selectedProduct} />

          {/* ✅ Select Category */}
          <div>
            <label className="block text-gray-400 mb-2 text-sm font-medium">
              Filter by Category (Optional)
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedId(""); // Reset selected product when category changes
              }}
              className={inputClass}
            >
              <option value="">All Categories</option>
              {PRODUCT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ Select Product */}
          <div>
            <label className="block text-gray-400 mb-2 text-sm font-medium">
              Select Product
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className={inputClass}
            >
              <option value="">-- Choose a product --</option>
              {filteredProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.itemName} (Qty: {p.quantity})
                </option>
              ))}
            </select>
          </div>

          {/* ✅ Quantity Input */}
          <div>
            <label className="block text-gray-400 mb-2 text-sm font-medium">
              Amount to {actionText}
            </label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
              placeholder={`Enter quantity to ${actionText.toLowerCase()}`}
            />
          </div>

          {/* ✅ Action Buttons */}
          <div className="flex gap-6 mt-8">
            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              type="submit"
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-lg shadow-md transition bg-${colorTheme}-600 hover:bg-${colorTheme}-700 disabled:opacity-70`}
            >
              {loading ? <LoadingSpinner /> : `${actionText} Quantity`}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/")}
              type="button"
              className="w-full py-4 rounded-xl font-semibold text-lg shadow-md bg-gray-700 hover:bg-gray-600 transition"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ✅ Subcomponents for better reusability */
function AnimateSelectedProduct({ product }) {
  if (!product) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-4"
    >
      <p className="text-gray-300 text-lg mb-2">
        <span className="font-semibold text-blue-400">Item:</span>{" "}
        {product.itemName}
      </p>
      <p className="text-gray-300 text-lg mb-2">
        <span className="font-semibold text-yellow-400">Category:</span>{" "}
        {product.category}
      </p>
      <p className="text-gray-300 text-lg">
        <span className="font-semibold text-green-400">Current Quantity:</span>{" "}
        {product.quantity}
      </p>
    </motion.div>
  );
}

function LoadingSpinner() {
  return (
    <>
      <svg
        className="animate-spin h-6 w-6 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 018 8h-4l3 3 3-3h-4a8 8 0 01-8 8v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
        ></path>
      </svg>
      <span>Processing...</span>
    </>
  );
}
