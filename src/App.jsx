import React, { useEffect, useMemo, useState } from "react";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import axios from "axios";

const API =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/* =========================
   Layout
========================= */

function Layout({ children }) {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("pantryUser") || "null"
  );

  const logout = () => {
    localStorage.removeItem("pantryUser");
    navigate("/login");
  };

  return (
    <div>
      <nav className="nav">
        <Link className="brand" to="/">
          🥫 Smart Pantry
        </Link>

        <div className="navlinks">
          <Link to="/pantry">Pantry</Link>
          <Link to="/recipes">Recipes</Link>
          <Link to="/scan">Vision AI</Link>

          {user ? (
            <button onClick={logout}>Logout</button>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}

/* =========================
   Home
========================= */

function Home() {
  return (
    <Layout>
      <section className="hero">
        <div>
          <p className="eyebrow">
            EXPIRING PANTRY & SMART RECIPE MANAGER
          </p>

          <h1>Use food before it becomes food waste.</h1>

          <p>
            Track pantry items, monitor expiry dates and discover
            recipes that prioritize ingredients closest to expiry.
          </p>

          <Link className="primary" to="/pantry">
            Open My Pantry →
          </Link>
        </div>

        <div className="hero-card">
          🧺
          <h3>Smart expiry priority</h3>
          <p>
            Recipes are ranked around ingredients that should be
            used first.
          </p>
        </div>
      </section>

      <section className="features">
        <div>
          <b>📅 Expiry tracking</b>
          <span>Know what needs attention.</span>
        </div>

        <div>
          <b>🍳 Smart recipes</b>
          <span>Cook with what you already have.</span>
        </div>

        <div>
          <b>📷 Vision AI</b>
          <span>Prototype receipt/image scanning.</span>
        </div>
      </section>
    </Layout>
  );
}

/* =========================
   Login
========================= */

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const response = await axios.post(
        API + "/auth/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem(
        "pantryUser",
        JSON.stringify(response.data.user)
      );

      navigate("/pantry");
    } catch (error) {
      setMsg(
        error.response?.data?.message ||
          "Login failed. Please check your details."
      );
    }
  };

  return (
    <Layout>
      <AuthBox title="Welcome back">
        <form onSubmit={submit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="primary" type="submit">
            Login
          </button>

          {msg && <p className="error">{msg}</p>}
        </form>

        <p>
          No account? <Link to="/register">Register</Link>
        </p>
      </AuthBox>
    </Layout>
  );
}

/* =========================
   Register
========================= */

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      await axios.post(
        API + "/auth/register",
        form
      );

      navigate("/pantry");
    } catch (error) {
      setMsg(
        error.response?.data?.message ||
          "Registration failed."
      );
    }
  };

  return (
    <Layout>
      <AuthBox title="Create your account">
        <form onSubmit={submit}>
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            required
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            required
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />

          <input
            type="password"
            placeholder="Password"
            minLength="6"
            value={form.password}
            required
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
          />

          <button className="primary" type="submit">
            Register
          </button>

          {msg && <p className="error">{msg}</p>}
        </form>

        <p>
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </AuthBox>
    </Layout>
  );
}

/* =========================
   Auth Box
========================= */

function AuthBox({ title, children }) {
  return (
    <div className="auth">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

/* =========================
   Pantry
========================= */

function Pantry() {
  const user = JSON.parse(
    localStorage.getItem("pantryUser") || "null"
  );

  const [items, setItems] = useState([]);

  const [form, setForm] = useState({
    name: "",
    quantity: 1,
    unit: "kg",
    expiryDate: "",
    category: "Vegetables",
  });

  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");

  const loadPantry = async () => {
    if (!user) return;

    try {
      const response = await axios.get(
        API + "/pantry/" + user.id
      );

      setItems(response.data);
    } catch (error) {
      setMsg("Could not load pantry items.");
    }
  };

  useEffect(() => {
    if (!user) return;

    loadPantry();
  }, [user?.id]);

  // Change default unit when category changes
  const changeCategory = (category) => {
    let defaultUnit = "kg";

    if (category === "Vegetables") {
      defaultUnit = "kg";
    } else if (category === "Fruits") {
      defaultUnit = "kg";
    } else if (category === "Dairy") {
      defaultUnit = "litre";
    } else if (category === "Grains") {
      defaultUnit = "kg";
    } else if (category === "Eggs") {
      defaultUnit = "pcs";
    } else if (category === "Bakery") {
      defaultUnit = "pack";
    } else if (category === "Beverages") {
      defaultUnit = "litre";
    } else {
      defaultUnit = "kg";
    }

    setForm({
      ...form,
      category,
      unit: defaultUnit,
    });
  };

  const add = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!user) {
      setMsg("Please login first.");
      return;
    }

    try {
      await axios.post(API + "/pantry", {
        ...form,
        userId: user.id,
      });

      setForm({
        name: "",
        quantity: 1,
        unit: "kg",
        expiryDate: "",
        category: "Vegetables",
      });

      await loadPantry();
    } catch (error) {
      setMsg(
        error.response?.data?.message ||
          "Could not add item."
      );
    }
  };
const del = async (id) => {
  try {
    await axios.delete(
      API + "/pantry/" + id
    );

    await loadPantry();
  } catch (error) {
    setMsg("Could not delete item.");
  }
};


// ADD THIS BELOW

const useItem = async (item) => {
  const quantityUsed = prompt(
    `How much ${item.name} did you use?\nAvailable: ${item.quantity} ${item.unit}`
  );

  if (quantityUsed === null) return;

  const used = Number(quantityUsed);

  if (!used || used <= 0) {
    setMsg("Please enter a valid quantity.");
    return;
  }

  if (used > Number(item.quantity)) {
    setMsg(
      `You only have ${item.quantity} ${item.unit} available.`
    );
    return;
  }

  try {
    await axios.put(
      API + "/pantry/" + item._id + "/use",
      {
        quantityUsed: used
      }
    );

    setMsg(
      used === Number(item.quantity)
        ? `${item.name} completely used.`
        : `${used} ${item.unit} of ${item.name} used.`
    );

    await loadPantry();

  } catch (error) {
    setMsg(
      error.response?.data?.message ||
      "Could not update item."
    );
  }
};
const editItem = async (item) => {
  const name = prompt("Food name:", item.name);
  if (name === null) return;

  const quantity = prompt(
    `Quantity (${item.unit}):`,
    item.quantity
  );
  if (quantity === null) return;

  const expiryDate = prompt(
    "Expiry date (YYYY-MM-DD):",
    item.expiryDate
      ? new Date(item.expiryDate).toISOString().split("T")[0]
      : ""
  );
  if (expiryDate === null) return;

  const updatedQuantity = Number(quantity);

  if (!name.trim() || !updatedQuantity || updatedQuantity <= 0) {
    setMsg("Please enter valid item details.");
    return;
  }

  try {
    await axios.put(
      API + "/pantry/" + item._id,
      {
        name: name.trim(),
        quantity: updatedQuantity,
        unit: item.unit,
        expiryDate: expiryDate,
        category: item.category
      }
    );

    setMsg(`${name} updated successfully.`);

    await loadPantry();

  } catch (error) {
    setMsg(
      error.response?.data?.message ||
      "Could not update item."
    );
  }
};

  const filtered = items.filter((item) =>
    item.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const counts = useMemo(
    () => ({
      total: items.length,

      soon: items.filter(
        (item) =>
          item.daysLeft >= 0 &&
          item.daysLeft <= 2
      ).length,

      expired: items.filter(
        (item) => item.daysLeft < 0
      ).length,
    }),
    [items]
  );

  if (!user) {
    return (
      <Layout>
        <AuthBox title="Login required">
          <p>
            Please login to manage your pantry.
          </p>

          <Link
            className="primary"
            to="/login"
          >
            Go to Login
          </Link>
        </AuthBox>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page">

        <div className="pagehead">

          <div>
            <p className="eyebrow">
              MY PANTRY
            </p>

            <h2>
              Manage your food
            </h2>
          </div>

          <input
            className="search"
            placeholder="🔍 Search items"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>


        {/* STATISTICS */}

        <div className="stats">

          <div>
            <b>{counts.total}</b>
            <span>Total items</span>
          </div>

          <div className="warning">
            <b>{counts.soon}</b>
            <span>Expiring soon</span>
          </div>

          <div className="danger">
            <b>{counts.expired}</b>
            <span>Expired</span>
          </div>

        </div>


        <div className="grid2">

          {/* ADD ITEM */}

          <form
            className="card"
            onSubmit={add}
          >

            <h3>
              Add pantry item
            </h3>


            {/* FOOD NAME */}

            <input
              placeholder="Food item"
              value={form.name}
              required
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
            />


            {/* QUANTITY + UNIT */}

            <div className="row">

              <input
                type="number"
                min="0.1"
                step="0.1"
                value={form.quantity}
                onChange={(e) =>
                  setForm({
                    ...form,
                    quantity: e.target.value,
                  })
                }
              />

              <select
                value={form.unit}
                onChange={(e) =>
                  setForm({
                    ...form,
                    unit: e.target.value,
                  })
                }
              >
                <option value="kg">
                  kg
                </option>

                <option value="g">
                  g
                </option>

                <option value="litre">
                  litre
                </option>

                <option value="ml">
                  ml
                </option>

                <option value="pcs">
                  pcs
                </option>

                <option value="pack">
                  pack
                </option>

                <option value="loaf">
                  loaf
                </option>

              </select>

            </div>


            {/* EXPIRY DATE */}

            <input
              type="date"
              value={form.expiryDate}
              required
              onChange={(e) =>
                setForm({
                  ...form,
                  expiryDate: e.target.value,
                })
              }
            />


            {/* CATEGORY */}

            <select
              value={form.category}
              onChange={(e) =>
                changeCategory(e.target.value)
              }
            >

              <option value="Vegetables">
                Vegetables
              </option>

              <option value="Fruits">
                Fruits
              </option>

              <option value="Dairy">
                Dairy
              </option>

              <option value="Grains">
                Grains
              </option>

              <option value="Eggs">
                Eggs
              </option>

              <option value="Bakery">
                Bakery
              </option>

              <option value="Beverages">
                Beverages
              </option>

              <option value="Other">
                Other
              </option>

            </select>


            {/* ADD BUTTON */}

            <button
              className="primary"
              type="submit"
            >
              + Add Item
            </button>


            {msg && (
              <p className="error">
                {msg}
              </p>
            )}

          </form>


          {/* PANTRY ITEMS */}

          <div className="card">

            <h3>
              Pantry items
            </h3>

            {filtered.length === 0 ? (

              <p className="muted">
                No items yet. Add your first
                pantry item.
              </p>

            ) : (

              filtered.map((item) => (

                <div
                  className="item"
                  key={item._id}
                >

                  <div>

                    <b>
                      {item.name}
                    </b>

                    <small>
                      {item.quantity}{" "}
                      {item.unit} ·{" "}
                      {item.category}
                    </small>

                  </div>


                  <div
                    className={
                      item.daysLeft < 0
                        ? "pill dangerpill"
                        : item.daysLeft <= 2
                        ? "pill warnpill"
                        : "pill"
                    }
                  >

                    {item.daysLeft < 0
                      ? "Expired"
                      : item.daysLeft === 0
                      ? "Today"
                      : `${item.daysLeft} days`}


                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
  <button
    type="button"
    onClick={() => editItem(item)}
    title="Edit this item"
  >
    Edit
  </button>

  <button
    type="button"
    onClick={() => useItem(item)}
    title="Use this item"
  >
    Use
  </button>

  <button
    type="button"
    onClick={() => del(item._id)}
    title="Delete this item"
  >
    ×
  </button>
</div>

                  </div>

                </div>

              ))

            )}

          </div>

        </div>

      </div>
    </Layout>
  );
}

/* =========================
   Recipes
========================= */

function Recipes() {
  const user = JSON.parse(
    localStorage.getItem("pantryUser") || "null"
  );

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadRecipes = async () => {
      setLoading(true);

      try {
        const response = await axios.get(
          API + "/recipes/smart/" + user.id
        );

        setRecipes(response.data);
      } catch (error) {
        console.error("Recipe loading error:", error);
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, [user?.id]);

  if (!user) {
    return (
      <Layout>
        <AuthBox title="Login required">
          <p>
            Please login to see smart recipe
            recommendations.
          </p>

          <Link
            className="primary"
            to="/login"
          >
            Go to Login
          </Link>
        </AuthBox>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page">

        <p className="eyebrow">
          SMART RECIPE MANAGER
        </p>

        <h2>
          Recipes to use food before it expires
        </h2>

        <p className="muted">
          Recipes are recommended based on the
          ingredients currently available in your
          pantry and their expiry dates.
        </p>

        {loading ? (
          <p>Finding recipes from your pantry...</p>
        ) : recipes.length === 0 ? (
          <div className="card">
            <h3>No matching recipes found</h3>

            <p className="muted">
              Add more food items to your pantry
              to get smart recipe recommendations.
            </p>

            <Link
              className="primary"
              to="/pantry"
            >
              Go to Pantry
            </Link>
          </div>
        ) : (
          <>
            <div className="card">
              <h3>
                🍽️ Smart recommendations
              </h3>

              <p className="muted">
                Recipes are prioritized using
                ingredients that are closest to
                their expiry date.
              </p>
            </div>

            <div className="recipegrid">

              {recipes.map((recipe, index) => (

                <div
                  className="recipe"
                  key={recipe.name}
                >

                  {/* Recipe icon */}
                  <div className="recipeemoji">
                    {index === 0 ? "🔥" : "🍳"}
                  </div>

                  <h3>
                    {recipe.name}
                  </h3>

                  <p>
                    {recipe.description}
                  </p>


                  {/* Pantry match */}
                  <div className="card">

                    <strong>
                      ✅ Your pantry matches
                    </strong>

                    {recipe.matchedIngredients &&
                    recipe.matchedIngredients.length > 0 ? (
                      <div className="tags">
                        {recipe.matchedIngredients.map(
                          (ingredient) => (
                            <span
                              key={ingredient}
                            >
                              {ingredient}
                            </span>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="muted">
                        No matching ingredients
                      </p>
                    )}

                  </div>


                  {/* Recipe ingredients */}
                  <div>

                    <strong>
                      🥕 Ingredients needed
                    </strong>

                    <div className="tags">

                      {recipe.ingredients.map(
                        (ingredient) => (
                          <span
                            key={ingredient}
                          >
                            {ingredient}
                          </span>
                        )
                      )}

                    </div>

                  </div>


                  {/* Match count */}
                  <p>
                    <strong>
                      Pantry match:
                    </strong>{" "}
                    {recipe.matchCount} ingredient
                    {recipe.matchCount !== 1
                      ? "s"
                      : ""}
                  </p>


                  {/* Expiry priority */}
                  {recipe.priorityIngredient && (
                    <div className="usefirst">

                      ⏰ <strong>
                        Use soon:
                      </strong>{" "}

                      {recipe.priorityIngredient}

                      {recipe.daysLeft !== null && (
                        <>
                          {" "}
                          (
                          {recipe.daysLeft < 0
                            ? "expired"
                            : recipe.daysLeft === 0
                            ? "expires today"
                            : `${recipe.daysLeft} day${
                                recipe.daysLeft !== 1
                                  ? "s"
                                  : ""
                              } left`}
                          )
                          )
                        </>
                      )}

                    </div>
                  )}

                </div>

              ))}

            </div>
          </>
        )}

      </div>
    </Layout>
  );
}
function parseExpiryDateFromText(text) {
  if (typeof text !== "string" || !text.trim()) return "";
  const labelled = text.match(/(?:EXP(?:IRY)?|BEST\\s*BEFORE|BB|USE\\s*BY|USE-BY|VALID\\s*UNTIL)\\s*[:.-]?\\s*(\\d{1,2}[\\/-]\\d{1,2}[\\/-]\\d{2,4}|\\d{1,2}\\s+[A-Za-z]{3,9}\\s+\\d{2,4}|[A-Za-z]{3,9}\\s+\\d{1,2},?\\s+\\d{2,4})/i);
  if (!labelled) return "";
  const value = labelled[1].trim();
  let year, month, day;
  let m = value.match(/^(\\d{1,2})[\\/-](\\d{1,2})[\\/-](\\d{2,4})$/);
  if (m) {
    day = Number(m[1]); month = Number(m[2]); year = Number(m[3]);
  } else {
    m = value.match(/^(\\d{1,2})\\s+([A-Za-z]{3,9})\\s+(\\d{2,4})$/);
    if (m) {
      day = Number(m[1]); month = new Date(Date.parse(m[2] + " 1, 2000")).getMonth() + 1; year = Number(m[3]);
    } else {
      m = value.match(/^([A-Za-z]{3,9})\\s+(\\d{1,2}),?\\s+(\\d{2,4})$/);
      if (!m) return "";
      month = new Date(Date.parse(m[1] + " 1, 2000")).getMonth() + 1; day = Number(m[2]); year = Number(m[3]);
    }
  }
  if (year < 100) year += year <= 79 ? 2000 : 1900;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return "";
  return String(year).padStart(4, "0") + "-" + String(month).padStart(2, "0") + "-" + String(day).padStart(2, "0");
}

function Scan() {
  const user = JSON.parse(
    localStorage.getItem("pantryUser") || "null"
  );

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [detectedItems, setDetectedItems] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);

  const API =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

  const analyzeImage = async (imageFile = file) => {
    if (!imageFile) {
      setMessage("Please select a food image first.");
      return;
    }

    setAnalyzing(true);
    setMessage("Analyzing image with Vision AI...");
    setDetectedItems([]);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await axios.post(
        API + "/vision/analyze",
        formData
      );

      console.log("Groq Vision result:", response.data);

      const items = response.data.items || [];

      if (items.length === 0) {
        setMessage("No food items were detected.");
        return;
      }

      const detected = items.map((item, index) => {
        const apiDate = typeof item.expiryDate === "string" && /^\\d{4}-\\d{2}-\\d{2}$/.test(item.expiryDate) ? item.expiryDate : "";
        const printedText = item.expiryDateText || "";
        const dateFromLabel = parseExpiryDateFromText(printedText);
        return {
          id: Date.now() + index,
          name: item.name || "Unknown Food",
          quantity: item.quantity || 1,
          unit: item.unit || "pcs",
          category: item.category || "Other",
          expiryDate: apiDate || dateFromLabel,
          expiryDateConfidence: apiDate ? (item.expiryDateConfidence || "medium") : dateFromLabel ? "medium" : "low",
          expiryDateText: printedText,
          selected: true
        };
      });

      setDetectedItems(detected);

      setMessage(
        `${detected.length} food item${
          detected.length > 1 ? "s" : ""
        } detected successfully. Please review them below.`
      );

    } catch (error) {
      console.error(
        "Vision AI error:",
        error.response?.data || error
      );

      setMessage(
        error.response?.data?.message ||
        "Could not analyze the image. Please try again."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const updateItem = (id, field, value) => {
    setDetectedItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value
            }
          : item
      )
    );
  };

  const addSelectedToPantry = async () => {
    if (!user) {
      setMessage("Please login first.");
      return;
    }

    const selectedItems =
      detectedItems.filter(
        (item) => item.selected
      );

    if (selectedItems.length === 0) {
      setMessage("Please select at least one item.");
      return;
    }

    const missingDate =
      selectedItems.some(
        (item) => !item.expiryDate
      );

    if (missingDate) {
      setMessage(
        "Please enter an expiry date for all selected items."
      );
      return;
    }

    try {
      for (const item of selectedItems) {
        await axios.post(API + "/pantry", {
          userId: user.id,
          name: item.name,
          quantity: Number(item.quantity) || 1,
          unit: item.unit,
          category: item.category,
          expiryDate: item.expiryDate
        });
      }

      setMessage(
        `${selectedItems.length} item${
          selectedItems.length > 1 ? "s" : ""
        } added to your pantry successfully.`
      );

      setDetectedItems([]);
      setFile(null);

    } catch (error) {
      console.error("Pantry save error:", error);

      setMessage(
        "Could not add detected items to pantry."
      );
    }
  };

  return (
    <Layout>
      <div className="page">

        <p className="eyebrow">
          VISION AI
        </p>

        <h2>
          Scan a grocery image
        </h2>

        <p className="muted">
          Upload a grocery image and Vision AI will automatically identify food items
          and read visible expiry dates.
        </p>

        {/* UPLOAD */}

        <div className="upload card">

          <div className="camera">
            📷
          </div>

          <h3>
            Upload image
          </h3>

          <p>
            Choose a grocery or food image.
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0] || null;
              setFile(selectedFile);
              setMessage("");
              setDetectedItems([]);

              if (selectedFile) {
                // Start AI food and expiry-date detection immediately after upload.
                analyzeImage(selectedFile);
              }
            }}
          />

          {file && (
            <p>
              Selected:{" "}
              <b>{file.name}</b>
            </p>
          )}

          <button
            className="primary"
            type="button"
            onClick={analyzeImage}
            disabled={!file || analyzing}
          >
            {analyzing
              ? "🔄 Analyzing..."
              : "🔄 Analyze image again"}
          </button>

          {message && (
            <p className="muted">
              {message}
            </p>
          )}

        </div>

        {/* DETECTED ITEMS */}

        {detectedItems.length > 0 && (

          <div className="card">

            <h3>
              🧠 Detected Food Items
            </h3>

            <p className="muted">
              Review the detected items before
              adding them to your pantry.
            </p>

            {detectedItems.map((item) => (

              <div
                className="item"
                key={item.id}
                style={{
                  display: "block",
                  marginBottom: "16px"
                }}
              >

                {/* SELECT */}

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "10px"
                  }}
                >

                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "selected",
                        e.target.checked
                      )
                    }
                  />

                  <b>
                    {item.name}
                  </b>

                </label>

                {/* QUANTITY + UNIT */}

                <div className="row">

                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "quantity",
                        e.target.value
                      )
                    }
                  />

                  <select
                    value={item.unit}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "unit",
                        e.target.value
                      )
                    }
                  >

                    <option value="kg">
                      kg
                    </option>

                    <option value="g">
                      g
                    </option>

                    <option value="litre">
                      litre
                    </option>

                    <option value="ml">
                      ml
                    </option>

                    <option value="pcs">
                      pcs
                    </option>

                    <option value="pack">
                      pack
                    </option>

                    <option value="loaf">
                      loaf
                    </option>

                  </select>

                </div>

                {/* EXPIRY */}

                <label>

                  <small>
                    Expiry date
                  </small>

                  <input
                    type="date"
                    value={item.expiryDate}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "expiryDate",
                        e.target.value
                      )
                    }
                  />

                  <small className="muted">
                    {item.expiryDate
                      ? "AI-read date (" + item.expiryDateConfidence + " confidence). Please verify it against the package."
                      : "AI could not confidently read an expiry date" + (item.expiryDateText ? " (visible text: " + item.expiryDateText + ")" : "") + ". Enter it manually."}
                  </small>

                </label>

                {/* CATEGORY */}

                <label>

                  <small>
                    Category
                  </small>

                  <select
                    value={item.category}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "category",
                        e.target.value
                      )
                    }
                  >

                    <option value="Vegetables">
                      Vegetables
                    </option>

                    <option value="Fruits">
                      Fruits
                    </option>

                    <option value="Dairy">
                      Dairy
                    </option>

                    <option value="Grains">
                      Grains
                    </option>

                    <option value="Eggs">
                      Eggs
                    </option>

                    <option value="Bakery">
                      Bakery
                    </option>

                    <option value="Beverages">
                      Beverages
                    </option>

                    <option value="Protein">
                      Protein
                    </option>

                    <option value="Snacks">
                      Snacks
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </label>

              </div>

            ))}

            {/* ADD TO PANTRY */}

            <button
              className="primary"
              type="button"
              onClick={addSelectedToPantry}
            >
              ➕ Add Selected Items to Pantry
            </button>

          </div>

        )}

        <p className="muted">
          <b>How it works:</b> The uploaded image is
          analyzed by Groq Vision AI, including visible expiry dates. Detected food
          items are shown for review before being stored
          in MongoDB.
        </p>

      </div>
    </Layout>
  );
}
/* =========================
   App Routes
========================= */

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/pantry"
        element={<Pantry />}
      />

      <Route
        path="/recipes"
        element={<Recipes />}
      />

      <Route
        path="/scan"
        element={<Scan />}
      />
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

export default App;