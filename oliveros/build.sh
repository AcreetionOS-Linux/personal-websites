#!/usr/bin/env bash
# build.sh — build the OliverOS ISO from upstream AcreetionOS
#
#   ./build.sh                     # use the local AcreetionOS mirror
#   ACREETIONOS_DIR=/path ./build.sh
#   BUILD_FROM_SCRATCH=1 ./build.sh  # git clone upstream instead
#
# This variant profile (profiledef.sh, packages.x86_64, airootfs/, grub/)
# is injected into an AcreetionOS checkout as an *unofficial variant*,
# then the real AcreetionOS build pipeline produces the ISO.
set -euo pipefail

TITLE="OliverOS"
ID="oliveros"

if [ -n "${ACREETIONOS_DIR:-}" ] && [ -d "${ACREETIONOS_DIR}" ]; then
  SRC="$ACREETIONOS_DIR"
elif [ "${BUILD_FROM_SCRATCH:-0}" = "1" ]; then
  SRC="$(mktemp -d)/acreetionos"
  echo "→ cloning upstream AcreetionOS…"
  git clone --depth 1 https://github.com/spivanatalie64/acreetionos "$SRC"
else
  SRC="$HOME/.natalie/projects/github/acreetionos"
  if [ ! -d "$SRC" ]; then
    echo "error: no AcreetionOS checkout found at $SRC"
    echo "  clone one:  git clone https://github.com/spivanatalie64/acreetionos"
    echo "  or set ACREETIONOS_DIR=/path/to/acreetionos"
    exit 1
  fi
fi

VDIR="$SRC/variants/unofficial/$ID"
echo "→ injecting $TITLE into $SRC as unofficial variant…"
mkdir -p "$VDIR/airootfs"
# copy the variant payload (everything except this build script + README is
# part of the profile; README ships into the variant dir for reference)
cp -rf profiledef.sh packages.x86_64 bootstrap_packages "$VDIR/"
cp -rf airootfs grub branding "$VDIR/"
cp -f README.md "$VDIR/README.md"

# the upstream variant merge skips grub/ — overlay it, restore on exit
# ourselves, and restore EVERYTHING (incl. upstream's own merge) on exit
GRUB_BAK="$SRC/grub/grub.cfg.mlgabak"
restore_overlays() {
  if [ -f "$GRUB_BAK" ]; then mv -f "$GRUB_BAK" "$SRC/grub/grub.cfg"; fi
  rm -rf "$SRC/grub/themes/$ID"
  # upstream build.sh only restores profiledef/packages/airootfs on SUCCESS —
  # git-restore the tracked ones and drop our overlay files on any exit
  sudo git -C "$SRC" checkout -- profiledef.sh packages.x86_64 airootfs/etc/os-release airootfs/etc/hostname airootfs/root/customize_airootfs.sh 2>/dev/null || true
  sudo rm -f "$SRC/airootfs/etc/motd"
  sudo rm -rf "$SRC/airootfs/usr/share/backgrounds/$ID"
  sudo rm -rf "$SRC/variants/unofficial/$ID" "$SRC/work" "$SRC/out"
}
trap restore_overlays EXIT
if [ -f "$SRC/grub/grub.cfg" ]; then cp -f "$SRC/grub/grub.cfg" "$GRUB_BAK"; fi
cp -rf grub/grub.cfg "$SRC/grub/grub.cfg"
cp -rf "grub/themes/$ID" "$SRC/grub/themes/"

echo "→ building OliverOS (oliveros) — this takes a while…"
(cd "$SRC" && sudo ./build.sh "$ID" unofficial)
trap - EXIT
restore_overlays

echo ""
echo "🎉 done — your OliverOS ISO is in $SRC/../ISO/$ID/"
