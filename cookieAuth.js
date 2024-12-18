const JWT = require("jsonwebtoken");

const cookiesJwtAuth = (req,res, next)=>{

    if(req.cookies === null){

        const token = req.cookies.token

    }else{
        return res.redirect("/blogs/signin")
    }

    try{
        const user = JWT.verify(token, "thisismysecretkey")
        req.user=user
        next()
    }catch(error){
        res.clearCookie("token")
        return res.redirect("/")
    }
}


// this function is used to retrieve a cookie from the browser named token that we created in the app.js file