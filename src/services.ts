import {
  Identity,
  NotificationsUpdate,
  Group,
  Currency,
  DetailedGroup,
  Notification,
  NotificationAction,
  Expense,
  Balance,
  NotificationUpdate
} from './types'
import { logout as logoutAction } from './utils'

export const API_HOST = import.meta.env.VITE_API_URL

type Event = {
  kind: 'group' | 'notification'
  id: number
  field: string
}

export async function fetchSync(): Promise<Event[]> {
  const res = await authentifiedFetch(`${API_HOST}/sync`)

  return (await res.json()) as Event[]
}

export async function updateNotifications(update: NotificationsUpdate): Promise<void> {
  await authentifiedFetch(`${API_HOST}/notifications`, {
    method: 'PUT',
    body: JSON.stringify(update),
    headers: { 'Content-Type': 'application/json' }
  })
}

export async function updateNotification(notification: Notification, update: NotificationUpdate): Promise<void> {
  await authentifiedFetch(`${API_HOST}/notifications/${notification.id}`, {
    method: 'PUT',
    body: JSON.stringify(update),
    headers: { 'Content-Type': 'application/json' }
  })
}

export async function updateMembership(status: NotificationAction, group: Group): Promise<void> {
  await authentifiedFetch(`${API_HOST}/groups/${group.id}/memberships`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
    headers: { 'Content-Type': 'application/json' }
  })
}

export async function fetchCurrencies(): Promise<Currency[]> {
  const res = await authentifiedFetch(`${API_HOST}/currencies`)

  return (await res.json()) as Currency[]
}

export async function fetchNotifications(): Promise<Notification[]> {
  const res = await authentifiedFetch(`${API_HOST}/notifications`)

  return (await res.json()) as Notification[]
}

export async function fetchGroup(id: number): Promise<DetailedGroup> {
  const res = await authentifiedFetch(`${API_HOST}/groups/${id}`)

  return (await res.json()) as DetailedGroup
}

export async function fetchGroups(): Promise<Group[]> {
  const res = await authentifiedFetch(`${API_HOST}/groups`)

  return (await res.json()) as Group[]
}

export async function inviteUsers(group_id: number, emails: string[]): Promise<void> {
  const response = await authentifiedFetch(`${API_HOST}/groups/${group_id}/memberships`, {
    method: 'POST',
    body: JSON.stringify({ emails }),
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    throw response
  }
}

export async function putExpense(expense: Expense, _groupId: number): Promise<void> {
  const response = await authentifiedFetch(`${API_HOST}/groups/${expense.group_id}/expenses/${expense.id}`, {
    method: 'PUT',
    body: JSON.stringify(expense),
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    throw response
  }
}

export async function postExpense(expense: Expense, groupId: number): Promise<void> {
  const response = await authentifiedFetch(`${API_HOST}/groups/${groupId}/expenses`, {
    method: 'POST',
    body: JSON.stringify(expense),
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    throw response
  }
}

export async function deleteExpense(expenseId: number, groupId: number): Promise<void> {
  const response = await authentifiedFetch(`${API_HOST}/groups/${groupId}/expenses/${expenseId}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    throw response
  }
}

export async function fetchExpenses(groupId: number): Promise<Expense[]> {
  const res = await authentifiedFetch(`${API_HOST}/groups/${groupId}/expenses`)

  return await res.json()
}

export async function fetchBalances(groupId: number): Promise<Balance[]> {
  const res = await authentifiedFetch(`${API_HOST}/groups/${groupId}/balances`)

  return await res.json()
}

export async function putGroup(group: Group): Promise<void> {
  const response = await authentifiedFetch(`${API_HOST}/groups/${group.id}`, {
    method: 'PUT',
    body: JSON.stringify(group),
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    throw response
  }
}

export async function postGroup(group: Group): Promise<void> {
  const response = await authentifiedFetch(`${API_HOST}/groups`, {
    method: 'POST',
    body: JSON.stringify(group),
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    throw response
  }
}

export async function deleteGroup(group: Group) {
  const response = await authentifiedFetch(`${API_HOST}/groups/${group.id}`, { method: 'DELETE' })
  if (!response.ok) {
    throw response
  }
}

export async function logout(): Promise<Response> {
  return await authentifiedFetch(API_HOST + '/logout')
}

// *****************************************************************************************************
// *************** utils ***************
// *****************************************************************************************************

let refreshing = false

async function authentifiedFetch(url: string, init: RequestInit | undefined = {}) {
  const options = {
    ...init,
    mode: 'cors' as const, // no-cors, *cors, same-origin
    cache: 'no-cache' as const, // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'include' as const // Ensures cookies are sent with the request
  }

  const response = await fetch(url, options)

  if (response.status === 401) {
    if (!refreshing) {
      refreshing = true

      let refreshResponse
      try {
        refreshResponse = await refresh(options)
      } catch {}
      refreshing = false

      if (!refreshResponse?.ok) {
        await logoutAction()

        return response
      }
    } else {
      // wait for the token to be refreshed
      while (refreshing) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    // retry the original request
    return await fetch(url, options)
  } else {
    return response
  }
}

async function refresh(init: RequestInit) {
  return await fetch(`${API_HOST}/refresh`, { ...init, method: 'POST' })
}
