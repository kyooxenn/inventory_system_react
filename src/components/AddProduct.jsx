import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createProduct } from "/src/services/api.js";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const productTypes = ["Electronics", "Furniture", "Clothing", "Food", "Books"];
const unitTypes = ["Piece", "Box", "Kg", "Pack", "Bottle"];

// ✅ Generate 13-character alphanumeric ID
function generateId() {
  return crypto.randomUUID().replace(/-/g, "").substring(0, 13).toUpperCase();
}

export default function AddProduct() {
  const [product, setProduct] = useState({
    id: "",
    itemName: "",
    description: "",
    category: "",
    unitPrice: "",
    quantity: "",
    unit: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setProduct((prev) => ({ ...prev, id: generateId() }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "unitPrice" && !/^\d*\.?\d*$/.test(value)) return;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const validateFields = () => {
    if (!product.itemName.trim()) return "Item name is required.";
    if (!productTypes.includes(product.category))
      return "Please select a valid product type.";
    if (!product.description.trim()) return "Description is required.";
    if (!unitTypes.includes(product.unit))
      return "Please select a valid unit type.";
    if (isNaN(product.quantity) || product.quantity <= 0)
      return "Quantity must be a positive number.";
    if (isNaN(product.unitPrice) || product.unitPrice <= 0)
      return "Unit price must be a positive number.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateFields();
    if (error) return toast.error(error);

    setLoading(true);
    try {
      await createProduct(product);
      toast.success(`Product added successfully!`);
      navigate("/inventory");
    } catch (err) {
      console.error("Error adding product:", err.response?.data);
      const backendMessage =
        err.response?.data?.errorMessage ||
        "Failed to add product. Please try again.";
      toast.error(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-center items-center py-10 px-4">
      {/* Header + Back Navigation */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold text-blue-400 drop-shadow-lg">
          ✨ Add New Product
        </h1>
        <Link
          to="/"
          className="text-gray-300 hover:text-blue-400 transition font-medium"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-5xl bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-lg p-10 border border-gray-800"
      >
        {/* Product ID */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-400">Generated Product ID</p>
          <p className="text-lg font-semibold text-blue-400 tracking-widest">
            {product.id || "Generating..."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-5">
            {/* Item Name */}
            <div>
              <label className="block mb-1 font-medium">Item Name</label>
              <input
                name="itemName"
                type="text"
                value={product.itemName}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white placeholder-gray-400 border border-gray-700 px-4 py-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter item name"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block mb-1 font-medium">Category</label>
              <select
                name="category"
                value={product.category}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white border border-gray-700 px-4 py-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Category</option>
                {productTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit */}
            <div>
              <label className="block mb-1 font-medium">Unit</label>
              <select
                name="unit"
                value={product.unit}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white border border-gray-700 px-4 py-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Unit</option>
                {unitTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* Description */}
            <div>
              <label className="block mb-1 font-medium">Description</label>
              <input
                name="description"
                type="text"
                value={product.description}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white placeholder-gray-400 border border-gray-700 px-4 py-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter description"
                required
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block mb-1 font-medium">Quantity</label>
              <input
                name="quantity"
                type="number"
                value={product.quantity}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white placeholder-gray-400 border border-gray-700 px-4 py-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter quantity"
                required
              />
            </div>

            {/* Unit Price */}
            <div>
              <label className="block mb-1 font-medium">Unit Price</label>
              <input
                name="unitPrice"
                type="text"
                value={product.unitPrice}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white placeholder-gray-400 border border-gray-700 px-4 py-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter unit price"
                required
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="col-span-1 md:col-span-2 flex justify-between items-center pt-4">
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 font-semibold shadow-md transition"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>Saving...</span>
                </div>
              ) : (
                "💾 Save Product"
              )}
            </motion.button>

            <button
              type="button"
              onClick={() => navigate("/inventory")}
              className="text-gray-300 hover:text-red-400 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>

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
