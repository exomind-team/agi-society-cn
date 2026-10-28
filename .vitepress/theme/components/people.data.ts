import { readFileSync } from 'node:fs'
import path from 'node:path'

// Membership roles come from the roster page, not homepage presentation markup.
export default {
  watch: ['../../../content/about/team.md'],
  load() {
    const team = readFileSync(path.resolve('content/about/team.md'), 'utf8')
    const groups = [...team.matchAll(/^\d\. (创办人|专家组|秘书组|会员组)：(.+)$/gm)].map(match => ({
      label: match[1],
      people: match[2].split('、').map(raw => {
        const anchorLink = raw.match(/\[\[#([^|\]]+)(?:\|([^\]]+))?\]\]/)
        const labelledLink = raw.match(/\[\[[^|\]]+\|([^\]]+)\]\]/)
        const name = (anchorLink ? (anchorLink[2] || anchorLink[1]) : labelledLink?.[1] || raw.replace(/\[\[([^\]]+)\]\]/g, '$1')).replace(/\\_/g, '_')
        const anchor = name === '那迪' ? '那孜古力·斯拉木-那迪' : name
        return { name, role: match[1], path: '/about/team#' + anchor }
      })
    }))
    const names = groups.flatMap(group => group.people.map(person => person.name))
    if (new Set(names).size !== names.length) throw new Error('Duplicate member names require source review')
    if (groups.length !== 4) throw new Error('Review team source format before rendering')
    return { featured: groups.slice(0,2).flatMap(group => group.people), secretariat: groups[2].people, members: groups[3].people }
  }
}
