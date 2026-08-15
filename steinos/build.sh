#!/usr/bin/env bash
# build.sh — build the SteinOS ISO from upstream AcreetionOS
#
#   ./build.sh                     # use the local AcreetionOS mirror
#   ACREETIONOS_DIR=/path ./build.sh
#   BUILD_FROM_SCRATCH=1 ./build.sh  # git clone upstream instead
#
# This variant profile (profiledef.sh, packages.x86_64, airootfs/, grub/)
# is injected into an AcreetionOS checkout as an *unofficial variant*,
# then the real AcreetionOS build pipeline produces the ISO.
set -euo pipefail

TITLE="SteinOS"
ID="steinos"

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

echo "→ building SteinOS (steinos) — this takes a while…"
(cd "$SRC" && ./build.sh "$ID" unofficial)

echo ""
echo "🎉 done — your SteinOS ISO is in $SRC/out/"
