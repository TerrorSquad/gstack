import { extendLocale } from '@nuxt/ui/composables'
import { en, hr } from '@nuxt/ui/locale'

// Nuxt UI ships no Serbian: derive Serbian Latin from Croatian (ijekavian → ekavian, the few words that differ).
// Code 'sr-Latn' so the calendar's month and day names are Latin; plain 'sr' is Cyrillic to Intl.
const SR: [RegExp, string][] = [
  [/Sljede/g, 'Slede'],
  [/mjesec/g, 'mesec'],
  [/Svijetl/g, 'Svetl'],
  [/svijetl/g, 'svetl'],
  [/Sustav/g, 'Sistem'],
  [/Natrag/g, 'Nazad'],
  [/ovdje/g, 'ovde'],
  [/Usporedba/g, 'Poređenje'],
  [/cjenovn/g, 'cenovn'],
  [/Pretraživanje/g, 'Pretraga'],
  [/Poveznice/g, 'Linkovi'],
  [/način rada/g, 'režim'],
  [/međuspremnik/g, 'klipbord'],
  [/Odaberite/g, 'Izaberite'],
  [/izbornik/g, 'meni'],
]
const ekavian = (v: unknown): unknown =>
  typeof v === 'string'
    ? SR.reduce((s, [re, to]) => s.replace(re, to), v)
    : v && typeof v === 'object'
      ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, ekavian(x)]))
      : v

export const UI_LOCALES = {
  en,
  sr: extendLocale(hr, {
    name: 'Srpski',
    code: 'sr-Latn',
    messages: ekavian(hr.messages) as typeof hr.messages,
  }),
}
