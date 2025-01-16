const express = require('express');
const {default:mongoose} = require('mongoose');
const methodOverride = require('method-override');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cookieJWTAuth = require("./cookieAuth.js");
const User = require('./models/user.js');
const Blog = require('./models/blog.js');
const connectDB = require('./utils/connectDB.js')

connectDB()

const app = express();
const port = 8080;
app.set('views engine', 'ejs')

app.use(express.static('public'))
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'))
app.use(cookieParser());
app.use(express.json());

app.get("/", async (req, res)=>{
    const blogs = (await Blog.find()).reverse()
    res.render('index.ejs', {title: 'HOME', blogs})
})

app.get("/about", (req, res)=>{
    res.render("about.ejs",  {title: 'ABOUT US'})
})

app.get("/sentmail", (req, res)=>{
    res.render("sentmail.ejs", {title: "SENT"})
})

app.get("/blogs/create", (req, res)=>{
    res.render("createblogs.ejs",  {title: 'NEW BLOG'})
})

app.post("/blogs/create", async (req, res)=>{
    try {
        const blog = new Blog(req.body);
    console.log(blog)

    await blog.save().then(()=>{
        res.redirect('/')
    })
    } catch (error) {
        console.log(error)
        res.redirect('/blogs/create')        
    }
})

app.get('/blogs/signup', (req, res)=>{
    res.render('signup.ejs', {title: 'Sign Up'});
})

app.get("/blogs/signin", (req,res)=>{
    res.render("signin.ejs", {title: "Sign In"})
})

app.get("/blogs/logout", (req,res)=>{
    res.cookie("token","")
    res.redirect("/")
})

app.post('/blogs/signup', async (req, res)=>{
    const {username, email, password} = req.body;
    console.log(username, email, password);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ username, email, password: hashedPassword});
    await user.save()

    const payload = {
        user: {
            email: user.email
        },
    }

    const token = await JWT.sign(payload, 'thisismysecretkey', {
        expiresIn: '3600s'
    })
    
    //send the token to the browser to be stored as a cookie
    res.cookie('token', token,{
        httpOnly: true,
    })
    
    res.redirect('/blogs/create')
})

app.post("/blogs/login", async(req,res)=>{
    const {email,password} = req.body;

    const user = await User.findOne({email})
    if (!user) {
        res.redirect("/blogs/signup")
    }

    await bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
            return res.redirect("/")
        }

        if(!isMatch) {
            return res.redirect("/blogs/signin")
        }

        const payload = {
            user: {
                email: user.email,
                username: user.username,
                id: user.id,
            },
        }    

        const token = JWT.sign(payload,"thisismysecretkey",{
            expiresIn:"3600",
        })

        res.cookie("token",token, { httpOnly: true });

        res.redirect("/blogs/create")

    });
})

app.get('/contact',(req, res)=>{
    res.render("contact.ejs", {title: 'CONTACT'})
})

app.post('/contact',  async (req, res)=>{
    const username = req.body.username;
    const useremail = req.body.email;
    const messageBody = req.body.userMessage;
    console.log(username, useremail, messageBody)

    const transporter = nodemailer.createTransport(
        smtpTransport({
            service:'gmail',
            host:'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'frankluv4christ@gmail.com',
                pass: 'xickkoawzxecjjwt'
            }
        })
    )

    const mailOptions = {
        from: useremail,
        to: 'frankluv4christ@gmail.com',
        subject: `${username}  enquiry from the Contact Form`,
        html: messageBody
    }

    await transporter.sendMail(mailOptions, (error, info)=>{
        if (error) {
            console.log(error)
        } else {
            res.redirect('/contact')
        }
    })
})


app.delete('/blogs/:postid', async (req, res)=>{
    try {
        const postID = req.params.postid;
    const deletePost = await Blog.findByIdAndDelete(postID);
    res.redirect('/')
    } catch (e) {
        console.log(err)
    }
})

app.get('/blogs/:postid', async (req, res)=>{
    const postID = req.params.postid;
    const blog = await Blog.findById(postID);
    res.render("details.ejs", {title: 'SINGLE', blog})
})

app.get("/blogs/updateblogs/:postid",  async (req, res)=>{
    const postID = req.params.postid;
    const blog = await Blog.findById(postID)

    // console.log(blog)
    res.render("update.ejs",  {title: 'UPDATE BLOG', blog})
})

app.put('/blogs/:postid', async (req, res)=>{
    try {
        const postID = req.params.postid;
        const body = req.body;        
        res.redirect('/')
        const  updatePost = await Blog.findByIdAndUpdate(postID, body, {new: true, runValidators: true});
        // console.log(updatePost)
        res.redirect('/')
    } catch (err) {
        console.log(err)
    }
})

app.use((req, res)=>{
    res.render("404.ejs",  {title: '404'})
})

app.listen(port, ()=>{
    console.log('Server is currently running')
})
