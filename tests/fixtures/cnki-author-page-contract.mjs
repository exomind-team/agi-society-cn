export function withoutCnkiAuthorPage(profile) {
  const value = structuredClone(profile)
  const pageSourceIds = new Set((value.sources || [])
    .filter(source => source.url?.includes('kns.cnki.net/kcms2/author/detail'))
    .map(source => source.id))
  value.sources = (value.sources || []).filter(source => !pageSourceIds.has(source.id))
  value.related = (value.related || []).filter(item => !item.href?.includes('kns.cnki.net/kcms2/author/detail'))
  value.sections = (value.sections || []).filter(section => section.title !== '知网作者页关注领域')
  if (value.id === 'liu-kai') value.limitations = '个人简介 PPTX 为单页材料且未附外部引用；职称、学历、经历和研究方向尚未逐项独立核验。博士后与访问学者时间有重叠，按原材料分项呈现，不推断其安排。内嵌头像经用户明确批准用于此人物页，但 PPTX 未注明摄影者或高校官方来源；不据此主张其为高校官方照片。招生要求和非必要个人字段未纳入。'
  return value
}
