/**
 * ./src/classes/incubation/distros/bionic.ts
 * penguins-eggs v.25.7.x / ecmascript 2020
 * author: Piero Proietti
 * email: piero.proietti@gmail.com
 * license: MIT
 */

import { IDistro, IInstaller, IRemix } from '../../../interfaces/index.js'
import CFS from '../../../krill/classes/cfs.js'
import Fisherman from '../fisherman.js'

interface IReplaces {
  replace: string
  search: string
}

/**
 *
 */
export class Bionic {
  distro: IDistro

  installer = {} as IInstaller

  isClone: boolean

  release = false

  remix: IRemix

  theme: string // theme comprende il path

  user_opt: string

  verbose = false

  /**
   * @param remix
   * @param distro
   * @param release
   * @param verbose
   */
  constructor(installer: IInstaller, remix: IRemix, distro: IDistro, user_opt: string, release = false, theme = 'eggs', isClone = false, verbose = false) {
    this.installer = installer
    this.remix = remix
    this.distro = distro
    this.user_opt = user_opt
    this.verbose = verbose
    this.release = release
    this.theme = theme
    this.isClone = isClone
  }

  /**
   * locale, partitions, users can come from themes
   */
  async create() {
    const fisherman = new Fisherman(this.distro, this.installer, this.verbose)

    await fisherman.createCalamaresSettings(this.theme, this.isClone)

    await fisherman.buildModule('welcome')
    await fisherman.buildModule('partition', this.remix.branding)
    await fisherman.buildModule('mount')
    await fisherman.moduleUnpackfs() //
    await fisherman.buildModule('machineid')
    await fisherman.buildModule('fstab')
    await fisherman.buildModule('locale', this.remix.branding)
    await fisherman.buildModule('keyboard')
    await fisherman.buildModule('localecfg')
    await fisherman.buildModule('luksbootkeyfile')
    await fisherman.buildModule('users', this.remix.branding)
    await fisherman.moduleDisplaymanager() //
    await fisherman.buildModule('networkcfg')
    await fisherman.buildModule('hwclock')
    await fisherman.buildCalamaresModule('sources-yolk', true)
    await fisherman.buildCalamaresModule('bug')
    await fisherman.buildModule('initramfscfg')
    await fisherman.buildModule('initramfs')
    await fisherman.buildCalamaresPy('grubcfg')
    await fisherman.buildModule('bootloader')
    await fisherman.buildCalamaresModule('after-bootloader')
    await fisherman.buildCalamaresModule('add386arch', false)
    await fisherman.modulePackages(this.distro, this.release) //
    await fisherman.moduleRemoveuser(this.user_opt) //
    await fisherman.buildCalamaresModule('sources-yolk-undo', false)
    await fisherman.buildCalamaresModule('cleanup', true)

    /**
     * cfs: custom final steps
     */
    const cfs = new CFS()
    const steps = await cfs.steps()
    if (steps.length > 0) {
      for (const step of steps) {
        await fisherman.buildCalamaresModule(step, true, this.theme)
      }
    }

    await fisherman.buildModule('umount')
    await fisherman.buildModule('finished')
  }
}
