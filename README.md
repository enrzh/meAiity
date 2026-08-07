# meAiity

**A terminal that is the about page.** Live at **[https://me.aiity.de/](https://me.aiity.de/)**.

Type `help`. No account, no backend, no forms — three static files and a locked-down nginx container.

> **Status: public.** Static site only. Nothing to install; credentials cannot leak because none are shipped.

## What it is

A command-driven personal site: `whoami`, `socials`, `projects`, `skills`, `gaming`, `contact`, and a few unlisted commands. Tab completes, arrows recall history, and there is a game if you dig.

Part of the **aiity** family (not **mAiity**, which is maps).

## Security posture

- Self-contained: HTML + CSS + one script; no third-party scripts or analytics
- CSP: `default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'none'`
- Unprivileged nginx, read-only container, capabilities dropped, GET/HEAD only
- No env files, API keys, or server-side data

## Run locally

```bash
npx --yes serve -l 3086 .
# or
docker compose up -d --build
# → http://127.0.0.1:3086/
```

## License

MIT — do what you want; attribution appreciated but not required.
