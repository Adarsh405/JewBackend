const express = require('express');
const {open} = require('sqlite');
const sqlite3 =require('sqlite3');
const path =require('path');
const app = express();
const bcrypt = require('bcrypt');
app.use(express.json());
const cors = require('cors');
app.use(cors());

let db=null;
const initilizerDBandServer=async ()=>{
    try{
        const dbPath=path.join(__dirname,'goodreads.db');
        db= await open({
            filename:dbPath,
            driver:sqlite3.Database
        });
        
        app.listen(3000,()=>{
            console.log("Server is running at http://localhost/3000;")
        })
    }
    catch(error){
        console.error('DB Error',error.message)
    }
}
app.get('/books',(request,response)=>{
  let jwtToken;
  const authHeader = request.header["authorization"];
  if(authHeader!==undefined){
    jwtToken = authHeader.split(" ")[1];

  }
  if(jwtToken===undefined){
    response.status(400);
    response.status('Invalid Access Token');
  }else{
    jwt.verify(jwtToken, "MY_SECRET_TOKEN", async(error,payLoad)=>{
      if(error){
        response.send("Invalid Access Token");
      }else{
        const getBooksQuery = `SELECT * FROM Book`
      }
    })
  }
})

app.get("/books/", (request, response) => {
  let jwtToken;
  const authHeader = request.headers["authorization"];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (jwtToken === undefined) {
    response.status(401);
    response.send("Invalid Access Token");
  } else {
    jwt.verify(jwtToken, "MY_SECRET_TOKEN", async (error, payload) => {
      if (error) {
        response.send("Invalid Access Token");
      } else {
        const getBooksQuery = `
            SELECT
              *
            FROM
             book
            ORDER BY
              book_id;`;
        const booksArray = await db.all(getBooksQuery);
        response.send(booksArray);
      }
    });
  }
});

app.get('/data',async (request,response)=>{
    const {limit =10,offset=0,orderby='ASC'} = request.query;
    const SelectQuery = `SELECT * FROM Book ORDER BY book_id ${orderby} LIMIT ${limit} OFFSET ${offset};`;
    const BookDetails = await db.all(SelectQuery);
    response.send(BookDetails);
});
app.get('/data/:bookId',async (request,response)=>{
    const {bookId}=request.params;
    const SelectQuery=`SELECT * FROM Book WHERE book_id = ${bookId};`;
    const BookDetails= await db.get(SelectQuery);
    response.send(BookDetails);
})

//Register User
app.post('/register', async (request,response)=>{
    const {username,name,password,gender,location} = request.body;
    const hashedPassword = await bcrypt.hash(password,10);
    const isUserFoundQuery = `SELECT * FROM user WHERE username = '${username}'`;
    const isUserFound = await db.get(isUserFoundQuery);
    if(isUserFound!==undefined){
      response.status(400);
      response.send('User already exist');
    }else{
      if(password.length < 5){
        response.status(400);
        response.send('Password is too short');
      }else{
        const addQuery = `INSERT INTO user(username,name,password,gender,location) 
        VALUES('${username}','${name}','${hashedPassword}','${gender}','${location}')`;
        await db.run(addQuery);
        response.status(200);
        response.send('User Registered Successfully');
      }
    }
})

app.post('/login',async (request,response)=>{
  const {username,password} = request.body;
  const checkUserQuery = `SELECT * FROM user WHERE username = '${username}'`;
  const UserDetails = await db.get(checkUserQuery);
  if(UserDetails === undefined){
    response.status(400);
    response.send("User not Found");
  }else{
    const checkPassword = await bcrypt.compare(password,UserDetails.password);
    if(checkPassword){
       const payload = {
        username: username,
      };
      const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
      response.send({ jwtToken });
    }else{
      response.status(400);
      response.send('Incorrect Password')
    }
  }
})













//Login User
// app.post('/login', async (request, response) => {
//   const {username, password} = request.body
//   const usernameCheckQuery = `SELECT * FROM user WHERE username = '${username}';`
//   const select_user = await db.get(usernameCheckQuery)

//   if (select_user === undefined) {
//     response.status(400)
//     response.send('Invalid user')
//   } else {
//     const isPasswordMatched = await bcrypt.compare(
//       password,
//       select_user.password,
//     )
//     if (isPasswordMatched) {
//       response.status(200)
//       response.send('Login success!')
//     } else {
//       response.status(400)
//       response.send('Invalid password')
//     }
//   }
// })

//Change Password

app.put('/change-password', async (request, response) => {
  const {username, oldPassword, newPassword} = request.body
  const dbUserQuery = `SELECT * FROM user WHERE username = '${username}';`
  const dbUser = await db.get(dbUserQuery)

  if (dbUser !== undefined) {
    const checkPassword = await bcrypt.compare(oldPassword, dbUser.password)
    if (checkPassword) {
      if (newPassword.length < 5) {
        response.status(400)
        response.send('Password is too short')
      } else {
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        const changePassQuery = `UPDATE user SET password = '${hashedPassword}' WHERE username = '${username}'`
        await db.run(changePassQuery)
        response.status(200)
        response.send('Password updated')
      }
    } else {
      response.status(400)
      response.send('Invalid current password')
    }
  } else {
    response.status(400)
    response.send('Invalid user')
  }
})
initilizerDBandServer()

