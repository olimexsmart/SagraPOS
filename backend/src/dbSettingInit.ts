import { SettingCategory } from "@Interfaces/setting";


export function insertDefaultSettingCategory(db: any, settingCategory: SettingCategory): void {
  // Check if already existent
  const out = db.prepare('SELECT COUNT(*) AS out FROM SettingCategories WHERE ID = ?').get(settingCategory.id).out
  if (out === 0) {
    const insertOK = db.prepare(`
      INSERT INTO SettingCategories (ID, Name)
      VALUES (@id, @name)
    `).run(settingCategory).changes === 1

    if (!insertOK)
      throw Error(`Setting category insert not ok. Key: ${settingCategory.id}`)
  }
}

export function insertDefaultSetting(db: any, setting: SettingToInsert): void {
  // Check if already existent
  const out = db.prepare('SELECT COUNT(*) AS out FROM Settings WHERE Key = ?').get(setting.key).out
  if (out === 0) {
    const insertOK = db.prepare(`
      INSERT INTO Settings (Key, Category, InputType, Value, DisplayName, Description)
      VALUES (@key, @category, @inputType, @value, @displayName, @description)
    `).run(setting).changes === 1

    if (!insertOK)
      throw Error(`Default setting insert not ok. Key: ${setting.key}`)
  }
}

export interface SettingToInsert { // TODO not great, I'm sure there is some better solution
  key: string,
  category: number,
  inputType: string,
  value: string | null,
  displayName: string,
  description: string | null
}

// List of settings categories
export const settingsCategories: SettingCategory[] = [
  { id: 1, name: 'Printer' },
  { id: 2, name: 'System' },
  { id: 3, name: 'Client Connection' },
]

// List of default settings
export const defaultSettingList: SettingToInsert[] = [
  {
    key: "PIN",
    category: 2,
    inputType: "number",
    value: "1234",
    displayName: "PIN Amministrazione",
    description: null
  },
  {
    key: "PrintLogo",
    category: 1,
    inputType: "file",
    value: null,
    displayName: "Logo scontrino",
    description: null
  },
  {
    key: "OverLogoText",
    category: 1,
    inputType: "textarea",
    value: "Vi aspettiamo \nil 28/29 Giugno 2024 per il Re Raviolo",
    displayName: "Testo sopra logo scontrino",
    description: null
  },
  {
    key: "UnderLogoText",
    category: 1,
    inputType: "textarea",
    value: "SagraPOS by Luca Olivieri @olimexsmart",
    displayName: "Testo sotto logo scontrino",
    description: null
  },
  {
    key: "PrintLogoHeight",
    category: 1,
    inputType: "number",
    value: "153",
    displayName: "Altezza logo scontrino",
    description: null
  },
  {
    key: "PrintOrderRecap",
    category: 1,
    inputType: "checkbox",
    value: "1",
    displayName: "Ricapitolo ordine",
    description: null
  },
  {
    key: "ServerURL",
    category: 3,
    inputType: "text",
    value: "http://192.168.1.153:3000",
    displayName: "Server URL",
    description: null
  },
  {
    key: "WiFiSSID",
    category: 3,
    inputType: "text",
    value: "SagraPOS_WiFi",
    displayName: "Nome rete WiFi",
    description: null
  },
  {
    key: "WiFiPassword",
    category: 3,
    inputType: "text",
    value: "sagra_pos",
    displayName: "Password rete WiFi",
    description: null
  },
  {
    key: "StartRecapText",
    category: 1,
    inputType: "textarea",
    value: "XXXVIII Sagra dei Testaieu\r\nCogorno 14/15 Giugno 2024\r\n",
    displayName: "Testo inizio riepilogo",
    description: null
  }
];


