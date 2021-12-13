/**
 * penguins-eggs-v7 based on Debian live
 * author: Piero Proietti
 * email: piero.proietti@gmail.com
 * license: MIT
 */
import {Command, flags} from '@oclif/command'
import Utils from '../classes/utils'
import Settings from '../classes/settings'
import Incubator from '../classes/incubation/incubator'
import Pacman from '../classes/pacman'
import {IRemix} from '../interfaces'

export default class Calamares extends Command {
   static description = 'calamares or install or configure it'

   remix = {} as IRemix

   incubator = {} as Incubator

   settings = {} as Settings

   static flags = {
     help: flags.help({char: 'h'}),
     verbose: flags.boolean({char: 'v'}),
     install: flags.boolean({char: 'i', description: 'install calamares and it\'s dependencies'}),
     final: flags.boolean({char: 'f', description: 'final: remove calamares and all it\'s dependencies after the installation'}),
     remove: flags.boolean({char: 'r', description: 'remove calamares and it\'s dependencies'}),
     theme: flags.string({description: 'theme/branding for eggs and calamares'}),
   }

   static examples = ['~$ sudo eggs calamares \ncreate/renew calamares configuration\'s files\n', '~$ sudo eggs calamares -i \ninstall calamares and create it\'s configuration\'s files\n']

   async run() {
     Utils.titles(this.id + ' ' + this.argv)

     this.settings = new Settings()

     const {flags} = this.parse(Calamares)
     let verbose = false
     if (flags.verbose) {
       verbose = true
     }

     let remove = false
     if (flags.remove) {
       remove = true
     }

     let install = false
     if (flags.install) {
       install = true
     }

     let final = false
     if (flags.final) {
       final = true
     }

     let theme = 'eggs'
     if (flags.theme !== undefined) {
       theme = flags.theme
     }

     console.log(`theme: ${theme}`)

     if (Utils.isRoot(this.id)) {
       let installer = 'krill'
       if (Pacman.isInstalledGui()) {
         installer = 'calamares'
       }

       if (installer === 'calamares') {
         if (!remove) {
           if (await Utils.customConfirm('Select yes to continue...')) {
             /**
                   * Install calamares
                   */
             if (install) {
               Utils.warning('Installing calamares...')
               await Pacman.calamaresInstall()
               if (await this.settings.load()) {
                 this.settings.config.force_installer = true
                 this.settings.save(this.settings.config)
                 await Pacman.calamaresPolicies()
               }
             }

             /**
                   * Configure calamares
                   */
             if (await this.settings.load()) {
               Utils.warning('Configuring installer')
               await this.settings.loadRemix(this.settings.config.snapshot_basename, theme)
               this.incubator = new Incubator(this.settings.remix, this.settings.distro, this.settings.config.user_opt, verbose)
               await this.incubator.config(final)
             }
           }
         } else {
           /**
                * Remove calamares
                */
           if (await Pacman.calamaresCheck()) {
             await Pacman.calamaresRemove()
             if (await this.settings.load()) {
               this.settings.config.force_installer = false
               this.settings.save(this.settings.config)
             }
           }
         }
       } else if (await Utils.customConfirm('Select yes to continue...')) {
         if (await this.settings.load()) {
           Utils.warning('Configuring krill')
           await this.settings.loadRemix(this.settings.config.snapshot_basename, theme)
           this.incubator = new Incubator(this.settings.remix, this.settings.distro, this.settings.config.user_opt, verbose)
           await this.incubator.config(final)
         }
       }
     }
   }
}

