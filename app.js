"use strict";
/* me.aiity.de — command-driven about-me terminal.
   Self-contained: no network calls, no third-party code, no eval. */

const $ = (id) => document.getElementById(id);
const out = $("out"), term = $("term"), inputrow = $("inputrow"),
      cmdline = $("cmdline"), echoEl = $("echo"), chips = $("chips");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const bootedAt = Date.now();

let history = [], histIdx = -1, busy = false, matrixOn = false, godmode = false;
let keyHook = null;   // when set, swallows keydown (used by snake)

const BANNER =
"███████╗███╗   ██╗██████╗ ██╗ ██████╗ ██████╗ \n" +
"██╔════╝████╗  ██║██╔══██╗██║██╔════╝██╔═══██╗\n" +
"█████╗  ██╔██╗ ██║██████╔╝██║██║     ██║   ██║\n" +
"██╔══╝  ██║╚██╗██║██╔══██╗██║██║     ██║   ██║\n" +
"███████╗██║ ╚████║██║  ██║██║╚██████╗╚██████╔╝\n" +
"╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═════╝ ";

/* ---------------- output helpers ---------------- */
const esc = (s) => String(s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

function scrollDown() { term.scrollTop = term.scrollHeight; }
function addLine(text = "", cls = "") {
  const div = document.createElement("div");
  div.className = "line" + (cls ? " " + cls : "");
  div.textContent = text;                    // always text — never HTML
  out.appendChild(div); scrollDown(); return div;
}
/* addHTML is ONLY ever called with literals built in this file.
   Anything user-derived must pass through esc() first. */
function addHTML(html, cls = "") {
  const div = document.createElement("div");
  div.className = "line" + (cls ? " " + cls : "");
  div.innerHTML = html;
  out.appendChild(div); scrollDown(); return div;
}
const sleep = (ms) => new Promise(r => setTimeout(r, reduceMotion ? 0 : ms));
async function typeLine(text, cls = "", cps = 3) {
  if (reduceMotion) { addLine(text, cls); return; }
  const div = addLine("", cls);
  for (let i = 0; i < text.length; i += 2) {
    div.textContent = text.slice(0, i + 2); scrollDown(); await sleep(cps);
  }
  div.textContent = text;
}
function link(href, label) {
  return '<a href="' + esc(href) + '" target="_blank" rel="noopener noreferrer">' + esc(label || href) + "</a>";
}
const redact = (n) => '<span class="redact">' + "█".repeat(n) + "</span>";
const pick = (a) => a[Math.floor(Math.random() * a.length)];

async function progress(label, ms = 1200, cls = "dim") {
  const div = addLine("", cls);
  const width = 26, steps = 18;
  for (let i = 0; i <= steps; i++) {
    const filled = Math.round((i / steps) * width);
    const pct = String(Math.round((i / steps) * 100)).padStart(3);
    div.textContent = label + " [" + "█".repeat(filled) + "·".repeat(width - filled) + "] " + pct + "%";
    scrollDown();
    await sleep(ms / steps);
  }
}

/* ---------------- content ---------------- */
function cmdWhoami() {
  addLine("enrico", "amber");
  addLine("human. probably.", "dim");
  addLine();
  addLine("builds things. breaks things. fixes them at 3am.");
  addLine("if it can be self-hosted, it already is.");
  addLine();
  addHTML('<span class="dark">[identity partially redacted — see identity.txt]</span>');
}
function cmdSocials() {
  addHTML("github     " + link("https://github.com/enrzh", "github.com/enrzh"));
  addHTML("x          " + link("https://x.com/foreseeingx", "@foreseeingx"));
  addHTML("instagram  " + link("https://instagram.com/enr.zh/", "@enr.zh"));
  addHTML("linkedin   " + link("https://www.linkedin.com/in/xianjie-zhan/", "in/xianjie-zhan"));
  addLine();
  addHTML('<span class="dim">everything i build lives on </span>' + link("https://github.com/enrzh", "github.com/enrzh"));
}
function cmdGaming() {
  addHTML("steam      " + link("https://steamcommunity.com/profiles/76561198253995638/", "steam profile"));
  addHTML("faceit     " + link("https://www.faceit.com/de/players/nRico_/stats/cs2", "nRico_ · cs2 stats"));
  addLine();
  addHTML('cs2: the aim is real. the rank is ' + redact(6) + '.');
}
function cmdProjects() {
  addLine("~/projects", "amber");
  addLine();
  addHTML('<span class="cyan">search.aiity.de</span>     ' + link("https://search.aiity.de", "search.aiity.de"));
  addLine("                     start page. clock, google ai search,", "dim");
  addLine("                     quick links, one thing to focus on today.", "dim");
  addLine();
  addHTML('<span class="cyan">sAiity</span>              ' + link("https://github.com/enrzh/sAiity", "github.com/enrzh/sAiity"));
  addLine("                     subtitles for whatever the mac is playing.", "dim");
  addLine("                     on-device. signed download. macOS 26 / apple silicon.", "dim");
  addLine();
  addHTML('<span class="cyan">hAiity</span>              ' + link("https://enrzh.github.io/hAiity/", "enrzh.github.io/hAiity"));
  addLine("                     habits on the iphone. each one a contribution graph.", "dim");
  addLine("                     no server. in testflight.", "dim");
  addLine();
  addHTML('<span class="cyan">mAiity</span>              ' + link("https://github.com/enrzh/mAiity", "github.com/enrzh/mAiity"));
  addLine("                     maps + nav, web and iphone.", "dim");
  addLine("                     apple maps or your own packs. on ice.", "dim");
  addLine();
  addHTML('<span class="cyan">aiity</span>               ' + link("https://github.com/enrzh/aiity", "github.com/enrzh/aiity"));
  addLine("                     iphone chat. agents that build mini-apps in the conversation.", "dim");
  addLine("                     side project. still cooking. not in the store.", "dim");
  addLine();
  addHTML('<span class="cyan">aiity.de</span>            ' + link("https://aiity.de", "aiity.de"));
  addLine("                     the family page. all of the above, in one place.", "dim");
  addLine();
  addLine("self-hosted fleet    a small datacenter pretending to be a NAS.");
  addLine("                     dozens of containers. one power bill.", "dim");
  addLine("agent                an AI with terminal access that runs parts");
  addLine("                     of my life. it restarts things at night.", "dim");
  addLine();
  addLine("[the rest stays off the grid.]", "dark");
}
function cmdSkills() {
  const rows = [
    ["swift / swiftui", 9], ["typescript / react", 9], ["python", 8],
    ["docker / linux", 9], ["networking / proxies", 8], ["llm & agent ops", 9],
    ["spray control", 7],
  ];
  for (const [name, lvl] of rows) {
    addLine(name.padEnd(22) + "█".repeat(lvl) + "░".repeat(10 - lvl));
  }
  addLine();
  addLine("levels self-reported. audit refused.", "dark");
}
function cmdContact() {
  addLine("no public email. the scrapers go hungry.", "dim");
  addLine();
  addHTML("DM instead → " + link("https://x.com/foreseeingx", "x") +
          " · " + link("https://www.linkedin.com/in/xianjie-zhan/", "linkedin") +
          " · " + link("https://instagram.com/enr.zh/", "instagram"));
  addHTML("code       → " + link("https://github.com/enrzh", "github.com/enrzh"));
}
function fmtUptime() {
  const s = Math.floor((Date.now() - bootedAt) / 1000);
  const m = Math.floor(s / 60);
  return (m ? m + "m " : "") + (s % 60) + "s";
}

const FILES = {
  "about.txt": cmdWhoami,
  "socials.txt": cmdSocials,
  "skills.txt": cmdSkills,
  "projects.txt": cmdProjects,
  "identity.txt": () => {
    addHTML("alias:     enrico");
    addHTML("name:      " + redact(12));
    addHTML("location:  " + redact(14));
    addHTML("employer:  " + redact(11));
    addHTML("age:       " + redact(2));
    addHTML("weakness:  " + redact(6) + ' <span class="dim">(no, not that one)</span>');
    addLine();
    addLine("[most fields redacted — operational security]", "dark");
  },
  ".bash_history": () => {
    const lines = [
      "docker compose up -d --build", "sudo systemctl restart everything",
      "git commit -m 'fix'", "git commit -m 'actually fix'",
      "git commit -m 'FINAL fix'", "rm -rf node_modules && npm i",
      "why is the container unhealthy", "ssh nas", "docker logs -f --tail 100",
      "git push --force  # i know what i'm doing", "curl ifconfig.me",
      "sudo !!", "exit",
    ];
    lines.forEach((l, i) => addLine(String(i + 1).padStart(4) + "  " + l, "dim"));
  },
};

/* ---------------- easter eggs ---------------- */
const FORTUNES = [
  "there are 2 hard problems in CS: cache invalidation, naming things, and off-by-one errors.",
  "it works on my machine. ship the machine.",
  "weeks of coding can save you hours of planning.",
  "the S in IoT stands for security.",
  "a good programmer looks both ways before crossing a one-way street.",
  "documentation is a love letter to your future self.",
  "there is no cloud. it's just someone else's computer. mine, in this case.",
  "99 little bugs in the code... 127 little bugs in the code.",
  "premature optimization is the root of all evil. so is prod on friday.",
  "if it hurts, do it more often. except deploying on friday.",
  "backups are a myth until you've restored one.",
  "the best time to set up monitoring was before the outage.",
];

function cowsay(text) {
  const msg = text && text.trim() ? text.trim() : pick(FORTUNES);
  const width = Math.min(46, Math.max(...msg.split(" ").map(w => w.length), 12));
  const words = msg.split(/\s+/); const lines = []; let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > width) { lines.push(cur.trim()); cur = w; }
    else cur += " " + w;
  }
  if (cur.trim()) lines.push(cur.trim());
  const w = Math.max(...lines.map(l => l.length));
  addLine(" " + "_".repeat(w + 2), "nowrap");
  if (lines.length === 1) {
    addLine("< " + lines[0].padEnd(w) + " >", "nowrap");
  } else {
    lines.forEach((l, i) => {
      const [a, b] = i === 0 ? ["/", "\\"] : i === lines.length - 1 ? ["\\", "/"] : ["|", "|"];
      addLine(a + " " + l.padEnd(w) + " " + b, "nowrap");
    });
  }
  addLine(" " + "-".repeat(w + 2), "nowrap");
  addLine("        \\   ^__^", "nowrap");
  addLine("         \\  (oo)\\_______", "nowrap");
  addLine("            (__)\\       )\\/\\", "nowrap");
  addLine("                ||----w |", "nowrap");
  addLine("                ||     ||", "nowrap");
}

async function steamLocomotive() {
  busy = true;
  const train = [
    "      ====        ________                ___________",
    "  _D _|  |_______/        \\__I_I_____===__|_________|",
    "   |(_)---  |   H\\________/ |   |        =|___ ___|  ",
    "   /     |  |   H  |  |     |   |         ||_| |_||  ",
    "  |      |  |   H  |__--------------------| [___] |  ",
    "  | ________|___H__/__|_____/[][]~\\_______|       |  ",
    "  |/ |   |-----------I_____I [][] []  D   |=======|__",
    "__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__",
    " |/-=|___|=   O=====O=====O=====O|_____/~\\___/       ",
    "  \\_/      \\__/  \\__/  \\__/  \\__/      \\_/           ",
  ];
  const holder = train.map(() => addLine("", "nowrap dim"));
  const width = 62;
  for (let off = width; off > -train[0].length; off -= 3) {
    train.forEach((row, i) => {
      holder[i].textContent = off > 0 ? " ".repeat(off) + row : row.slice(-off);
    });
    await sleep(38);
  }
  holder.forEach(h => h.remove());
  addLine("(you typed it wrong. enjoy the train.)", "dark");
  busy = false;
}

function fakeTop() {
  addLine("  PID USER      %CPU  %MEM  COMMAND", "amber");
  const procs = [
    ["  1", "root", "0.0", "0.1", "/sbin/init"],
    ["666", "enrico", "97.3", "42.0", "existential_dread --loop"],
    ["420", "enrico", "12.8", "8.4", "coffee_daemon --refill"],
    ["1337", "root", "88.1", "31.2", "docker (all of them)"],
    ["2048", "enrico", "4.2", "2.1", "one_more_side_project"],
    ["3141", "nobody", "0.1", "0.0", "sleep_schedule [defunct]"],
    ["9001", "enrico", "63.7", "12.5", "cs2 --rank=" + "█".repeat(4)],
    ["  42", "root", "0.0", "0.0", "answer_service"],
  ];
  for (const p of procs) {
    addLine(p[0].padStart(5) + " " + p[1].padEnd(9) + p[2].padStart(5) + " " + p[3].padStart(5) + "  " + p[4]);
  }
  addLine();
  addLine("load average: 3.14, 2.72, 1.41", "dim");
}

async function fakeNmap(target) {
  busy = true;
  const t = (target || "me.aiity.de").slice(0, 40);
  addLine("Starting Nmap 7.99 ( https://nmap.org ) at " + new Date().toISOString().slice(0, 16).replace("T", " "), "dim");
  await sleep(400);
  addLine("Nmap scan report for " + t);
  addLine("Host is up (0.00042s latency).");
  addLine();
  addLine("PORT      STATE    SERVICE      VERSION", "amber");
  const ports = [
    ["22/tcp", "filtered", "ssh", "(you wish)"],
    ["80/tcp", "open", "http", "nginx (redirects, obviously)"],
    ["443/tcp", "open", "ssl/http", "nginx — the only way in"],
    ["1337/tcp", "filtered", "elite", "nice try"],
    ["3306/tcp", "closed", "mysql", "not today"],
    ["31337/tcp", "open", "backdoor?", "it's a honeypot. smile."],
  ];
  for (const p of ports) {
    await sleep(180);
    addLine(p[0].padEnd(10) + p[1].padEnd(9) + p[2].padEnd(13) + p[3]);
  }
  addLine();
  addLine("Nmap done: 1 IP address (1 host up) scanned in 4.04 seconds", "dim");
  addLine("all findings are fictional. this is a static page.", "dark");
  busy = false;
}

async function fakeHack(target) {
  busy = true;
  const t = (target || "the mainframe").slice(0, 40);
  addLine("initiating intrusion sequence against " + t + " ...", "red");
  await sleep(300);
  await progress("bypassing firewall  ", 900);
  await progress("cracking encryption ", 1100);
  await progress("escalating privilege", 800);
  await sleep(200);
  addLine();
  addLine("ACCESS GRANTED", "amber big");
  await sleep(400);
  addLine();
  addLine("...to a static HTML page. there is nothing here.", "dim");
  addLine("you hacked a website that has no backend. congratulations.", "dark");
  busy = false;
}

async function forkBomb() {
  busy = true;
  addLine("fork bomb detected.", "red");
  await sleep(250);
  for (let i = 0; i < 24; i++) {
    addLine("bash: fork: retry: resource temporarily unavailable", "red");
    await sleep(45);
  }
  $("crt").classList.add("shaking");
  await sleep(600);
  $("crt").classList.remove("shaking");
  out.innerHTML = "";
  addLine("kernel: OOM killer engaged. terminal rescued.", "amber");
  addLine("(classic. respect.)", "dim");
  busy = false;
}

async function cmdRmRf() {
  busy = true;
  const victims = ["/bin", "/boot", "/etc", "/home", "/opt", "/root", "/srv", "/usr", "/var", "/identity", "/secrets", "/hopes", "/dreams"];
  for (const v of victims) { addLine("rm: removing " + v + " ...", "red"); await sleep(110); }
  $("crt").classList.add("shaking");
  addLine();
  await typeLine("CRITICAL: filesystem gone. terminal integrity failing.", "red", 6);
  await sleep(900);
  $("crt").classList.remove("shaking");
  out.innerHTML = "";
  await typeLine("restoring from snapshot ...", "amber", 8);
  await sleep(500);
  addLine("filesystem restored. nice try.", "dim");
  addLine();
  busy = false;
}

function fakeGitLog() {
  const commits = [
    ["a1b2c3d", "fix: it works now, unclear why"],
    ["9f8e7d6", "revert 'fix: it works now, unclear why'"],
    ["4c5d6e7", "chore: rename variable to something worse"],
    ["deadbee", "feat: add feature nobody asked for"],
    ["c0ffee1", "fix: 3am hotfix, do not review"],
    ["badc0de", "docs: lie about what this does"],
    ["1337h4x", "initial commit"],
  ];
  for (const [hash, msg] of commits) {
    addHTML('<span class="amber">' + esc(hash) + "</span> " + esc(msg));
  }
  addLine();
  addLine("(7 commits shown. the shameful ones were rebased away.)", "dark");
}

function setTheme(name) {
  const themes = ["green", "amber", "ice", "blood", "mono"];
  if (!name) {
    addLine("themes: " + themes.join("  "), "dim");
    addLine("usage: theme <name>", "dark");
    return;
  }
  const t = String(name).toLowerCase();
  if (!themes.includes(t)) { addLine("theme: unknown phosphor '" + t + "'", "red"); return; }
  if (t === "green") document.body.removeAttribute("data-theme");
  else document.body.setAttribute("data-theme", t);
  addLine("phosphor set to " + t + ".", "dim");
}

function toggleMatrix(force) {
  matrixOn = force !== undefined ? force : !matrixOn;
  $("matrix").style.opacity = matrixOn ? "0.34" : "0";
  addLine(matrixOn ? "wake up, neo. (type 'matrix' again to sleep)" : "back to reality.", "dim");
}

function enableGodmode() {
  if (godmode) return;
  godmode = true;
  document.body.classList.add("godmode");
  addLine();
  addLine("╔══════════════════════════════╗", "amber nowrap");
  addLine("║  KONAMI ACCEPTED — GOD MODE  ║", "amber nowrap");
  addLine("╚══════════════════════════════╝", "amber nowrap");
  addLine("30 lives granted. unfortunately this is not that kind of game.", "dim");
  addLine("but you did unlock: " + "snake", "cyan");
  addLine();
  if (inputrow.hidden === false) cmdline.focus({ preventScroll: true });
}

/* ---------------- snake ---------------- */
function playSnake() {
  const W = 28, H = 14;
  let snake = [[4, 7], [3, 7], [2, 7]];
  let dir = [1, 0], nextDir = [1, 0], score = 0, dead = false;
  let food = [12, 7];
  const board = addLine("", "nowrap");
  const status = addLine("", "dim");
  inputrow.hidden = true;

  const placeFood = () => {
    let f;
    do { f = [Math.floor(Math.random() * W), Math.floor(Math.random() * H)]; }
    while (snake.some(s => s[0] === f[0] && s[1] === f[1]));
    food = f;
  };
  const draw = () => {
    const grid = Array.from({ length: H }, () => Array(W).fill(" "));
    grid[food[1]][food[0]] = "◆";
    snake.forEach(([x, y], i) => { grid[y][x] = i === 0 ? "█" : "▓"; });
    board.textContent =
      "┌" + "─".repeat(W) + "┐\n" +
      grid.map(r => "│" + r.join("") + "│").join("\n") +
      "\n└" + "─".repeat(W) + "┘";
    status.textContent = "score " + score + "   ·   arrows/wasd to steer   ·   q to quit";
    scrollDown();
  };
  const finish = (msg) => {
    clearInterval(timer);
    keyHook = null;
    inputrow.hidden = false;
    status.textContent = msg + "  final score: " + score;
    busy = false;
    cmdline.focus({ preventScroll: true });
  };
  const step = () => {
    if (dead) return;
    dir = nextDir;
    const head = [snake[0][0] + dir[0], snake[0][1] + dir[1]];
    if (head[0] < 0 || head[0] >= W || head[1] < 0 || head[1] >= H ||
        snake.some(s => s[0] === head[0] && s[1] === head[1])) {
      dead = true; draw(); finish("game over."); return;
    }
    snake.unshift(head);
    if (head[0] === food[0] && head[1] === food[1]) { score += 10; placeFood(); }
    else snake.pop();
    draw();
  };

  busy = true;
  keyHook = (e) => {
    const k = e.key.toLowerCase();
    if (k === "q" || k === "escape") { e.preventDefault(); dead = true; finish("aborted."); return; }
    const moves = {
      arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1],
      arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0],
    };
    const m = moves[k];
    if (m) {
      e.preventDefault();
      if (m[0] !== -dir[0] || m[1] !== -dir[1]) nextDir = m;   // no instant reverse
    }
  };
  placeFood(); draw();
  const timer = setInterval(step, 130);
}

/* ---------------- command table ---------------- */
const COMMANDS = {
  help() {
    const rows = [
      ["whoami", "who is this guy"], ["socials", "find me elsewhere"],
      ["projects", "what i build"], ["github", "the source code"],
      ["skills", "the stack"],
      ["gaming", "steam / faceit / cs2"], ["contact", "reach me (no email)"],
      ["ls", "look around"], ["cat FILE", "read a file"],
      ["neofetch", "system info"], ["theme", "change phosphor colour"],
      ["matrix", "follow the white rabbit"], ["clear", "wipe the screen"],
    ];
    addLine("available commands:", "dim");
    for (const [c, d] of rows) addHTML('  <span class="amber">' + esc(c.padEnd(10)) + "</span><span class=\"dim\">" + esc(d) + "</span>");
    addLine();
    addLine("…and quite a few that aren't listed. try the forbidden ones.", "dark");
    addLine("hint: tab completes · arrows recall · there is a game hidden here.", "dark");
  },
  whoami: cmdWhoami,
  socials: cmdSocials, links: cmdSocials, social: cmdSocials,
  github() {
    addHTML("→ " + link("https://github.com/enrzh", "github.com/enrzh"));
    addLine("the public family lives there. one source tree is private — ask.", "dim");
  },
  x() {
    addHTML("me    → " + link("https://x.com/foreseeingx", "@foreseeingx"));
    addHTML("aiity → " + link("https://x.com/aiityapp", "@aiityapp"));
  },
  twitter() { COMMANDS.x(); },
  projects: cmdProjects, work: cmdProjects,
  skills: cmdSkills, stack: cmdSkills,
  gaming: cmdGaming, game: cmdGaming,
  contact: cmdContact,
  neofetch() {
    const info = [
      ["host", "me.aiity.de"], ["user", "enrico"], ["os", "self-built · rolling"],
      ["shell", "zsh (obviously)"], ["theme", "phosphor [CRT]"],
      ["uptime", fmtUptime() + " (this session)"], ["packages", "too many"],
      ["cpu", "caffeine"], ["gpu", redact(10)],
    ];
    const logo = ["  >_   ", "       ", " ready ", "       "];
    addLine();
    for (let i = 0; i < Math.max(logo.length, info.length); i++) {
      const l = logo[i] || "       ";
      if (info[i]) {
        addHTML('<span class="amber">' + esc(l) + "</span><span class=\"cyan\">" +
                esc(info[i][0].padEnd(10)) + "</span>" + info[i][1]);
      } else addHTML('<span class="amber">' + esc(l) + "</span>");
    }
    addLine();
  },
  banner() { addLine(BANNER, "banner"); },
  ls(args) {
    const all = args && (args[0] === "-a" || args[0] === "-la" || args[0] === "-al");
    let s = 'about.txt  socials.txt  skills.txt  projects.txt  <span class="amber">identity.txt</span>  <span class="dark">.secrets/</span>';
    if (all) s += '  <span class="dark">.bash_history</span>  <span class="dark">.ssh/</span>';
    addHTML(s);
    if (all) addLine("(you found the hidden ones. try reading .bash_history)", "dark");
  },
  ll(a) { COMMANDS.ls(["-la"]); },
  dir(a) { COMMANDS.ls(a); },
  cat(args) {
    const f = (args[0] || "").replace(/^\.\//, "");
    if (!f) { addLine("cat: which file? try ls", "dim"); return; }
    if (f.startsWith(".secrets") || f.startsWith(".ssh")) {
      addLine("cat: " + f + ": permission denied", "red");
      addLine("(what did you expect?)", "dark"); return;
    }
    if (FILES[f]) { FILES[f](); return; }
    addLine("cat: " + f + ": no such file", "red");
  },
  history() { history.forEach((h, i) => addLine("  " + String(i + 1).padStart(3) + "  " + h, "dim")); },
  date() { addLine(new Date().toString()); },
  uptime() { addLine("session up " + fmtUptime() + " · operator up since forever"); },
  echo(args) { addLine(args.join(" ")); },
  pwd() { addLine("/home/guest"); },
  theme(args) { setTheme(args[0]); },
  matrix() { toggleMatrix(); },
  clear() { out.innerHTML = ""; }, cls() { out.innerHTML = ""; },

  /* --- easter eggs --- */
  fortune() { addLine(pick(FORTUNES), "cyan"); },
  cowsay(args) { cowsay(args.join(" ")); },
  sl() { return steamLocomotive(); },
  top() { fakeTop(); }, htop() { fakeTop(); },
  ps() { fakeTop(); },
  nmap(args) { return fakeNmap(args[0]); },
  hack(args) { return fakeHack(args.join(" ")); },
  snake() { playSnake(); },
  coffee() {
    addLine("HTTP/1.1 418 I'm a teapot", "amber");
    addLine("the terminal cannot brew coffee. the operator, barely.", "dim");
  },
  brew(a) { COMMANDS.coffee(); },
  xyzzy() { addLine("nothing happens.", "dim"); addLine("(but you clearly know your classics.)", "dark"); },
  "42"() { addLine("the answer to life, the universe, and everything.", "amber"); addLine("the question remains unclear.", "dim"); },
  answer() { COMMANDS["42"](); },
  uname(args) {
    if (args[0] === "-a") addLine("Linux me.aiity.de 6.6.6-hardened #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux");
    else addLine("Linux");
  },
  df() {
    addLine("Filesystem      Size  Used Avail Use% Mounted on", "amber");
    addLine("/dev/reality    100G   99G  1.0G  99% /");
    addLine("/dev/free_time  512M  512M     0 100% /home/enrico");
    addLine("/dev/patience    16G  2.1G   14G  13% /var/support");
    addLine("tmpfs           8.0G  8.0G     0 100% /tmp/side_projects");
  },
  git(args) {
    if (args[0] === "log") { fakeGitLog(); return; }
    if (args[0] === "status") { addLine("On branch main"); addLine("nothing to commit, working tree suspiciously clean", "dim"); return; }
    if (args[0] === "push") { addLine("Everything up-to-date. (this page has no repo access)", "dim"); return; }
    if (args[0] === "blame") { addLine("it was you. it was always you.", "dim"); return; }
    addLine("git: '" + (args[0] || "") + "' is not a git command. see 'git log'.", "dim");
  },
  whois() {
    addLine("Domain:      me.aiity.de");
    addLine("Registrant:  " + "REDACTED FOR PRIVACY");
    addLine("Admin:       " + "REDACTED FOR PRIVACY");
    addLine("Tech:        a very tired human");
    addLine("Status:      clientTransferProhibited (and emotionally unavailable)", "dim");
  },
  traceroute(args) {
    const t = (args[0] || "the void").slice(0, 30);
    addLine("traceroute to " + t + ", 30 hops max");
    [" 1  your_router (192.168.1.1)  1.2 ms",
     " 2  your_isp (10.0.0.1)  8.4 ms",
     " 3  the_internet (*)  22 ms",
     " 4  * * *",
     " 5  somewhere_in_germany  31 ms",
     " 6  a_nas_in_a_cupboard  0.4 ms",
     " 7  " + t + "  reached. that's it. that's the whole trip."].forEach(l => addLine(l));
  },
  ping(args) {
    const t = (args[0] || "me.aiity.de").slice(0, 30);
    addLine("PING " + t + " — 64 bytes, time=0.003ms");
    addLine("pong. we are very close.", "dim");
  },
  apt(args) { COMMANDS.__pkg("apt", args); },
  pacman(args) { COMMANDS.__pkg("pacman", args); },
  npm(args) { COMMANDS.__pkg("npm", args); },
  __pkg(mgr, args) {
    if ((args[0] || "").match(/install|-S|i/)) {
      addLine(mgr + ": installing " + (args.slice(1).join(" ") || "something") + " ...", "dim");
      addLine("E: could not open lock file — you are not root, and never will be.", "red");
    } else addLine(mgr + ": read-only system. nothing to do.", "dim");
  },
  chmod(args) {
    if (args.join(" ").includes("777")) {
      addLine("chmod: 777? on a public web server?", "red");
      addLine("we don't do that here.", "dim");
    } else addLine("chmod: everything here is already exactly as permissive as it should be.", "dim");
  },
  sudo(args) {
    const a = args.join(" ");
    if (a.startsWith("rm")) return cmdRmRf();
    if (a === "su" || a.startsWith("su ") || a === "-i") {
      addLine("Password: " + "*".repeat(12), "dim");
      addLine("Sorry, try again.", "red"); addLine("Sorry, try again.", "red");
      addLine("sudo: 3 incorrect password attempts", "red"); return;
    }
    addLine("guest is not in the sudoers file.", "red");
    addLine("this incident will be reported. ✓ reported. that was fast.", "dim");
  },
  su() { COMMANDS.sudo(["su"]); },
  rm(args) {
    const a = args.join(" ");
    if (a.includes("-rf") || a.includes("-fr")) return cmdRmRf();
    addLine("rm: nothing here belongs to you.", "dim");
  },
  vim() { addLine("you may never leave. (thankfully this isn't vim.)", "dim"); },
  nano() { addLine("real ones use ed.", "dim"); },
  emacs() { addLine("a great operating system, lacking only a decent editor.", "dim"); },
  ed() { addLine("?", "dim"); },
  man(args) { addLine("no manual entry for " + (args[0] || "that") + ". figure it out — tradition.", "dim"); },
  ssh() { addLine("ssh: connect to host: Connection refused", "red"); addLine("this terminal only goes one way.", "dim"); },
  telnet() { addLine("try: telnet towel.blinkenlights.nl (not here, though — no sockets in a static page)", "dim"); },
  curl(args) { addLine("curl: (7) Failed to connect — this page makes no outbound requests. by design.", "dim"); },
  wget(a) { COMMANDS.curl(a); },
  exit() { addLine("you can check out any time you like...", "dim"); addLine("but you can never leave.", "amber"); },
  quit() { COMMANDS.exit(); }, logout() { COMMANDS.exit(); },
  hello() { addLine("hello, friend.", "amber"); }, hi() { COMMANDS.hello(); },
  credits() {
    addLine("me.aiity.de", "amber");
    addLine("built by enrico (with an AI that had terminal access)", "dim");
    addLine("static html · no tracking · no cookies · no backend", "dim");
    addLine("your data stays yours. there is nowhere for it to go.", "dark");
  },
  konami() { addLine("you have to actually press it. ↑↑↓↓←→←→ B A", "dim"); },
};

/* ---------------- input loop ---------------- */
async function run(raw) {
  const input = String(raw).trim();
  addHTML('<span class="prompt"><span class="u">guest</span>@<span class="h">me.aiity.de</span>:~$ </span>' + esc(input));
  if (!input) return;
  if (history[history.length - 1] !== input) history.push(input);
  histIdx = history.length;

  if (input.replace(/\s+/g, "") === ":(){:|:&};:") return forkBomb();

  const parts = input.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);
  const fn = Object.prototype.hasOwnProperty.call(COMMANDS, cmd) && cmd !== "__pkg" ? COMMANDS[cmd] : null;
  if (typeof fn === "function") {
    try { await fn(args); }
    catch (err) { addLine("segmentation fault (core dumped)", "red"); }
  } else {
    addLine("command not found: " + cmd, "red");
    addLine("type 'help' — no one guesses their way in.", "dim");
  }
  addLine();
}

const KONAMI = ["arrowup","arrowup","arrowdown","arrowdown","arrowleft","arrowright","arrowleft","arrowright","b","a"];
let konamiIdx = 0;
document.addEventListener("keydown", (e) => {
  const k = (e.key || "").toLowerCase();
  konamiIdx = (k === KONAMI[konamiIdx]) ? konamiIdx + 1 : (k === KONAMI[0] ? 1 : 0);
  if (konamiIdx === KONAMI.length) { konamiIdx = 0; enableGodmode(); }
  if (keyHook) keyHook(e);
}, true);

cmdline.addEventListener("keydown", async (e) => {
  if (busy) { e.preventDefault(); return; }
  if (e.key === "Enter") {
    const v = cmdline.value;
    cmdline.value = ""; echoEl.textContent = "";
    await run(v); scrollDown();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (histIdx > 0) { histIdx--; cmdline.value = history[histIdx] || ""; echoEl.textContent = cmdline.value; }
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    if (histIdx < history.length) { histIdx++; cmdline.value = history[histIdx] || ""; echoEl.textContent = cmdline.value; }
  } else if (e.key === "Tab") {
    e.preventDefault();
    const v = cmdline.value.toLowerCase();
    if (!v) return;
    const matches = Object.keys(COMMANDS).filter(c => c.startsWith(v) && c !== "__pkg");
    if (matches.length === 1) cmdline.value = matches[0] + " ";
    else if (matches.length > 1) { addLine(matches.join("  "), "dim"); addLine(); }
    echoEl.textContent = cmdline.value;
  } else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); out.innerHTML = ""; }
});
cmdline.addEventListener("input", () => { echoEl.textContent = cmdline.value; });
document.addEventListener("click", (e) => {
  if (e.target.closest("a") || e.target.closest(".chip") || busy) return;
  cmdline.focus({ preventScroll: true });
});

const CHIP_CMDS = ["help", "whoami", "socials", "projects", "skills", "gaming", "contact", "neofetch", "snake", "matrix"];
for (const c of CHIP_CMDS) {
  const b = document.createElement("button");
  b.className = "chip"; b.type = "button"; b.textContent = c;
  b.addEventListener("click", async () => { if (busy) return; await run(c); scrollDown(); });
  chips.appendChild(b);
}

/* ---------------- matrix rain ---------------- */
(function initMatrix() {
  const cv = $("matrix"), ctx = cv.getContext("2d");
  let cols = []; const fontSize = 14;
  function resize() {
    cv.width = innerWidth; cv.height = innerHeight;
    cols = Array(Math.ceil(innerWidth / fontSize)).fill(0).map(() => Math.random() * -50);
  }
  resize(); addEventListener("resize", resize);
  const glyphs = "アカサタナハマヤ01XZ<>/#$";
  setInterval(() => {
    if (!matrixOn && cv.style.opacity === "0") return;
    ctx.fillStyle = "rgba(5,8,5,0.08)";
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue("--fg").trim() || "#33ff66";
    ctx.font = fontSize + "px monospace";
    cols.forEach((y, i) => {
      ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], i * fontSize, y * fontSize);
      cols[i] = y * fontSize > cv.height && Math.random() > 0.975 ? 0 : y + 1;
    });
  }, 55);
})();

/* ---------------- boot ---------------- */
const BOOT = [
  ["initializing display driver ... ok", "dim", 120],
  ["mounting /identity ... partial (some volumes encrypted)", "dim", 200],
  ["loading personality module ... ok", "dim", 160],
  ["starting session for guest@me.aiity.de", "dim", 240],
];
(async function boot() {
  busy = true;
  if (!reduceMotion) {
    for (const [t, c, d] of BOOT) { addLine(t, c); await sleep(d); }
    await sleep(150);
  }
  addLine(BANNER, "banner");
  addLine();
  await typeLine("terminal access granted. unauthorized snooping will be logged*", "", 3);
  addLine("  *and mildly appreciated", "dark");
  addLine();
  addHTML('type <span class="amber">help</span> to begin.');
  addLine();
  inputrow.hidden = false; chips.hidden = false; busy = false;
  cmdline.focus({ preventScroll: true });
})();
