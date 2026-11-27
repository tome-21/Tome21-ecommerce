import { Link } from "react-router-dom";
import heroBanner from "../assets/hero.jpg";

export default function HeroBanner() {
  return (
    <Link
      to="/products"
      aria-label="Shop Now at Tome21"
      className="block w-full overflow-hidden rounded-2xl shadow-lg"
    >
      <img
        src={heroBanner}
        alt="Tome21 - Fashion, Style, More. Dress Better, Live Stylish"
        className="w-full h-auto md:h-[420px] lg:h-[460px] md:object-cover md:object-center"
        draggable={false}
      />
    </Link>
  );
}
