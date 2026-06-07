export interface WordToken {
  word: string;
  start: number;
  end: number;
  script: "devanagari" | "latin" | "other";
}

export interface Segment {
  id: number;
  start: number;
  end: number;
  text: string;
  words: WordToken[];
}

export interface Transcript {
  text: string;
  language: string;
  segments: Segment[];
  duration: number;
}
