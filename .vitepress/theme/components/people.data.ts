import { readFileSync } from 'node:fs'
import path from 'node:path'
import MarkdownIt from 'markdown-it'

// A view of the existing Markdown, never a second editorial source.
export default {
  watch: ['../../../content/index.md', '../../../content/about/team.md'],
  load() {
    const home = readFileSync(path.resolve('content/index.md'), 'utf8')
    const team = readFileSync(path.resolve('content/about/team.md'), 'utf8')
    const markdown = new MarkdownIt()
    const originals = Object.fromEntries([...home.matchAll(/<div class="team-member">\s*([\s\S]*?)\s*<\/div>/g)].map(match => {
      const name = match[1].match(/\*\*(.*?)\*\*/)?.[1]
      if (!name) throw new Error('Unrecognized original homepage member')
      return [name, markdown.render(match[1])]
    }))
    const groups = [...team.matchAll(/^\d\. (创办人|专家组|秘书组|会员组)：(.+)$/gm)].map(match => ({
      label: match[1],
      people: match[2].split('、').map(raw => {
        const name = raw.replace(/\[\[#([^|\]]+)\|([^\]]+)\]\]/g, '$2').replace(/\[\[#([^\]]+)\]\]/g, '$1').replace(/\\_/g, '_')
        const anchor = name === '那迪' ? '那孜古力·斯拉木-那迪' : name
        return { name, role: match[1], originalBio: originals[name] || '', path: '/about/team' + (originals[name] ? '#' + anchor : '') }
      })
    }))
    const names = groups.flatMap(group => group.people.map(person => person.name))
    if (new Set(names).size !== names.length) throw new Error('Duplicate member names require source review')
    if (groups.length !== 4 || Object.keys(originals).length !== 6) throw new Error('Review team source format before rendering')
    return { featured: groups.slice(0,2).flatMap(group => group.people), secretariat: groups[2].people, members: groups[3].people }
  }
}
