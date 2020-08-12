const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const fs = require('fs')
const multer = require('multer')
const bibtexParse = require('bibtex-parser-js')
const _ = require('lodash')
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "uploads")
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
})

var upload = multer({
    storage: storage
})
app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(bodyParser.urlencoded({
    extended: true
}))

const files = []
app.get("/", (req, res) => {
    res.render("bibfile")
})
app.get("/post/:fileName", (req, res) => {
    const fileName = req.params.fileName
    files.forEach(function(file) {
        var fname = _.lowerCase(file.originalname)
        if (fname === fileName) {
            fs.readFile(file.path, {
                encoding: "utf8"
            }, (err, data) => {
                if (!err) {
                    res.render("bibparse", { bibtex: data })
                    // var bib = bibtexParse.toJSON(data)
                    // res.send(bib)
                } else {
                    console.log(err)
                }
            })
        }
    })
})
app.post("/post", upload.single('bibFile'), (req, res) => {
    const file = req.file
    files.push(file)
    const fileName = _.lowerCase(req.file.originalname)
    res.redirect("/post/" + fileName)
})
app.listen(3000, () => {
    console.log("Server is running at port 3000")
})