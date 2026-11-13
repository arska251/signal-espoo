// The fictional event the prototype is set in.
import { t } from '../i18n'

export const EVENT = {
  name: 'Espoo Talent Match',
  get date() {
    return t('10 December 2026', '10. joulukuuta 2026')
  },
  daysLeft: 27,
}
