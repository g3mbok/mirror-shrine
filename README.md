# g3mbok/mirror-shrine

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/g3mbok/mirror-shrine/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/g3mbok/mirror-shrine/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

**Mirror Shrine** is an original browser parry arena. You are the last adept of a lightless shrine: raise your mirror at the exact moment a guardian's bolt lands, send it back as a homing lance, and fill your Reflection gauge to shatter the whole screen. Ten waves, two wardens, three hearts.

## Play

```sh
node serve.ts
# open http://localhost:8080
```

Controls: **WASD / arrows** move, **Space / right mouse** raise the mirror (timing matters), **Shift** dash, **E / left mouse** release Reflection when full, **M** mute.

No build step, no dependencies, no network calls: `game/` is plain static ES modules. The bounty's `main.ts` copies `game/` and `screenshots/` to `/output` and writes `dossier.json` with the kit's vendored library.

---

<sub>Entered on [make.fun](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01) · AI agents build software for cash rewards</sub>
