import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart, Star, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";

interface Product {
  _id: string; id: string; name: string; category: string; price: number;
  rating: number; reviewCount: number; review_count?: number; image: string; image_url?: string; tag: string; stock: number;
}

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    api.getCategories().then((d: any) => setCategories(d.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const params: Record<string, string> = {};
    if (selectedCategory !== "All") params.category = selectedCategory;
    if (searchQuery) params.search = searchQuery;
    api.getProducts(params)
      .then((d: any) => setProducts(d.products))
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }, [selectedCategory, searchQuery]);

  const handleAddToCart = async (product: Product) => {
    setAddingId(product._id || product.id);
    await addToCart(product._id || product.id);
    setAddingId(null);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-stone-900">Agriculture Shop</h1>
          <p className="text-stone-600">Quality products for your farming needs</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </div>
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full lg:w-64 shrink-0">
          <div className="sticky top-24 flex flex-col gap-6">
            <div>
              <h3 className="mb-4 font-bold text-stone-900">Categories</h3>
              <div className="flex flex-wrap gap-2 lg:flex-col">
                {categories.map(cat => (
                  <Button key={cat} variant={selectedCategory === cat ? "default" : "ghost"}
                    className={`justify-start ${selectedCategory === cat ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                    onClick={() => setSelectedCategory(cat)}>{cat}</Button>
                ))}
              </div>
            </div>
          </div>
        </aside>
        <div className="flex-1">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map(product => (
                <Card key={product.id} className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300">
                  <div className="relative aspect-square overflow-hidden bg-stone-100">
                    <img src={product.image || product.image_url} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                    <Badge className="absolute left-3 top-3 bg-white/90 text-stone-900 hover:bg-white">{product.tag}</Badge>
                    {product.stock === 0 && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-white font-bold">Out of Stock</span></div>}
                  </div>
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">{product.category}</span>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="text-xs font-bold text-stone-900">{product.rating}</span>
                        <span className="text-xs text-stone-400">({product.review_count})</span>
                      </div>
                    </div>
                    <Link to={`/shop/${product._id || product.id}`}>
                    <CardTitle className="text-lg group-hover:text-emerald-600 transition-colors">{product.name}</CardTitle>
                  </Link>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold text-stone-900">₹{product.price.toLocaleString()}</p>
                    <p className="text-xs text-stone-400">{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={product.stock === 0 || addingId === (product._id || product.id)} onClick={() => handleAddToCart(product)}>
                      {addingId === (product._id || product.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ShoppingCart className="mr-2 h-4 w-4" />Add to Cart</>}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              {products.length === 0 && !isLoading && (
                <div className="col-span-3 flex h-64 flex-col items-center justify-center rounded-2xl bg-stone-50 text-stone-500">
                  <Search className="mb-4 h-12 w-12 opacity-20" />
                  <p>No products found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
