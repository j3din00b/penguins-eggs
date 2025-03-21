#!/usr/bin/env bash

set -x
export CMD_PATH=$(cd `dirname $0`; pwd)
export PROJECT_NAME="${CMD_PATH##*/}"
echo $PROJECT_NAME
export NEEDRESTART_MODE=a


####################################################################################################################################
# 1 check
cd $CMD_PATH
env
pwd
whoami

####################################################################################################################################
# 2 hostname
echo -e "$(hostname)\n" > /etc/hostname

# 2.1 hosts
echo -e "\
127.0.0.1  localhost
::1        localhost ip6-localhost ip6-loopback
ff02::1    ip6-allnodes
ff02::2    ip6-allrouters
# This host address
127.0.1.1   $(hostname)" > /etc/hosts

####################################################################################################################################
# penguins-eggs mininal requisites for debian bookworm

cd $CMD_PATH
pacman -Syu --noconfirm

# packages to be added for a minimum standard installation

# We must install the same version of the host
pacman -S  --noconfirm linux

# packages minimal
source ./minimal/archlinux-packages.sh

# packages to be added tarballs
source ./minimal/archlinux-tarballs-requirements.sh

# starting with eggs
cd /ci/

# install tarball
EGGS_HOME="/opt/penguins-eggs/"
EGGS_PACKAGE=eggs-v10.0.60-*-linux-x64.tar.gz

# Rimozione di /opt/penguins-eggs se esiste
if [ -d "$EGGS_HOME" ]; then
    rm -rf "$EGGS_HOME"
fi

# extract package
tar -xf $EGGS_PACKAGE
if [ $? -ne 0 ]; then
    echo "Error: not possible extract $EGGS_PACKAGE."
    exit 1
fi

mv eggs penguins-eggs
$SUDO mv penguins-eggs /opt/

# create link themes  grub/isolinux
ln -sf "${EGGS_HOME}addons/eggs/theme/livecd/isolinux.main.full.cfg" "${EGGS_HOME}addons/eggs/theme/livecd/isolinux.main.cfg"
ln -sf "${EGGS_HOME}addons/eggs/theme/livecd/grub.main.full.cfg" "${EGGS_HOME}addons/eggs/theme/livecd/grub.main.cfg"

# Bash completions
if [ -d "/usr/share/bash-completion/completions/" ]; then
    rm -f /usr/share/bash-completion/completions/eggs.bash
    ln -sf "${EGGS_HOME}scripts/eggs.bash" /usr/share/bash-completion/completions/eggs.bash
fi

# Zsh completions
if [ -d "/usr/share/zsh/functions/Completion/Zsh/" ]; then
    rm -f /usr/share/zsh/functions/Completion/Zsh/_eggs
    ln -sf "${EGGS_HOME}scripts/_eggs" /usr/share/zsh/functions/Completion/Zsh/
fi

# Icons
if [ -d "/usr/share/icons/" ]; then
    rm -f /usr/share/icons/eggs.png
    ln -sf "${EGGS_HOME}assets/eggs.png" /usr/share/icons/eggs.png
fi

# Manual
if [ -d "/usr/share/man/man1" ]; then
    rm -f /usr/share/man/man1/eggs.1.gz
    ln -sf "${EGGS_HOME}manpages/doc/man/eggs.1.gz" /usr/share/man/man1/eggs.1.gz
fi

# Link binary
rm -f /usr/bin/eggs
ln -sf "${EGGS_HOME}bin/eggs" /usr/bin/eggs

# eggs was installed!

eggs dad -d
eggs tools clean -n
eggs produce --pendrive -n # --verbose

# clean tarballs on /ci
rm /ci/$EGGS_PACKAGE

date

echo "# enable bash_completion, running:"
echo "source /etc/bash_completion"
