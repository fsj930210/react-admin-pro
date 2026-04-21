import { HttpResponse, http } from "msw";

const SUCCESS_CODE = "0000000000";

// Mock data for basic user table
const users = Array.from({ length: 1000 }, (_, index) => ({
  id: (10000 + index).toString(),
  name: [
    "Percy Schamberger",
    "Kellie Smitham Jr.",
    "Randy Hoger",
    "Jamie O'Connell",
    "Janice Sporer",
    "Delores Pollich",
    "Lloyd Heathcote",
    "Todd Boyer",
    "Bob Beahan",
    "Melba Haag"
  ][index % 10],
  email: [
    "derek.bernier3@hotmail.com",
    "margie.juttgen22@gmail.com",
    "blanca98@hotmail.com",
    "bud.schuster@yahoo.com",
    "reuben.proace63@gmail.com",
    "rodel@hotmail.com",
    "martine.juttgen@hotmail.com",
    "trinity.troy98@hotmail.com",
    "milan.van87@hotmail.com",
    "vada.klocko@yahoo.com"
  ][index % 10],
  phone: [
    "832.538.8673",
    "924.904.4209 x5607",
    "(237) 382-8887 x65...",
    "(483) 842-1255 x008",
    "1-594-579-9823 x7...",
    "714.586.3099 x766",
    "357-388-0390 x5412",
    "(767) 894-8754 x9723",
    "872.531.1831 x038",
    "1-566-442-7222"
  ][index % 10],
  age: Math.floor(Math.random() * 60) + 20,
  expenses: Math.floor(Math.random() * 10) + 1,
  total_amount: (Math.random() * 3000 + 500).toFixed(2),
  joined: "Oct 30, 2025"
}));

// Mock data for advanced orders table with subrows
const orders = Array.from({ length: 1000 }, (_, index) => {
  const orderId = `ORD-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  const customer = [
    "Willis Yost",
    "Thomas Zboncak",
    "Doreen Adams Sr.",
    "Mr. Ted Mosinski",
    "Tyrone Walker DVM",
    "Sue Dietrich DDS",
    "Carrie Sauer",
    "Grady Nader",
    "Mrs. Kristie Kortzmann",
    "Faith Dare"
  ][index % 10];

  const statuses = ["Cancelled", "Shipped", "Pending", "Delivered", "Processing"];
  const status = statuses[Math.floor(Math.random() * statuses.length)];

  const products = [
    { name: "Bespoke Bamboo Bike", price: 1711.39, qty: 5 },
    { name: "Fresh Bronze Chips", price: 371.84, qty: 10 },
    { name: "Fantastic Bronze Chair", price: 291.30, qty: 6 },
    { name: "Sleek Steel Tuna", price: 380.79, qty: 3 },
    { name: "Practical Silk Ball", price: 486.71, qty: 1 },
    { name: "Luxurious Cotton Table", price: 95.43, qty: 1 },
    { name: "Sleek Rubber Shirt", price: 446.12, qty: 6 },
    { name: "Intelligent Bamboo Shirt", price: 339.14, qty: 6 },
    { name: "Luxurious Gold Tuna", price: 820.13, qty: 6 },
    { name: "Tasty Granite Chips", price: 118.81, qty: 1 }
  ];

  const productIndex = index % products.length;
  const mainProduct = products[productIndex];
  const subtotal = (mainProduct.price * mainProduct.qty).toFixed(2);

  // Create subrows (items) for each order
  const itemsCount = Math.floor(Math.random() * 5) + 1;
  const items = Array.from({ length: itemsCount }, (_, i) => {
    const itemProduct = products[(productIndex + i) % products.length];
    const itemQty = Math.floor(Math.random() * 10) + 1;
    return {
      id: `${orderId}-item-${i + 1}`,
      product: itemProduct.name,
      price: itemProduct.price.toFixed(2),
      qty: itemQty,
      subtotal: (itemProduct.price * itemQty).toFixed(2)
    };
  });

  const total = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0).toFixed(2);

  const dates = [
    "Jan 20, 2026",
    "Apr 9, 2026",
    "Jan 2, 2026",
    "Nov 29, 2025",
    "Dec 14, 2025",
    "Oct 25, 2025",
    "Jan 11, 2026",
    "Jan 13, 2026",
    "Nov 25, 2025",
    "Mar 9, 2026"
  ];

  return {
    id: orderId,
    customer,
    product: mainProduct.name,
    qty: mainProduct.qty,
    price: mainProduct.price.toFixed(2),
    subtotal,
    items: itemsCount,
    total,
    status,
    date: dates[index % dates.length],
    subRows: items
  };
});

export default [
  // Basic user table endpoint
  http.get("/api/rap/table/users", ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") ?? "1");
    const limit = parseInt(url.searchParams.get("limit") ?? "10");
    const search = url.searchParams.get("search") ?? "";

    let filteredUsers = users;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.phone.includes(searchLower)
      );
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedUsers = filteredUsers.slice(start, end);

    return HttpResponse.json({
      code: SUCCESS_CODE,
      message: "success",
      data: {
        data: paginatedUsers,
        pagination: {
          page,
          limit,
          total_pages: Math.ceil(filteredUsers.length / limit),
          total_items: filteredUsers.length
        }
      }
    });
  }),

  // Advanced orders table endpoint
  http.get("/api/rap/table/orders", ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") ?? "1");
    const limit = parseInt(url.searchParams.get("limit") ?? "10");
    const search = url.searchParams.get("search") ?? "";

    let filteredOrders = orders;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchLower) ||
        order.customer.toLowerCase().includes(searchLower) ||
        order.product.toLowerCase().includes(searchLower)
      );
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedOrders = filteredOrders.slice(start, end);

    return HttpResponse.json({
      code: SUCCESS_CODE,
      message: "success",
      data: {
        data: paginatedOrders,
        pagination: {
          page,
          limit,
          total_pages: Math.ceil(filteredOrders.length / limit),
          total_items: filteredOrders.length
        }
      }
    });
  })
];
