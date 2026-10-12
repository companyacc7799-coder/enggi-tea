require("dotenv").config();

const supabase = require("./db");

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from("resources")
      .select("id")
      .limit(1);

    if (error) {
      console.error("❌ Supabase connection failed:");
      console.error(error.message);
      return;
    }

    console.log("✅ Supabase connected successfully!");
    console.log("✅ Resources table is accessible!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testConnection();