export interface IntroTextInput {
  text: string;
  page: string;
}

export interface IntroText extends IntroTextInput {
  id: string;
}

export interface InformativeText {
  title: string;
  text: string;
  imageId: string;
}

export interface InformativeTextCollectionInput {
  page: string;
  infoTexts: InformativeText[];
}

export interface InformativeTextCollection extends InformativeTextCollectionInput {
  id: string;
}
