import express from "express";
import bodyParser from "body-parser";
// import session from "express-session";
// import cookieParser from "cookie-parser";
// import flash from "connect-flash";
import pg from "pg";
// import fileupload from "express-fileupload";
import multer from "multer"; // it is a middleware specially used for Uploading image file and handling (<form enctype = multipart/form-data>) or multiple data 

const app = express();
const port = 3000;

const db = new pg.Client({
user:"postgres",
host:"localhost",
database:"WorldRecipes",
password:"root",
port:5432,
});

db.connect();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
const upload = multer({ dest: './public/data/uploads/' });
// app.use(fileupload());
// app.use(cookieParser());
// app.use(flash());

/*Main Section*/

/*Read operation Here we can Read all the Recipes */
app.get("/" , async(req,res) =>  {
try{
    const value =  await db.query("SELECT id FROM newrecipe WHERE id = (SELECT MAX(id) FROM newrecipe)");
    // console.log(value.rows[0].id);
    const newnumber = value.rows[0].id;
    const currentid = newnumber;
    const result = await db.query("SELECT * FROM allrecipes WHERE id < 6");
    const newresult = await db.query("SELECT id,name,image FROM newrecipe  WHERE id > $1 ORDER BY id DESC",[currentid-5]);
    const result2 = await db.query("SELECT * FROM newrecipe");
    let newdummyrecipe = [];
    let dummyrecipe = [];
    let recipe=[];
    dummyrecipe = result.rows;
    newdummyrecipe = newresult.rows;
    recipe = result2.rows;
    res.render("index.ejs" ,  {
    items : dummyrecipe,
    newitems : newdummyrecipe,
    allitem:recipe,    
    },);
}
catch(error)
{
    res.render("newrecipe.ejs",{value:"Error"},);   
}
});

/*Home Section*/
app.get("/home" , async(req,res) =>  {
try{
    const value =  await db.query("SELECT id FROM newrecipe WHERE id = (SELECT MAX(id) FROM newrecipe)");
    // console.log(value.rows[0].id);
    const newnumber = value.rows[0].id;
    const currentid = newnumber; 
    const result = await db.query("SELECT * FROM allrecipes WHERE id < 6");
    const newresult = await db.query("SELECT id,name,image FROM newrecipe WHERE id > $1 ORDER BY id DESC",[currentid-5]);
    const result2 = await db.query("SELECT * FROM newrecipe");
    let newdummyrecipe = [];
    let dummyrecipe = [];
    let recipe=[];
    dummyrecipe = result.rows;
    newdummyrecipe = newresult.rows;
    recipe = result2.rows;
    res.render("index.ejs" ,  {
    items : dummyrecipe,
    newitems : newdummyrecipe,
    allitem:recipe,    
    },);
}
catch(error)
{
  res.render("newrecipe.ejs",{value:"Error"},);   
}
});

/*About Section*/
app.get("/about",async(req,res)=>{
try{
    res.render("About.ejs");
}
catch(error)
{
  res.render("newrecipe.ejs",{value:"Error"},);   
}   
});

/*Recipe.ejs */
/* start for id */
let ID;

// Created my own MiddleWare specially for recipe/id value.
// Middleware is used specially for accesing Specific Recipe at a particular ID.
async function logger (req,res,next)
{
const id = (req.params.id);
const result = await db.query("SELECT * FROM newrecipe");
let items=[];
items = result.rows;
items.forEach(element => {
    if(element.id == id)
    {
        ID = element.id;
    }
});
next();
}
app.use(logger); //middleware call

app.get("/recipe/:ID",async(req,res)=>{ // took reference from build my own api folder in get specific joke has been used in it.
try{
    const id = parseInt(req.params.ID);//
    const newresult = await db.query("SELECT * FROM newrecipe WHERE id = $1",[id]);
    let newitem = [];
    newitem = newresult.rows;
    console.log(newresult.rows);
    res.render("recipes.ejs",{
    Item:newitem,    
    },);
}
catch(error)
{
  res.render("newrecipe.ejs",{value:"Error"},);   
}
});

/*categories.ejs */
app.get("/categories", async(req,res) => {
try{
    const result = await db.query("SELECT * FROM allrecipes");
    let dummyrecipe = [];
    dummyrecipe = result.rows;
    res.render("categories.ejs" , {items:dummyrecipe},);
}
catch(error)
{
  res.render("newrecipe.ejs",{value:"Error"},);   
}
});


/* new.ejs */
/*Created my own MiddleWare specially for categories/Cat  */
/*  Middleware is used specially for accesing Specific Recipe
at a Particular Category and inside the category accesing specific Recipe at a particular ID. */
let Cat;
async function newlogger (req,res,next)
{
const category = (req.params.category);
const result = await db.query("SELECT * FROM newrecipe");
let items=[];
items = result.rows;
items.forEach(element => {
    if(element.category == category)
    {
        Cat = category;
    }
});
    next();
}
app.use(newlogger); //middleware call

app.get("/categories/:Cat", async(req,res) => {
try{
    const cate = req.params.Cat;
    console.log(cate);
    const result = await db.query("SELECT * FROM newrecipe WHERE category = $1",[cate]);
    let newitem = [];
    newitem = result.rows;
    console.log(result.rows);
    res.render("new.ejs",{
    Item:newitem,
    Category:cate,})
}
catch(error)
{
  res.render("newrecipe.ejs",{value:"Error"},);   
}
});  

/*recipes.ejs */
app.get("/categories/:Cat/:ID", async(req,res) => {
try{
    const id = parseInt(req.params.ID);
    const newresult = await db.query("SELECT * FROM newrecipe WHERE id = $1",[id]);
    let newitem = [];
    newitem = newresult.rows;
    console.log(newresult.rows);
    res.render("recipes.ejs",{
    Item:newitem,},); 
}
catch(error)
{
  res.render("newrecipe.ejs",{value:"Error"},);   
}
});

/* Search any Dish = Search.ejs */
app.post("/search", async(req,res)=>{
try{
    const finditem = req.body.search;
    console.log(finditem);
    const result = await db.query("SELECT * FROM newrecipe WHERE LOWER(name) LIKE '%' || $1 || '%';",[finditem.toLowerCase()]);
    console.log(result.rows);
    let Item = [];
    Item = result.rows; 
    res.render("Search.ejs", {newitem:Item},);
}
catch(error)
{
  res.render("newrecipe.ejs",{value:"Error"},);   
}
});

/* Explore Latest Section = explore.ejs*/
// in this section all the recipes are arranged in descending order.
app.get("/explore-latest",async(req,res)=>{
try{   
    const value =  await db.query("SELECT id FROM newrecipe WHERE id = (SELECT MAX(id) FROM newrecipe)");
    // console.log(value.rows[0].id);
    const newnumber = value.rows[0].id;
    const currentid = newnumber;
    const result = await db.query("SELECT * FROM newrecipe WHERE id <= $1 ORDER BY id DESC",[currentid]);
    let alitem = [];
    alitem = result.rows;
    res.render("explore.ejs",{item:alitem});    
}
catch(error)
{
  res.render("newrecipe.ejs",{value:"Error"},);   
}
});

/* Submit-Recipe Section = Submit-Recipe.ejs*/
/*Create operation , Here we Create our new Recipe */
app.get("/submit-recipe",async(req,res)=>{
try{
    res.render("Submit-Recipe.ejs");
}
catch(error)
{
    res.render("newrecipe.ejs",{value:"Error"},);   
}
});


app.post("/submit-recipe",upload.single("image"), async(req,res)=>{
try{    
    const value =  await db.query("SELECT id FROM newrecipe WHERE id = (SELECT MAX(id) FROM newrecipe)");
    // console.log(value.rows[0].id);
    const newnumber = value.rows[0].id;
    const currentid = newnumber;
    const newid = currentid + 1;
    const Email = req.body.email;
    console.log(Email);
    const Source = req.body.source;
    console.log(Source);
    const recipename = req.body.name;
    console.log(recipename);
    const Description = req.body.description;
    console.log(Description);
    const Ingredients = req.body.ingredients;
    console.log(Ingredients);
    const category = req.body.category;
    console.log(category);
    const Image = req.file.originalname;   
    // console.log(req.file,req.body);
    //console.log(req.file.originalname);
    console.log(Image);
     await db.query("INSERT INTO newrecipe(id,name,description,source,email,ingredients,category,image) VALUES($1,$2,$3,$4,$5,($6::TEXT[]),$7,$8)",
       [newid,recipename,Description,Source,Email,Ingredients,category,Image]);
      res.render("newrecipe.ejs",{value:"Recipe Submited"},);
}
catch(error)
{
    res.render("newrecipe.ejs",{value:"Error"},);   
}
});

/*Update Section = update.ejs*/
/*Update Operation Here We can Update our Recipes */
// Here to get Specific ID. Checkout app.get("/recipe/:ID") in this part how middleware is used to find ID. 
let fid;
app.get("/edit/:ID", async (req,res)=>{
try{
    const id = parseInt(req.params.ID);
    console.log(id);
    const result = await db.query("SELECT * FROM newrecipe WHERE id = $1",[id]);
    let newitem = [];
    newitem = result.rows;
    console.log(newitem);
    res.render("Update-Recipe.ejs",{Item:newitem},);
    fid = id;
}
catch(error)
{
    res.render("newrecipe.ejs",{value:"Error"},);   
}
});

app.post("/edit",upload.single("image"),async(req,res)=> {
    console.log(fid);
    const recipename = req.body.name;
    console.log(recipename);
    const Description = req.body.description;
    console.log(Description);
    const Ingredients = req.body.ingredients;
    console.log(Ingredients);
    const category = req.body.category;
    console.log(category);
    try{ 
        const Name = await db.query("SELECT name FROM newrecipe  WHERE id = $1",[fid]); //1 
        const Desc = await db.query("SELECT description FROM newrecipe  WHERE id = $1",[fid]); //2
        const Ingre = await db.query("SELECT ingredients FROM newrecipe  WHERE id = $1",[fid]); //3
        const Cate = await db.query("SELECT category FROM newrecipe  WHERE id = $1",[fid]); //4
        if(Name !== recipename && Desc === Description && Ingre === Ingredients && Cate === category) //1
        {
            await db.query("UPDATE newrecipe SET name = $1, WHERE id = $2", [recipename,fid]); 
            res.render("newrecipe.ejs",{value:"Recipe Updated"},);
        }
        else if(Desc !== Description && Ingre === Ingredients && Cate === category && Name === recipename) //2
        {
            await db.query("UPDATE newrecipe SET description = $1, WHERE id = $2", [Description,fid]); 
            res.render("newrecipe.ejs",{value:"Recipe Updated"},);
        }
        else if(Ingre !== Ingredients && Desc === Description && Cate === category && Name === recipename) //3
        {
            await db.query("UPDATE newrecipe SET ingredients = ($1::TEXT[]), WHERE id = $2", [Ingredients,fid]); 
            res.render("newrecipe.ejs",{value:"Recipe Updated"},);
        }
        else if(Cate !== category && Name === recipename  && Desc === Description && Ingre === Ingredients) //4
        {
            await db.query("UPDATE newrecipe SET category = $1, WHERE id = $2", [category,fid]); 
            res.render("newrecipe.ejs",{value:"Recipe Updated"},);
        }
        else if(Name !== recipename && Desc !== Description && Ingre === Ingredients && Cate === category) //1,2
        {
            await db.query("UPDATE newrecipe SET name = $1, description = $2 WHERE id = $3", [recipename,Description,fid]); 
            res.render("newrecipe.ejs",{value:"Recipe Updated"},);
        }
        else if(Name !== recipename && Ingre !== Ingredients && Desc === Description && Cate === category) //1,3
        {
            await db.query("UPDATE newrecipe SET name = $1, ingredients = ($2::TEXT[]) WHERE id = $3", [recipename,Ingredients,fid]); 
            res.render("newrecipe.ejs",{value:"Recipe Updated"},);
        }
        else if(Name !== recipename && Cate !== category && Desc === Description && Ingre === Ingredients) //1,4
        {
            await db.query("UPDATE newrecipe SET name = $1, category = $2 WHERE id = $3", [recipename,category,fid]); 
            res.render("newrecipe.ejs",{value:"Recipe Updated"},);
        }
        else if(Desc !== Description && Ingre !== Ingredients && Name === recipename && Cate === category) //2,3
        {
            await db.query("UPDATE newrecipe SET description = $1, ingredients = ($2::TEXT[]) WHERE id = $3", [Description,Ingredients,fid]); 
            res.render("newrecipe.ejs",{value:"Recipe Updated"},);
        }
        else if(Desc !== Description &&  Cate !== category && Name === recipename && Ingre === Ingredients)//2,4
        {
            await db.query("UPDATE newrecipe SET description = $1, category = $2 WHERE id = $3", [Description,category,fid]); 
            res.render("newrecipe.ejs",{value:"Recipe Updated"},);
        }
        else if(Ingre !== Ingredients &&  Cate !== category && Name === recipename && Desc === Description) //3,4
        {
            await db.query("UPDATE newrecipe SET ingredients = ($1::TEXT[]), category = $2 WHERE id = $3", [Ingredients,category,fid]); 
            res.render("newrecipe.ejs",{value:"Recipe Updated"},);
        }
        else if(Name !== recipename && Desc !== Description && Ingre !== Ingredients && Cate === category) //1,2,3
        {
            await db.query("UPDATE newrecipe SET name = $1, description = $2, ingredients = ($3::TEXT[]) WHERE id = $4", [recipename,Description,Ingredients,fid]); 
            res.render("newrecipe.ejs",{value:"Recipe Updated"},);
        }
        else if(Name !== recipename && Desc !== Description && Cate !== category && Ingre === Ingredients) //1,2,4
        {
            await db.query("UPDATE newrecipe SET name = $1, description = $2, category = $3 WHERE id = $4", [recipename,Description,category,fid]); 
            res.render("newrecipe.ejs",{value:"Recipe Updated"},);
        }
        else if(Name !== recipename && Ingre !== Ingredients && Cate !== category && Desc === Description) //1,3,4
        {
            await db.query("UPDATE newrecipe SET name = $1, ingredients = ($2::TEXT[]), category = $3 WHERE id = $4", [recipename,Ingredients,category,fid]); 
            res.render("newrecipe.ejs",{value:"Recipe Updated"},);
        } 
        else if(Desc !== Description && Ingre !== Ingredients && Cate !== category && Name === recipename) //2,3,4
        {
            await db.query("UPDATE newrecipe SET description = $1, ingredients = ($2::TEXT[]), category = $3 WHERE id = $4", [Description,Ingredients,category,fid]); 
            res.render("newrecipe.ejs",{value:"Recipe Updated"},);
        }  
        else 
        {
            await db.query("UPDATE newrecipe SET name = $1, description = $2, ingredients = ($3::TEXT[]), category = $4 WHERE id = $5",
            [recipename,Description,Ingredients,category,fid]); 
            res.render("newrecipe.ejs",{value:"Recipe Updated"},);
        }
    }
    catch(error)
    {
        res.render("newrecipe.ejs",{value:"Error While Updating "},);
    }
});

/*Delete Recipe = Deleterecipe.ejs */
/*Delete Operation */
// Here to get Specific ID. Checkout app.get("/recipe/:ID") in this part how middleware is used to find ID.
let getid;

app.get("/delete/:ID", async(req,res)=>{
try{
const newid = parseInt(req.params.ID);
console.log(newid);
getid = newid;
res.render("Deleterecipe.ejs");
}
catch(error)
{
    res.render("newrecipe.ejs",{value:"Error While Deleting "},);
}
});

app.post("/delete",async(req,res)=>{
try{
console.log(getid);
    if(getid > 15)
    {  
        await db.query("DELETE FROM newrecipe WHERE id = $1",[getid]);
        res.render("newrecipe.ejs",{value:"Recipe Deleted"},);
    }
    else
    {
        res.render("newrecipe.ejs",{value:"Cannot Delete The Recipe Whose ID is Less than 15"},);
    }
}
catch(error)
{
    res.render("newrecipe.ejs",{value:"Error While Deleting the Recipe "},);
}
});
app.listen(port, () => {
    console.log (`Server running on port ${port}`);
});