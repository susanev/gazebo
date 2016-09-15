var data;
var desc;
var mic;
var alpha_level;
var capture;
var r;
var words;

var count = 0;

var blackout1 = ["pistol", "fatally", "shoting", "killing", "shot", "dead", "killed", "fire", "died", "fired"]

function preload() {
  data = loadTable("data/MPVDataset.csv", "csv", "header")
  // mic = new p5.AudioIn();
  // mic.start();
  textFont("Inconsolata");
}

function setup() {
  createCanvas(1000, 400);
  // capture = createCapture(VIDEO);
  
  // display sources for this machine
  // MediaStreamTrack.getSources(gotSources);
  
  // capture.size(320, 240);
  newData();
  
  alpha_level = 255;
  

}

function draw() {
  background(255);   
  fill(0, alpha_level);
  textSize(20);
  text(desc.join(" "), 10, 30, 700, 500);
  
  for(var i=0; i<words.length; i++){
    if(words[i].blackedOut){
      blackOut(i);
    }
  }  

  // fill(0);
  // noStroke();
  // textSize(20);
  // text("a", 10, 30);
  // noFill();
  // stroke(255, 0, 0);
  // rect(10,20, 10, 10);
  
  //image(capture, 0, 0, 320, 240);
  
  // for(var x=0; x<video.width; x++){
  //   for(var y=0; y<capture.height; y++){
  //     var loc = x + y*capture.width;
      
  //     console.log(capture.pixels[loc]);
  //   }
  // }
  // capture.loadPixels();
  // console.log(capture.pixels[mouseX+mouseY*capture.width]);
  // console.log(capture.pixels.length)
  // capture.updatePixels();
  
  // micLevel = mic.getLevel();
  
  // console.log(micLevel);
  // console.log(alpha_level);
  // if(micLevel > 0.4 || alpha_level <= 0){
  //   alpha_level = 255;
  //   desc = data.getString(int(random(data.getRowCount())),13)
  // }
  // else if(micLevel > 0.01) {
  //   alpha_level = max(0, alpha_level-1);
  // }
  // else if(micLevel < 0.00015){
  //   alpha_level = min(255, alpha_level+1);
  // }
}

function gotSources(sources) {
  for (var i = 0; i !== sources.length; ++i) {
    if (sources[i].kind === 'audio') {
      console.log('audio: '+sources[i].label+' ID: '+sources[i].id);
    } else if (sources[i].kind === 'video') {
      console.log('video: '+sources[i].label+' ID: '+sources[i].id);
    } else {
      console.log('Some other kind of source: ', sources[i]);
    }
  }
}

function mousePressed() {
  var flag = false;
  if(count <= 1) {
    for(var i=0; i<words.length; i++){
      if(words[i].blackOutLevel == count+1){
        words[i].blackedOut = true;
        flag = true;
      }
      
      if(i==words.length-1 && flag == false){
        count++;
        i=0;
      }
    }
  }
  else if(count <= 3){
    r = 0;
    if(count == 2){
      r = 0.5;
    }
    else {
      r = 0.2;
    }
    
    for(var i=0; i<words.length; i++){
      if(random() > r) {
        words[i].blackedOut = true;
      }
    }
  }
  
  else if(count == 4){
    for(var i=0; i<words.length; i++){
      words[i].blackedOut = true;
    }
  }
  
  else {
   newData(); 
   count = -1;
  }
  
  count++;
}

function newData() {
  desc = split(data.getString(int(random(data.getRowCount())),13), " ");
  //desc = split("Graham, who was wanted by police as a person of interest in the disappearance of his six-month-old daughter, was fatally shot by deputies who tracked a car he stole in a nearby town.", " ");
  words = [];
  for(var i=0; i<desc.length; i++){
    if(desc[i].length != 0){
      words[i] = new Word(desc[i]+" ");
      
      for(var j=0; j<blackout1.length; j++){
        if(desc[i] == blackout1[j]){
          words[i].blackOutLevel = 1;
        }
      }
      
      first_letter = unchar(words[i].word_text[0]);
      if(first_letter >= 65 && first_letter <= 90){
        words[i].blackOutLevel = 2;
      }
    }
  }
}

// function setValues() {

  
//   r = int(random(words.length));
//   // r=34;
//   words[r].blackedOut = true;
// }

function Word(word_text) {
  this.word_text = word_text;
  this.word_length = word_text.length * 10;
  this.blackedOut = false;
  this.blackOutLevel = 0;
}

function blackOut(index) {
  all_words_before = 0;
  line_num = 0;
  lines_before = 0;
  this_line = 0
  
  for(var i=0; i<index; i++){
    this_line+=words[i].word_length;
    all_words_before+=words[i].word_length;
    
    if(this_line > 700){
      lines_before = all_words_before-words[i].word_length;;
      this_line = words[i].word_length;
      line_num++;
    }
  }
  
  if(this_line + words[index].word_length > 700){
    line_num++;
    lines_before = all_words_before;
  }
  
  rect(10+all_words_before-lines_before, line_num*25+30, words[index].word_length-10, 20);
}

