# SteinOS — Green Edition

*PEOPLE · PLANET · PEACE* 🇺🇸

**SteinOS** is a political edition of **AcreetionOS** — the lightweight,
Arch-based Linux distribution built by the AcreetionOS community. Same
rock-solid base, same Calamares installer, same speed on low-end
hardware — wrapped in the colors, slogans, and spirit of the Green
movement, named for Dr. Jill Stein.

> Built as an *unofficial variant* of AcreetionOS using its native
> variant system (profiledef override + package overrides + airootfs
> overlay). All credit for the machinery goes to the
> [AcreetionOS project](https://acreetionos.org).

## The figure

Dr. Jill Stein is a physician, environmental activist, and the Green
Party's presidential nominee. SteinOS brings the Green New Deal to the
desktop: sustainability, democracy, and peace — one kernel at a time.

## The platform

1. **Green Computing** — low-power defaults, energy-efficient kernels.
2. **The Planet First** — repair rights, less e-waste, sustainable builds.
3. **Peace in the Repos** — community-owned, not corporate-captured.
4. **Healthy People** — screen-time that respects you.
5. **Open, Democratic, Free Software** — the Green New Deal for the desktop.

## Features

- **PEOPLE · PLANET · PEACE** — branded boot, GRUB theme, wallpaper, and terminal motd
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

- SteinOS branding and slogans: parody/commentary, © the Green campaign
  figure's public persona used in satire — no affiliation implied.
- OS machinery: [AcreetionOS](https://acreetionos.org), GPL-3.0-or-later.
- Arch Linux base: Arch Linux, GPL — [terms](https://terms.archlinux.org).
