// sensor data variables
var portName = '/dev/cu.usbmodem1421';  // fill in your serial
var serial; // variable to hold an instance of the serialport library
var sensorA;                             // for incoming serial data
var sensorB;
var sensorC;
var sensorD;
var sensorE;
var sensorF;
var serialEvents = 0;

var nameDiv;
var descDiv;
var blurEffect = true;

var newDataSet = false;
var shuffledWords = [];
 
var data;
var desc;
var words;
var curName;
var barInterval;
var start = false;
var divWidth = 820;

// text positioning variables
var text_size = 40;
var descPosition = text_size*3+5;//displayWidth/2;//
var x_padding = 50;
var y_padding = 45;//+displayWidth/2;
var entire_desc;

// blacking out sequence
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
  serialSetup();
  createCanvas(800, 650);
  // capture = createCapture(VIDEO);
  
  // display sources for this machine
  // MediaStreamTrack.getSources(gotSources);
  
  // capture.size(320, 240);
  newData();
  noStroke();
}

function serialSetup() {
  serial = new p5.SerialPort();       // make a new instance of the serialport library
  serial.on('list', printList);  // set a callback function for the serialport list event
  serial.on('connected', serverConnected); // callback for connecting to the server
  serial.on('open', portOpen);        // callback for the port opening
  serial.on('data', serialEvent);     // callback for when new data arrives
  serial.on('error', serialError);    // callback for errors
  serial.on('close', portClose);      // callback for the port closing
 
  serial.list();                      // list the serial ports
  serial.open(portName);              // open a serial port
}

function draw() {

  // sensor testing statements
  // println("sensor A value: " + sensorA);
  // println("sensor B value: " + sensorB);
  // println("sensor C value: " + sensorC);
  // println("sensor D value: " + sensorD);  
  // println("sensor E value: " + sensorE);
  // println("sensor F value: " + sensorF);
  
  background(255); 
  removeElements();
  noStroke();
  textSize(text_size);
  
  //console.log(newDataSet);
  
  if(!newDataSet) {
    curName.alpha_level = min(curName.alpha_level+1, 255);
    
    nameDiv = createDiv(curName.name);
    nameDiv.position(x_padding, y_padding);
    
    descDiv = createDiv(desc.join(" "));
    descDiv.position(x_padding, descPosition, 700, 500);
  
    for(var i=0; i<words.length; i++){
        words[i].display();
    }
      
    if(curName.alpha_level == 255) {
      // may need to hardcode the 15 here...
      // y-padding = 30
      // 20 -> 30
      // 25 ->
      // 30 -> 5
      // 40 -> 2
  
      rect(x_padding, 52, curName.length*(text_size/2), text_size);
      
      sensorSum = sensorA + sensorB + sensorC + sensorD + sensorE + sensorF;
      println(sensorSum);
      if(start == false){
        //if(sensorSum > 2){
          blurEffect = false;
          // nameDiv.removeClass('blur');
          // descDiv.removeClass('blur');
          nameDiv.class('regular');
          descDiv.class('regular');
          
          start = true;
          
          setTimeout(function() {        
            levelOne();
            startBarInterval();
          }, 4000);
       // }
        // else {
        //   start = true;
        //   blurEffect = false;
        //   setTimeout(function() {
        //     newDataSet = true;
        //     background(255);
        //   }, 4000);
        
        //   setTimeout(function() {
        //     newDataSet = false;
        //     newData();
        //     blurEffect = true;
        //     start = false;
        //     count = 1;
        //   }, 7000);
        // }
      }
    }
    if(blurEffect) {
      nameDiv.class('blur');
      descDiv.class('blur');
    }
  }
}

function startBarInterval() {
  barInterval = setInterval(function() {
    advance();}
  , 2000);
}

function stopBarInterval() {
  clearInterval(barInterval);
}

function levelOne() {
  for(var i=0; i<words.length; i++){
    if(words[i].blackOutLevel == 1){
      words[i].blackedOut = true;
      entire_desc.blacked_out++;
    }
  }
}

function advance() {
  stopBarInterval();
  var flag = false;

  shuffleArray(shuffledWords);
  
  if(count == 1){
    startBarInterval();
  }
  
  else if(count <=2){
    for(var i=0; i<shuffledWords.length; i++){
      if(entire_desc.percent() < 0.5){
        if(random() > 0.5 && shuffledWords[i].blackOutLevel < 4) {
          words[words.indexOf(shuffledWords[i])].blackedOut = true;
          entire_desc.blacked_out++
        }
      }
    }
    startBarInterval();
  }
  
  else if(count <= 3){
    for(var i=0; i<shuffledWords.length; i++){
      if(entire_desc.percent() < 0.75){
        if(random() > 0.2 && shuffledWords[i].blackOutLevel < 4) {
          words[words.indexOf(shuffledWords[i])].blackedOut = true;
          entire_desc.blacked_out++
        }
      }
    }
    startBarInterval();
  }
  
  else if(count == 4){
    for(var i=0; i<words.length; i++){
      words[i].blackedOut = true;
      entire_desc.blacked_out++;
    }
    startBarInterval();
  }
  
  else {
    setTimeout(function() {
      newDataSet = true;
      background(255);
    }, 4000);
    
    setTimeout(function() {
      newDataSet = false;
      newData();
      blurEffect = true;
      start = false;
      count = -1;
    }, 7000);
    
    
  }
  
  count++;
}


function newData() {
  try {
    // force commit
    descLength = 600;
    while (descLength > 590){
      cell = int(random(data.getRowCount()))
      curName = new Name(data.getString(cell, 0));
      //curName = new Name(data.getString(3112-4, 0));
      desc = split(data.getString(cell,13), " ");
      //desc = split(data.getString(3112-4,13), " ");
      //desc = split("Graham, who was wanted by police as a person of interest in the disappearance of his six-month-old daughter, was fatally shot by deputies who tracked a car he stole in a nearby town.", " ");
      descLength = desc.length;
    }
    words = [];
    shuffledWords = [];
    for(var i=0; i<desc.length; i++){
      desc[i] = desc[i].replace(/^\s+|\s+$/g, '');
      if(desc[i].length != 0){
        words[i] = new Word(desc[i]+" ", i);
        
        for(var j=0; j<blackout1.length; j++){
          if(desc[i].includes(blackout1[j])){
            words[i].blackOutLevel = 2;
          }
        }
        
        for(var j=0; j<keep.length; j++){
          if(desc[i].includes(keep[j])){
            words[i].blackOutLevel = 4;
          }
        }
        
        first_letter = unchar(words[i].word_text[0]);
        if(first_letter >= 65 && first_letter <= 90){
          words[i].blackOutLevel = 3;
        }
        
        regex = desc[i].toLowerCase().replace(/[.,\/#!$%\^&\*;:]/g,"")
        name_parts = curName.name.toLowerCase().replace(/[.,\/#!$%\^&\*;:]/g,"").split(" ");

        for(var j=0; j<name_parts.length; j++){
          if(name_parts[j] == regex) {
            words[i].blackOutLevel = 1;
          }
        }
      }
    }
    
    for(var i=0; i<words.length-2; i++){
      for(var j=0; j<blackout1_pairs.length; j++){
        if(words[i].word_text.includes(blackout1_pairs[j][0]) && words[i+1].word_text.includes(blackout1_pairs[j][1])){
          words[i].blackOutLevel = 2;
          words[i+1].blackOutLevel = 2;
          i++;
        }
      }
    }
    
    for(var i=0; i<words.length; i++){
      words[i].blackRect();
    }
    entire_desc = new Description(words.length);
    
    for(var i=0; i<words.length; i++){
      shuffledWords[i] = words[i];
    }
  }
  catch(e) {
    console.log("Error");
    console.log(e);
  }
}

function Description(total_words) {
  this.total_words = total_words;
  this.blacked_out = 0;
  
  this.percent = function() {
    return this.blacked_out/this.total_words;
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
  this.word_length = word_text.length * (text_size/2);
  this.blackedOut = false;
  this.blackOutLevel = 3;
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
          this.blackRectCords[2]+=(text_size/2);
          this.hasNeighbor = true;
        }
      }

      stroke(0);
      fill(0);
      rect(this.blackRectCords[0], this.blackRectCords[1]+10, this.blackRectCords[2], this.blackRectCords[3]);
      //this.rectWidth = min(this.rectWidth+1, this.blackRectCords[2])
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
      
      if(this_line > divWidth){
        lines_before = all_words_before-words[i].word_length;;
        this_line = words[i].word_length;
        line_num++;
      }
    }
    
    if(this_line + words[this.index].word_length > divWidth){
      line_num++;
      lines_before = all_words_before;
    }
    
    return([x_padding+all_words_before-lines_before, line_num*(text_size+text_size/4)+descPosition, this.word_length-(text_size/2), text_size]);
  }
}

function shuffleArray(a) {
  var j, x, i;
  for (i = a.length; i; i--) {
      j = Math.floor(Math.random() * i);
      x = a[i - 1];
      a[i - 1] = a[j];
      a[j] = x;
  }
}


// Serial data functions
// get the list of ports:
function printList(portList) {
 // portList is an array of serial port names
 for (var i = 0; i < portList.length; i++) {
 // Display the list the console:
 println(i + " " + portList[i]);
 }
}

function serverConnected() {
  println('connected to server.');
}
 
function portOpen() {
  println('the serial port opened.')
}
 
function serialEvent() {
  var which = serialEvents%6;
  if(which == 0){
    sensorA = Number(serial.read());
  }
  else if(which == 1){
    sensorB = Number(serial.read());
  }
  else if(which == 2){
    sensorC = Number(serial.read());
  }
  else if(which == 3){
    sensorD = Number(serial.read());
  }
  else if(which == 4){
    sensorE = Number(serial.read());
  }
  else {
    sensorF = Number(serial.read());
  }
  serialEvents = (serialEvents+1)%6;
}
 
function serialError(err) {
  println('Something went wrong with the serial port. ' + err);
}
 
function portClose() {
  println('The serial port closed.');
}



