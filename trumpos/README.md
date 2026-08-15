# TrumpOS — Republican Edition

*MAKE LINUX GREAT AGAIN* 🇺🇸

**TrumpOS** is a political edition of **AcreetionOS** — the lightweight,
Arch-based Linux distribution built by the AcreetionOS community. Same
rock-solid base, same Calamares installer, same speed on low-end
hardware — wrapped in the colors, slogans, and spirit of the Republican
movement, named for Donald J. Trump.

> Built as an *unofficial variant* of AcreetionOS using its native
> variant system (profiledef override + package overrides + airootfs
> overlay). All credit for the machinery goes to the
> [AcreetionOS project](https://acreetionos.org).

## The figure

Donald J. Trump is the 45th and 47th President of the United States
and the leader of the MAGA movement. TrumpOS carries that energy into the
kernel: America-first, build-it-ourselves, drain-the-swamp —
for the open source faithful.

## The platform

1. **Build the Kernel Wall** — one commit at a time, stop the bloat.
2. **Drain the systemd Swamp** — init freedom, no PID 1 monarchy.
3. **Make Secure Boot Great Again** — sign your own keys, own your hardware.
4. **America-First Boot Order** — boots so fast, you get tired of winning.
5. **Git Push Liberty** — free speech means free software.
6. **We Don't Negotiate With Malware** — find it, patch it, win.
7. **Right to Bear Forks** — every distro keeps and bears its own repos.

## Features

- **MAKE LINUX GREAT AGAIN** — branded boot, GRUB theme, wallpaper, and terminal motd
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

- TrumpOS branding and slogans: parody/commentary, © the Republican campaign
  figure's public persona used in satire — no affiliation implied.
- OS machinery: [AcreetionOS](https://acreetionos.org), GPL-3.0-or-later.
- Arch Linux base: Arch Linux, GPL — [terms](https://terms.archlinux.org).
