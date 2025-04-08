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

# packages minimal
source ./minimal/manjaro-container2host.sh


# test mount -t overlay
source ./kernel-overlay-install.sh

# installing eggs
source ./penguins-eggs-install.sh

# systemd
systemctl set-default multi-user.target
systemctl enable getty@tty1.service

# shasum fix
ln -s /usr/bin/core_perl/shasum /usr/bin/shasum

# THIS DISTRO ONLY
# START
############################################################
# enable sudo for wheel group
sed -i 's/# %wheel ALL=(ALL) ALL/%wheel ALL=(ALL) ALL/g' /etc/sudoers
############################################################
# END

# execute eggs
source ./penguins-eggs-execute.sh
