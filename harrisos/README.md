# HarrisOS — Democrat Edition

*WHEN WE FIGHT, WE WIN* 🇺🇸

**HarrisOS** is a political edition of **AcreetionOS** — the lightweight,
Arch-based Linux distribution built by the AcreetionOS community. Same
rock-solid base, same Calamares installer, same speed on low-end
hardware — wrapped in the colors, slogans, and spirit of the Democrat
movement, named for Kamala Harris.

> Built as an *unofficial variant* of AcreetionOS using its native
> variant system (profiledef override + package overrides + airootfs
> overlay). All credit for the machinery goes to the
> [AcreetionOS project](https://acreetionos.org).

## The figure

Kamala Harris is the 49th Vice President of the United States and the
2024 Democratic nominee for President. HarrisOS channels the fight-forward
spirit: progress, inclusion, and a future nobody has to go back to.

## The platform

1. **Forward, Not Back** — rolling releases, always moving.
2. **Freedom for Every User** — accessibility on by default.
3. **We Fight for the Middle Class — of Packages** — software for everyone.
4. **No User Left Behind** — docs, tutorials, and support for all.
5. **Hope, Progress, and Open Source** — a future worth booting into.

## Features

- **WHEN WE FIGHT, WE WIN** — branded boot, GRUB theme, wallpaper, and terminal motd
- Lightweight Arch LTS base (inherited from AcreetionOS)
- User-friendly Calamares installation
- Performance-optimized for low-end hardware
- Full open source — fork it, run it, own it

## Build it

Requirements: an Arch Linux machine (or container) with
`archiso`, and either the local AcreetionOS mirror or the upstream repo.

```bash
# 1. grab upstream AcreetionOS once
git clone https://github.com/spivanatalie64/acreetionos

# 2. build this edition (auto-injects as an unofficial variant)
ACREETIONOS_DIR=/path/to/acreetionos ./build.sh
# or: BUILD_FROM_SCRATCH=1 ./build.sh

# 3. ISO lands in acreetionos/out/
```

## Flashing

Write the ISO to USB with [AcreetionOS Media Writer]
(https://github.com/spivanatalie64/AcreetionMediaWriter), Etcher, Rufus,
or Ventoy (Ventoy MUST use GRUB MODE 2).

## License & credits

- HarrisOS branding and slogans: parody/commentary, © the Democrat campaign
  figure's public persona used in satire — no affiliation implied.
- OS machinery: [AcreetionOS](https://acreetionos.org), GPL-3.0-or-later.
- Arch Linux base: Arch Linux, GPL — [terms](https://terms.archlinux.org).
