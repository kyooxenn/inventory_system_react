import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductList from "./components/ProductList";
import AddProduct from "./components/AddProduct";
import UpdateProduct from "./components/UpdateProduct";
import Dashboard from "./components/Dashboard";

function App() {
    return (
        <Router>

            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/inventory" element={<ProductList />} />
                <Route path="/add-product" element={<AddProduct />} />
                <Route path="/update-product/:id" element={<UpdateProduct />} />
            </Routes>
        </Router>
    );
}

export default App;