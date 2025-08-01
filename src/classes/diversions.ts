/**
 * ./src/classes/diversions.ts
 * penguins-eggs v.25.7.x / ecmascript 2020
 * author: Piero Proietti
 * email: piero.proietti@gmail.com
 * license: MIT
 */

/**
 * contiene le variazione di nome 
 * per ogni famiglia
 */

import { IDistro } from '../interfaces/index.js'
import Distro from './distro.js'
import fs from 'fs'

export default class Diversions {


  /**
   * 
   * @param familyId 
   * @returns 
   */
  static isSystemDBoot(familyId: string, isEfi: boolean): boolean {
    let isSystemDBoot = false
    if (familyId === 'fedora' && isEfi) {
      isSystemDBoot = true
    }
    return isSystemDBoot
  }

  /**
   * 
   * @param familyId 
   * @returns deluser
   */
  static deluser(familyId: string): string {
    let deluser = 'deluser'
    if (familyId === 'aldos' ||
      familyId === 'archlinux' ||
      familyId === 'fedora' ||
      familyId === 'openmamba' ||
      familyId === 'opensuse' ||
      familyId === 'voidlinux') {
      deluser = 'userdel'
    }
    return deluser
  }

  /**
   * 
   * @param familyId 
   * @returns 
   */
  static grubName(familyId: string): string {
    let grubName = 'grub'
    if (familyId === 'aldos' ||
      familyId === 'fedora' ||
      familyId === 'opensuse') {

      grubName = 'grub2'
    }

    return grubName
  }

  /**
   * grubForce
   */
  static grubForce(familyId: string): string {
    let grubForce = ''
    if (familyId === 'aldos' || familyId === 'fedora') {

      grubForce = '--force'
    }

    return grubForce
  }
  /**
   * 
   * @param familyId 
   * @param volid 
   * @returns 
   */
  static kernelParameters(familyId: string, volid: string): string {
    // GRUB_CMDLINE_LINUX='ipv6.disable=1'

    let kp = ""

    if (familyId === 'aldos') {
      kp += `root=live:CDLABEL=${volid} rd.live.image rd.live.dir=/live rd.live.squashimg=filesystem.squashfs selinux=0 rootfstype=auto rd.locale.LANG=en_US.UTF-8 KEYBOARDTYPE=pc rd.vconsole.keymap=us rootflags=defaults,relatime,commit=60 nmi_watchdog=0 rhgb rd_NO_LUKS rd_NO_MD rd_NO_DM`
      //     root=live:CDLABEL=ALDOS6420241128 rootfstype=auto ro liveimg quiet rd.locale.LANG=es_MX.UTF-8 KEYBOARDTYPE=pc SYSFONT=latarcyrheb-sun16 rd.vconsole.keymap=es  rootflags=defaults,relatime,commit=60 selinux=0 nmi_watchdog=0 rhgb rd_NO_LUKS rd_NO_MD rd_NO_DM  
    } else if (familyId === 'alpine') {
      kp += `alpinelivelabel=${volid} alpinelivesquashfs=/mnt/live/filesystem.squashfs`
    } else if (familyId === 'archlinux') {
      kp += `boot=live components locales=${process.env.LANG}`
      const distroId = this.distro().distroId
      if (this.isManjaroBased(distroId)) {
        kp += ` misobasedir=manjaro misolabel=${volid}`
        // shx.exec(`mkdir -p ${this.settings.iso_work}.miso`)
      } else {
        kp += ` archisobasedir=arch archisolabel=${volid}`
      }
    } else if (familyId === 'debian') {
      kp += `boot=live components locales=${process.env.LANG} cow_spacesize=2G`
    } else if (familyId === 'fedora') {
      kp += `root=live:CDLABEL=${volid} rd.live.image rd.live.dir=/live rd.live.squashimg=filesystem.squashfs selinux=0`
    } else if (familyId === 'openmamba') {
      kp += `root=live:CDLABEL=${volid} rd.live.image rd.live.dir=/live rd.live.squashimg=filesystem.squashfs selinux=0`
    } else if (familyId === 'opensuse') {
      kp += `root=live:CDLABEL=${volid} rd.live.image rd.live.dir=/live rd.live.squashimg=filesystem.squashfs apparmor=0`
    } else if (familyId === 'voidlinux') {
      kp += `root=live:CDLABEL=${volid} rd.live.image rd.live.dir=/live rd.live.squashimg=filesystem.squashfs rd.debug`
    }

    return kp
  }

  /**
     *
     * @returns
     */
  static distro(): IDistro {
    return new Distro()
  }

  /**
  * isManjaroBased
  */
  static isManjaroBased(distro: string): boolean {
    let found = false
    if (distro === 'Manjaro' ||
      distro === `Biglinux` ||
      distro === `Bigcommunity`) {
      found = true
    }

    return found
  }

}
