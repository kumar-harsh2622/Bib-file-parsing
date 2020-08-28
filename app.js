const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const fs = require('fs')
// const multer = require('multer')
// const bibtexParse = require('bibtex-parser-js')
const formidable = require("formidable")
const _ = require('lodash')
const bibtexParse = require("./bibtexParse")
const mv = require("mv")
// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, "uploads")
//     },
//     filename: function(req, file, cb) {
//         cb(null, file.originalname)
//     }
// })

// var upload = multer({
//     storage: storage
// })
app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(bodyParser.urlencoded({
    extended: true
}))

const bibfiles = []
app.get("/", (req, res) => {
    res.render("bibfile")
})

app.post("/post", (req, res) => {
    var form = new formidable.IncomingForm()
    form.parse(req, function(err, fields, files) {
        var file = files.bibFile
        var oldpath = files.bibFile.path
        var newpath = __dirname + "/uploads/" + files.bibFile.name
        file.path = newpath
        const fileName = _.lowerCase(files.bibFile.name)
        mv(oldpath, newpath, (err => {
            if (err) console.log(err);
            else {
                console.log("File uploaded");
            }
        }))
        // console.log(file);
        bibfiles.push(file)
        res.redirect("/post/" + fileName)
    })
})

function removeSpecial(params) {
    params.forEach(entry => {
        var newTags = entry.entryTags
        for (let key in newTags) {
            newTags[key] = newTags[key].replace(/{/g, "").replace(/}/g, "").replace(/\\/g, "").replace(/[\u{0080}-\u{FFFF}]/gu, "\"")
        }
    })
}
// console.log(files);
app.get("/post/:fileName", (req, res) => {
    const fileName = req.params.fileName
    bibfiles.forEach(file => {
        var fname = _.lowerCase(file.name)
        if (fname === fileName) {
            fs.readFile(file.path, { encoding: "utf8" }, (err, data) => {
                if (!err) {
                    var bib = bibtexParse.toJSON(data)
                    removeSpecial(bib)
                    var journals = [],
                        conferences = [],
                        books = []
                    // console.log(bib);
                    bib.forEach(entry => {
                        if (entry.entryType === "ARTICLE") journals.push(entry)
                        else if (entry.entryType === "INPROCEEDINGS") conferences.push(entry)
                        else if (entry.entryType === "BOOKS") books.push(entry)
                    })
                    journals.sort(function(a, b) {
                        return b.entryTags.YEAR - a.entryTags.YEAR;
                    })
                    conferences.sort(function(a, b) {
                        return b.entryTags.YEAR - a.entryTags.YEAR;
                    })
                    books.sort(function(a, b) {
                        return b.entryTags.YEAR - a.entryTags.YEAR;
                    })
                    // console.log(journals);
                    res.render("mybib", { journals: journals, conferences: conferences, books: books })
                } else {
                    console.log(err);
                }
            })
        }
    })
})
app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running at port 3000")
})