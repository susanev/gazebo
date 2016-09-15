var data;
var desc;
var mic;
var capture;
var words;
var descPosition = 60;
var curName;
var barInterval;
var start = false;

var count = 0;

// var blackout1 = ["pistol", "fatally", "killing", "shot", "dead", "killed", "fire"]
var blackout1 = ["allegedly", "threatening", "threatened", "domestic", "burglary", "robbery", "approached", "brandished", "situation", "history", "armed", "suspect", "appeared", "seemed", "warning"];
var blackout1_pairs = [["reached", "for"]];

var keep = ["break", "hurt", "man", "woman", "child", "dead", "death", "girl", "boy", "home", "died", "mother", "year-old", "student", "brother", "sister", "father"];

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
}

function draw() {
  background(255);   
  //fill(0, alpha_level);
  textSize(20);
  r = int(random(3000, 6000));
  if(!curName.displayed) {
    text(curName.name, 10, 30);
    setTimeout(function() {
      curName.displayed = true;
    }, r);
  }
  else {
    fill(0);
    text(curName.name, 10, 30);
    rect(10,15, curName.rectWidth, 20);
    curName.rectWidth = min(curName.rectWidth+1, curName.length*10);
    
    fill(0, curName.alpha_level);
    text(desc.join(" "), 10, descPosition, 700, 500);
    curName.alpha_level = min(curName.alpha_level+1, 255);
    for(var i=0; i<words.length; i++){
        words[i].display();
    }
  }
  
  if(curName.alpha_level == 255 && start == false){
    start = true;
    startBarInterval();
  }
  

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

function startBarInterval() {
  r = int(random(3000, 10000));
  barInterval = setInterval(function() {
    advance();}
  , r);
}

function stopBarInterval() {
  clearInterval(barInterval);
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

function advance() {
  stopBarInterval();
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
    startBarInterval();
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
    startBarInterval();
  }
  
  else if(count == 4){
    for(var i=0; i<words.length; i++){
      words[i].blackedOut = true;
    }
    startBarInterval();
  }
  
  else {
   newData(); 
   stopBarInterval();
   start = false;
   count = -1;
  }
  
  count++;
}


function newData() {
  try {
    // force commit
    cell = int(random(data.getRowCount()))
    curName = new Name(data.getString(cell, 0));

    desc = split(data.getString(cell,13), " ");
    //desc = split(data.getString(3021-22,13), " ");
    //desc = split("Graham, who was wanted by police as a person of interest in the disappearance of his six-month-old daughter, was fatally shot by deputies who tracked a car he stole in a nearby town.", " ");
    words = [];
    for(var i=0; i<desc.length; i++){
      desc[i] = desc[i].replace(/^\s+|\s+$/g, '');
      if(desc[i].length != 0){
        words[i] = new Word(desc[i]+" ", i);
        
        for(var j=0; j<blackout1.length; j++){
          if(desc[i].includes(blackout1[j])){
            words[i].blackOutLevel = 1;
          }
        }
        
        for(var j=0; j<keep.length; j++){
          if(desc[i].includes(keep[j])){
            words[i].blackOutLevel = 4;
          }
        }
        
        first_letter = unchar(words[i].word_text[0]);
        if(first_letter >= 65 && first_letter <= 90){
          words[i].blackOutLevel = 2;
        }
      }
    }
    
    for(var i=0; i<words.length-2; i++){
      for(var j=0; j<blackout1_pairs.length; j++){
        if(words[i].word_text.includes(blackout1_pairs[j][0]) && words[i+1].word_text.includes(blackout1_pairs[j][1])){
          words[i].blackOutLevel = 1;
          words[i+1].blackOutLevel = 1;
          i++;
        }
      }
    }
    
    for(var i=0; i<words.length; i++){
      words[i].blackRect();
    }
  }
   catch(e) {
     console.log(e);
   }
}

function Name(name){
  this.name = name;
  this.rectWidth = 0;
  this.alpha_level = 0;
  this.displayed = false;
  this.length = name.length;
  
  this.reset = function() {
    this.rectWidth = 0;
    this.alpha_level = 0;
    this.displayed = false;
  }
}

function Word(word_text, index) {
  this.word_text = word_text;
  this.word_length = word_text.length * 10;
  this.blackedOut = false;
  this.blackOutLevel = 0;
  this.index = index;
  this.blackRectCords = [];
  this.hasNeighbor = false;
  this.rectWidth = 0;

  this.blackRect = function() {
    this.blackRectCords = this.blackOut(this.index);
  }
  
  this.display = function() {
    if(this.blackedOut){
      if(index < words.length-1){
        if(this.hasNeighbor == false && words[index+1].blackedOut) {
          this.blackRectCords[2]+=10;
          this.hasNeighbor = true;
        }
      }
      rect(this.blackRectCords[0], this.blackRectCords[1], this.rectWidth, this.blackRectCords[3]);
      this.rectWidth = min(this.rectWidth+1, this.blackRectCords[2])
    }
  }
  
  this.blackOut = function() {
    all_words_before = 0;
    line_num = 0;
    lines_before = 0;
    this_line = 0
    
    for(var i=0; i<this.index; i++){
      this_line+=words[i].word_length;
      all_words_before+=words[i].word_length;
      
      if(this_line > 700){
        lines_before = all_words_before-words[i].word_length;;
        this_line = words[i].word_length;
        line_num++;
      }
    }
    
    if(this_line + words[this.index].word_length > 700){
      line_num++;
      lines_before = all_words_before;
    }
    
    return([10+all_words_before-lines_before, line_num*25+descPosition, this.word_length-10, 20]);
  }
}



