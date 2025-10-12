import { HashRouter as Router, Routes, Route } from "react-router-dom";
import ProductList from "./components/ProductList";
import AddProduct from "./components/AddProduct";
import UpdateProduct from "./components/UpdateProduct";
import Dashboard from "./components/Dashboard";
import AdjustQuantity from "./components/AdjustQuantity";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/inventory" element={<ProductList />} />
                <Route path="/add-product" element={<AddProduct />} />
                <Route path="/update-product/:id" element={<UpdateProduct />} />
                <Route path="/adjust/:type" element={<AdjustQuantity />} />
            </Routes>
        </Router>
    );
}

export default App;
