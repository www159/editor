export const OrderedListOptions = ['1', 'i', 'a', 'A'] as const
export type OrderedListOptions_t = typeof OrderedListOptions[number]

export const BulletListOptions = ['disc', 'circle', 'square'] as const
export type BulletListOptions_t = typeof BulletListOptions[number]

export interface bullet_listAttrs {
    type?: BulletListOptions_t,
    start?: number
}

export interface ordered_listAttrs {
    type?: OrderedListOptions_t,
    start?: number
}
