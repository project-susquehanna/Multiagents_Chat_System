const { AgentOutputValidationError } = require('./agentResponse');

const reviewContract = 'Output only JSON containing exactly decision, reasonCode, reason, retryHint, and reply. decision must be retry or final; reasonCode must be wrong_tool, wrong_scope, tool_error, sufficient_evidence, insufficient_evidence, or retry_exhausted; reason must be non-empty. For retry, retryHint must be non-empty and reply must be empty. For final, retryHint must be empty and reply must be a complete, non-empty final answer.';

function parseReviewJson(content) {
    let value;
    try { value = JSON.parse(content); } catch { throw new AgentOutputValidationError('Review result is not JSON'); }
    const fields = ['decision', 'reasonCode', 'reason', 'retryHint', 'reply'];
    if (!value || Array.isArray(value) || Object.keys(value).length !== fields.length ||
        fields.some(key => typeof value[key] !== 'string') ||
        !['retry', 'final'].includes(value.decision) || !value.reason.trim()) {
        throw new AgentOutputValidationError('Invalid review fields');
    }
    const retryReasons = ['wrong_tool', 'wrong_scope', 'tool_error'];
    if (![...retryReasons, 'sufficient_evidence', 'insufficient_evidence', 'retry_exhausted'].includes(value.reasonCode) ||
        (value.decision === 'retry' && (!retryReasons.includes(value.reasonCode) || !value.retryHint.trim() || value.reply !== '')) ||
        (value.decision === 'final' && (!value.reply.trim() || value.retryHint !== ''))) {
        throw new AgentOutputValidationError('Review decision is inconsistent with its content');
    }
    return value;
}

function preflightReason(question, action) {
    const historyRequest = /\b(previous(?:ly)?|earlier|last time|chats?|conversations?|I said|you said|we discussed)\b/i.test(question);
    const externalRequest = /\b(consult|verify|check|search|retrieve|look up|find)\b/i.test(question) && /\b(reports?|projects?|announcements?|official websites?|releases?|trials?)\b/i.test(question);
    if (action.tool === 'searchHistory' && externalRequest && !historyRequest) {
        return 'The user requested verification of external information, but searchHistory can only retrieve chat history. Select searchTavily instead to retrieve relevant sources.';
    }
    return null;
}

module.exports = { reviewContract, parseReviewJson, preflightReason };
