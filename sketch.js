// /dev/cu.usbmodem1421

var portName = '/dev/cu.usbmodem1421';  // fill in your serial
var serial; // variable to hold an instance of the serialport library
var sensor1;                             // for incoming serial data
var sensor2;
var sensor3;
var sensor4;
var serialEvents = 0;
 
var data;
var desc;
var mic;
var capture;
var words;
var curName;
var barInterval;
var start = false;
var entire_alpha_level = 255;
var text_size = 20;
var descPosition = text_size*2;
var x_padding = 10;
var y_padding = 30;
var entire_desc;

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
  serial = new p5.SerialPort();       // make a new instance of the serialport library
  serial.on('list', printList);  // set a callback function for the serialport list event
  serial.on('connected', serverConnected); // callback for connecting to the server
  serial.on('open', portOpen);        // callback for the port opening
  serial.on('data', serialEvent);     // callback for when new data arrives
  serial.on('error', serialError);    // callback for errors
  serial.on('close', portClose);      // callback for the port closing
 
  serial.list();                      // list the serial ports
  serial.open(portName);              // open a serial port
  createCanvas(1000, 400);
  // capture = createCapture(VIDEO);
  
  // display sources for this machine
  // MediaStreamTrack.getSources(gotSources);
  
  // capture.size(320, 240);
  newData();
  //noStroke();
}

function draw() {
  //curdata = inData.split(",");
  println("sensor 1 value: " + sensor1);
  println("sensor 2 value: " + sensor2);
  println("sensor 3 value: " + sensor3);
  println("sensor 4 value: " + sensor4);
  noStroke();
  background(255);  

  if(entire_alpha_level < 255) {
    entire_alpha_level = max(0, entire_alpha_level-1);
    fill(0, entire_alpha_level);
  }
  
    //fill(0, alpha_level);
    textSize(text_size);
    r = int(random(3000, 6000));
    if(!curName.displayed) {
      text(curName.name, 10, 30);
      setTimeout(function() {
        curName.displayed = true;
      }, r);
    }
    else {
      if(entire_alpha_level >= 255){
        fill(0);
      }
      else {
        fill(255);
      }
      text(curName.name, x_padding, y_padding);
      //curName.rectWidth = min(curName.rectWidth+1, curName.length*10);
      
      if(entire_alpha_level >= 255){
        fill(0, curName.alpha_level);
      }
      else {
        fill(255);
      }
      text(desc.join(" "), x_padding, descPosition, 700, 500);
      curName.alpha_level = min(curName.alpha_level+1, 255);
      
      if(entire_alpha_level >= 255){
        fill(0);
      }
      else {
        fill(0, entire_alpha_level);
      }
      for(var i=0; i<words.length; i++){
          words[i].display();
      }
    }
    
    if(curName.alpha_level == 255){
      // may need to hardcode the 15 here...
      // y-padding = 30
      // 20 -> 15
      // 25 ->
      // 30 -> 5
      // 40 -> 2

      rect(x_padding, 15, curName.length*(text_size/2), text_size);
      
      if(start == false && sensor1+sensor2>1 && sensor3 < 10){
        levelOne();
        start = true;
        startBarInterval();
      }
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
  r = int(random(3000, 6000));
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
  
  if(count == 1){
    startBarInterval();
  }
  
  else if(count <=2){
    for(var i=0; i<words.length; i++){
      if(entire_desc.percent() < 0.5){
        if(random() > 0.5 && words[i].blackOutLevel < 4) {
          words[i].blackedOut = true;
          entire_desc.blacked_out++
        }
      }
    }
    startBarInterval();
  }
  
  else if(count <= 3){
    for(var i=0; i<words.length; i++){
      if(entire_desc.percent() < 0.75){
        if(random() > 0.2 && words[i].blackOutLevel < 4) {
          words[i].blackedOut = true;
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
    entire_alpha_level = 254;
  }
  
  else {
   newData(); 
   stopBarInterval();
   start = false;
   count = -1;
   entire_alpha_level = 255;
  }
  
  count++;
}


function newData() {
  try {
    // force commit
    entire_alpha_level = 255;
    cell = int(random(data.getRowCount()))
    curName = new Name(data.getString(cell, 0));
    //curName = new Name(data.getString(3112-4, 0));
    desc = split(data.getString(cell,13), " ");
    //desc = split(data.getString(3112-4,13), " ");
    //desc = split("Graham, who was wanted by police as a person of interest in the disappearance of his six-month-old daughter, was fatally shot by deputies who tracked a car he stole in a nearby town.", " ");
    words = [];
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
        name_parts = curName.name.toLowerCase().split(" ");

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
      if(entire_alpha_level >=255){
        stroke(0);
      }
      else {
        noStroke();
      }
      rect(this.blackRectCords[0], this.blackRectCords[1], this.blackRectCords[2], this.blackRectCords[3]);
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
    
    return([x_padding+all_words_before-lines_before, line_num*(text_size+text_size/4)+descPosition, this.word_length-(text_size/2), text_size]);
  }
}

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
  var which = serialEvents%4;
  if(which == 0){
    sensor1 = Number(serial.read());
  }
  else if(which == 1){
    sensor2 = Number(serial.read());
  }
  else if(which == 2){
    sensor3 = Number(serial.read());
  }
  else {
    sensor4 = Number(serial.read());
    if(sensor4 >= 122){
      sensor4 = 0;
    }
  }
  serialEvents = (serialEvents+1)%4;
}
 
function serialError(err) {
  println('Something went wrong with the serial port. ' + err);
}
 
function portClose() {
  println('The serial port closed.');
}



