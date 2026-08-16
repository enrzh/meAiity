# me.aiity.de

**A terminal that is the about page** — not a product in the aiity app family.

Open [me.aiity.de](https://me.aiity.de/), type `help`. Static site (HTML/CSS/JS), no account, no backend. The maps product is **mAiity** (repo: `mAiity`) — currently on ice, with no site up.

Public GitHub release: [enrzh/meAiity](https://github.com/enrzh/meAiity) (plain host port in compose; no private-network bind).

```bash
# static preview
npx --yes serve -l 3086 .
# or Docker (public compose: 3086:8080)
docker compose up -d --build
```
