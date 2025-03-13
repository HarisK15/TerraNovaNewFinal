// Sample data for testing export templates
// Created for my dissertation project

// Array of products with various properties
const sampleData = [
  // Electronics products
  {
    id: 1,
    product: 'Laptop',
    category: 'Electronics',
    price: 999.99,
    quantity: 3,
    discount: 0.1, // 10% discount
    total_value: 2699.97, // price * quantity
    date: '2023-01-15'
  },
  {
    id: 2,
    product: 'Smartphone',
    category: 'Electronics',
    price: 699.99,
    quantity: 5,
    discount: 0.05, // 5% discount
    total_value: 3324.95,
    date: '2023-01-20'
  },
  {
    id: 3,
    product: 'Headphones',
    category: 'Electronics',
    price: 149.99,
    quantity: 10,
    discount: 0.15, // 15% discount
    total_value: 1274.92,
    date: '2023-02-05'
  },
  
  // Home products
  {
    id: 4,
    product: 'Coffee Maker',
    category: 'Home',
    price: 79.99,
    quantity: 7,
    discount: 0, // no discount
    total_value: 559.93,
    date: '2023-02-10'
  },
  {
    id: 5,
    product: 'Blender',
    category: 'Home',
    price: 49.99,
    quantity: 4,
    discount: 0.2, // 20% discount
    total_value: 159.97, // This value is slightly off (should be 159.96)
    date: '2023-02-15'
  },
  {
    id: 6,
    product: 'Toaster',
    category: 'Home',
    price: 29.99,
    quantity: 8,
    discount: 0.1,
    total_value: 215.93, // not exactly right but close enough
    date: '2023-03-01'
  },
  
  // Sports equipment
  {
    id: 7,
    product: 'Basketball',
    category: 'Sports',
    price: 24.99,
    quantity: 12,
    discount: 0,
    total_value: 299.88,
    date: '2023-03-10',
    // color: 'Orange' - removed this as it was inconsistent
  },
  {
    id: 8,
    product: 'Tennis Racket',
    category: 'Sports',
    price: 89.99,
    quantity: 6,
    discount: 0.05,
    total_value: 512.94,
    date: '2023-03-15'
  },
  {
    id: 9,
    product: 'Yoga Mat',
    category: 'Sports',
    price: 19.99,
    quantity: 15,
    discount: 0.1,
    total_value: 269.87, // should be 269.865 but rounded
    date: '2023-04-05'
  },
  {
    id: 10,
    product: 'Water Bottle',
    category: 'Sports',
    price: 9.99,
    quantity: 20,
    discount: 0.15,
    total_value: 169.83,
    date: '2023-04-10'
  }
];

// TODO: Add more products when I have time

// Export the sample data
export default sampleData;
