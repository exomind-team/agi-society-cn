import assert from 'node:assert/strict'
// Only the two withdrawn claims and the three links whose sole evidence was
// those claims are removed. All other historical graph entries remain frozen.
export const withdrawnRelations = new Set([
 ['liu-kai','wang-weijun','link','explicit-wikilink','/wiki/people/liu-kai','confirmed','explicit'],
 ['liu-kai','hu-xiangen','link','explicit-wikilink','/wiki/people/liu-kai','confirmed','explicit'],
 ['liu-kai','wang-weijun','doctoral-advisor','editorial-evidence','/wiki/people/liu-kai#师承与身份线索','maintainer-provided','explicit-maintainer-statement'],
 ['liu-kai','hu-xiangen','postdoctoral-advisor','editorial-evidence','/wiki/people/liu-kai#师承与身份线索','maintainer-provided','explicit-maintainer-statement'],
 ['wang-weijun','liu-kai','link','explicit-wikilink','/wiki/people/wang-weijun','confirmed','explicit'],
].map(([from,to,...rest])=>JSON.stringify(['/wiki/people/'+from,'/wiki/people/'+to,...rest])))
export function beforeMentorWithdrawal(profile) {
 if(profile.id!=='wang-weijun') return profile
 assert.equal(profile.limitations,'本页非完整履历与成果目录。')
 return {...profile,limitations:'导师关系另以维护者提供标注，尚未独立核验公开来源；本页非完整履历与成果目录。'}
}
export function isWithdrawnRelation(key,current) {
 if(!withdrawnRelations.has(key)) return false
 assert.ok(!current.has(key),'Withdrawn claim/link must not survive: '+key)
 return true
}
