var data;
var cur_desc;
var mic;
var alpha_level;
var capture;

var count = 0;

// var blackout1 = ["pistol", "fatally", "killing", "shot", "dead", "killed", "fire"]
var blackout1 = ["allegedly", "threatening", "threatened", "domestic", "burglary", "robbery", "approached", "brandished", "situation", "history", "armed", "suspect", "appeared", "seemed", "warning"];
var blackout1_pairs = [["reached", "for"]];

var keep = ["break", "hurt", "man", "woman", "child", "dead", "death", "girl", "boy", "home", "died", "mother", "year-old", "student"];

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
  cur_desc = new Description();
  try {
  cur_desc.setWords();
  }
  catch(e){
    console.log(e);
  }
  
  alpha_level = 255;
}

function draw() {
  background(255);   
  fill(0, alpha_level);
  textSize(20);
  text(cur_desc.desc.join(" "), 10, 30, 700, 500);
  cur_desc.display();

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
      if(random() > r && words[i].blackOutLevel < 4) {
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
   cur_desc = new Description();
   count = -1;
  }
  
  count++;
}

function Word(word_text, index) {
  this.word_text = word_text;
  this.word_length = word_text.length * 10;
  this.blackedOut = false;
  this.blackOutLevel = 0;
  this.index = index;
  this.blackRectCords = [];
  this.hasNeighbor = false;
}


function Description() {
  this.desc = split(data.getString(int(random(data.getRowCount())),13), " ");
  this.words = [];
  //desc = split(data.getString(3021-22,13), " ");
  //desc = split("Graham, who was wanted by police as a person of interest in the disappearance of his six-month-old daughter, was fatally shot by deputies who tracked a car he stole in a nearby town.", " ");
  
  this.display = function() {
    for(var i=0; i<this.words.length; i++){
      if(this.words[i].blackedOut){
        if(this.words[i].index < this.words.length-1){
          if(this.words[i].hasNeighbor == false && this.words[i+1].blackedOut) {
            this.words[i].blackRectCords[2]+=10;
            this.words[i].hasNeighbor = true;
          }
        }
        rect(this.words[i].blackRectCords[0], this.words[i].blackRectCords[1], this.words[i].blackRectCords[2], this.words[i].blackRectCords[3]);
      }
    }
  }
  
  this.setWords = function() {
    console.log("here_pre");
    for(var i=0; i<this.desc.length; i++){
      this.desc[i] = this.desc[i].replace(/^\s+|\s+$/g, '');
      if(this.desc[i].length != 0){
        this.words[i] = new Word(this.desc[i]+" ", i);
        console.log("here");
        for(var j=0; j<blackout1.length; j++){
          if(this.desc[i].includes(blackout1[j])){
            this.words[i].blackOutLevel = 1;
          }
        }
        
        for(var j=0; j<keep.length; j++){
          if(this.desc[i].includes(keep[j])){
            this.words[i].blackOutLevel = 4;
          }
        }
        
        first_letter = unchar(this.words[i].word_text[0]);
        if(first_letter >= 65 && first_letter <= 90){
          this.words[i].blackOutLevel = 2;
        }
      }
    }
    
    for(var i=0; i<this.words.length-2; i++){
      for(var j=0; j<blackout1_pairs.length; j++){
        if(this.words[i].word_text.includes(blackout1_pairs[j][0]) && this.words[i+1].word_text.includes(blackout1_pairs[j][1])){
          this.words[i].blackOutLevel = 1;
          this.words[i+1].blackOutLevel = 1;
          i++;
        }
      }
    }
    
    for(var i=0; i<this.words.length; i++){
      all_words_before = 0;
      line_num = 0;
      lines_before = 0;
      this_line = 0
      
      for(var i=0; i<this.words[i].index; i++){
        this_line+=this.words[i].word_length;
        all_words_before+=this.words[i].word_length;
        
        if(this_line > 700){
          lines_before = all_words_before-this.words[i].word_length;;
          this_line = this.words[i].word_length;
          line_num++;
        }
      }
      
      if(this_line + this.words[i].word_length > 700){
        line_num++;
        lines_before = all_words_before;
      }
      
      this.words[i].blackRectCords = [10+all_words_before-lines_before, line_num*25+30, this.words[i].word_length-10, 20];
    }
  }
}





