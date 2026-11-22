const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { parseReviewJson, preflightReason } = require('./reviewProtocol');

const action = (tool = 'searchTavily') => ({ skill: tool === 'searchHistory' ? 'history-manager' : 'search-tavily', tool, args: { keyword: 'Report' }, reply: 'Searching' });
const draft = { skill: 'none', tool: 'none', args: {}, reply: 'Candidate answer' };
const retry = { decision: 'retry', reasonCode: 'wrong_scope', reason: 'Incorrect retrieval scope', retryHint: 'Search for the trial report', reply: '' };
const final = { decision: 'final', reasonCode: 'insufficient_evidence', reason: 'Only a target is available', retryHint: '', reply: '22% is only a target; no measured results are available yet.' };

async function run(outputs, question = 'Please consult the Xingwei trial report and provide the energy savings percentage') {
    let handler;
    const executed = [], requests = [];
    const mocks = {
        './db': () => { throw Error('must not write'); },
        './createEmbedding': {},
        './skillCatalog': { skillCatalog: async () => [] },
        './prompts/catalogPrompt': { createCatalogPrompt: () => '' },
        './toolUser': { toolUser: async (role, skill, tool) => {
            executed.push(tool);
            return tool === 'stopOperate' ? { stopOperate: true } : { success: true, results: [] };
        } },
        express: { Router: () => ({ post: (_, fn) => { handler = fn; }, get() {} }) },
        'groq-sdk': class { constructor() { this.chat = { completions: { create: async request => {
            requests.push(request);
            assert.ok(outputs.length, 'unexpected model call');
            return { choices: [{ message: { content: JSON.stringify(outputs.shift()) } }] };
        } } }; } }
    };
    vm.runInNewContext(fs.readFileSync(require.resolve('./chat'), 'utf8'), {
        require: name => mocks[name] || require(name), module: { exports: {} },
        process: { env: {} }, console: { log() {}, warn() {}, error() {} }
    });
    let body, status = 200;
    await handler({ body: { originalMessage: question, messageHistory: question } }, {
        status(code) { status = code; return this; }, json(value) { body = value; }
    });
    assert.equal(status, 200, JSON.stringify(body));
    assert.equal(outputs.length, 0);
    return { body, executed, requests };
}

test('preflight preserves explicit history requests', () => {
    assert.ok(preflightReason('Please consult the project trial report', action('searchHistory')));
    assert.ok(preflightReason('Please search for the Taiqiao project team roster. Who leads the software team, and who leads the hardware team?', action('searchHistory')));
    assert.equal(preflightReason('Find the project report in our previous chat', action('searchHistory')), null);
});
test('review contract rejects malformed and inconsistent decisions', () => {
    assert.deepEqual(parseReviewJson(JSON.stringify(retry)), retry);
    assert.throws(() => parseReviewJson(JSON.stringify({ ...retry, retryHint: '' })));
    assert.throws(() => parseReviewJson(JSON.stringify({ ...final, extra: true })));
    assert.throws(() => parseReviewJson(JSON.stringify({ ...retry, reasonCode: 'insufficient_evidence' })));
});
test('wrong history tool is blocked before execution and consumes shared retry', async () => {
    const { body, executed } = await run([action('searchHistory'), action(), draft, final]);
    assert.deepEqual(executed, ['searchTavily', 'stopOperate']);
    assert.equal(body.retriesUsed, 1);
    assert.equal(body.attempts[0].stage, 'preflight');
});
test('C feedback reruns A, B and C once and is visible to A', async () => {
    const { body, requests, executed } = await run([action(), draft, retry, action(), draft, final]);
    assert.equal(body.attempts.length, 2);
    assert.equal(body.finalAnswer, final.reply);
    assert.match(requests[3].messages[1].content, /wrong_scope|Incorrect retrieval scope/);
    assert.deepEqual(executed, ['searchTavily', 'searchTavily', 'stopOperate']);
});
test('repeated retry from C is bounded and becomes an explicit final limitation', async () => {
    const { body } = await run([action(), draft, retry, action(), draft, retry]);
    assert.equal(body.review.reasonCode, 'retry_exhausted');
    assert.equal(body.stopOperate, true);
});
test('preflight and C cannot each obtain a retry', async () => {
    const { body, executed } = await run([action('searchHistory'), action('searchHistory'), draft, retry]);
    assert.deepEqual(executed, ['stopOperate']);
    assert.equal(body.retriesUsed, 1);
    assert.equal(body.review.reasonCode, 'retry_exhausted');
});
test('correct search with insufficient evidence ends without retry', async () => {
    const { body } = await run([action(), draft, final]);
    assert.equal(body.retriesUsed, 0);
    assert.equal(body.review.reasonCode, 'insufficient_evidence');
});
test('invalid C JSON is retried with the C contract', async () => {
    const { requests } = await run([action(), draft, {}, final]);
    assert.match(requests[3].messages[0].content, /decision, reasonCode, reason, retryHint, and reply/);
    assert.doesNotMatch(requests[3].messages[0].content, /Must contain exactly four fields: skill/);
});
test('invalid C output after its retry falls back to a safe final answer', async () => {
    const invalid = { ...retry, reasonCode: 'insufficient_evidence' };
    const { body, executed } = await run([action(), draft, invalid, invalid]);
    assert.equal(body.review.decision, 'final');
    assert.equal(body.review.reasonCode, 'retry_exhausted');
    assert.notEqual(body.finalAnswer, draft.reply);
    assert.deepEqual(executed, ['searchTavily', 'stopOperate']);
});
