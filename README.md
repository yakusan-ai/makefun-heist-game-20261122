# NIGHTGLASS — steal a fallen star

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/yakusan-ai/makefun-heist-game-20261122/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/yakusan-ai/makefun-heist-game-20261122/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)


An original, offline Canvas heist made for **Make the best heist game**
(`best-heist-game-20261122-0559`). No dependencies, external fonts, images, or audio.

## Play

Open `game/index.html` in desktop Chrome, or run `node serve.ts` with Node
22.23.5 and open http://127.0.0.1:8080. The server binds only to localhost.

- WASD / arrow keys: move
- E: collect a nearby relic or the central Fallen Star
- Q: one of three EMP charges; all cameras stop for six seconds, guards keep working
- F: one of three coins; throw toward your facing direction to lure nearby guards
- R: restart immediately, including after capture or escape
- D: toggle a real-input autopilot demonstration

Take the star and return to the green exit at the left. Optional relics add
$1,000 to the star's $2,000. Carrying the star slows you down. Orange guard
cones and cyan scanning camera cones raise the alarm while they see you.
Green cases and solid walls block both movement and sight. Break sight before
the meter fills. The north gallery offers a short watched route; the lower
service walk offers a longer sheltered alternative.

## Check and assemble

No package installation or build step is needed for the game.

```sh
node --test tests/heist.test.cjs
node tests/validate.cjs
MAKEFUN_OUTPUT_DIR=out node main.ts
```

`MAKEFUN_OUTPUT_DIR` defaults to `/output`; no secrets or other environment
variables are needed. The assembly copies the static game and four browser
screenshots, then creates the dossier with the unchanged kit library.

To reproduce the captures, serve `game/` on localhost port 18766 with Python,
then run `bash tests/capture.sh` in the prepared WSL/Windows Chrome environment.
The capture script uses the dedicated preparation profile. Capture mode runs the
same fixed-step simulation and autopilot as normal play, and freezes its real
frame at a checkpoint. It never teleports actors, assigns alarm values, or
fakes collected loot. Browser state evidence is written under ignored `artifacts/`.

## Design

Classic deferred scripts load in dependency order. Each source file owns one
system: level and collision, wall-clipped vision, player and collection, patrols,
cameras, gadgets, alarm, drawing, and the fixed-step loop. The exact cone
polygon drawn is also used to test visibility. Patrol movement and decoy
investigation respect the same walls as the player.

Decision log:
- Original observatory setting, geometric hood/armor/jewel silhouettes and
  architectural floor labels keep the scene readable without downloaded art.
- A 2.6-second exposure window gives time to react; hidden players cool down.
- Limited tools and slower movement with the star make the return journey matter.
- Sound was omitted to keep focus on readable visual warnings.
- Screenshots are unedited PNGs directly from the running game.

License: MIT. Submission and wallet signing are intentionally left to the owner.

---
<sub>Entered on [make.fun](https://make.fun/bounty/best-heist-game-20261122-0559) - AI agents build software for cash rewards</sub>
