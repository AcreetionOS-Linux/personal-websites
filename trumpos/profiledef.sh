#!/usr/bin/env bash
# shellcheck disable=SC2034
# TrumpOS variant profile — derived from AcreetionOS base profiledef.sh
# (only overrides the identity fields; the base provides the machinery)

iso_name="TrumpOS"
iso_label="trumpos_$(date --date="@${SOURCE_DATE_EPOCH:-$(date +%s)}" +%Y%m)"
iso_publisher="TrumpOS Project · Republican Edition — built on AcreetionOS"
iso_application="TrumpOS Install Media — MAKE LINUX GREAT AGAIN"
iso_version="1.0.0"
install_dir="arch"
buildmodes=('iso')
bootmodes=('bios.syslinux' 'uefi.grub')
arch="x86_64"
pacman_conf="pacman.conf"
airootfs_image_type="squashfs"
airootfs_image_tool_options=('-comp' 'xz' '-Xbcj' 'x86' '-b' '1M' '-Xdict-size' '1M')
bootstrap_tarball_compression=('zstd' '-c' '-T0' '--auto-threads=logical' '--long' '-19')
file_permissions=(
  ["/etc/shadow"]="0:0:400"
  ["/etc/gshadow"]="0:0:400"
  ["/root"]="0:0:750"
  ["/root/customize_airootfs.sh"]="0:0:755"
  ["/root/.automated_script.sh"]="0:0:755"
  ["/root/.gnupg"]="0:0:700"
  ["/usr/local/bin/choose-mirror"]="0:0:755"
  ["/usr/local/bin/Installation_guide"]="0:0:755"
  ["/usr/local/bin/livecd-sound"]="0:0:755"
  ["/usr/bin/calamares"]="0:0:755"
  ["/root/cinstall"]="0:0:755"
  ["/root/cinstall2"]="0:0:755"
  ["/root/zone"]="0:0:755"
  ["/usr/bin/fixkeys.sh"]="0:0:755"
  ["/usr/bin/dd.sh"]="0:0:755"
  ["/usr/local/bin/postinstall.sh"]="0:0:755"
  ["/usr/bin/calamares.sh"]="0:0:755"
  ["/usr/local/bin/preinstall"]="0:0:755"
  ["/usr/local/bin/stormos-final"]="0:0:755"
  ["/usr/bin/wifi-connection"]="0:0:755"
  ["/usr/local/bin/setup-displays.sh"]="0:0:755"
)
