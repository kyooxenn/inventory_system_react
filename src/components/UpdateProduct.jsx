import { useState, useEffect } from "react";
import { getProductById, updateProduct, deleteProduct } from "../api";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react"; // ✨ modern spinner icon

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
  const [loadingFetch, setLoadingFetch] = useState(true); // Start as true
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        if (!data) {
          toast.error("No matching product found.");
          setProduct(null);
        } else {
          data.productType = productTypeMapping[data.productType] || data.productType;
          setProduct(data);
        }
      } catch {
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
      toast.success("Product deleted.");
      navigate("/");
    } catch {
      toast.error("Failed to delete product.");
    }
    setLoadingDelete(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-xl mx-auto p-6 mt-10 bg-gray-900 text-white rounded-2xl shadow-2xl border border-gray-800"
    >
      <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-md">
        🔧 Update Product
      </h2>

      {/* Loading Animation */}
      {loadingFetch && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col justify-center items-center py-10"
        >
          <Loader2 className="h-10 w-10 animate-spin text-blue-400 mb-3" />
          <span className="text-blue-300 font-medium animate-pulse text-lg">
            Loading product details...
          </span>
        </motion.div>
      )}

      {/* Show Form if product is found and not loading */}
      {!loadingFetch && product && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Product Name */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <label htmlFor="productName" className="block mb-1 font-medium text-blue-300">
              Product Name
            </label>
            <input
              id="productName"
              name="productName"
              type="text"
              value={product.productName}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white placeholder-gray-400 border border-gray-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Enter product name"
              required
            />
          </motion.div>

          {/* Product Type */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <label htmlFor="productType" className="block mb-1 font-medium text-blue-300">
              Product Type
            </label>
            <select
              id="productType"
              name="productType"
              value={product.productType || ""}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white border border-gray-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            >
              <option value="">Select Product Type</option>
              {productTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </motion.div>

          {/* Description, Quantity, Price */}
          {[
            { label: "Description", name: "description", type: "text", placeholder: "Enter description", delay: 0.4 },
            { label: "Quantity", name: "quantity", type: "number", placeholder: "Enter quantity", delay: 0.5 },
            { label: "Price", name: "unitPrice", type: "number", placeholder: "Enter unit price", delay: 0.6 },
          ].map(({ label, name, type, placeholder, delay }) => (
            <motion.div key={name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
              <label htmlFor={name} className="block mb-1 font-medium text-blue-300">
                {label}
              </label>
              <input
                id={name}
                name={name}
                type={type}
                value={product[name] || ""}
                onChange={handleChange}
                className="w-full bg-gray-800 text-white placeholder-gray-400 border border-gray-700 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
            {/* Update Button */}
            <button
              type="submit"
              disabled={loadingUpdate || loadingDelete}
              className={`flex items-center justify-center gap-2 bg-yellow-500 text-white px-5 py-2 rounded-md hover:bg-yellow-600 disabled:opacity-50 transition-all shadow-md hover:shadow-yellow-500/30`}
            >
              {loadingUpdate ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 text-white" />
                  <span>Updating...</span>
                </>
              ) : (
                "Update Product"
              )}
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={handleDelete}
              disabled={loadingUpdate || loadingDelete}
              className={`flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 transition-all shadow-md hover:shadow-red-500/30`}
            >
              {loadingDelete ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 text-white" />
                  <span>Deleting...</span>
                </>
              ) : (
                "Delete Product"
              )}
            </button>

            {/* Return Button */}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-gray-300 hover:text-blue-400 transition-colors underline-offset-2 hover:underline"
            >
              Return to List
            </button>
          </motion.div>
        </form>
      )}

      {/* Show "Not Found" message only if loading finished and no product */}
      {!loadingFetch && !product && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-gray-400 py-6"
        >
          No matching product found.
        </motion.p>
      )}
    </motion.div>
  );
}
