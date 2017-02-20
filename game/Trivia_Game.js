var api = "https://opentdb.com/"
var question, token; //For api
var typeElement, difficultyElement, categoryElement, submitButton, questionDiv, questionRadio, answerDiv, html, opentdbElement; //Elements

function preload() {
   html = loadStrings("select_options.txt");
   token = loadStrings("token.txt");
}

function setup() {
  createCanvas(displayWidth, 500);
  var elementY = displayHeight - 150;
  
  opentdbElement = createA("https://opentdb.com/", "Powered by Open Trivia Database");
  opentdbElement.position(width - 250, elementY);
  
  typeElement = createSelect();
  typeElement.position(20, elementY);
  typeElement.size(200, 30);
  typeElement.html(html[0]); //Options
  
  difficultyElement = createSelect(); 
  difficultyElement.position(220, elementY);
  difficultyElement.size(100, 30);
  difficultyElement.html(html[1]); //Options
  
  categoryElement = createSelect();
  categoryElement.position(320, elementY);
  categoryElement.size(400, 30);
  categoryElement.html(html[2]); //Options
  
  submitButton = createButton("Get Question");
  submitButton.position(740, elementY);
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
  loadJSON(api + "api.php?amount=1&difficulty=" + difficulty+ "&type=" + type + "&category=" + category + "&token=" + token[0], parseQuestion);
}

function parseQuestion(data) {
   switch(data.response_code) {
     case 0:
       question = data.results[0];
       displayQuestion();
     break;
     case 4:
       resetToken();
       setQuestion(typeElement.value(), difficultyElement.value(), categoryElement.value());
     break;
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
  loadJSON(api + "api_token.php?command=reset&token=" + token[0], parseToken);
}

function parseToken(data) {
  token[0] = data.token;
}