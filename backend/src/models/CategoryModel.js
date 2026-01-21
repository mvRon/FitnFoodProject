const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Tên loại sản phẩm, ví dụ: "Laptop", "Acer"
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null }, // _id của category cha, null nếu là gốc
  },
  { timestamps: true }
);

// Tạo compound index để đảm bảo name + parent là unique (tùy chọn)
// Điều này cho phép: 
// - Category cha: name="Apple", parent=null
// - Category con: name="Apple", parent="Điện thoại_id"
// Nhưng không cho phép 2 category con cùng tên trong cùng 1 parent
categorySchema.index({ name: 1, parent: 1 }, { unique: true });

const Category = mongoose.model("Category", categorySchema);

module.exports = Category; 