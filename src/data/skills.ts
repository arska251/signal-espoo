import { t } from '../i18n'
// A small skills taxonomy modelled on ESCO (European Skills, Competences, Qualifications and Occupations).
// Labels follow ESCO style; a production version would use ESCO URIs from the ESCO API.
// `related` lists skills that transfer well: a candidate with a related skill counts as a close match.
// `words` are lowercase stems used by the offline extractor (English and Finnish).

export type SkillGroup =
  | 'Software'
  | 'Data'
  | 'Cloud and infrastructure'
  | 'Logistics and operations'
  | 'Health and care'
  | 'Customer and sales'
  | 'Business and project'
  | 'Design'
  | 'Engineering'

export interface Skill {
  id: string
  label: string
  group: SkillGroup
  related: string[]
  words: string[]
}

export const SKILLS: Skill[] = [
  // Software
  { id: 'js', label: 'JavaScript', group: 'Software', related: ['ts', 'frontend'], words: ['javascript', 'node.js', 'nodejs'] },
  { id: 'ts', label: 'TypeScript', group: 'Software', related: ['js'], words: ['typescript'] },
  { id: 'frontend', label: 'develop user interfaces (frontend)', group: 'Software', related: ['js', 'ux'], words: ['frontend', 'front-end', 'react', 'käyttöliittym'] },
  { id: 'backend', label: 'develop server-side software (backend)', group: 'Software', related: ['java', 'python', 'api'], words: ['backend', 'back-end', 'server-side', 'palvelin'] },
  { id: 'python', label: 'Python', group: 'Software', related: ['backend', 'data-analysis'], words: ['python'] },
  { id: 'java', label: 'Java', group: 'Software', related: ['backend', 'csharp'], words: ['java ', 'java,', 'java.', 'kotlin', 'spring'] },
  { id: 'csharp', label: 'C#', group: 'Software', related: ['java'], words: ['c#', '.net', 'dotnet'] },
  { id: 'cpp', label: 'C++', group: 'Software', related: ['csharp', 'embedded'], words: ['c++', 'unreal'] },
  { id: 'api', label: 'design application programming interfaces', group: 'Software', related: ['backend'], words: ['api ', 'apis', 'rajapin', 'integraati', 'integration'] },
  { id: 'testing', label: 'perform software testing', group: 'Software', related: ['backend', 'frontend'], words: ['testing', 'test automation', 'qa ', 'testaus', 'testau'] },
  { id: 'legacy', label: 'migrate existing systems', group: 'Software', related: ['backend', 'cloud', 'sql'], words: ['migrat', 'legacy', 'vanha järjestelmä', 'modernis', 'siirtä'] },
  { id: 'embedded', label: 'develop embedded systems', group: 'Software', related: ['cpp'], words: ['embedded', 'sulautet', 'firmware'] },
  { id: 'games', label: 'develop games', group: 'Software', related: ['cpp', 'csharp'], words: ['game', 'peli', 'unity', 'multiplayer', 'moninpel'] },

  // Data
  { id: 'sql', label: 'SQL', group: 'Data', related: ['data-analysis', 'database'], words: ['sql', 'postgres', 'mysql'] },
  { id: 'database', label: 'manage databases', group: 'Data', related: ['sql'], words: ['database', 'tietokan'] },
  { id: 'data-analysis', label: 'perform data analysis', group: 'Data', related: ['sql', 'python', 'bi'], words: ['data analy', 'analytics', 'analytiik', 'data-analy', 'analysoi'] },
  { id: 'bi', label: 'create business intelligence reports', group: 'Data', related: ['data-analysis', 'excel'], words: ['power bi', 'tableau', 'dashboard', 'raportoin', 'reporting'] },
  { id: 'ml', label: 'apply machine learning', group: 'Data', related: ['python', 'data-analysis'], words: ['machine learning', 'koneoppi', ' ml ', 'ai model', 'tekoälymall'] },

  // Cloud and infrastructure
  { id: 'cloud', label: 'manage cloud infrastructure', group: 'Cloud and infrastructure', related: ['devops', 'linux'], words: ['cloud', 'pilvi', 'pilveen', 'aws', 'azure', 'gcp'] },
  { id: 'devops', label: 'apply DevOps practices', group: 'Cloud and infrastructure', related: ['cloud', 'linux'], words: ['devops', 'ci/cd', 'kubernetes', 'docker', 'deployment'] },
  { id: 'linux', label: 'administer Linux systems', group: 'Cloud and infrastructure', related: ['devops'], words: ['linux', 'unix'] },
  { id: 'security', label: 'apply information security', group: 'Cloud and infrastructure', related: ['cloud', 'linux'], words: ['security', 'tietoturva', 'kyberturva'] },

  // Logistics and operations
  { id: 'wms', label: 'operate warehouse management systems', group: 'Logistics and operations', related: ['supply-chain', 'erp'], words: ['warehouse', 'varasto', 'wms'] },
  { id: 'supply-chain', label: 'manage supply chain', group: 'Logistics and operations', related: ['wms', 'procurement'], words: ['supply chain', 'toimitusketju', 'logistic', 'logistiik'] },
  { id: 'procurement', label: 'perform procurement', group: 'Logistics and operations', related: ['supply-chain'], words: ['procurement', 'hankin', 'purchasing', 'osto'] },
  { id: 'erp', label: 'use enterprise resource planning software', group: 'Logistics and operations', related: ['wms', 'excel'], words: ['erp ', 'sap '] },
  { id: 'lean', label: 'apply lean process improvement', group: 'Logistics and operations', related: ['supply-chain', 'pm'], words: ['lean ', 'process improvement', 'prosessikehit', 'tehostaa', 'efficien'] },

  // Health and care
  { id: 'nursing', label: 'provide nursing care', group: 'Health and care', related: ['elderly-care', 'patient-safety'], words: ['nurse', 'nursing', 'sairaanhoita', 'hoitaja', 'lähihoita'] },
  { id: 'elderly-care', label: 'care for older adults', group: 'Health and care', related: ['nursing'], words: ['elderly', 'vanhus', 'ikäänty', 'hoivakoti', 'care home'] },
  { id: 'medication', label: 'administer medication', group: 'Health and care', related: ['nursing', 'patient-safety'], words: ['medication', 'lääke', 'lääkehoi'] },
  { id: 'patient-safety', label: 'ensure patient safety', group: 'Health and care', related: ['nursing'], words: ['patient safety', 'potilasturval'] },

  // Customer and sales
  { id: 'customer-service', label: 'provide customer service', group: 'Customer and sales', related: ['sales', 'customer-success'], words: ['customer service', 'asiakaspalvelu', 'customer support', 'asiakastuki'] },
  { id: 'customer-success', label: 'manage customer relationships', group: 'Customer and sales', related: ['customer-service', 'sales'], words: ['customer success', 'account manag', 'asiakkuu', 'key account'] },
  { id: 'sales', label: 'sell products and services', group: 'Customer and sales', related: ['customer-success'], words: ['sales', 'myynti', 'myydä', 'b2b'] },
  { id: 'marketing', label: 'plan marketing campaigns', group: 'Customer and sales', related: ['content', 'sales'], words: ['marketing', 'markkinoin', 'campaign', 'kampanj'] },
  { id: 'content', label: 'create digital content', group: 'Customer and sales', related: ['marketing'], words: ['content', 'sisällö', 'copywrit', 'social media', ' some '] },

  // Business and project
  { id: 'pm', label: 'perform project management', group: 'Business and project', related: ['agile', 'stakeholders'], words: ['project manag', 'projektinhallin', 'projektipäällik', 'projektin'] },
  { id: 'agile', label: 'apply agile methods', group: 'Business and project', related: ['pm'], words: ['agile', 'scrum', 'ketterä', 'kanban'] },
  { id: 'stakeholders', label: 'coordinate with stakeholders', group: 'Business and project', related: ['pm', 'customer-success'], words: ['stakeholder', 'sidosryhm', 'cross-functional', 'eri tiimien'] },
  { id: 'accounting', label: 'perform accounting', group: 'Business and project', related: ['excel', 'erp'], words: ['accounting', 'kirjanpi', 'bookkeeping', 'taloushallin'] },
  { id: 'excel', label: 'use spreadsheet software', group: 'Business and project', related: ['bi', 'accounting'], words: ['excel ', 'spreadsheet', 'taulukkolaske'] },
  { id: 'training', label: 'train and onboard people', group: 'Business and project', related: ['stakeholders'], words: ['training', 'onboard', 'perehdy', 'koulut', 'mentor'] },

  // Design
  { id: 'ux', label: 'design user experience', group: 'Design', related: ['frontend', 'graphic'], words: ['ux ', 'user experience', 'käyttökokemu', 'usability', 'figma'] },
  { id: 'graphic', label: 'create graphic design', group: 'Design', related: ['ux', 'content'], words: ['graphic', 'graafi', 'visual design', 'illustrat'] },

  // Engineering
  { id: 'cad', label: 'use CAD software', group: 'Engineering', related: ['mech'], words: ['cad ', 'solidworks', 'autocad'] },
  { id: 'mech', label: 'design mechanical systems', group: 'Engineering', related: ['cad', 'automation'], words: ['mechanical', 'mekaniik', 'koneensuunnit'] },
  { id: 'automation', label: 'program industrial automation', group: 'Engineering', related: ['embedded', 'mech'], words: ['automation', 'automaati', 'plc', 'robot'] },
  { id: 'electrical', label: 'design electrical systems', group: 'Engineering', related: ['automation', 'embedded'], words: ['electrical', 'sähkö'] },
]

export const SKILL_BY_ID: Record<string, Skill> = Object.fromEntries(SKILLS.map((s) => [s.id, s]))

const FI_LABEL: Record<string, string> = {
  'js': 'JavaScript',
  'ts': 'TypeScript',
  'frontend': 'käyttöliittymien kehittäminen (frontend)',
  'backend': 'palvelinohjelmistojen kehittäminen (backend)',
  'python': 'Python',
  'java': 'Java',
  'csharp': 'C#',
  'cpp': 'C++',
  'api': 'ohjelmointirajapintojen suunnittelu',
  'testing': 'ohjelmistotestaus',
  'legacy': 'vanhojen järjestelmien siirtäminen',
  'embedded': 'sulautettujen järjestelmien kehittäminen',
  'games': 'pelinkehitys',
  'sql': 'SQL',
  'database': 'tietokantojen hallinta',
  'data-analysis': 'data-analyysi',
  'bi': 'liiketoimintaraportointi',
  'ml': 'koneoppimisen soveltaminen',
  'cloud': 'pilvi-infrastruktuurin hallinta',
  'devops': 'DevOps-käytännöt',
  'linux': 'Linux-ylläpito',
  'security': 'tietoturva',
  'wms': 'varastonhallintajärjestelmät',
  'supply-chain': 'toimitusketjun hallinta',
  'procurement': 'hankinnat',
  'erp': 'toiminnanohjausjärjestelmät (ERP)',
  'lean': 'lean-prosessikehitys',
  'nursing': 'sairaanhoito',
  'elderly-care': 'ikääntyneiden hoito',
  'medication': 'lääkehoito',
  'patient-safety': 'potilasturvallisuus',
  'customer-service': 'asiakaspalvelu',
  'customer-success': 'asiakkuuksien hoito',
  'sales': 'myynti',
  'marketing': 'markkinointikampanjat',
  'content': 'digitaalisen sisällön tuottaminen',
  'pm': 'projektinhallinta',
  'agile': 'ketterät menetelmät',
  'stakeholders': 'sidosryhmäyhteistyö',
  'accounting': 'kirjanpito',
  'excel': 'taulukkolaskenta',
  'training': 'koulutus ja perehdytys',
  'ux': 'käyttökokemuksen suunnittelu',
  'graphic': 'graafinen suunnittelu',
  'cad': 'CAD-ohjelmistot',
  'mech': 'mekaniikkasuunnittelu',
  'automation': 'teollisuusautomaation ohjelmointi',
  'electrical': 'sähkösuunnittelu',
}

const FI_GROUP: Record<SkillGroup, string> = {
  'Software': 'Ohjelmistot',
  'Data': 'Data',
  'Cloud and infrastructure': 'Pilvi ja infrastruktuuri',
  'Logistics and operations': 'Logistiikka ja operaatiot',
  'Health and care': 'Terveys ja hoiva',
  'Customer and sales': 'Asiakkuudet ja myynti',
  'Business and project': 'Liiketoiminta ja projektit',
  'Design': 'Muotoilu',
  'Engineering': 'Tekniikka',
}

export function skillLabel(id: string): string {
  const skill = SKILL_BY_ID[id]
  if (!skill) return id
  return t(skill.label, FI_LABEL[id] ?? skill.label)
}

export const groupLabel = (g: SkillGroup): string => t(g, FI_GROUP[g])
