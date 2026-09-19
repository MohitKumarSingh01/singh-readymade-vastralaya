"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function AdminClient({
  initialProducts,
}: {
  initialProducts: any[];
}) {
  const [products, setProducts] = useState(initialProducts);

  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(
    null
  );

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

  useEffect(() => {
    async function loadOrders() {
      try {
        setOrdersLoading(true);
        setOrdersError("");

        const response = await fetch("/api/admin/orders", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || "Unable to load orders."
          );
        }

        setOrders(data.orders || []);
      } catch (error) {
        setOrdersError(
          error instanceof Error
            ? error.message
            : "Unable to load orders."
        );
      } finally {
        setOrdersLoading(false);
      }
    }

    loadOrders();
  }, []);

  async function updateOrderStatus(
    orderId: number,
    orderStatus: string
  ) {
    try {
      setUpdatingOrderId(orderId);

      const response = await fetch(
        `/api/admin/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to update order status."
        );
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                orderStatus: data.order.orderStatus,
              }
            : order
        )
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to update order status."
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }

  async function save(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter product name.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "/api/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const product = await response.json();

      if (!response.ok) {
        throw new Error(
          product?.error ||
            "Failed to add product"
        );
      }

      setProducts((current) => [
        product,
        ...current,
      ]);

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
      const response = await fetch(
        `/api/products/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to delete product"
        );
      }

      setProducts((current) =>
        current.filter(
          (product) => product.id !== id
        )
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
        {/* ADMIN HEADER */}

        <div className="admin-header">
          <div>
            <p className="eyebrow">
              SINGH READYMADE VASTRALAYA
            </p>

            <h1>Catalogue Admin</h1>
          </div>

          <Link
            href="/"
            className="btn dark"
          >
            View store
          </Link>
        </div>

        {/* PRODUCTS */}

        <div className="admin-grid">
          <form
            className="admin-form"
            onSubmit={save}
          >
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
                  price: Number(
                    e.target.value
                  ),
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
                  mrp: Number(
                    e.target.value
                  ),
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
                  description:
                    e.target.value,
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
                  stock: Number(
                    e.target.value
                  ),
                })
              }
              required
            />

            <button
              type="submit"
              className="btn dark"
              disabled={saving}
            >
              {saving
                ? "Adding..."
                : "Add product"}
            </button>
          </form>

          <section className="admin-products">
            <h2>
              {products.length} products
            </h2>

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
                  <h3>
                    {product.name}
                  </h3>

                  <p>
                    {product.brand} · ₹
                    {product.price} · stock{" "}
                    {product.stock}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    del(product.id)
                  }
                >
                  Delete
                </button>
              </div>
            ))}
          </section>
        </div>

        {/* ORDERS */}

        <section
          className="admin-products"
          style={{
            marginTop: "35px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            <div>
              <p className="eyebrow">
                CUSTOMER ORDERS
              </p>

              <h2
                style={{
                  margin: 0,
                }}
              >
                {orders.length} Orders
              </h2>
            </div>

            <button
              type="button"
              className="btn light"
              onClick={() =>
                window.location.reload()
              }
            >
              Refresh
            </button>
          </div>

          {ordersLoading && (
            <div
              style={{
                padding: "30px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              Loading orders...
            </div>
          )}

          {ordersError && (
            <div
              style={{
                padding: "18px",
                borderRadius: "12px",
                background: "#fee2e2",
                color: "#991b1b",
              }}
            >
              {ordersError}
            </div>
          )}

          {!ordersLoading &&
            !ordersError &&
            orders.length === 0 && (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                <h3>No orders yet</h3>

                <p>
                  Customer orders will appear
                  here after successful payment.
                </p>
              </div>
            )}

          {!ordersLoading &&
            !ordersError &&
            orders.map((order) => (
              <div
                key={order.id}
                style={{
                  marginBottom: "18px",
                  padding: "22px",
                  border:
                    "1px solid rgba(11,31,58,0.08)",
                  borderRadius: "16px",
                  background:
                    "rgba(248,250,252,0.8)",
                }}
              >
                {/* Order heading */}

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "flex-start",
                    gap: "20px",
                    flexWrap: "wrap",
                    marginBottom: "18px",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: "0 0 5px",
                        fontSize: "12px",
                        color: "#64748b",
                      }}
                    >
                      ORDER NUMBER
                    </p>

                    <h3
                      style={{
                        margin: 0,
                        color: "#071a33",
                      }}
                    >
                      {order.orderNumber}
                    </h3>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    {/* Payment Status */}

                    <span
                      style={{
                        padding:
                          "7px 12px",
                        borderRadius: "999px",
                        background:
                          order.paymentStatus ===
                          "PAID"
                            ? "#dcfce7"
                            : "#fef3c7",
                        color:
                          order.paymentStatus ===
                          "PAID"
                            ? "#166534"
                            : "#92400e",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      Payment:{" "}
                      {order.paymentStatus}
                    </span>

                    {/* Order Status */}

                    <span
                      style={{
                        padding:
                          "7px 12px",
                        borderRadius: "999px",
                        background:
                          "#e0e7ff",
                        color: "#3730a3",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      Order:{" "}
                      {order.orderStatus}
                    </span>

                    {/* Status Update */}

                    <select
                      value={
                        order.orderStatus
                      }
                      disabled={
                        updatingOrderId ===
                        order.id
                      }
                      onChange={(e) =>
                        updateOrderStatus(
                          order.id,
                          e.target.value
                        )
                      }
                      style={{
                        padding:
                          "7px 10px",
                        borderRadius: "8px",
                        border:
                          "1px solid #d1d5db",
                        background:
                          "#ffffff",
                        color: "#111827",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor:
                          updatingOrderId ===
                          order.id
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      <option value="PENDING">
                        Pending
                      </option>

                      <option value="PROCESSING">
                        Processing
                      </option>

                      <option value="SHIPPED">
                        Shipped
                      </option>

                      <option value="DELIVERED">
                        Delivered
                      </option>

                      <option value="CANCELLED">
                        Cancelled
                      </option>
                    </select>

                    {updatingOrderId ===
                      order.id && (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#64748b",
                        }}
                      >
                        Updating...
                      </span>
                    )}
                  </div>
                </div>

                {/* Customer */}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(2, minmax(0, 1fr))",
                    gap: "18px",
                    marginBottom: "20px",
                  }}
                >
                  <div>
                    <strong>
                      Customer
                    </strong>

                    <p
                      style={{
                        margin:
                          "6px 0 0",
                        color:
                          "#64748b",
                      }}
                    >
                      {order.customerName}
                    </p>
                  </div>

                  <div>
                    <strong>
                      Phone
                    </strong>

                    <p
                      style={{
                        margin:
                          "6px 0 0",
                        color:
                          "#64748b",
                      }}
                    >
                      {order.customerPhone}
                    </p>
                  </div>

                  <div>
                    <strong>
                      Email
                    </strong>

                    <p
                      style={{
                        margin:
                          "6px 0 0",
                        color:
                          "#64748b",
                        wordBreak:
                          "break-word",
                      }}
                    >
                      {order.customerEmail}
                    </p>
                  </div>

                  <div>
                    <strong>
                      Order Date
                    </strong>

                    <p
                      style={{
                        margin:
                          "6px 0 0",
                        color:
                          "#64748b",
                      }}
                    >
                      {new Date(
                        order.createdAt
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>
                </div>

                {/* Address */}

                <div
                  style={{
                    marginBottom: "20px",
                    padding: "16px",
                    borderRadius: "12px",
                    background:
                      "#ffffff",
                  }}
                >
                  <strong>
                    Delivery Address
                  </strong>

                  <p
                    style={{
                      margin:
                        "7px 0 0",
                      color:
                        "#64748b",
                      lineHeight: 1.6,
                    }}
                  >
                    {order.address}
                    <br />
                    {order.city},{" "}
                    {order.state} -{" "}
                    {order.pincode}
                  </p>
                </div>

                {/* Products */}

                <div>
                  <strong>
                    Products
                  </strong>

                  <div
                    style={{
                      marginTop:
                        "10px",
                    }}
                  >
                    {order.items.map(
                      (item: any) => (
                        <div
                          key={item.id}
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            gap: "15px",
                            padding:
                              "10px 0",
                            borderBottom:
                              "1px solid rgba(11,31,58,0.08)",
                          }}
                        >
                          <span>
                            {item.product
                              ?.name ||
                              "Product"}{" "}
                            ×{" "}
                            {item.quantity}
                          </span>

                          <strong>
                            ₹
                            {(
                              item.price *
                              item.quantity
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </strong>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Total */}

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    marginTop: "18px",
                    paddingTop:
                      "16px",
                    borderTop:
                      "2px solid rgba(11,31,58,0.08)",
                  }}
                >
                  <strong>
                    Total
                  </strong>

                  <strong
                    style={{
                      fontSize:
                        "22px",
                      color:
                        "#071a33",
                    }}
                  >
                    ₹
                    {order.total.toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>
              </div>
            ))}
        </section>
      </div>
    </main>
  );
}
