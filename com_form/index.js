const express = require("express");
const app = express();
const bp = require("body-parser");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");


const uri = "mongodb+srv://22pa1a12c9:ZuNq7riQwGsWCB8p@cluster0.vk0pa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


app.use(bp.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

let dbClient; 

async function connectToDB() {
  dbClient = new MongoClient(uri);
  try {
    await dbClient.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1); 
  }
}

connectToDB();


app.get("/", async (req, res) => {
  const departmentFilter = req.query.department || ""; // Get department from query, default to empty string if not set
  try {
    const storage = dbClient.db("complaintsDB").collection("complaints");
    
    let query = {};
    if (departmentFilter) {
      query.department = departmentFilter; // Filter complaints by department if selected
    }
    
    const complaints = await storage.find(query).sort({ likes: -1 }).toArray(); // Fetch complaints based on query
    res.render("complaint", { complaints, departmentFilter }); // Pass departmentFilter to EJS
  } catch (error) {
    console.log("Error fetching complaints:", error);
    res.status(500).json({ success: false, message: "Error fetching complaints", error: error.message });
  }
});




app.get("/complaintsform", (req, res) => {
  res.render("complaintsform");
});



app.post("/complaintsform", async (req, res) => {
  const data = req.body; 
  console.log("Form data received:", data);

  try {
    const storage = dbClient.db("complaintsDB").collection("complaints");
    await storage.insertOne({ ...data, likes: 0 }); 
    console.log("Data submitted: ", data);
    res.redirect("/");
  } catch (error) {
    console.log("Error inserting complaint:", error);
    res.status(500).json({ success: false, message: "Error submitting complaint", error: error.message });
  }
});

 
app.post("/like/:id", async (req, res) => {
  const complaintId = req.params.id;
  try {
    const storage = dbClient.db("complaintsDB").collection("complaints");
    await storage.updateOne(
      { _id: new ObjectId(complaintId) }, 
      { $inc: { likes: 1 } } 
    );
    
    res.redirect("/"); 
  } catch (error) {
    console.log("Error adding like:", error);

  }
});


app.listen(9100, () => {
  console.log("Server is running on port 9100");
});
