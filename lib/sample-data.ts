import { parseLeadExportCsv } from "@/lib/csv";
import { buildWorkspaceSnapshot } from "@/lib/pipeline";

const sampleCsv = `First name,Last name,LinkedIn email,Corporate email,Manually added email,Phone number,Title,Company,Location,Linkedin url,Last action,Time of last action,Company website,Linkedin public url,City,Country
Ajay,Gupta,a.gupta@stirista.com,ajay@stirista.com,,,Chief Executive Officer,Stirista Global,San Antonio,https://www.linkedin.com/in/ACoAAA32hpIBghnQOBy0ISEAe3sIkueBIhEPyA8,EMAIL_SENT,1774460744388,http://www.stirista.com/,https://www.linkedin.com/in/ajay-gupta-24255366,San Antonio,United States
Mark,Perini,,mark@iceesocial.com,,,Founder,ICEE Social,New York,https://www.linkedin.com/in/ACoAAA7S6FwBql4UyVqg9sO6iZbyUmSIf8UFubw,EMAIL_SENT,1774461121624,https://iceesocial.com/,https://www.linkedin.com/in/mark-perini,New York,United States
Cameron,Mcpherson,,cameronm@sparkpr.com,,,Senior Vice President of Finance and Operations,Sparkpr,San Francisco Bay Area,https://www.linkedin.com/in/ACoAAAA3_0wBzrHc7NfWy1Zk2P7V2TLjLuhus1k,EMAIL_SENT,1774461267656,https://sparkpr.com/lets-talk?wleadsource=LinkedIn,https://www.linkedin.com/in/cameronmcpherson,San Francisco Bay Area,United States`;

export const sampleContacts = parseLeadExportCsv(sampleCsv);
export const sampleWorkspace = buildWorkspaceSnapshot(sampleContacts);
