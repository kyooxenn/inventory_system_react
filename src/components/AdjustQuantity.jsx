import { useEffect, useState } from "react";
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
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const all = await getAllProducts();
      setProducts(all);
    } catch {
      toast.error("Failed to load products.");
    }
  };

  const handleSelectProduct = (id) => {
    setSelectedId(id);
    const product = products.find((p) => p.id === id);
    setSelectedProduct(product || null);
  };

  const handleAdjust = async (e) => {
    e.preventDefault();

    if (!selectedId) return toast.error("Please select a product.");
    if (!amount || isNaN(amount) || amount <= 0)
      return toast.error("Enter a valid quantity amount.");

    const product = products.find((p) => p.id === selectedId);
    if (!product) return toast.error("Product not found.");

    const updatedQuantity =
      type === "increase"
        ? product.quantity + parseInt(amount)
        : product.quantity - parseInt(amount);

    // ✅ Validation for decreasing below or equal to zero
    if (type === "decrease" && updatedQuantity <= 0) {
      return toast.error(
        "Quantity cannot be reduced to zero. Please restock or remove this product instead."
      );
    }

    setLoading(true);
    try {
      await updateProduct(selectedId, {
        ...product,
        quantity: updatedQuantity,
      });

      toast.success(
        `Quantity ${type === "increase" ? "increased" : "decreased"} successfully!`
      );
      navigate("/");
    } catch {
      toast.error("Failed to adjust quantity.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-900 w-full max-w-4xl p-10 rounded-3xl shadow-2xl border border-gray-800"
      >
        <h1
          className={`text-4xl font-extrabold text-center mb-10 ${
            type === "increase" ? "text-green-400" : "text-red-400"
          }`}
        >
          {type === "increase" ? "⬆️ Increase Quantity" : "⬇️ Decrease Quantity"}
        </h1>

        <form onSubmit={handleAdjust} className="space-y-8">
          {/* Product Info */}
          {selectedProduct && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mb-4"
            >
              <p className="text-gray-300 text-lg mb-2">
                <span className="font-semibold text-blue-400">Item:</span>{" "}
                {selectedProduct.itemName}
              </p>
              <p className="text-gray-300 text-lg">
                <span className="font-semibold text-green-400">
                  Current Quantity:
                </span>{" "}
                {selectedProduct.quantity}
              </p>
            </motion.div>
          )}

          {/* Select Product */}
          <div>
            <label className="block text-gray-400 mb-2 text-sm font-medium">
              Select Product
            </label>
            <select
              value={selectedId}
              onChange={(e) => handleSelectProduct(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-4 text-white focus:ring-2 focus:ring-blue-500 text-lg"
            >
              <option value="">-- Choose a product --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.itemName} (Qty: {p.quantity})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-gray-400 mb-2 text-sm font-medium">
              Amount to {type === "increase" ? "Add" : "Remove"}
            </label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-4 text-white focus:ring-2 focus:ring-blue-500 text-lg"
              placeholder={`Enter quantity to ${
                type === "increase" ? "add" : "remove"
              }`}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-6 mt-8">
            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              type="submit"
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-lg shadow-md transition ${
                type === "increase"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {loading ? (
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
              ) : type === "increase" ? (
                "Increase Quantity"
              ) : (
                "Decrease Quantity"
              )}
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
