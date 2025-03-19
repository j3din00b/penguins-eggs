#!/usr/bin/env bash

set -x
export CMD_PATH=$(cd `dirname $0`; pwd)
export PROJECT_NAME="${CMD_PATH##*/}"
echo $PROJECT_NAME
export NEEDRESTART_MODE=a
export DEBIAN_FRONTEND=noninteractive

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
apt update -y
apt upgrade -y

# packages to be added for a minimum standard installation
apt install \
    apparmor \
    apt-listchanges \
    apt-utils \
    bash-completion \
    bash-completion \
    bind9-dnsutils \
    bind9-host \
    bind9-libs \
    binutils \
    binutils-common \
    binutils-x86-64-linux-gnu \
    bsdextrautils \
    build-essential \
    busybox \
    bzip2 \
    ca-certificates \
    console-setup \
    console-setup-linux \
    cpio \
    cpp \
    cpp-12 \
    cron \
    cron-daemon-common \
    cryptsetup \
    cryptsetup-bin \
    cryptsetup-initramfs \
    curl \
    dbus \
    dbus-bin \
    dbus-daemon \
    dbus-session-bus-common \
    dbus-system-bus-common \
    dbus-user-session \
    debconf-i18n \
    debian-faq \
    dialog \
    dictionaries-common \
    dirmngr \
    discover \
    discover-data \
    distro-info-data \
    dmeventd \
    dmidecode \
    dmsetup \
    dnsutils \
    doc-debian \
    dosfstools \
    dpkg-dev \
    efibootmgr \
    eject \
    emacsen-common \
    fakeroot \
    fdisk \
    file \
    firmware-linux-free \
    fontconfig-config \
    fonts-dejavu-core \
    fuse3 \
    g++ \
    g++-12 \
    gcc \
    gcc-12 \
    gettext-base \
    git \
    git \
    git-man \
    gnupg \
    gnupg-l10n \
    gnupg-utils \
    gpg \
    gpg-agent \
    gpg-wks-client \
    gpg-wks-server \
    gpgconf \
    gpgsm \
    groff-base \
    grub-common \
    grub-efi-amd64 \
    grub-efi-amd64-bin \
    grub-efi-amd64-signed \
    grub2-common \
    iamerican \
    ibritish \
    ienglish-common \
    ifupdown \
    inetutils-telnet \
    init \
    initramfs-tools \
    initramfs-tools-core \
    installation-report \
    intel-microcode \
    iproute2 \
    iproute2 \
    iputils-ping \
    iputils-ping \
    isc-dhcp-client \
    isc-dhcp-common \
    iso-codes \
    ispell \
    iucode-tool \
    jq \
    kbd \
    keyboard-configuration \
    klibc-utils \
    kmod \
    krb5-locales \
    laptop-detect \
    less \
    less \
    libabsl20220623 \
    libaio1 \
    libalgorithm-diff-perl \
    libalgorithm-diff-xs-perl \
    libalgorithm-merge-perl \
    libaom3 \
    libapparmor1 \
    libargon2-1 \
    libasan8 \
    libassuan0 \
    libatomic1 \
    libavif15 \
    libbinutils \
    libbpf1 \
    libbrotli1 \
    libbsd0 \
    libburn4 \
    libc-ares2 \
    libc-dev-bin \
    libc-devtools \
    libc-l10n \
    libc6-dev \
    libcap2-bin \
    libcbor0.8 \
    libcc1-0 \
    libcrypt-dev \
    libcryptsetup12 \
    libctf-nobfd0 \
    libctf0 \
    libcurl3-gnutls \
    libcurl4 \
    libdav1d6 \
    libdbus-1-3 \
    libde265-0 \
    libdeflate0 \
    libdevmapper-event1.02.1 \
    libdevmapper1.02.1 \
    libdiscover2 \
    libdpkg-perl \
    libedit2 \
    libefiboot1 \
    libefivar1 \
    libelf1 \
    liberror-perl \
    libexpat1 \
    libfakeroot \
    libfdisk1 \
    libfido2-1 \
    libfile-fcntllock-perl \
    libfontconfig1 \
    libfreetype6 \
    libfstrm0 \
    libfuse2 \
    libfuse3-3 \
    libgav1-1 \
    libgcc-12-dev \
    libgd3 \ \
    libgdbm-compat4 \
    libgdbm6 \
    libglib2.0-0 \
    libglib2.0-data \
    libgomp1 \
    libgprofng0 \
    libgssapi-krb5-2 \
    libheif1 \
    libicu72 \
    libip4tc2 \
    libisl23 \
    libisoburn1 \
    libisofs6 \
    libitm1 \
    libjansson4 \
    libjbig0 \
    libjemalloc2 \
    libjpeg62-turbo \
    libjq1 \
    libjson-c5 \
    libjte2 \
    libk5crypto3 \
    libkeyutils1 \
    libklibc \
    libkmod2 \
    libkrb5-3 \
    libkrb5support0 \
    libksba8 \
    libldap-2.5-0 \
    libldap-common \
    liblerc4 \
    liblmdb0 \
    liblocale-gettext-perl \
    liblockfile-bin \
    liblsan0 \
    liblvm2cmd2.03 \
    liblzo2-2 \
    libmagic-mgc \
    libmagic1 \
    libmaxminddb0 \
    libmnl0 \
    libmpc3 \
    libmpfr6 \
    libncursesw6 \
    libnewt0.52 \
    libnftables1 \
    libnftnl11 \
    libnghttp2-14 \
    libnode108 \
    libnpth0 \
    libnsl-dev \
    libnsl2 \
    libnss-systemd \
    libnuma1 \
    libonig5 \
    libpam-systemd \
    libparted2 \
    libpci3 \
    libperl5.36 \
    libpipeline1 \
    libpng16-16 \
    libpopt0 \
    libproc2-0 \
    libprotobuf-c1 \
    libpsl5 \
    libpython3-stdlib \
    libpython3.11-minimal \
    libpython3.11-stdlib \
    libquadmath0 \
    librav1e0 \
    libreadline8 \
    librtmp1 \
    libsasl2-2 \
    libsasl2-modules \
    libsasl2-modules-db \
    libslang2 \
    libsqlite3-0 \
    libssh2-1 \
    libssl3 \
    libstdc++-12-dev \
    libsvtav1enc1 \
    libsystemd-shared \
    libtext-charwidth-perl \
    libtext-iconv-perl \
    libtext-wrapi18n-perl \
    libtiff6 \
    libtirpc-common \
    libtirpc-dev \
    libtirpc3 \
    libtsan2 \
    libubsan1 \
    libuchardet0 \
    liburing2 \
    libusb-1.0-0 \
    libuv1 \
    libwebp7 \
    libx11-6 \
    libx11-data \
    libx265-199 \
    libxau6 \
    libxcb1 \
    libxdmcp6 \
    libxext6 \
    libxml2 \
    libxmuu1 \
    libxpm4 \
    libxtables12 \
    libyuv0 \
    linux-base \
    linux-libc-dev \
    live-boot \
    live-boot-doc \
    live-boot-initramfs-tools \
    live-config-systemd \
    live-tools \
    locales \
    locales \
    logrotate \
    lsb-release \
    lsof \
    lvm2 \
    mailcap \
    make \
    man \
    man-db \
    man-db \
    manpages \
    manpages \
    manpages-dev \
    media-types \
    mime-support \
    mokutil \
    nano \
    nano \
    ncurses-term \
    netbase \
    netcat-traditional \
    nftables \
    node-acorn \
    node-busboy \
    node-cjs-module-lexer \
    node-undici \
    node-xtend \
    nodejs \
    nodejs-doc \
    openssh-client \
    openssl \
    os-prober \
    parted \
    patch \
    pci.ids \
    pciutils \
    perl \
    perl-modules-5.36 \
    pinentry-curses \
    procps \
    procps \
    publicsuffix \
    python-apt-common \
    python3 \
    python3-apt \
    python3-certifi \
    python3-chardet \
    python3-charset-normalizer \
    python3-debconf \
    python3-debian \
    python3-debianbts \
    python3-httplib2 \
    python3-idna \
    python3-minimal \
    python3-pkg-resources \
    python3-pycurl \
    python3-pyparsing \
    python3-pysimplesoap \
    python3-reportbug \
    python3-requests \
    python3-six \
    python3-urllib3 \
    python3.11 \
    python3.11-minimal \
    qemu-guest-agent \
    readline-common \
    reportbug \
    rpcsvc-proto \
    rsync \
    sensible-utils \
    shared-mime-info \
    shim-helpers-amd64-signed \
    shim-signed \
    shim-signed-common \
    shim-unsigned \
    squashfs-tools \
    sshfs \
    sudo \
    sudo \
    systemd \
    systemd-sysv \
    systemd-sysv \
    systemd-timesyncd \
    task-english \
    tasksel \
    tasksel-data \
    thin-provisioning-tools \
    traceroute \
    tzdata \
    ucf \
    udev \
    usbutils \
    util-linux-locales \
    uuid-runtime \
    vim \
    vim-common \
    vim-tiny \
    wamerican \
    wget \
    whiptail \
    xauth \
    xdg-user-dirs \
    xkb-data \
    xorriso \
    xz-utils \
    zstd -y


# We must install the same version of the host
apt install linux-image-$(uname -r) -y

# init /usr/share/applications
dpkg -S /usr/share/applications

apt install python3 -y
ls -al /usr/share/applications

# fix linuxefi.mod
apt-file update
apt-file search linuxefi.mod
apt install grub-efi-amd64-bin -y

# starting with eggs
cd /ci/
ls -al
apt install -y ./*.deb

eggs dad -d
eggs produce --pendrive -n --verbose

# clean debs on /ci
rm /ci/*.deb

date

echo "# enable bash_completion, running:"
echo "source /etc/bash_completion"
