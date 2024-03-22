
export function copyToClipboard(value: string): void {
  navigator.clipboard.writeText(value)
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const dayNumberToName = (d: number): string => {
  switch (d) {
    case 0: return 'Sun'
    case 1: return 'Mon'
    case 2: return 'Tue'
    case 3: return 'Wed'
    case 4: return 'Thu'
    case 5: return 'Fri'
    case 6: return 'Sat'
    default: throw 'day number out of range'
  }
}


export const monthNumberToName = (m: string): string => {
  switch (m) {
    case '01': return 'January'
    case '02': return 'February'
    case '03': return 'March'
    case '04': return 'April'
    case '05': return 'May'
    case '06': return 'June'
    case '07': return 'July'
    case '08': return 'August'
    case '09': return 'September'
    case '10': return 'October'
    case '11': return 'November'
    case '12': return 'December'
    default: throw `month number out of range ${m}`
  }
}
