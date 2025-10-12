import { useState, useEffect } from "react";
import { getProductById, updateProduct, deleteProduct } from "../api";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const productTypeMapping = {
  1: "Electronics",
  2: "Furniture",
  3: "Clothing",
  4: "Food",
  5: "Books",
};

const productTypes = Object.values(productTypeMapping);
const unitTypes = ["Piece", "Box", "Kg", "Pack", "Bottle"];

export default function UpdateProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loadingFetch, setLoadingFetch] = useState(true);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        if (!data) throw new Error("No matching product found.");

        data.category = productTypeMapping[data.category] || data.category;
        setProduct(data);
      } catch {
        toast.dismiss();
        toast.error("No matching product found.");
        setProduct(null);
      } finally {
        setLoadingFetch(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // prevent invalid decimal input
    if (name === "unitPrice" && !/^\d*\.?\d*$/.test(value)) return;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const validateFields = () => {
    if (!product.itemName?.trim()) return "Item name is required.";
    if (!productTypes.includes(product.category))
      return "Select a valid product type.";
    if (!product.description?.trim()) return "Description is required.";
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

    setLoadingUpdate(true);
    try {
      await updateProduct(id, product);
      toast.success("Product updated successfully!");
      navigate("/");
    } catch (err) {
      console.error("Error updating product:", err.response?.data);
      const backendMessage =
        err.response?.data?.errorMessage ||
        "Failed to update product. Please try again.";
      toast.error(backendMessage);
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleDelete = async () => {
    setLoadingDelete(true);
    try {
      await deleteProduct(id);
      toast.success("Product deleted successfully!");
      navigate("/");
    } catch {
      toast.error("Failed to delete product.");
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-xl mx-auto p-6 mt-10 bg-gray-900 text-white rounded-lg shadow-lg"
    >
      {/* ✅ Product ID Display */}
      {product && (
        <div className="text-center mb-2">
          <p className="text-sm text-gray-400">Product ID</p>
          <p className="text-lg font-semibold text-blue-400 tracking-widest">
            {product.id}
          </p>
        </div>
      )}

      <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
        🔧 Update Product
      </h2>

      {loadingFetch && (
        <div className="flex flex-col justify-center items-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-yellow-400 mb-3" />
          <span className="text-yellow-300 font-medium animate-pulse text-lg">
            Loading product details...
          </span>
        </div>
      )}

      {!loadingFetch && product && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Item Name */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <label htmlFor="itemName" className="block mb-1 font-medium">
              Item Name
            </label>
            <input
              id="itemName"
              name="itemName"
              type="text"
              value={product.itemName}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white placeholder-gray-400 border border-gray-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Enter item name"
              required
            />
          </motion.div>

          {/* Category */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <label htmlFor="category" className="block mb-1 font-medium">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={product.category || ""}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white border border-gray-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
            <label htmlFor="unit" className="block mb-1 font-medium">
              Unit
            </label>
            <select
              id="unit"
              name="unit"
              value={product.unit || ""}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white border border-gray-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                value={product[name] || ""}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white placeholder-gray-400 border border-gray-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
              disabled={loadingUpdate || loadingDelete}
              className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 disabled:opacity-50"
            >
              {loadingUpdate ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>Updating...</span>
                </div>
              ) : (
                "Update Product"
              )}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={loadingUpdate || loadingDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {loadingDelete ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>Deleting...</span>
                </div>
              ) : (
                "Delete"
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
      )}

      {!loadingFetch && !product && (
        <p className="text-center text-gray-400 py-6">
          No matching product found.
        </p>
      )}
    </motion.div>
  );
}
