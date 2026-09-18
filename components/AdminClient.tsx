"use client";

import { useState } from "react";
import Link from "next/link";

export function AdminClient({
  initialProducts,
}: {
  initialProducts: any[];
}) {
  const [products, setProducts] = useState(initialProducts);

  const [form, setForm] = useState<any>({
    name: "",
    brand: "Local Brand",
    category: "T-Shirts",
    gender: "Unisex",
    price: 599,
    mrp: 899,
    description: "",
    image:
      "https://placehold.co/800x1000/png?text=New+Product",
    colors: "#111111,#ffffff",
    sizes: "S,M,L,XL",
    stock: 20,
  });

  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter product name.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const product = await response.json();

      if (!response.ok) {
        throw new Error(product?.error || "Failed to add product");
      }

      setProducts((current) => [product, ...current]);

      setForm({
        ...form,
        name: "",
        description: "",
      });

      alert("Product added successfully.");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  async function del(id: number) {
    const confirmed = confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setProducts((current) =>
        current.filter((product) => product.id !== id)
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    }
  }

  return (
    <main className="admin">
      <div className="container">
        <div className="admin-header">
          <div>
            <p className="eyebrow">
              SINGH READYMADE VASTRALAYA
            </p>

            <h1>Catalogue Admin</h1>
          </div>

          <Link href="/" className="btn dark">
            View store
          </Link>
        </div>

        <div className="admin-grid">
          <form className="admin-form" onSubmit={save}>
            <h2>Add product</h2>

            <input
              placeholder="Product name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              required
            />

            <input
              placeholder="Brand"
              value={form.brand}
              onChange={(e) =>
                setForm({
                  ...form,
                  brand: e.target.value,
                })
              }
              required
            />

            <input
              placeholder="Category"
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value,
                })
              }
              required
            />

            <input
              placeholder="Gender"
              value={form.gender}
              onChange={(e) =>
                setForm({
                  ...form,
                  gender: e.target.value,
                })
              }
              required
            />

            <input
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) =>
                setForm({
                  ...form,
                  price: Number(e.target.value),
                })
              }
              required
            />

            <input
              type="number"
              placeholder="MRP"
              value={form.mrp}
              onChange={(e) =>
                setForm({
                  ...form,
                  mrp: Number(e.target.value),
                })
              }
              required
            />

            <textarea
              placeholder="Product description"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
            />

            <input
              placeholder="Product image URL"
              value={form.image}
              onChange={(e) =>
                setForm({
                  ...form,
                  image: e.target.value,
                })
              }
              required
            />

            <input
              placeholder="Colors e.g. #111111,#ffffff"
              value={form.colors}
              onChange={(e) =>
                setForm({
                  ...form,
                  colors: e.target.value,
                })
              }
              required
            />

            <input
              placeholder="Sizes e.g. S,M,L,XL"
              value={form.sizes}
              onChange={(e) =>
                setForm({
                  ...form,
                  sizes: e.target.value,
                })
              }
              required
            />

            <input
              type="number"
              placeholder="Stock"
              value={form.stock}
              onChange={(e) =>
                setForm({
                  ...form,
                  stock: Number(e.target.value),
                })
              }
              required
            />

            <button
              type="submit"
              className="btn dark"
              disabled={saving}
            >
              {saving ? "Adding..." : "Add product"}
            </button>
          </form>

          <section className="admin-products">
            <h2>{products.length} products</h2>

            {products.map((product) => (
              <div
                className="admin-product"
                key={product.id}
              >
                <img
                  src={product.image}
                  alt={product.name}
                />

                <div>
                  <h3>{product.name}</h3>

                  <p>
                    {product.brand} · ₹{product.price} ·
                    {" "}stock {product.stock}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => del(product.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
