import { buildRelations, readPages, readPeople } from '../../relations/index.mjs'
import path from 'node:path'
export default {
  watch: ['../../../content/**/*.md', '../../../data/people-*.json'],
  load: () => buildRelations({ pages: readPages(path.resolve('content')), people: readPeople() }),
}
