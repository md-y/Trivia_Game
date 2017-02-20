var api = "https://opentdb.com/"
var question, token; //Set by functions
var typeElement, difficultyElement, categoryElement, submitButton, questionDiv, questionRadio, answerDiv, html, opentdbElement; //Elements

function preload() {
   html = loadStrings("select_options.txt");
   loadJSON(api + "api_token.php?command=request", parseToken);
}

function setup() {
  createCanvas(displayWidth, 500);
  background(75);
  
  opentdbElement = createA(api, "Powered by Open Trivia Database");
  opentdbElement.position(850, height);
  
  typeElement = createSelect();
  typeElement.position(20, height);
  typeElement.size(200, 30);
  typeElement.html(html[0]); //Options
  
  difficultyElement = createSelect(); 
  difficultyElement.position(220, height);
  difficultyElement.size(100, 30);
  difficultyElement.html(html[1]); //Options
  
  categoryElement = createSelect();
  categoryElement.position(320, height);
  categoryElement.size(400, 30);
  categoryElement.html(html[2]); //Options
  
  submitButton = createButton("Get Question");
  submitButton.position(740, height);
  submitButton.size(100, 30);
  submitButton.mousePressed(submit);
}

function submit() {
  setQuestion(typeElement.value(), difficultyElement.value(), categoryElement.value());
  
  if (questionDiv != null && questionRadio != null) {
    questionDiv.remove();
    questionRadio.remove();
  }
  if (answerDiv != null) {
    answerDiv.remove(); 
  }
}

function setQuestion(type, difficulty, category) {
  loadJSON(api + "api.php?amount=1&encode=base64&difficulty=" + difficulty+ "&type=" + type + "&category=" + category + "&token=" + token, parseQuestion);
}

function parseQuestion(data) {
   switch(data.response_code) {
     case 0:
       question = data.results[0];
       decodeQuestion();
       displayQuestion();
     break;
     case 4:
       resetToken();
       setQuestion(typeElement.value(), difficultyElement.value(), categoryElement.value());
     break;
   }
}

function decodeQuestion() {
  question.type = atob(question.type);
  question.question = atob(question.question);
  question.correct_answer = atob(question.correct_answer);
  for (var i = 0; i < question.incorrect_answers.length; i++) {
    question.incorrect_answers[i] = atob(question.incorrect_answers[i]);
  }
}

function displayQuestion() {
  questionDiv = createDiv("<h1>" + question.question + "</h1>");
  questionDiv.size(width - 200, height/4);
  questionDiv.position(100, 20);
  
  questionRadio = createRadio();
  if (question.type == "multiple") {
    var answers = question.incorrect_answers;
    answers.splice(random(0, question.correct_answer.length - 1), 0, question.correct_answer);
    for (var i = 0; i < answers.length; i++) {
      questionRadio.option(answers[i]);
    }
  } else {
    questionRadio.option("True");
    questionRadio.option("False");
  }
  
  questionRadio.position(100, 200);
  questionRadio.changed(checkAnswer);
}

function checkAnswer() {
  if (answerDiv != null) {
    answerDiv.remove(); 
  }
  if (questionRadio.value() == question.correct_answer) {
    answerDiv = createDiv("<h2>Correct</h2>");
  } else {
    answerDiv = createDiv("<h3>Wrong</h3>");
  }
  answerDiv.position(100, 250);
}


function resetToken() {
  loadJSON(api + "api_token.php?command=reset&token=" + token, parseToken);
}

function parseToken(data) {
  token = data.token;
}