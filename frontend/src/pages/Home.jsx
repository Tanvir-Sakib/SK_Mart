import { useEffect, useState } from "react";
import { getProducts } from "../api/productService";
import { formatPrice } from "../utils/currency";
import { apiClient, endpoints } from '../utils/api';


function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        SK Mart Products 🛒
      </h1>

      <div className="grid grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="border p-4 rounded shadow"
          >
         <img src={getImageUrl(product.image)} alt={product.title}
            className="h-40 w-full object-cover"
          />

            <h2 className="text-lg font-semibold mt-2">
              {product.title}
            </h2>

            <p className="text-gray-600">
              {formatPrice(product.price)}
            </p>
            

            <button className="bg-blue-500 text-white px-3 py-1 mt-2">
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;