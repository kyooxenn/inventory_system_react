import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProductById, updateProduct } from "/src/services/api.js";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const PRODUCT_TYPES = ["Electronics", "Furniture", "Clothing", "Food", "Books"];
const UNIT_TYPES = ["Piece", "Box", "Kg", "Pack", "Bottle"];
const CATEGORY_MAP = { 1: "Electronics", 2: "Furniture", 3: "Clothing", 4: "Food", 5: "Books" };

export default function UpdateProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState({ fetch: true, update: false, del: false });

  // ✅ Fetch product details
  useEffect(() => {
    (async () => {
      try {
        const data = await getProductById(id);
        if (!data) throw new Error();
        setProduct({
          ...data,
          category: CATEGORY_MAP[data.category] || data.category,
        });
      } catch {
        toast.error("No matching product found.");
        setProduct(null);
      } finally {
        setLoading((prev) => ({ ...prev, fetch: false }));
      }
    })();
  }, [id]);

  // ✅ Handle input changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === "unitPrice" && !/^\d*\.?\d*$/.test(value)) return;
    setProduct((prev) => ({ ...prev, [name]: value }));
  }, []);

  // ✅ Validate fields
  const validateFields = useCallback(() => {
    if (!product.itemName?.trim()) return "Item name is required.";
    if (!PRODUCT_TYPES.includes(product.category)) return "Select a valid category.";
    if (!product.description?.trim()) return "Description is required.";
    if (!UNIT_TYPES.includes(product.unit)) return "Select a valid unit type.";
    if (isNaN(product.quantity) || product.quantity <= 0)
      return "Quantity must be a positive number.";
    if (isNaN(product.unitPrice) || product.unitPrice <= 0)
      return "Unit price must be a positive number.";
    return "";
  }, [product]);

  // ✅ Update product
  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateFields();
    if (error) return toast.error(error);

    setLoading((prev) => ({ ...prev, update: true }));
    try {
      await updateProduct(id, product);
      toast.success("Product updated successfully!");
      navigate("/inventory");
    } catch (err) {
      const msg =
        err.response?.data?.errorMessage || "Failed to update product. Please try again.";
      toast.error(msg);
    } finally {
      setLoading((prev) => ({ ...prev, update: false }));
    }
  };

  const inputClass = useMemo(
    () =>
      "w-full bg-gray-800 text-white placeholder-gray-400 border border-gray-700 px-4 py-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
    []
  );

  if (loading.fetch)
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-950 text-white">
        <Loader2 className="h-10 w-10 animate-spin text-blue-400 mb-3" />
        <span className="text-blue-300 font-medium animate-pulse text-lg">
          Loading product details...
        </span>
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-400 bg-gray-950">
        No matching product found.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-center items-center py-10 px-4">
      {/* Header */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold text-blue-400 drop-shadow-lg">
          🔧 Update Product
        </h1>
        <Link to="/" className="text-gray-300 hover:text-blue-400 transition font-medium">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-lg p-10 border border-gray-800"
      >
        <div className="text-center mb-6">
          <p className="text-sm text-gray-400">Product ID</p>
          <p className="text-lg font-semibold text-blue-400 tracking-widest">
            {product.id}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-5">
            <Input label="Item Name" name="itemName" value={product.itemName} onChange={handleChange} className={inputClass} />
            <Select label="Category" name="category" value={product.category} onChange={handleChange} options={PRODUCT_TYPES} className={inputClass} />
            <Select label="Unit" name="unit" value={product.unit} onChange={handleChange} options={UNIT_TYPES} className={inputClass} />
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            <Input label="Description" name="description" value={product.description} onChange={handleChange} className={inputClass} />
            <Input label="Quantity" name="quantity" type="number" value={product.quantity} onChange={handleChange} className={inputClass} />
            <Input label="Unit Price" name="unitPrice" value={product.unitPrice} onChange={handleChange} className={inputClass} />
          </div>

          {/* Buttons */}
          <div className="col-span-full flex justify-between items-center pt-4">
            <motion.button
              type="submit"
              disabled={loading.update || loading.del}
              whileTap={{ scale: 0.97 }}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 font-semibold shadow-md transition"
            >
              {loading.update ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-5 w-5" /> <span>Updating...</span>
                </div>
              ) : (
                "💾 Update Product"
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

/* ✅ Reusable Components */
function Input({ label, className, ...props }) {
  return (
    <div>
      <label className="block mb-1 font-medium">{label}</label>
      <input {...props} className={className} required />
    </div>
  );
}

function Select({ label, options, className, ...props }) {
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
