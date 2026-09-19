"use client";

import { Header } from "@/components/Header";
import { useEffect, useState } from "react";
import Link from "next/link";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type Address = {
  id: number;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

type CustomerUser = {
  id: number;
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
};

export default function Cart() {
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [loggedInUser, setLoggedInUser] =
    useState<CustomerUser | null>(null);

  const [loadingCustomer, setLoadingCustomer] =
    useState(true);

  const [selectedAddressId, setSelectedAddressId] =
    useState<number | null>(null);

  useEffect(() => {
    const savedCart = JSON.parse(
      localStorage.getItem("cart") || "[]"
    );

    setCart(savedCart);

    loadCustomer();
  }, []);

  async function loadCustomer() {
    try {
      setLoadingCustomer(true);

      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        setLoggedInUser(null);

        setCustomer((current) => ({
          ...current,
          state: current.state || "",
        }));

        return;
      }

      const data = await response.json();

      if (data.success && data.user) {
        const user = data.user as CustomerUser;

        setLoggedInUser(user);

        setCustomer((current) => ({
          ...current,
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          state:
            current.state ||
            user.addresses?.[0]?.state ||
            "",
        }));

        if (
          user.addresses &&
          user.addresses.length > 0
        ) {
          const firstAddress =
            user.addresses[0];

          setSelectedAddressId(
            firstAddress.id
          );

          setCustomer((current) => ({
            ...current,
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            address:
              firstAddress.address || "",
            city: firstAddress.city || "",
            state: firstAddress.state || "",
            pincode:
              firstAddress.pincode || "",
          }));
        }
      }
    } catch (error) {
      console.error(
        "LOAD CUSTOMER ERROR:",
        error
      );
    } finally {
      setLoadingCustomer(false);
    }
  }

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + item.price * item.qty,
    0
  );

  const delivery =
    subtotal >= 999 ? 0 : 49;

  const total = subtotal + delivery;

  function update(
    index: number,
    difference: number
  ) {
    const updatedCart = [...cart];

    updatedCart[index].qty = Math.max(
      1,
      updatedCart[index].qty + difference
    );

    setCart(updatedCart);

    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );

    window.dispatchEvent(
      new Event("cart-updated")
    );
  }

  function remove(index: number) {
    const updatedCart = cart.filter(
      (_, itemIndex) =>
        itemIndex !== index
    );

    setCart(updatedCart);

    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );

    window.dispatchEvent(
      new Event("cart-updated")
    );
  }

  function handleCustomerChange(
    field: string,
    value: string
  ) {
    setSelectedAddressId(null);

    setCustomer((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function selectAddress(address: Address) {
    setSelectedAddressId(address.id);

    setCustomer((current) => ({
      ...current,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    }));

    setPaymentError("");
  }

  function loadRazorpayScript() {
    return new Promise<boolean>((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script =
        document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);

      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  }

  async function checkout() {
    setPaymentError("");

    if (!cart.length) {
      setPaymentError(
        "Your bag is empty."
      );
      return;
    }

    if (
      !customer.name ||
      !customer.email ||
      !customer.phone ||
      !customer.address ||
      !customer.city ||
      !customer.state ||
      !customer.pincode
    ) {
      setPaymentError(
        "Please fill all delivery details."
      );
      return;
    }

    if (!/^[0-9]{10}$/.test(
      customer.phone
    )) {
      setPaymentError(
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    if (!/^[0-9]{6}$/.test(
      customer.pincode
    )) {
      setPaymentError(
        "Please enter a valid 6-digit pincode."
      );
      return;
    }

    setLoading(true);

    try {
      const scriptLoaded =
        await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error(
          "Unable to load Razorpay. Please try again."
        );
      }

      const response = await fetch(
        "/api/payment/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            items: cart.map((item) => ({
              productId: Number(item.id),
              quantity: Number(item.qty),
            })),

            customerName:
              customer.name,

            customerEmail:
              customer.email,

            customerPhone:
              customer.phone,

            address:
              customer.address,

            city:
              customer.city,

            state:
              customer.state,

            pincode:
              customer.pincode,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to create payment order."
        );
      }

      if (
        !data.keyId ||
        !data.razorpayOrderId
      ) {
        throw new Error(
          "Razorpay order could not be created."
        );
      }

      const options = {
        key: data.keyId,

        amount: data.amount,

        currency:
          data.currency || "INR",

        name:
          "Singh Readymade Vastralaya",

        description:
          "Purchase from Singh Readymade Vastralaya",

        order_id:
          data.razorpayOrderId,

        prefill: {
          name:
            customer.name,

          email:
            customer.email,

          contact:
            customer.phone,
        },

        notes: {
          address:
            customer.address,

          city:
            customer.city,

          state:
            customer.state,

          pincode:
            customer.pincode,
        },

        theme: {
          color: "#071a33",
        },

        handler: async function (
          paymentResponse: any
        ) {
          try {
            const verifyResponse =
              await fetch(
                "/api/payment/verify",
                {
                  method: "POST",
                  headers: {
                    "Content-Type":
                      "application/json",
                  },
                  credentials:
                    "include",

                  body: JSON.stringify({
                    razorpay_order_id:
                      paymentResponse.razorpay_order_id,

                    razorpay_payment_id:
                      paymentResponse.razorpay_payment_id,

                    razorpay_signature:
                      paymentResponse.razorpay_signature,

                    orderId:
                      data.orderId,
                  }),
                }
              );

            const verifyData =
              await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(
                verifyData?.error ||
                  verifyData?.message ||
                  "Payment verification failed."
              );
            }

            localStorage.removeItem(
              "cart"
            );

            window.dispatchEvent(
              new Event("cart-updated")
            );

            window.location.href =
              `/order-success?order=${encodeURIComponent(
                verifyData.orderNumber
              )}`;
          } catch (error) {
            setPaymentError(
              error instanceof Error
                ? error.message
                : "Payment verification failed."
            );

            setLoading(false);
          }
        },

        modal: {
          ondismiss:
            function () {
              setLoading(false);
            },
        },
      };

      const razorpay =
        new window.Razorpay(
          options
        );

      razorpay.on(
        "payment.failed",
        function (
          response: any
        ) {
          console.error(
            "Payment failed:",
            response?.error
          );

          setPaymentError(
            response?.error
              ?.description ||
              "Payment failed. Please try again."
          );

          setLoading(false);
        }
      );

      razorpay.open();
    } catch (error) {
      setPaymentError(
        error instanceof Error
          ? error.message
          : "Unable to start payment."
      );

      setLoading(false);
    }
  }

  return (
    <>
      <Header />

      <main className="container cart-page">

        <p className="eyebrow">
          YOUR BAG
        </p>

        <h1>
          Shopping bag
        </h1>

        {cart.length === 0 ? (
          <div className="empty">
            <p>
              Your bag is empty.
            </p>

            <Link
              href="/"
              className="btn dark"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="cart-layout">

            <div>

              {cart.map(
                (item, index) => (
                  <div
                    className="cart-item"
                    key={item.id}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                    />

                    <div>
                      <h3>
                        {item.name}
                      </h3>

                      <p>
                        ₹
                        {item.price.toLocaleString(
                          "en-IN"
                        )}
                      </p>

                      <div>
                        <button
                          type="button"
                          onClick={() =>
                            update(
                              index,
                              -1
                            )
                          }
                        >
                          −
                        </button>

                        {" "}

                        {item.qty}

                        {" "}

                        <button
                          type="button"
                          onClick={() =>
                            update(
                              index,
                              1
                            )
                          }
                        >
                          +
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            remove(
                              index
                            )
                          }
                          style={{
                            marginLeft:
                              "12px",
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}

              {/* Delivery Details */}
              <section
                className="checkout-details"
                style={{
                  marginTop:
                    "32px",
                }}
              >
                <p className="eyebrow">
                  DELIVERY DETAILS
                </p>

                <h2>
                  Where should we deliver?
                </h2>

                {loadingCustomer ? (
                  <p
                    style={{
                      marginTop:
                        "18px",
                      opacity: 0.65,
                    }}
                  >
                    Loading account details...
                  </p>
                ) : (
                  <>
                    {loggedInUser &&
                      loggedInUser
                        .addresses
                        ?.length >
                        0 && (
                        <div
                          style={{
                            marginTop:
                              "20px",
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "space-between",
                              marginBottom:
                                "12px",
                            }}
                          >
                            <strong>
                              Saved
                              addresses
                            </strong>

                            <Link
                              href="/account"
                              style={{
                                fontSize:
                                  "13px",
                                color:
                                  "#071a33",
                                fontWeight:
                                  600,
                              }}
                            >
                              Manage
                              addresses
                            </Link>
                          </div>

                          <div
                            style={{
                              display:
                                "grid",
                              gap:
                                "10px",
                            }}
                          >
                            {loggedInUser.addresses.map(
                              (
                                savedAddress
                              ) => (
                                <button
                                  key={
                                    savedAddress.id
                                  }
                                  type="button"
                                  onClick={() =>
                                    selectAddress(
                                      savedAddress
                                    )
                                  }
                                  style={{
                                    width:
                                      "100%",
                                    textAlign:
                                      "left",
                                    padding:
                                      "14px",
                                    border:
                                      selectedAddressId ===
                                      savedAddress.id
                                        ? "2px solid #d4af37"
                                        : "1px solid #ddd",
                                    borderRadius:
                                      "10px",
                                    background:
                                      selectedAddressId ===
                                      savedAddress.id
                                        ? "rgba(212,175,55,0.08)"
                                        : "#fff",
                                    cursor:
                                      "pointer",
                                  }}
                                >
                                  <strong
                                    style={{
                                      display:
                                        "block",
                                      marginBottom:
                                        "5px",
                                    }}
                                  >
                                    {
                                      savedAddress.address
                                    }
                                  </strong>

                                  <span
                                    style={{
                                      fontSize:
                                        "13px",
                                      opacity:
                                        0.7,
                                    }}
                                  >
                                    {
                                      savedAddress.city
                                    }
                                    ,{" "}
                                    {
                                      savedAddress.state
                                    }{" "}
                                    -{" "}
                                    {
                                      savedAddress.pincode
                                    }
                                  </span>
                                </button>
                              )
                            )}
                          </div>

                          <div
                            style={{
                              marginTop:
                                "20px",
                              marginBottom:
                                "5px",
                              fontSize:
                                "13px",
                              opacity:
                                0.7,
                            }}
                          >
                            Or edit delivery
                            details below
                          </div>
                        </div>
                      )}

                    <div
                      style={{
                        display:
                          "grid",
                        gap: "12px",
                        marginTop:
                          "18px",
                      }}
                    >

                      <input
                        type="text"
                        placeholder="Full name"
                        value={
                          customer.name
                        }
                        onChange={(e) =>
                          handleCustomerChange(
                            "name",
                            e.target.value
                          )
                        }
                      />

                      <input
                        type="email"
                        placeholder="Email address"
                        value={
                          customer.email
                        }
                        onChange={(e) =>
                          handleCustomerChange(
                            "email",
                            e.target.value
                          )
                        }
                      />

                      <input
                        type="tel"
                        placeholder="Mobile number"
                        value={
                          customer.phone
                        }
                        maxLength={
                          10
                        }
                        onChange={(e) =>
                          handleCustomerChange(
                            "phone",
                            e.target.value.replace(
                              /\D/g,
                              ""
                            )
                          )
                        }
                      />

                      <textarea
                        placeholder="Full delivery address"
                        value={
                          customer.address
                        }
                        onChange={(e) =>
                          handleCustomerChange(
                            "address",
                            e.target.value
                          )
                        }
                        rows={4}
                      />

                      <div
                        style={{
                          display:
                            "grid",
                          gridTemplateColumns:
                            "1fr 1fr",
                          gap: "12px",
                        }}
                      >
                        <input
                          type="text"
                          placeholder="City"
                          value={
                            customer.city
                          }
                          onChange={(e) =>
                            handleCustomerChange(
                              "city",
                              e.target.value
                            )
                          }
                        />

                        <input
                          type="text"
                          placeholder="State"
                          value={
                            customer.state
                          }
                          onChange={(e) =>
                            handleCustomerChange(
                              "state",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <input
                        type="text"
                        placeholder="6-digit Pincode"
                        value={
                          customer.pincode
                        }
                        maxLength={
                          6
                        }
                        onChange={(e) =>
                          handleCustomerChange(
                            "pincode",
                            e.target.value.replace(
                              /\D/g,
                              ""
                            )
                          )
                        }
                      />

                    </div>
                  </>
                )}
              </section>
            </div>

            {/* Summary */}
            <aside className="summary">

              <h2>
                Summary
              </h2>

              <p>
                Subtotal

                <b>
                  ₹
                  {subtotal.toLocaleString(
                    "en-IN"
                  )}
                </b>
              </p>

              <p>
                Delivery

                <b>
                  {delivery === 0
                    ? "FREE"
                    : `₹${delivery}`}
                </b>
              </p>

              <hr />

              <p className="grand">
                Total

                <b>
                  ₹
                  {total.toLocaleString(
                    "en-IN"
                  )}
                </b>
              </p>

              {paymentError && (
                <div
                  style={{
                    marginBottom:
                      "14px",
                    padding:
                      "12px",
                    borderRadius:
                      "10px",
                    background:
                      "rgba(180, 30, 30, 0.08)",
                    color:
                      "#a11",
                    fontSize:
                      "14px",
                  }}
                >
                  {paymentError}
                </div>
              )}

              <button
                className="btn dark"
                type="button"
                onClick={
                  checkout
                }
                disabled={
                  loading
                }
                style={{
                  width:
                    "100%",
                }}
              >
                {loading
                  ? "Processing..."
                  : `Pay ₹${total.toLocaleString(
                      "en-IN"
                    )}`}
              </button>

              <small
                style={{
                  display:
                    "block",
                  marginTop:
                    "12px",
                  textAlign:
                    "center",
                  opacity:
                    0.65,
                }}
              >
                Secure payment
                powered by
                Razorpay
              </small>

            </aside>

          </div>
        )}
      </main>
    </>
  );
}
