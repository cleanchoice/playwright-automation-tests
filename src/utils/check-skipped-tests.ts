import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const JIRA_EMAIL = process.env.JIRA_EMAIL!;
const JIRA_TOKEN = process.env.JIRA_API_TOKEN!;
const JIRA_BASE_URL = process.env.JIRA_BASE_URL!;

const TEST_DIR = 'tests';
// For second check
const SCAN_DIRS_FOR_LINKS = ['.']; // scan whole repo
const IGNORE_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'out', '.next']);

// Jira ID: TA-123, LC-935
const jiraPattern = /\b([A-Z]+[0-9]*-\d+)\b/g;

// Jira links in comments
const jiraBaseEscaped = JIRA_BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const jiraLinkPattern = new RegExp(
  String.raw`https?:\/\/${jiraBaseEscaped.replace(/^https?:\/\//, '')}\/browse\/([A-Z]+[0-9]*-\d+)`,
  'g',
);

// -------- helpers --------
function* walkFiles(dir: string): Generator<string> {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) {
      if (IGNORE_DIRS.has(e.name)) continue;
      yield* walkFiles(path.join(dir, e.name));
    } else {
      yield path.join(dir, e.name);
    }
  }
}

// -------- Check #1: search for Jira keys in tests --------
async function findAllJiraIdsInTests(dir: string): Promise<string[]> {
  const results = new Set<string>();
  for (const filePath of walkFiles(dir)) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) continue;
    const content = fs.readFileSync(filePath, 'utf-8');
    let match;
    while ((match = jiraPattern.exec(content)) !== null) {
      results.add(match[1]);
    }
  }
  return [...results];
}

// -------- Check #2: search for Jira links --------
async function findAllJiraIdsFromCommentLinks(dirs: string[]): Promise<string[]> {
  const results = new Set<string>();
  for (const dir of dirs) {
    for (const filePath of walkFiles(dir)) {
      if (!/\.(ts|tsx|js|jsx)$/.test(filePath)) continue;
      const content = fs.readFileSync(filePath, 'utf-8');
      const m1 = content.match(/\/\/[^\n]*/g);
      const m2 = content.match(/\/\*[\s\S]*?\*\//g);
      const lineComments: string[] = m1 ? Array.from(m1) : [];
      const blockComments: string[] = m2 ? Array.from(m2) : [];
      const comments: string[] = [...lineComments, ...blockComments];

      for (const c of comments) {
        let m;
        while ((m = jiraLinkPattern.exec(c)) !== null) {
          results.add(m[1]);
        }
      }
    }
  }
  return [...results];
}

// -------- Jira API --------
async function getJiraIssueStatus(issueId: string): Promise<string> {
  const url = `${JIRA_BASE_URL}/rest/api/3/issue/${issueId}`;
  const response = await axios.get(url, {
    auth: { username: JIRA_EMAIL, password: JIRA_TOKEN },
    headers: { Accept: 'application/json' },
  });
  return response.data.fields.status.name;
}

(async () => {
  // ===== Check #1: ID in the tests =====
  const idsFromTests = await findAllJiraIdsInTests(TEST_DIR);
  console.log(`\n🔎 Check №1 — found ${idsFromTests.length} Jira ID in ${TEST_DIR}:`);
  for (const id of idsFromTests) {
    try {
      const status = await getJiraIssueStatus(id);
      if (status.toLowerCase() === 'done') {
        console.log(`✅ ${id} — status "Done" → skip should be removed`);
      } else {
        console.log(`⏳ ${id} — status "${status}"`);
      }
    } catch (e) {
      if (axios.isAxiosError(e)) {
        console.error(`⚠️ Axios error for ${id}:`, e.response?.data || e.message);
      } else if (e instanceof Error) {
        console.error(`⚠️ error for ${id}:`, e.message);
      } else {
        console.error(`⚠️ Unknown error for ${id}:`, e);
      }
    }
  }

  // ===== Check #2: links in the comments =====
  const idsFromLinks = await findAllJiraIdsFromCommentLinks(SCAN_DIRS_FOR_LINKS);
  console.log(`\n🔎 check #2 — found ${idsFromLinks.length} Jira ID in the comments ( ${JIRA_BASE_URL}/browse/... ):`);
  for (const id of idsFromLinks) {
    try {
      const status = await getJiraIssueStatus(id);
      if (status.toLowerCase() === 'done') {
        console.log(`📌 ${id} — "Done"`);
      } else {
        console.log(`📝 ${id} — status "${status}"`);
      }
    } catch (e) {
      if (axios.isAxiosError(e)) {
        console.error(`⚠️ Axios error for ${id}:`, e.response?.data || e.message);
      } else if (e instanceof Error) {
        console.error(`⚠️ error for ${id}:`, e.message);
      } else {
        console.error(`⚠️ Unknown error for ${id}:`, e);
      }
    }
  }
})();
