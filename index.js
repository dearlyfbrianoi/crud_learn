// import module
const fs = require("fs");
const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const currencyFormatter = require("currency-formatter");
const mongoose = require("mongoose");
const port = 8089;

// connect to MongoDB
mongoose.connect("mongodb://localhost:27017/webapi", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// End Connect

const productSchema = new mongoose.Schema({
  nameProduct: String,
  description: String,
  price: Number,
  stock: Number,
  image: String,
});

const Product = mongoose.model("Product: ", productSchema);

app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true }));
app.get("/product", async (req, res) => {
  try {
    const data = await Product.find();
    const formattedData = data.map((item) => ({
      ...item,
      price: `Rp. ${currencyFormatter.format(item.price, { code: "" })}`,
    }));
    res.json(formattedData);
  } catch {
    res.json({
      status: 500,
      message: "Internal Server Error",
    });
  }
});

// get data
app.get("/product/:id", async (req, res) => {
  try {
    const findProduct = await Product.findById(req.params.id);
    if (!findProduct) {
      const lastItem = await Product.findOne().sort({ _id: -1 });
      return res.json({
        status: 404,
        message: "Data yang anda cari tidak ditemukan",
        data: lastItem,
      });
    }
    res.json(findProduct);
  } catch (error) {
    console.error("Error finding data: ", error);
    res.status(500).json({ status: 500, message: "Server Down", data: null });
  }
});

app.put("/product/:id", async (req, res) => {
  try {
    const updateProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          nameProduct: req.body.nameProduct,
          description: req.body.description,
          price: req.body.price,
          stock: req.body.stock,
          image: req.body.image,
        },
      },
      { new: true }
    );
    res.json({
      status: 200,
      message: "Data berhasil di update",
      data: updateProduct,
    });
  } catch (error) {
    console.error("Error updating data: ", error);
    res.status(500).json({ status: 500, message: "Server Down", data: null });
  }
});

app.delete("/product/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({
      status: 200,
      message: "Data berhasil di hapus",
      data: null,
    });
  } catch (error) {
    console.error("Error deleting data: ", error);
    res.status(500).json({ status: 500, message: "Server Down", data: null });
  }
});

const getData = (path) => {
  const data = fs.readFileSync(path, "utf-8", (err, data) => data);
  const parsedData = JSON.parse(data);

  const formattedData = parsedData.map((item) => ({
    ...item,
    price: `Rp. ${currencyFormatter.format(item.price, { code: "" })}`,
  }));
  return formattedData;
};

// post data
app.post("/createProduct", async (req, res) => {
  try {
    const newData = await Product.create({
      nameProduct: req.body.nameProduct,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      image: req.body.image,
    });

    res.json({
      status: 200,
      message: "Data berhasil di tambahkan",
      data: newData,
    });
  } catch (error) {
    console.error("Error creating data: ", error);
    res.status(500).json({ status: 500, message: "Server Down", data: null });
  }
});

// start server
app.listen(port, () => {
  console.log(`Server running in port 8089 http://localhost:${port}`);
});
