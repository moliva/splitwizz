import { Content, LineFormat, Note } from "./types"

export function copyToClipboard(value: string): void {
  navigator.clipboard.writeText(value)
}

const TITLE_SIZE = 1.5
const TAGS_SIZE = 0.5

export const WRAPPING_SIZE = 18


/**
  * Takes a Note object and turns it into number corresponding to the number of lines plus its header size
  */
export function wrappedNoteSize(note: Note): number {
  return Math.min(noteSize(note), WRAPPING_SIZE)
}

/**
  * Takes a Note object and turns it into number corresponding to the number of lines plus its header size
  */
export function noteSize(note: Note): number {
  const tagsSize = note.tags.length > 0 ? TAGS_SIZE : 0
  return TITLE_SIZE + contentToLineNumber(note.content) + tagsSize
}

/**
  * Takes a Content object and turns it into number corresponding to the number of lines
  */
export function contentToLineNumber(content: Content, acc: number = 0): number {
  for (const [, value] of content) {
    const internalContent = contentToLineNumber(value)
    const current = 1

    acc += current + internalContent
  }
  return acc
}

/**
  * Takes a Content object and turns it into a string
  */
export function contentToString(content: Content): string {
  return collectContent(content).join("\n")
}

/**
  * Takes a Content object and turns it into an array of lines
  */
function collectContent(content: Content, indent: string = '', acc: string[] = []): string[] {
  for (const [key, value] of content) {
    let line = indent

    if (key.checkbox) {
      line += key.check ? '[x]' : '[ ]'
    }

    if (key.blur) {
      line += '[!]'
    }

    line += key.link ? `[${key.line}](${key.link})` : key.line

    acc.push(line)

    collectContent(value, indent + '  ', acc)
  }
  return acc
}

const LINE_REGEX = /\[(.*)\]\((.*)\)/

/**
  * Takes a string and turns it into a Content object
  */
export function parseContent(value: string): Content {
  const content: Content = []

  const lines = value.split("\n")
  for (let line of lines) {
    // check parent node of current line
    let at = content
    while (line.startsWith('  ')) {
      at = at[at.length - 1]![1]
      line = line.substring(2)
    }

    const value: LineFormat = {}

    // check format
    // 1- checkbox
    if (line.startsWith('[ ]')) {
      value.checkbox = true
      value.check = false
      line = line.substring(3)
    } else if (line.startsWith('[x]')) {
      value.checkbox = true
      value.check = true
      line = line.substring(3)
    }

    // 2- blur
    if (line.startsWith('[!]')) {
      value.blur = true
      line = line.substring(3)
    }

    // 3- check for link format
    const result = LINE_REGEX.exec(line)
    if (!!result) {
      value.line = result.at(1)
      value.link = result.at(2)
    } else {
      value.line = line
    }

    if (line.length)
      at.push([value, []])
  }

  return content
}
