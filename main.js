const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const fs = require("fs")
const session = require("express-session")
const multer  = require("multer")

//start the server
app.listen(3000, () => {
    console.log("Server is running at 3000 port")
})




//EJS
app.set("views", "view-files")
app.set("view engine", "ejs")

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use("/static", express.static(__dirname + '/static'))
app.use("/uploads" ,express.static(__dirname+"/uploads"))

//MULTER 

const storage = multer.diskStorage({ 
    destination: function (req, file, cb) 
    {
      cb(null, 'uploads/')
    },
    filename: function(req, file, cb)
    {
      cb(null, Date.now()+".jpg");
    }
  })
  
  var upload = multer({ storage: storage })
// Session 
app.use(session({
    secret: 'Team faltoo Rohit',
    saveUninitialized: true,
    resave: false
}))



// LOGIC started

app.get("/", (req, res) => {
    if (req.session.isLoggedIn) {
        res.redirect("/home");
    }
    else {
        res.render("login.ejs",{ message: "" })
    }
})

app.get("/register",(req,res)=>{
    if(req.session.isLoggedIn){
        res.redirect("/");
    }
    else{
        res.render("signup.ejs",{message:""});
    }
})

let name;
app.post("/signup", (req, res) => {
    readUserDB((users)=>{
        let user = req.body;
        let flag = false;
        for(let i=0;i<users.length;i++){
            if(users[i].username == user.username){
                flag = true;
                break;
            }
        }
        if(flag){
            res.render("signup.ejs",{message:"Username already exists"})
        }
        else{
            users.push(user);
            writeUserDB(users);
            res.redirect("/");
        }
    })

})

app.get("/home",(req,res)=>{
    if(req.session.isLoggedIn){
        readToDoDB(allTodos=>{
            allTodos = allTodos.filter(todo=>{
                return todo.username === req.session.username;
            })
            res.render("home.ejs",{username:req.session.username,data:allTodos})
        })
    }
    else{
        res.redirect("/");
    }
})


app.post("/login", (req, res) => {
    readUserDB((users) => {
        const user = users.find(user => user.username === req.body.username)
        if (user == null) {
            res.render("login.ejs", { message: "User Not registered, Please Create Account" })
        }
        else if (user.password === req.body.password) {
            req.session.isLoggedIn = true;
            req.session.username = req.body.username;
            res.redirect("/home")
        }
        else {
            res.render("login.ejs", { message: "Enter Correct Password" })
        }

    })


})

app.get("/logout", function (req, res) {
    req.session.destroy();
    res.redirect("/")    
})




function readUserDB(call) {
    let users = [];
    fs.readFile("./users.txt", "utf-8", (err, data) => {
        if (err) {
            console.log(err)
        }
        else if (data.length > 0) {
            users = JSON.parse(data);
        }
        call(users);
    })
}


function writeUserDB(allUsers) {
    fs.writeFile("./users.txt", JSON.stringify(allUsers), (err) => {
        if (err) {
            return 500;
        }
        return 200;
    })
}


//Save Todo
app.post("/save", upload.single("taskimage") , (req, res) => {
    readToDoDB(allTodos=>{

        let task = {
            username:req.session.username,
            id: Date.now(),
            todo: req.body.task,
            done: false,
            img:req.file.path
        }

        allTodos.push(task);
        writeToDoDB(allTodos);
        res.redirect("/");
    })
})

// for checking toDo
app.post("/check", (req, res) => {
    readToDoDB(allTodos => {
        allTodos = allTodos.map(t => {
            if (t.id === Number(req.body.id)) {
                t.done = req.body.value;
                return t;
            }
            else {
                return t;
            }
        })
        writeToDoDB(allTodos);
    })

    res.redirect("/");
})

// Function for edit Todo
app.get("/edit/:id", (req, res) => {
    if(req.session.isLoggedIn){
        readToDoDB(allTodos => {
            editTodo = allTodos.filter(t => {
                if (t.id === Number(req.params.id) && t.username === req.session.username) {
                    t.done = req.body.value;
                    return t;
                }
            })
           res.render("edit",{data:editTodo[0],username:editTodo[0].username})
        })
    }
    else{
        res.redirect("/");
    }

})

//Update Todo After operation.
app.post("/update",(req,res)=>{
 
    readToDoDB((allTodos)=>{
        let editTodo = allTodos.find(todo=>todo.id === Number(req.body.id))
        editTodo.todo = req.body.task;
        writeToDoDB(allTodos);

    })


    res.redirect("/")
})



//function for delete Todo
app.get("/delete/:id", (req, res) => {

    if(req.session.isLoggedIn){
        readToDoDB(allTodos => {
            let toRemoveTask = allTodos.find(todo => todo.id === Number(req.params.id))
            allTodos = allTodos.filter(todo => {
                return todo.id !== Number(req.params.id);
            })
            writeToDoDB(allTodos);
            fs.unlink(toRemoveTask.img,(err)=>{
                if(err){
                    console.log(err)
                }
                else{
                    console.log("deleted")
                }
            })
    
        })
    
        res.redirect("/");
    }
    else{
        res.redirect("/");
    }

})


//Read from todo.txt file
function readToDoDB(call) {
    fs.readFile("./allToDos.txt", "utf-8", (err, data) => {
        let todos = []
        if (err) {
            console.log(err)
        }
        else if (data.length > 0) {
            todos = JSON.parse(data);
            call(todos);
        }
    })
}

//write in todo.txt file
function writeToDoDB(allTodos) {
    fs.writeFile("./allToDos.txt", JSON.stringify(allTodos), (err) => {
        if (err) {
            return 500;
        }
        return 200;
    })
}