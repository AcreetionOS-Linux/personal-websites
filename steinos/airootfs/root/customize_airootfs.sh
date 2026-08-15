#!/usr/bin/env bash
# SteinOS customize_airootfs.sh — Green Edition
# Base behavior (regenerate initramfs; the mkinitcpio post-transaction hook
# segfaults in the pacstrap chroot) plus a fix: the custom AcreetionOS
# kernel preset references the r8125 module (Realtek 2.5G NIC, DKMS-only)
# which the stock kernel does not provide — mkinitcpio hard-aborts on it.
set -e -u

# a post-transaction pacman hook appends r8125 (Realtek 2.5G, DKMS-only)
# to the archiso.conf drop-in + kernel preset — mkinitcpio hard-aborts on
# the missing module, so strip it from both before regenerating the initramfs
sed -i 's/r8125//g' /etc/mkinitcpio.conf.d/archiso.conf 2>/dev/null || true
sed -i 's/r8125//g' /etc/mkinitcpio.d/linux.preset 2>/dev/null || true

mkinitcpio -p linux
