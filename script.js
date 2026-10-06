const SUPABASE_URL =
  "https://sxtehozxnbachauflpog.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_DGNkZo5HllS5KPBFFINMZw_Lhn6jl77";

let allProducts = [];

async function loadProducts() {
  try {
    const response = await fetch(
      SUPABASE_URL + "/rest/v1/products?select=*",
      {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": "Bearer " + SUPABASE_KEY
        }
      }
    );

    if (!response.ok) {
      throw new Error("فشل الاتصال");
    }

    allProducts = await response.json();
    displayProducts(allProducts);

  } catch (error) {
    document.getElementById("productsList").innerHTML = `
      <div class="product">
        <div class="product-icon">⚠️</div>
        <h3>تعذر تحميل الهواتف</h3>
        <p>تحقق من اتصال Supabase.</p>
      </div>
    `;
  }
}

function displayProducts(products) {
  const container = document.getElementById("productsList");

  if (!products.length) {
    container.innerHTML = `
      <div class="product">
        <h3>لا توجد نتائج</h3>
      </div>
    `;
    return;
  }

  container.innerHTML = products.map(product => `
    <div class="product">
      <div class="product-icon">
        ${product.icon || "📱"}
      </div>

      <div class="company">
        ${product.company}
      </div>

      <h3>${product.model}</h3>

      <p>
        ${product.description || "متوفر للاستفسار"}
      </p>

      <button
        onclick="askPrice('${escapeText(product.company)}','${escapeText(product.model)}')">
        💬 استفسر عن السعر
      </button>
    </div>
  `).join("");
}

function escapeText(text) {
  return String(text).replace(/'/g, "\\'");
}

function askPrice(company, model) {
  const message =
    `السلام عليكم، أريد الاستفسار عن سعر ${company} ${model} من إدريس ستور.`;

  const url =
    "https://wa.me/249112793692?text=" +
    encodeURIComponent(message);

  window.open(url, "_blank");
}

function filterBrand(brand) {
  if (brand === "الكل") {
    displayProducts(allProducts);
    return;
  }

  const filtered = allProducts.filter(
    product => product.company === brand
  );

  displayProducts(filtered);
}

function searchProducts() {
  const value =
    document.getElementById("search").value
      .toLowerCase()
      .trim();

  const filtered = allProducts.filter(product =>
    product.company.toLowerCase().includes(value) ||
    product.model.toLowerCase().includes(value)
  );

  displayProducts(filtered);
}

document
  .getElementById("orderForm")
  .addEventListener("submit", async function(event) {

    event.preventDefault();

    const message =
      document.getElementById("message");

    message.textContent = "جاري إرسال الطلب...";

    const order = {
      customer_name:
        document.getElementById("customerName").value,

      phone:
        document.getElementById("customerPhone").value,

      location:
        document.getElementById("location").value,

      request:
        document.getElementById("request").value,

      notes:
        document.getElementById("notes").value
    };

    try {
      const response = await fetch(
        SUPABASE_URL + "/rest/v1/orders",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_KEY,
            "Authorization": "Bearer " + SUPABASE_KEY,
            "Prefer": "return=minimal"
          },

          body: JSON.stringify(order)
        }
      );

      if (!response.ok) {
        throw new Error("فشل إرسال الطلب");
      }

      message.textContent =
        "✅ تم إرسال طلبك بنجاح، سنتواصل معك قريبًا.";

      document.getElementById("orderForm").reset();

    } catch (error) {
      message.textContent =
        "❌ حدث خطأ أثناء إرسال الطلب.";
    }
  });

loadProducts();
