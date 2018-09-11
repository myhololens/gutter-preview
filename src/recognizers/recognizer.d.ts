import { TextDocument } from 'vscode-languageserver';

interface UrlMatch {
    url: string;
    lineIndex: number;
    start: number;
    end: number;
}

interface ImagePathRecognizer {
    recognize(document: TextDocument, lineIndex: number, line: string): UrlMatch;
}
