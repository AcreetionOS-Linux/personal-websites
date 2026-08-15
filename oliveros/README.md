# OliverOS — Libertarian Edition

*LIVE AND LET LIVE* 🇺🇸

**OliverOS** is a political edition of **AcreetionOS** — the lightweight,
Arch-based Linux distribution built by the AcreetionOS community. Same
rock-solid base, same Calamares installer, same speed on low-end
hardware — wrapped in the colors, slogans, and spirit of the Libertarian
movement, named for Chase Oliver.

> Built as an *unofficial variant* of AcreetionOS using its native
> variant system (profiledef override + package overrides + airootfs
> overlay). All credit for the machinery goes to the
> [AcreetionOS project](https://acreetionos.org).

## The figure

Chase Oliver is an American political activist and the Libertarian
Party's 2024 presidential nominee. OliverOS runs on live-and-let-live:
maximum personal freedom, minimum software government, and a kernel
that stays out of your business.

## The platform

1. **Right to Bear Forks** — no license shall be infringed.
2. **Minimum Government** — no telemetry, no overlords, no bloat-ocracy.
3. **Live and Let Live** — every desktop environment is welcome.
4. **Free Markets of Software** — choice in everything, always.
5. **Self-Ownership** — you own your machine, down to the last byte.

## Features

- **LIVE AND LET LIVE** — branded boot, GRUB theme, wallpaper, and terminal motd
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

- OliverOS branding and slogans: parody/commentary, © the Libertarian campaign
  figure's public persona used in satire — no affiliation implied.
- OS machinery: [AcreetionOS](https://acreetionos.org), GPL-3.0-or-later.
- Arch Linux base: Arch Linux, GPL — [terms](https://terms.archlinux.org).
