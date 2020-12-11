const express = require("express");
const app = express();
const cors = require("cors");
const multer  = require('multer');
const path = require('path');

app.use(cors());
app.use( express.urlencoded({ extended: true }));
app.use(express.json());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const JiraClient = require("jira-connector");
const jira = new JiraClient({
    host: "ideas2it.atlassian.net",
    basic_auth: {
      email: "ponnuvel@ideas2it.com",
      api_token: "W3rQuMEduhCeOYXbMCtWF23D"
    }
});

app.get("/", (req, res) => {
    res.send("Welcome");
});

app.post("/issue/create", upload.single("file"), async (req, res) => {
    const params = {
        fields: {
            project: {
                key: req.body.project
            },
            summary: req.body.summary,
            description: req.body.desc,
            issuetype: {
                name: req.body.issueType
            }
        }
    };
    const issue = await jira.issue.createIssue(params);

    const options = {
        filename: 'uploads/' + req.file.filename,
        issueId: issue.id
    }
    const response = await jira.issue.addAttachment(options);
    res.send(issue);
});

app.get("/get", async (req, res) => {
    const params = { issueKey: req.query.id };
    const issue = await jira.issue.getIssue(params);
    res.send(issue);
});

app.listen(5000, () => console.log("listening on port 5000"));