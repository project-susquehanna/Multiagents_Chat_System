# Three-agent evaluation with fixed evidence

The existing local result files have been translated into English for readability. Their recorded model responses and evidence text are translations of earlier runs, not new model outputs. Original timestamps, usage, and hashes describe those earlier runs; they do not validate the translated text or measure the English prompts. Run a new evaluation to assess the translated pipeline.

Current status: only offline script validation has been completed; there are no new real-model results. All 12 cases passed the full dry run; placeholder answers are not scored.

## Running

Place the three-agent-eval folder inside backend. Node with --env-file support (20.6+) is required. Run from the backend directory:

```bash
node --env-file=.env three-agent-eval/run-eval.mjs --project . --limit 3
```

Run three cases first to confirm model availability. For the formal small-sample evaluation:

```bash
node --env-file=.env three-agent-eval/run-eval.mjs --project . --limit 12 --repeats 3
```

Results are saved to three-agent-eval/raw-results.json by default. Runs consume Groq API quota: 12 cases × 3 rounds normally require 144 generations, or up to 288 with retries; there are no real search charges. Authentication or rate-limit errors are recorded and stop the run without repeated reruns. The default interval between cases is 18 seconds, with a 90-second timeout per call. Environment variables are read at runtime and keys are not printed. Share only raw-results.json; there is no need to upload .env.

## What is compared

1. A+B: use the B draft from the same execution chain; cost includes A and B.
2. A+B+C: use the C final answer from the latest code; cost includes all three agents and retries.
3. Standalone 120B: answer independently using the exact system prompt and evidence input received by B, with temperature 0 to match C. If A fails and B does not run, mark this control as not run; do not count it as correct or silently exclude it.

A uses the model configured in the project by default; B/C retain their original models and prompts. No JSON contract is appended by default, so project output issues are not silently fixed. The existing A token cap is preserved; calls without a cap receive a 4096-token cap to prevent excessively long generations. If a model is unavailable, the script fails rather than switching automatically. --collector-model explicitly overrides A and is recorded in the results; such runs cannot be described as evaluations of the original model configuration.

Search and history tools return fixed synthetic data, while model calls are real. All projects and .example addresses are fictional. No live web searches, database connections, real history reads, or production writes occur. The isolated environment supplies a fixed test user identity to exercise history-tool permissions. This is an evidence-grounding stress test, not a full login/search/database end-to-end test or a measurement of general-knowledge hallucination rates.

## How to score

After results are returned, check each case against gold/rubric in cases.json. Hide model groups before scoring, retain explanations, and do not treat a model claim of correctness as a pass.

- correct: the answer matches the evidence and fulfills the request; correctly identifying genuinely insufficient evidence also counts.
- hallucination: confidently states false or unsupported facts, sources, or quotations.
- incomplete: partially correct but omits required information.
- abstain: refuses despite sufficient evidence; reducing hallucinations through refusal does not justify claiming better overall performance.
- protocol_error: no usable reply, invalid JSON, or an API failure; count separately, not as a hallucination-free success.

Report counts of correct answers, hallucinations, abstentions, partial answers, and failures for each group; how many B errors C corrected and how many correct answers C made incorrect; API latency and input/output tokens including retries. Failed calls without usage data have unknown cost and must not be treated as free. Report costs in tokens only; do not invent dollar estimates.

The difference between A+B and A+B+C also includes the capability difference between 20B and 120B, hence the standalone 120B control. Three repetitions still contain only 12 independent cases, not 36 distinct cases. The sample is too small to claim a general percentage reduction in hallucinations. Model call order is fixed; latency supports only rough comparisons and excludes real search, database, and web UI time.

Optional: --dry-run checks only the evaluation script without calling any API; its output is marked dryRun:true and must not be used to measure model performance. --mode fixed-evidence also replaces A with a deterministic stub and cannot represent three real agents. --json-contract modifies the prompt contract for troubleshooting only and must not be mixed with original-configuration evaluations.
