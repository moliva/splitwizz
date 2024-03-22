import { Accessor, For, Resource, Show, createSignal } from "solid-js"

import { Balance, DetailedGroup, Expense, FormatExpense, } from "../types"
import { useAppContext } from "../context"

import appStyles from '../App.module.css'
import styles from '../pages/Group.module.css'

export type BalancesProps = {
  balances: Accessor<Balance[]>
  group: Resource<DetailedGroup>
}

export const Balances = (props: BalancesProps) => {
  const { balances, group } = props
  const [state, setState] = useAppContext()!

  return (
    <>
      <For each={balances()}>{(balance) => {
        return <span>{JSON.stringify(balance)}</span>
      }}</For>
    </>
  )
}
