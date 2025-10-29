import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createProduct } from "/src/services/api.js";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const PRODUCT_TYPES = [
    "Books",
    "Movies",
    "Music",
    "Games",
    "Electronics",
    "Computers",
    "Home",
    "Garden",
    "Tools",
    "Grocery",
    "Health",
    "Beauty",
    "Toys",
    "Kids",
    "Baby",
    "Clothing",
    "Shoes",
    "Jewelery",
    "Sports",
    "Outdoors",
    "Automotive",
    "Industrial"
    ];
const UNIT_TYPES = ["Piece", "Box", "Kg", "Pack", "Bottle"];

// ✅ Generate 13-character alphanumeric ID
const generateId = () =>
  crypto.randomUUID().replace(/-/g, "").substring(0, 13).toUpperCase();

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(() => ({
    id: generateId(),
    itemName: "",
    description: "",
    category: "",
    unitPrice: "",
    quantity: "",
    unit: "",
  }));

  // ✅ Handle input changes efficiently
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === "unitPrice" && !/^\d*\.?\d*$/.test(value)) return;
    setProduct((prev) => ({ ...prev, [name]: value }));
  }, []);

  // ✅ Client-side validation
  const validateFields = useCallback(() => {
    const { itemName, description, category, unit, quantity, unitPrice } = product;

    if (!itemName.trim()) return "Item name is required.";
    if (!PRODUCT_TYPES.includes(category)) return "Please select a valid category.";
    if (!description.trim()) return "Description is required.";
    if (!UNIT_TYPES.includes(unit)) return "Please select a valid unit type.";
    if (isNaN(quantity) || quantity <= 0) return "Quantity must be a positive number.";
    if (isNaN(unitPrice) || unitPrice <= 0)
      return "Unit price must be a positive number.";
    return "";
  }, [product]);

  // ✅ Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateFields();
    if (error) return toast.error(error);

    setLoading(true);
    try {
      await createProduct(product);
      toast.success("Product added successfully!");
      navigate("/inventory");
    } catch (err) {
      console.error("Error adding product:", err);
      toast.error(err.message || "Failed to add product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Memoized shared input classes
  const inputClass = useMemo(
    () =>
      "w-full bg-gray-800 text-white placeholder-gray-400 border border-gray-700 px-4 py-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
    []
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-center items-center py-10 px-4">
      {/* Header */}
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

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-5xl bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-lg p-10 border border-gray-800"
      >
        {/* Product ID */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-400">Generated Product ID</p>
          <p className="text-lg font-semibold text-blue-400 tracking-widest">
            {product.id}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-5">
            <InputField
              label="Item Name"
              name="itemName"
              value={product.itemName}
              onChange={handleChange}
              placeholder="Enter item name"
              className={inputClass}
            />

            <SelectField
              label="Category"
              name="category"
              value={product.category}
              onChange={handleChange}
              options={PRODUCT_TYPES}
              className={inputClass}
            />

            <SelectField
              label="Unit"
              name="unit"
              value={product.unit}
              onChange={handleChange}
              options={UNIT_TYPES}
              className={inputClass}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            <InputField
              label="Description"
              name="description"
              value={product.description}
              onChange={handleChange}
              placeholder="Enter description"
              className={inputClass}
            />

            <InputField
              label="Quantity"
              name="quantity"
              type="number"
              value={product.quantity}
              onChange={handleChange}
              placeholder="Enter quantity"
              className={inputClass}
            />

            <InputField
              label="Unit Price"
              name="unitPrice"
              value={product.unitPrice}
              onChange={handleChange}
              placeholder="Enter unit price"
              className={inputClass}
            />
          </div>

          {/* Buttons */}
          <div className="col-span-full flex justify-between items-center pt-4">
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
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
        transition={{ duration: 0.5 }}
        className="mt-10 text-gray-500 text-sm text-center"
      >
        © {new Date().getFullYear()} Norbert Jon Bobila | {" "}
                           <span className="text-blue-400">All rights reserved.</span>
      </motion.footer>
    </div>
  );
}

/* ✅ Reusable Subcomponents */
function InputField({ label, className, ...props }) {
  return (
    <div>
      <label className="block mb-1 font-medium">{label}</label>
      <input {...props} className={className} required />
    </div>
  );
}

function SelectField({ label, options, className, ...props }) {
  return (
    <div>
      <label className="block mb-1 font-medium">{label}</label>
      <select {...props} className={className} required>
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
