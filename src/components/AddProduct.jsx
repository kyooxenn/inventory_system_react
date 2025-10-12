import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../api";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

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

  // ✅ Auto-generate ID when the component first loads
  useEffect(() => {
    setProduct((prev) => ({ ...prev, id: generateId() }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ Prevent invalid decimal inputs for unitPrice
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
      navigate("/");
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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-xl mx-auto p-6 mt-10 bg-gray-900 text-white rounded-lg shadow-lg"
    >
      {/* ✅ Generated Product ID Display */}
      <div className="text-center mb-2">
        <p className="text-sm text-gray-400">Generated Product ID</p>
        <p className="text-lg font-semibold text-blue-400 tracking-widest">
          {product.id || "Generating..."}
        </p>
      </div>

      <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
        ✨ Add New Product
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Item Name */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label htmlFor="itemName" className="block mb-1 font-medium">
            Item Name
          </label>
          <input
            id="itemName"
            name="itemName"
            type="text"
            value={product.itemName}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white placeholder-gray-400 border border-gray-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter item name"
            required
          />
        </motion.div>

        {/* Category */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label htmlFor="category" className="block mb-1 font-medium">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={product.category}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white border border-gray-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Category</option>
            {productTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Unit */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label htmlFor="unit" className="block mb-1 font-medium">
            Unit
          </label>
          <select
            id="unit"
            name="unit"
            value={product.unit}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white border border-gray-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Unit</option>
            {unitTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Description, Quantity, Unit Price */}
        {[
          {
            label: "Description",
            name: "description",
            type: "text",
            placeholder: "Enter description",
            delay: 0.4,
          },
          {
            label: "Quantity",
            name: "quantity",
            type: "number",
            placeholder: "Enter quantity",
            delay: 0.5,
          },
          {
            label: "Unit Price",
            name: "unitPrice",
            type: "text",
            placeholder: "Enter unit price",
            delay: 0.6,
          },
        ].map(({ label, name, type, placeholder, delay }) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, x: name === "quantity" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
          >
            <label htmlFor={name} className="block mb-1 font-medium">
              {label}
            </label>
            <input
              id={name}
              name={name}
              type={type}
              value={product[name]}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white placeholder-gray-400 border border-gray-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={placeholder}
              required
            />
          </motion.div>
        ))}

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex justify-between items-center pt-4"
        >
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2"
              >
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 1,
                    ease: "linear",
                  }}
                />
                <span className="animate-pulse">Saving...</span>
              </motion.div>
            ) : (
              "Save Product"
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-gray-300 hover:underline"
          >
            Cancel
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
}
