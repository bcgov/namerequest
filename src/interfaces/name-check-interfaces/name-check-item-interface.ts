export interface NameCheckItemIF {
  count: number,
  expandedInfoBlock1?: Array<string>,
  expandedInfo1: string,
  expandedInfo2: string,
  expandedInfo3?: string,
  expandedInfo4?: string,
  expandedList: Array<{ name: string, type: string }>,
  expandLabel: {
    open: string,
    closed: string
  },
  icon: string,
  iconColor: string,
  info?: string,
  problem: string,
  words: Array<string>
}