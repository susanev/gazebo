class Word {
  constructor(word_text) {
    this.word_text = word_text;
    this.word_length = word_text.length * 10;
    this.blackedOut = false;
  }
}