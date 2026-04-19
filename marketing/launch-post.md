# Your CLAUDE.md is probably broken

Most agent instruction files are markdown. Most markdown gets written once, forked around the company, and then mutated by whoever needed the agent to do one more thing this quarter. Nobody checks whether the rules still agree.

After looking at a lot of real `CLAUDE.md` / `AGENTS.md` / MCP tool specs, the same five failure modes show up:

## 1. Two binding rules that contradict

> - You must always commit before pushing.
> - Never commit before pushing.

Both use binding language. Neither marks itself as the exception. Different models resolve the contradiction differently. The same model resolves it differently on different runs.

## 2. "Follow our standards"

> Follow our standards when writing tests.

The agent can't look up what "our standards" means. Neither can most of the humans reading the file. Either link the doc or delete the rule.

## 3. Destructive verbs without gates

> Delete expired users nightly.

No "confirm", no "ask", no "human review", no "dry run". Agents execute tool calls the rule says to. This one will happily do exactly what it says.

## 4. Binding rules buried past the attention threshold

The rule that matters most is on line 247 of a 400-line spec. Models pay uneven attention across long contexts. If a binding rule is important, it goes near the top — or the spec needs surgery.

## 5. Permission ambiguity on tools

Section A says "use `docker push` for local testing". Section B says "never run Docker in production". Neither mentions the other. The agent picks whichever section it last saw most vividly.

---

The shared shape here: markdown became the lingua franca of agent instructions by accident, and there's no lint for it.

So we built one. [`agentspec`](https://github.com/HMAKT99/Agentspec) is the missing layer:

- **Lint** — 18 rules across conflict / clarity / tools / structure / tokens / compliance
- **Score** — a single 0–100 number you can gate PRs against
- **Fix** — safe-by-default auto-fixes
- **Test** — behavior-prediction engine runs your spec across three model families, classifies outcomes, reports divergence
- **CI** — GitHub Action with sticky PR comment and score delta vs base

Free, OSS, MIT. The CLI never touches the network unless you opt into `agentspec test`. Hosted registry + enterprise compliance are on the roadmap and paid; the linter is free forever.

Try it in your browser: [agentspec.dev/playground](https://agentspec.dev/playground). Paste your `CLAUDE.md`. We think you'll be surprised.
