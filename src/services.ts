import { Identity, Note } from "./types";

export const API_HOST = import.meta.env.VITE_API_URL

export async function fetchTags(identity: Identity): Promise<string[]> {
  const res = await authentifiedFetch(`${API_HOST}/tags`, identity!)

  return await res.json() as string[]
}

export async function fetchNote(identity: Identity, note: Note): Promise<Note> {
  const res = await authentifiedFetch(`${API_HOST}/notes/${note.id}`, identity!)

  return await res.json() as Note
}

export async function fetchNotes(identity: Identity): Promise<Note[]> {
  const res = await authentifiedFetch(`${API_HOST}/notes`, identity!)

  const notes = await res.json() as Note[]

  return notes
}

export async function putNote(note: Note, identity: Identity): Promise<void> {
  const response = await authentifiedFetch(`${API_HOST}/notes/${note.id}`, identity, {
    method: 'PUT',
    body: JSON.stringify(note),
    headers: { "Content-Type": "application/json" }
  })

  if (!response.ok) {
    throw response
  }
}

export async function postNote(note: Note, identity: Identity): Promise<void> {
  const response = await authentifiedFetch(`${API_HOST}/notes`, identity, {
    method: 'POST',
    body: JSON.stringify(note),
    headers: { "Content-Type": "application/json" }
  })

  if (!response.ok) {
    throw response
  }
}

export async function deleteNote(note: Note, identity: Identity) {
  const response = await authentifiedFetch(`${API_HOST}/notes/${note.id}`, identity, { method: 'DELETE' })
  if (!response.ok) {
    throw response
  }
}

async function authentifiedFetch(url: string, identity: Identity, init: RequestInit | undefined = {}) {
  return await fetch(url, {
    ...init,
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    headers: {
      Authorization: identity!.token,
      ...init.headers,
    },
  })
}
