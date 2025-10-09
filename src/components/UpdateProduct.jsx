import { useState, useEffect } from "react";
import { getProductById, updateProduct, deleteProduct } from "../api";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

const productTypeMapping = {
  1: "Electronics",
  2: "Furniture",
  3: "Clothing",
  4: "Food",
  5: "Books",
};

const productTypes = Object.values(productTypeMapping);

export default function UpdateProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await getProductById(id);
        data.productType = productTypeMapping[data.productType] || data.productType;
        setProduct(data);
      } catch {
        toast.error("No matching product found.");
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const validateFields = () => {
    if (!product.productName.trim()) return "Product name is required.";
    if (!productTypes.includes(product.productType)) return "Select a valid product type.";
    if (!product.description.trim()) return "Description is required.";
    if (isNaN(product.quantity) || product.quantity <= 0) return "Quantity must be a positive number.";
    if (isNaN(product.unitPrice) || product.unitPrice <= 0) return "Unit price must be a positive number.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateFields();
    if (error) return toast.error(error);

    setLoading(true);
    try {
      await updateProduct(id, product);
      toast.success("Product updated successfully!");
      navigate("/");
    } catch {
      toast.error("Failed to update product.");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteProduct(id);
      toast.success("Product deleted.");
      navigate("/");
    } catch {
      toast.error("Failed to delete product.");
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-xl mx-auto p-6 mt-10 bg-gray-900 text-white rounded-lg shadow-lg"
    >
      <h2 className="text-3xl font-bold mb-6 text-center text-white drop-shadow-lg">
        🔧 Update Product
      </h2>

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center items-center mb-6"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-400 border-opacity-50"></div>
          <span className="ml-3 text-blue-300 font-medium animate-pulse">Loading product details...</span>
        </motion.div>
      )}

      {product ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Product Name */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label htmlFor="productName" className="block mb-1 font-medium">Product Name</label>
            <input
              id="productName"
              name="productName"
              type="text"
              value={product.productName}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white placeholder-gray-400 border border-gray-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product name"
              required
            />
          </motion.div>

          {/* Product Type */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label htmlFor="productType" className="block mb-1 font-medium">Product Type</label>
            <select
              id="productType"
              name="productType"
              value={product.productType || ""}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white border border-gray-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Product Type</option>
              {productTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </motion.div>

          {/* Description, Quantity, Price */}
          {[
            { label: "Description", name: "description", type: "text", placeholder: "Enter description", delay: 0.4 },
            { label: "Quantity", name: "quantity", type: "number", placeholder: "Enter quantity", delay: 0.5 },
            { label: "Price", name: "unitPrice", type: "number", placeholder: "Enter unit price", delay: 0.6 },
          ].map(({ label, name, type, placeholder, delay }) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, x: name === "quantity" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay }}
            >
              <label htmlFor={name} className="block mb-1 font-medium">{label}</label>
              <input
                id={name}
                name={name}
                type={type}
                value={product[name] || ""}
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
            className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4"
          >
            <button
              type="submit"
              disabled={loading}
              className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Product"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Delete Product"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-gray-300 hover:underline"
            >
              Return to List
            </button>
          </motion.div>
        </form>
      ) : (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-gray-400"
        >
          No matching product found.
        </motion.p>
      )}
    </motion.div>
  );
}
