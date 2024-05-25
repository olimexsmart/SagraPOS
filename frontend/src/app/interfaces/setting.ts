export interface SettingCategory {
    id: number,
    name: string
}

export interface Setting {
    key: string,
    category: SettingCategory,
    inputType: string,
    value: string,
    displayName: string,
    description: string
}
