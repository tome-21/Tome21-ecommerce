import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import AdminDashboard from "./pages/AdminDashboard";
// info pages
import Contact from "./pages/infoPages/Contact";
import About from "./pages/infoPages/About";
import Terms from "./pages/infoPages/Terms";
import Privacy from "./pages/infoPages/Privacy";
import Safety from "./pages/infoPages/Safety";
import FAQ from "./pages/infoPages/FAQ";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetails />} />
        <Route path="cart" element={<Cart />} />
        <Route path="orders" element={<Orders />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="contact" element={<Contact />} />

        <Route path="/about" element={<About />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/faq" element={<FAQ />} />
      </Routes>
    </>
  );
};

export default App;
