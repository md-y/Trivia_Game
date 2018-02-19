var categoriesElement;
var categories = [];
var token;
var questionQueue = [];
const initialCategory = "9";
const questionsPerRequest = "3";
var sentRequests = 0;
var currentQuestion;
var answerAreaElement;
var questionElement;
var enabledArgs = {
    "type": {
        "boolean": true,
        "multiple": true
    },
    "difficulty": {
        "easy": false,
        "medium": true,
        "hard": false,
    },
    "categories": {}
};

window.onload = function()
{
    categoriesElement = document.getElementById("categories");
    answerAreaElement = document.getElementById("answerArea");
    questionElement = document.getElementById("question");
    SendRequest("api_category.php", UpdateCategoryListing);
    SendRequest("api_token.php?command=request", (t) => {token = t.token});
}

function SendRequest(args, callback) 
{
    var req = new XMLHttpRequest();
    req.onreadystatechange = function()
    {
        if (this.readyState == 4 && this.status == 200) {
            callback(JSON.parse(req.responseText));
        }
    }
    req.open("GET", "https://opentdb.com/" + args);
    req.send();
}

function UpdateCategoryListing(json)
{
    categories = categories.concat(json["trivia_categories"]);

    for (let i of categories) {
        var link = document.createElement("a");
        link.setAttribute("href", "#");

        var sect = document.createElement("section");
        sect.className = "option";
        sect.id = "cat" + i.id.toString();
        sect.setAttribute("onclick", "ToggleOption(this);");
        link.append(sect);

        var listing = document.createElement("h5");
        listing.innerHTML = i.name;

        sect.append(listing);
        categoriesElement.append(link);

        enabledArgs.categories[i.id.toString()] = false;
    }

    ToggleOption(document.getElementById("cat" + initialCategory));
}

function ToggleOption(element)
{
    if (element.className == "option") {
        element.className = "option selected";
    } else {
        element.className = "option";
    }

    switch(element.id) {
        default: //Categories
            var id = element.id.split("cat")[1];
            enabledArgs.categories[id] = !enabledArgs.categories[id];
            break;
        case "tof": //Question Types
            enabledArgs.type.boolean = !enabledArgs.type.boolean;
            break;
        case "mul":
            enabledArgs.type.multiple = !enabledArgs.type.multiple;
            break;
        case "easy": //Difficulties
            enabledArgs.difficulty.easy = !enabledArgs.difficulty.easy;
            break;
        case "medium":
            enabledArgs.difficulty.medium = !enabledArgs.difficulty.medium;
            break;
        case "hard":
            enabledArgs.difficulty.hard = !enabledArgs.difficulty.hard;
            break;
    }

    questionQueue = []; //Clear queue for updated questions
}

function GetQuestion() 
{
    answerAreaElement.innerHTML = "";
    questionElement.innerHTML = "Loading...";
    if (questionQueue.length == 0) {
        RetrieveQuestions();
    } else {
        ShowQuestion();
    }
}

function RetrieveQuestions() 
{
    var prefix = "api.php?amount=" + questionsPerRequest + "&token=" + token;
    var baseRequests = [];

    for (let i in enabledArgs.categories) { //Categories
        if (enabledArgs.categories[i] == true)
            baseRequests.push(prefix += "&category=" + i);
    }

    var requests = [];
    for (let i in enabledArgs.type) { //Types
        if (enabledArgs.type[i]) {
            var newRequests = [];
            for (let r of baseRequests) {
                newRequests.push(r + "&type=" + i)
            }
            requests = requests.concat(newRequests);
        }
    }

    baseRequests = requests;
    requests = [];

    for (let i in enabledArgs.difficulty) { //Difficulties
        if (enabledArgs.difficulty[i]) {
            var newRequests = [];
            for (let r of baseRequests) {
                newRequests.push(r + "&difficulty=" + i)
            }
            requests = requests.concat(newRequests);
        }
    }

    sentRequests = 10;
    for (var i = 0; i < 10; i++) { //Send Requests To OpenTDB
        var r = Math.floor(Math.random() * requests.length);
        RequestQuestions(requests[r]);
    }

}

function RequestQuestions(url) 
{
    console.log(url);
    SendRequest(url, (res) => {
        if (res.response_code == 0) {
            questionQueue = questionQueue.concat(res.results);
        }
        sentRequests--;
        if (sentRequests <= 0) {
            if (questionQueue.length == 0) {
                SendRequest("api_token.php?command=reset&token=" + GetQuestion);
            } else {
                ShowQuestion();
            }
        }
    });
}

function ShowQuestion()
{
    var qn = Math.floor(Math.random() * questionQueue.length);
    var q = questionQueue[qn];
    currentQuestion = q;
    var answers = q.incorrect_answers;
    answers.splice(Math.floor(Math.random() * answers.length), 0 , q.correct_answer);

    questionElement.innerHTML = q.question;
    for (let i of answers) {
        var link = document.createElement("a");
        link.setAttribute("href", "#");

        var sect = document.createElement("section");
        sect.className = "option";
        sect.id = i; //txt//
        sect.setAttribute("onclick", "CheckAnswer(this.id)");
        link.append(sect);

        var listing = document.createElement("h4");
        listing.innerHTML = i; //txt//

        sect.append(listing);
        answerAreaElement.append(link);
    }

    questionQueue.splice(qn, 1);
}

function CheckAnswer(id)
{
    if (id == currentQuestion.correct_answer) {
        alert("Correct");
    } else {
        alert("Incorrect \nCorrect Answer: " + currentQuestion.correct_answer);
    }
    GetQuestion();
}