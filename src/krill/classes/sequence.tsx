/**
 * ./src/krill/sequence.tsx
 * penguins-eggs v.10.0.0 / ecmascript 2020
 * author: Piero Proietti
 * email: piero.proietti@gmail.com
 * license: MIT
 * https://stackoverflow.com/questions/23876782/how-do-i-split-a-typescript-class-into-multiple-files
 */

/**
 * Ideally, I want to respect calamares way, 
 * implementing the same (SEMPLIFIED) sequence
 *  on a TUI. Note: here sequence is hard coded!
 */


import { IRemix, IDistro, INet } from '../../interfaces/index.js'
import Settings from '../../classes/settings.js'

import React from 'react';
import { render, RenderOptions, Box, Text } from 'ink'
import Install from '../components/install.js'
import Finished from '../components/finished.js'

import fs from 'fs'
import yaml from 'js-yaml'

import { installer } from '../../classes/incubation/installer.js'
import CliAutologin from '../../classes/cli-autologin.js'
import Distro from '../../classes/distro.js'
import Pacman from '../../classes/pacman.js'
import Utils from '../../classes/utils.js'
import Xdg from '../../classes/xdg.js';

import { IInstaller, IDevices, IDevice } from '../../interfaces/index.js'
import { ICalamaresModule, ILocation, IKeyboard, IPartitions, IUsers } from '../interfaces/i_krill.js'
import { exec } from '../../lib/utils.js'

// import krill modules
import partition from './sequence.d/partition.js'
// import createLvmPartitions from './sequence.d/partition.d/create-lvm-partitions.js'
import biosStandard from './sequence.d/partition.d/bios_standard.js'
import biosLuks from './sequence.d/partition.d/bios_luks.js'
import uefiStandard from './sequence.d/partition.d/uefi_standard.js'
import uefiLuks from './sequence.d/partition.d/uefi_luks.js'

import { mountFs, umountFs } from './sequence.d/mount_fs.js'
import { mountVfs, umountVfs } from './sequence.d/mount_vfs.js'
import unpackfs from './sequence.d/unpackfs.js'
import machineId from './sequence.d/machine_id.js'
import fstab from './sequence.d/fstab.js'
import locale from './sequence.d/locale.js'
import mKeyboard from './sequence.d/m_keyboard.js'
import localeCfg from './sequence.d/locale_cfg.js'
// users
import addUser from './sequence.d/add_user.js'
import changePassword from './sequence.d/change_password.js'
// displaymanager: autologin
import networkCfg from './sequence.d/network_cfg.js'
// hwclock:
// services-systemd:
// bootloader-config
import bootloaderConfig from './sequence.d/bootloader_config.js'
import grubcfg from './sequence.d/grubcfg.js'
import bootloader from './sequence.d/bootloader.js'
import packages from './sequence.d/packages.js'
import removeInstallerLink from './sequence.d/remove_installer_link.js'
import initramfsCfg from './sequence.d/initramfs_cfg.js'
import initramfs from './sequence.d/initramfs.js'
import delLiveUser from './sequence.d/del_live_user.js'
import umount from './sequence.d/umount.js'
import mkfs from './sequence.d/mkfs.js'
import hostname from './sequence.d/hostname.js'

import CFS from './cfs.js'

import Title from '../components/title.js'
import cliCursor from 'cli-cursor'
import { spawnSync } from 'child_process';


/**
 * hatching: installazione o cova!!!
 */
export default class Sequence {
   partition = partition
   // createLvmPartitions = createLvmPartitions
   partitionBiosStandard = biosStandard
   partitionUefiStandard = uefiStandard
   partitionBiosLuks = biosLuks
   partitionUefiLuks = uefiLuks
   
   // mount
   mountFs = mountFs
   mountVfs = mountVfs
   //
   unpackfs = unpackfs
   machineId = machineId
   fstab = fstab
   locale = locale
   keyboard = mKeyboard
   localeCfg = localeCfg
   // users
   addUser = addUser
   changePassword = changePassword
   // displaumanager: autologin
    networkCfg = networkCfg
   // hwclock:
   // services-systemd:
   // bootloader-config
   bootloaderConfig = bootloaderConfig
   //
   grubcfg = grubcfg
   bootloader = bootloader
   packages = packages
   removeInstallerLink = removeInstallerLink
   // luksbootkeyfile:
   // plymouthcfg;
   initramfsCfg = initramfsCfg
   initramfs = initramfs
   delLiveUser = delLiveUser
   umountFs = umountFs
   umountVfs = umountVfs
   umount = umount
   mkfs = mkfs
   hostname = hostname

   installer = {} as IInstaller

   installTarget = '/tmp/calamares-krill-root'

   verbose = false

   echo = {}

   efi = false

   devices = {} as IDevices

   users = {} as IUsers

   network = {} as INet

   partitions = {} as IPartitions

   swapSize: number = 0

   language = ''

   region = ''

   zone = ''

   keyboardModel = ''

   keyboardLayout = ''

   keyboardVariant = ''

   toNull = ' > /dev/null 2>&1'

   spinner = true

   settings = {} as Settings

   remix = {} as IRemix

   distro = {} as IDistro

   // Crypted Clone
   luksName = 'luks-volume'

   luksFile = ``

   luksDevice = `/dev/mapper/${this.luksName}`

   luksMountpoint = `/mnt`

   is_clone = fs.existsSync('/etc/penguins-eggs.d/is_clone')

   is_crypted_clone = fs.existsSync('/etc/penguins-eggs.d/is_crypted_clone')

   unattended = false

   nointeractive = false

   chroot = false

   halt = false

   cliAutologin = new CliAutologin()


   /**
    * constructor
    */
   constructor(location: ILocation, keyboard: IKeyboard, partitions: IPartitions, users: IUsers, network: INet) {

      this.installer = installer()
      this.settings = new Settings()

      this.language = location.language
      this.region = location.region
      this.zone = location.zone

      this.keyboardModel = keyboard.keyboardModel
      this.keyboardLayout = keyboard.keyboardLayout
      this.keyboardVariant = keyboard.keyboardVariant

      this.network = network

      this.partitions = partitions

      this.users = users

      this.devices.efi = {} as IDevice
      this.devices.boot = {} as IDevice
      this.devices.root = {} as IDevice
      this.devices.data = {} as IDevice
      this.devices.swap = {} as IDevice

      this.distro = new Distro()
      this.efi = fs.existsSync('/sys/firmware/efi/efivars')
      this.luksFile = `${this.distro.liveMediumPath}live/${this.luksName}`
   }

   /**
    * install
    * @param verbose
    * @param umount
    * @returns
    */
   async start(domain = '', unattended = false, nointeractive = false, chroot = false, halt = false, verbose = false) {
      // Imposta il domain per flag
      if (domain !== '') {
         if (domain.at(0) !== '.') {
            domain = '.' + domain
         }
         this.network.domain = domain
      }

      /**
       * To let krill to work with Arch we need:
       */
      if (this.distro.familyId === 'archlinux') {
         if (this.distro.distroId === 'Manjarolinux') {
            await exec(`ln -s /run/miso/bootmnt/live/ /live`)
         } else {
            await exec(`ln -s /run/archiso/bootmnt/live/ /live`)
         }
      }

      /**
       * dmsetup remove_all
       */
      if (this.distro.familyId === 'opensuse') {
         await exec('dmsetup remove_all')
      }

      this.unattended = unattended
      this.nointeractive = nointeractive
      this.chroot = chroot
      this.halt = halt

      this.verbose = verbose
      this.echo = Utils.setEcho(this.verbose)
      if (this.verbose) {
         this.toNull = ''
         this.spinner = false
      }

      // start
      await this.settings.load()

      
      let isPartitioned = false
      let message = "Creating partitions"
      await redraw(<Install message={message} percent={0} spinner={this.spinner} />)
      try {
         isPartitioned = await this.partition()
      } catch (error) {
         await this.showProblem(message, error)
      }

      if (isPartitioned) {
         // formatting
         message = "Formatting file system"
         await redraw(<Install message={message} percent={6} spinner={this.spinner} />)
         try {
            await this.mkfs()
         } catch (error) {
            await this.showProblem(message, error)
         }


         // mountFs
         message = "Mounting target file system"
         redraw(<Install message={message} percent={9} spinner={this.spinner} />)
         try {
            let success = await this.mountFs()
            await sleep(500) // diamo il tempo di montare
         } catch (error) {
            await this.showProblem(message, error)
         }

         // mountVfs
         message = "Mounting on target VFS"
         await redraw(<Install message={message} percent={12} spinner={this.spinner} />)
         try {
            await this.mountVfs()
         } catch (error) {
            await this.showProblem(message, error)
         }


         // unpackfs
         message = "Unpacking filesystem"
         await redraw(<Install message={message} percent={15} spinner={this.spinner} />)
         try {
            await this.unpackfs()
         } catch (error) {
            await this.showProblem(message, error)
         }


         // dpkg-unsafe-io
         if (this.distro.familyId === 'debian') {
            message = "Force dpkg-unsafe-io"
            await redraw(<Install message={message} percent={40} spinner={this.spinner} />)
            try {
               await this.execCalamaresModule('dpkg-unsafe-io')
            } catch (error) {
               await this.showProblem(message, error)
            }
         }


         // sources-yolk
         if (this.distro.familyId === 'debian') {
            message = 'Add sources-yolk'
            await redraw(<Install message={message} percent={43} spinner={this.spinner} />)
            try {
               await this.execCalamaresModule('sources-yolk')
            } catch (error) {
               await this.showProblem(message, error)
            }
         }


         // machineid
         message = 'machineid'
         await redraw(<Install message={message} percent={46} spinner={this.spinner} />)
         try {
            await this.machineId()
         } catch (error) {
            await this.showProblem(message, error)
         }


         // fstab
         message = "Creating fstab"
         await redraw(<Install message={message} percent={49} spinner={this.spinner} />)
         try {
            await this.fstab(this.partitions.installationDevice)
         } catch (error) {
            await this.showProblem(message, error)
         }


         /**
          * CryptedClone exec eggs syncfrom
          */
         if (this.is_crypted_clone) {
            message = "Restore private data from crypted clone"
            await redraw(<Install message={message} percent={55} spinner={this.spinner} />)
            if (fs.existsSync(this.luksFile)) {
               let cmd = `eggs syncfrom --rootdir /tmp/calamares-krill-root/ --file ${this.luksFile}`
               try {
                  await exec(cmd, Utils.setEcho(true))
                  this.is_clone = true // Adesso è un clone
               } catch (error) {
                  await this.showProblem(message, error)
               }
            } else {
               await Utils.pressKeyToExit(`Cannot find luks-volume file ${this.luksFile}`)
            }
         }

         // networkcfg
         message = "Network configuration"
         await redraw(<Install message={message} percent={61} spinner={this.spinner} />)
         try {
            await this.networkCfg()
         } catch (error) {
            await this.showProblem(message, error)
         }

         // hostname
         message = "Create hostname"
         await redraw(<Install message={message} percent={64} spinner={this.spinner} />)
         try {
            await this.hostname(this.network.domain)
         } catch (error) {
            await this.showProblem(message, error)
         }


         // dpkg-unsafe-io-undo
         if (this.distro.familyId === 'debian') {
            message = "Remove dpkg-unsafe-io"
            await redraw(<Install message={message} percent={65} spinner={this.spinner} />)
            try {
               await this.execCalamaresModule('dpkg-unsafe-io-undo')
            } catch (error) {
               await this.showProblem(message, error)
            }
         }


         /**
          * IF NOT CLONE: 
          * locale, 
          * keyboard, 
          * localeCfg, 
          * delLiveUser, 
          * adduser, 
          * addRootPassword, 
          * autologin GUI
          */
         if (!this.is_clone) {
            // NOT_CLONE: locale
            message = "Locale"
            redraw(<Install message={message} percent={70} spinner={this.spinner} />)
            try {
               if (this.distro.familyId === 'alpine' ||
                  this.distro.familyId === 'archlinux' ||
                  this.distro.familyId === 'debian') {

                  await this.locale()
               }
            } catch (error) {
               await this.showProblem(message, error)
            }


            // NOT_CLONE: keyboard
            message = "Settings keyboard"
            redraw(<Install message={message} percent={71} spinner={this.spinner} />)
            try {
               await this.keyboard()
            } catch (error) {
               await this.showProblem(message, error)
            }


            // NOT_CLONE: localeCfg
            if (this.distro.familyId === 'archlinux' ||
               this.distro.familyId === 'debian') {
               message = "Locale Configuration"
               redraw(<Install message={message} percent={72} spinner={this.spinner} />)
               try {
                  await this.localeCfg()
                  await exec("chroot " + this.installTarget + " locale-gen" + this.toNull)
               }
               catch (error) {
                  await this.showProblem(message, error)
               }
            }


            // NOT_CLONE: delLiveUser
            message = "Remove live user"
            await redraw(<Install message={message} percent={73} spinner={this.spinner} />)
            try {
               await this.delLiveUser()
            } catch (error) {
               await this.showProblem(message, error)
            }


            // NOT_CLONE: addUser
            message = `Add user ${this.users.username}`
            await redraw(<Install message={message} percent={74} spinner={this.spinner} />)
            try {
               await this.addUser(this.users.username, this.users.password, this.users.fullname, '', '', '')
            } catch (error) {
               await this.showProblem(message, error)
            }


            // NOT_CLONE: addRootPassword
            message = "Add root password"
            await redraw(<Install message={message} percent={75} spinner={this.spinner} />)
            try {
               await this.changePassword('root', this.users.rootPassword)
            } catch (error) {
               await this.showProblem(message, error)
            }


            // NOT_CLONE: autologin GUI
            if (Pacman.isInstalledGui()) {
               try {
                  message = "Autologin GUI"
                  await redraw(<Install message={message} percent={78} spinner={this.spinner} />)
                  if (this.users.autologin) {
                     await Xdg.autologin(await Utils.getPrimaryUser(), this.users.username, this.installTarget)
                     if (this.distro.distroLike === 'Arch') {
                        await exec(`chroot ${this.installTarget} groupadd autologin ${this.toNull}`)
                        await exec(`chroot ${this.installTarget} gpasswd -a ${this.users.username} autologin ${this.toNull}`)
                     }
                  }
               } catch (error) {
                  await this.showProblem(message, error)
               }
            }
         } // IF NOT CLONE END

         // ALWAYS remove autologin CLI
         message = "Remove autologin CLI"
         await redraw(<Install message={message} percent={80} spinner={this.spinner} />)
         try {
            await this.cliAutologin.remove(this.installTarget)
         } catch (error) {
            await this.showProblem(message, error)
         }


         // bootloader-config
         message = "bootloader-config"
         await redraw(<Install message={message} percent={81} spinner={this.spinner} />)
         try {
            await this.bootloaderConfig()
         } catch (error) {
            await this.showProblem(message, error)
         }


         // grubcfg
         message = "grubcfg"
         await redraw(<Install message={message} percent={82} spinner={this.spinner} />)
         try {
            await this.grubcfg()
         } catch (error) {
            await this.showProblem(message, error)
         }

         // bootloader (grub-install)
         message = "bootloader"
         await redraw(<Install message={message} percent={83} spinner={this.spinner} />)
         try {
            await this.bootloader()
         } catch (error) {
            await this.showProblem(message, error)
         }


         // sources-yolk-undo
         if (this.distro.familyId === 'debian') {
            message = "Remove sources-yolk"
            await redraw(<Install message={message} percent={84} spinner={this.spinner} />)
            try {
               await this.execCalamaresModule('sources-yolk-undo')
            } catch (error) {
               await this.showProblem(message, error)
            }
         }


         // packages
         message = "Add/remove packages"
         await redraw(<Install message={message} percent={85} spinner={this.spinner} />)
         try {
            await this.packages()
         } catch (error) {
            await this.showProblem(message, error)
         }


         // initramfsCfg
         message = "initramfs configure"
         await redraw(<Install message={message} percent={86} spinner={this.spinner} />)
         try {
            await this.initramfsCfg(this.partitions.installationDevice)
         } catch (error) {
            await this.showProblem(message, error)
         }


         // initramfs
         message = "initramfs"
         await redraw(<Install message={message} percent={87} spinner={this.spinner} />)
         try {
            await this.initramfs()
         } catch (error) {
            await this.showProblem(message, error)
         }


         /**
          *
          * remove CLI/GUI installer link
          */
         message = "Remove GUI installer link"
         await redraw(<Install message={message} percent={88} spinner={this.spinner} />)
         try {
            await this.removeInstallerLink()
         } catch (error) {
            await this.showProblem(message, error)
         }


         // remove /etc/penguins_eggs.d/is_clone*
         message = "Cleanup"
         await redraw(<Install message={message} percent={89} spinner={this.spinner} />)
         try {
            await exec(`rm -f ${this.installTarget}/etc/penguins-eggs.d/is_clone`)
            await exec(`rm -f ${this.installTarget}/etc/penguins-eggs.d/is_crypted_clone`)
         } catch (error) {
            await this.showProblem(message, error)
         }


         /**
          * custom final steps
          */
         const cfs = new CFS()
         const steps = await cfs.steps()
         if (steps.length > 0) {
            for (const step of steps) {
               message = `running ${step}`
               await redraw(<Install message={message} percent={90} spinner={this.spinner} />)
               try {
                  await this.execCalamaresModule(step)
               } catch (error) {
                  await this.showProblem(message, error)
               }
            }
         }


         // chroot
         if (chroot) {
            message = `You are in chroot mode under ${this.installTarget}, type "exit" to exit.`
            await this.emergencyShell(message)
         }


         // umountVfs
         message = "umount Virtual File System"
         await redraw(<Install message={message} percent={96} spinner={this.spinner} />)
         try {
            await this.umountVfs()
         } catch (error) {
            await this.showProblem(message, error)
         }
         //await Utils.pressKeyToExit('passed:' + message)

         message = "umount File system"
         await redraw(<Install message={message} percent={99} spinner={this.spinner} />)
         try {
            await this.umountFs()
         } catch (error) {
            await this.showProblem(message, error)
         }
         await sleep(500) // wait 0,5 seconds


         /**
          * Finished
          */
         let cmd = "reboot"
         if (this.halt) {
            cmd = "poweroff"
         }

         message = `Press a key to ${cmd}`
         if (this.unattended && this.nointeractive) {
            message = `System will ${cmd} in 5 seconds...`
         }

         await redraw(<Finished
            installationDevice={this.partitions.installationDevice}
            hostName={this.users.hostname}
            userName={this.users.username}
            message={message} />)

         // await Utils.pressKeyToExit('passed:' + message)

         if (this.unattended && this.nointeractive) {
            await sleep(5000)
         } else {
            spawnSync('read _ ', { shell: true, stdio: [0, 1, 2] })
         }
         await exec(cmd, { echo: false })
      }
   }


   /**
    *
    */
   async execCalamaresModule(name: string) {
      const moduleName = this.installer.multiarchModules + name + '/module.desc'
      if (fs.existsSync(moduleName)) {
         const calamaresModule = yaml.load(fs.readFileSync(moduleName, 'utf8')) as ICalamaresModule
         let command = calamaresModule.command
         if (command !== '' || command !== undefined) {
            command += this.toNull
            await exec(command, this.echo)
         }
      }
   }


   /**
    * 
   * @param message 
   */
   async emergencyShell(message: string) {
      try {
         await redraw(
            <>
               <Title />
               <Box>
                  <Text>{message}</Text>
               </Box>
            </>
         )
         cliCursor.show()
         await exec(`chroot ${this.installTarget} /bin/bash`)
         cliCursor.hide()
      } catch (error) {
         await Utils.pressKeyToExit(JSON.stringify(error))
      }
   }

   /**
    * 
    * @param message 
    */
   async showProblem(message: string, currErr: any) {
      message = `We was on "${message}", get error: ${JSON.stringify(currErr)}, type "exit" to exit from krill emergency shell.`
      try {
         await redraw(
            <>
               <Title />
               <Box>
                  <Text>{message}</Text>
               </Box>
            </>
         )
         cliCursor.show()
         await exec("/bin/bash")
         cliCursor.hide()
      } catch (error) {
         await Utils.pressKeyToExit(JSON.stringify(error))
      }
   }
}

/**
 *
 * @param elem
 */
async function redraw(elem: JSX.Element) {
   let opt: RenderOptions = {}
   opt.patchConsole = false
   opt.debug = true
   console.clear()
   render(elem, opt)
}

/**
 *
 * @param ms
 * @returns
 */
function sleep(ms = 0) {
   return new Promise((resolve) => {
      setTimeout(resolve, ms);
   });
}
