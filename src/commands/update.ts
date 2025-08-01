/**
 * ./src/commands/syncfrom.ts
 * penguins-eggs v.25.7.x / ecmascript 2020
 * author: Piero Proietti
 * email: piero.proietti@gmail.com
 * license: MIT
 */

import { Command, Flags } from '@oclif/core'
import inquirer from 'inquirer'
import Distro from '../classes/distro.js'

import Pacman from '../classes/pacman.js'
import Tools from '../classes/tools.js'
import Utils from '../classes/utils.js'
import Diversions from '../classes/diversions.js'
import { exec } from '../lib/utils.js'

import axios from 'axios'
import https from 'node:https'
const agent = new https.Agent({
  rejectUnauthorized: false
})

/**
 *
 */
export default class Update extends Command {
  static description = "update the Penguins' eggs tool"

  static examples = ['eggs update']

  static flags = {
    help: Flags.help({ char: 'h' }),
    verbose: Flags.boolean({ char: 'v', description: 'verbose' })
  }

  distro = new Distro()

  /**
   * run
   */
  async run(): Promise<void> {
    Utils.titles(this.id + ' ' + this.argv)
    const { flags } = await this.parse(Update)
    Utils.titles(this.id + ' ' + this.argv)

    if (Utils.isRoot()) {
      if (Utils.isSources()) {
        Utils.warning(`You are on penguins-eggs v. ${Utils.getPackageVersion()} from sources`)
      } else if (Utils.isPackage()) {
        Utils.warning(`You are on eggs-${Utils.getPackageVersion()} installed as package`)
      }

      await this.chooseUpdate()
    } else {
      Utils.useRoot(this.id)
    }
  }

  async chooseUpdate() {
    console.log()
    const choose = await this.choosePkg()
    Utils.titles(`updating via ${choose}`)
    switch (choose) {
      case 'repos': {
        await this.getPkgFromRepo()

        break
      }

      case 'lan': {
        await this.getPkgFromLan()

        break
      }

      case 'sourceforge': {
        this.getPkgFromSourceforge()

        break
      }

      case 'sources': {
        this.getFromSources()

        break
      }
      // No default
    }
  }

  /**
   *
   */
  async choosePkg(): Promise<string> {
    const choices: string[] = ['abort']
    choices.push('lan', 'repos', 'sourceforge', 'sources')

    const questions: any = [
      {
        choices,
        message: 'select update method',
        name: 'selected',
        type: 'list'
      }
    ]
    const answer = await inquirer.prompt(questions)
    if (answer.selected === 'abort') {
      process.exit(0)
    }

    return answer.selected
  }

  /**
   *
   */
  async getPkgFromRepo() {
    let cmd = ""
    if (this.distro.familyId === "debian") {
      cmd = 'apt install penguins-eggs'
    } else if (this.distro.familyId === 'archlinux') {
      cmd = 'pacman -S penguins-eggs'
    } else if (this.distro.familyId === 'alpine') {
      cmd = `apk add penguins-egga`
    }
    console.log(cmd)
    await exec(cmd)
  }

  /**
   * download da LAN
   */
  async getPkgFromLan() {
    const Tu = new Tools()
    await Tu.loadSettings()

    Utils.warning('Update from LAN')
    if (this.distro.familyId === 'archlinux') {
      let repo = "aur"
      if (Diversions.isManjaroBased(this.distro.distroId)) {
        repo = 'manjaro'
      }

      const filter = `penguins-eggs-25.*.*-?-any.pkg.tar.zst`
      const cmd = `scp ${Tu.config.remoteUser}@${Tu.config.remoteHost}:${Tu.config.remotePathPackages}/${repo}/${filter} /tmp`
      await exec(cmd, { capture: true, echo: true })
      if (await Utils.customConfirm(`Want to install ${filter}`)) {
        await exec(`pacman -U /tmp/${filter}`)
      }

    } else if (this.distro.familyId === 'alpine') {
      let arch = 'x86_64'
      if (process.arch === 'ia32') {
        arch = 'i386'
      }
      const filter = `penguins-eggs-25.*.*-r*.apk`
      const cmd = `scp ${Tu.config.remoteUser}@${Tu.config.remoteHost}:${Tu.config.remotePathPackages}/alpine/${filter} /tmp`
      await exec(cmd, { capture: true, echo: true })

      if (await Utils.customConfirm(`Want to install ${filter}`)) {
        await exec(`apk add /tmp/${filter}`)
      }
    } else if (this.distro.familyId === "debian") {
      const filter = `penguins-eggs_25.*.*-*_${Utils.uefiArch()}.deb`
      const cmd = `scp ${Tu.config.remoteUser}@${Tu.config.remoteHost}:${Tu.config.remotePathPackages}/debs/${filter} /tmp`
      await exec(cmd, { capture: true, echo: true })

      if (await Utils.customConfirm(`Want to install ${filter}`)) {
        await exec(`dpkg -i /tmp/${filter}`)
      }
    }
  }

  /**
   *
   */
  async getPkgFromSourceforge() {
    let repo = ''
    let cmd = ''
    let url = 'https://sourceforge.net/projects/penguins-eggs/files/Packages'
    let filter = `penguins-eggs`
    if (this.distro.familyId === 'archlinux') {
      repo = "aur"
      filter = `penguins-eggs-10.?.*-?-any.pkg.tar.zst`
      cmd = `sudo pacman -U ${filter}`
      if (Diversions.isManjaroBased(this.distro.distroId)) {
        repo = 'manjaro'
      }
      url = `${url}/${repo}`
    } else if (this.distro.familyId === "alpine" ) {
      let arch = 'x86_64'
      if (process.arch === 'ia32') {
        arch = 'i386'
      }
      repo="alpine"
      url= `${url}/${repo}/$arch/${Utils.uefiArch()}`
      const filter = `penguins-eggs-25.*.*-r*.apk`
      cmd = `doas apk add ${filter}`

    } else     if (this.distro.familyId === "debian") {
      repo = "debs"
      url = `${url}/${repo}`
      filter = `penguins-eggs_25.*.*-*_${Utils.uefiArch()}.deb`
      cmd = `sudo apt-get install ./${filter}`
    }
    let command = `- open your browser at ${url}\n`
    command += `- select and download last package: ${filter}\n`
    command += `- ${cmd}\n`
    console.log(command)
    this.show(url)
  }

  /**
 *
 * @param aptVersion
 */
  getFromSources() {
    console.log('You can get a fresh installation, cloning penguins-eggs:')
    console.log('cd ~')
    console.log('git clone https://github.com/pieroproietti/penguins-eggs')
    console.log('')
    console.log('Then, open your browser to read detailed instructions:')
    console.log('https://github.com/pieroproietti/penguins-eggs/blob/master/PREREQUISITES/README.md')
    console.log('')
    console.log('')
  }

  /**
   * show
   */
  async show(url: string) {
    url += `/stats/json`
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    // adjust 0 before single digit date
    const day = ('0' + yesterday.getDate()).slice(-2)
    const month = ('0' + (yesterday.getMonth() + 1)).slice(-2)
    const year = yesterday.getFullYear()

    const end = year + '-' + month + '-' + day
    let start = year + '-' + month + '-' + day

    const request = '?start_date=' + start + '&end_date=' + end
    url += request

    const res = await axios.get(url, { httpsAgent: agent })
    console.log("\nStatistics to get an idea: yesterday downloads")
    console.log()
    for (const country of res.data.countries) {
      console.log('- ' + country[0] + ': ' + country[1])
    }
  }
}
