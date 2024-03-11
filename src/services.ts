import { Identity, Group } from "./types";

export const API_HOST = import.meta.env.VITE_API_URL

export async function fetchGroups(identity: Identity): Promise<Group[]> {
  const res = await authentifiedFetch(`${API_HOST}/groups`, identity!)

  return await res.json() as Group[]
}

export async function putGroup(group: Group, identity: Identity): Promise<void> {
  const response = await authentifiedFetch(`${API_HOST}/groups/${group.id}`, identity, {
    method: 'PUT',
    body: JSON.stringify(group),
    headers: { "Content-Type": "application/json" }
  })

  if (!response.ok) {
    throw response
  }
}

export async function postGroup(group: Group, identity: Identity): Promise<void> {
  const response = await authentifiedFetch(`${API_HOST}/groups`, identity, {
    method: 'POST',
    body: JSON.stringify(group),
    headers: { "Content-Type": "application/json" }
  })

  if (!response.ok) {
    throw response
  }
}

export async function deleteGroup(group: Group, identity: Identity) {
  const response = await authentifiedFetch(`${API_HOST}/groups/${group.id}`, identity, { method: 'DELETE' })
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
