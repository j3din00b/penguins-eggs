/**
 * ./src/classes/ovary.d/make-efi.ts
 * penguins-eggs v.10.0.0 / ecmascript 2020
 * author: Piero Proietti
 * email: piero.proietti@gmail.com
 * license: MIT
 */

import mustache from 'mustache'

// packages
import fs from 'node:fs'
import path from 'node:path'

// classes
import { exec } from '../../lib/utils.js'
import Ovary from '../ovary.js'
import Diversions from '../diversions.js'
import Utils from '../utils.js'

// _dirname
const __dirname = path.dirname(new URL(import.meta.url).pathname)

/**
 * makeEFI
 */
export async function makeEfi(this: Ovary, theme = 'eggs') {
    Utils.warning("creating efi configuration...")

    const efiPath = path.join(this.settings.config.snapshot_mnt, '/efi/')

    const efiWorkDir = path.join(efiPath, '/work/')
    const efiMemdiskDir = path.join(efiPath, '/memdisk/')
    const efiMnt = path.join(efiPath, '/mnt/')

    const isoDir = this.settings.iso_work
    const readmes = `${isoDir}/READMES`
    let readmeContent = `# README\n`

    /**
     * check: grub/grub2 command MUST to exists
     */
    const grubName = Diversions.grubName(this.familyId)
    if (grubName === '') {
        Utils.error('Cannot find command grub/grub2.')
        process.exit(1)
    }

    /**
     * GAE = Grub Arch Efi path+grubx86.efi/signed
     */
    let GAE = srcGAES()
    if (!fs.existsSync(srcGAE())) {
        GAE = srcGAE()
    }

    if (!fs.existsSync(GAE)) {
        if (this.familyId === 'debian') {
            console.log(`error: cannot find ${GAE}`)
            process.exit(1)
        }
    }

    // Create READMES on ISO
    await exec(`mkdir ${readmes}`)

    // clean/create all in efiPath
    if (fs.existsSync(efiPath)) {
        await exec(`rm -rf ${efiPath}`)
    }
    await exec(`mkdir ${efiPath}`, this.echo)
    await exec(`mkdir ${efiMemdiskDir}`, this.echo)
    await exec(`mkdir ${efiMnt}`, this.echo)
    await exec(`mkdir ${efiWorkDir}`, this.echo)

    const grub1 = `${efiMemdiskDir}/boot/grub/grub.cfg`
    let grubText1 = `# grub.cfg 1\n`
    if (this.familyId === `debian`) {
        // create memdisk
        await exec(`mkdir ${path.join(efiMemdiskDir, "/boot")}`, this.echo)
        await exec(`mkdir ${path.join(efiMemdiskDir, "/boot/grub")}`, this.echo)

        // create grub.cfg 1 in memdisk
        Utils.warning("creating grub.cfg in (efi.img)")
        grubText1 += `# created on ${efiMemdiskDir}\n`
        grubText1 += `\n`
        grubText1 += `search --set=root --file /.disk/id/${this.uuid}\n`
        grubText1 += 'set prefix=($root)/boot/grub\n'
        grubText1 += `configfile ($root)/boot/grub/grub.cfg\n`
        
        Utils.write(grub1, grubText1)

        /**
         * creating structure efiWordDir
         */
        await exec(`mkdir ${efiWorkDir}/boot`, this.echo)
        await exec(`mkdir ${efiWorkDir}/boot/grub`, this.echo)

        /**
         * create tarred efiMemdiskDir
         */
        //await exec(`tar -cvf ${efiMemdiskDir}/memdisk ${efiMemdiskDir}/boot`, this.echo)
        const currentDir = process.cwd()
        process.chdir(efiMemdiskDir)
        await exec('tar -cvf memdisk boot', this.echo)
        process.chdir(currentDir)

        /**
         * Create boot image "boot/grub/efi.img"
         */
        const efiImg = `${efiWorkDir}boot/grub/efi.img`
        await exec(`dd if=/dev/zero of=${efiImg} bs=1M count=16`, this.echo)
        await exec(`/sbin/mkdosfs -F 12 ${efiImg}`, this.echo)

        // mount efi.img on mnt-img
        await exec(`mount -o loop ${efiImg} ${efiMnt}`, this.echo)

        // create structure inside efiMnt
        await exec(`mkdir ${efiMnt}/boot`, this.echo)
        await exec(`mkdir ${efiMnt}/boot/grub`, this.echo)
        await exec(`mkdir ${efiMnt}/EFI`, this.echo)
        await exec(`mkdir ${efiMnt}/EFI/boot`, this.echo)

        /**
         * we need: (efi.img)/boot/grub/grub.cfg
         *          (efi.img)/EFI/boot/bootx84.efi
         *          (efi.img)/EFI/boot/grubx84.efi
         */

        // copy grub.cfg to (efi.img)/boot/grub
        await exec(`cp ${grub1} ${efiMnt}/boot/grub`)

        // copy shimx64.efi.signed to (efi.img)/EFI/boot as bootx84.efi
        await exec(`cp ${srcShim()} ${efiMnt}/EFI/boot/${bootArchEfi()}`, this.echo)

        // copy grubx64.efi.signed to (efi.img)/EFI/boot as grubx64.efi
        await exec(`cp ${srcGAES()} ${efiMnt}/EFI/boot/${nameGAE()}`, this.echo)

        
        // readme
        readmeContent += `## copyng on (efi.img) ${efiMnt}\n`
        readmeContent += `${grub1} copied to /boot/grub`
        readmeContent += `${srcShim()} copied is  ${bootArchEfi()}\n`
        readmeContent += `${GAE} is ${nameGAE()}\n`


        // umount efiMnt
        await exec(`umount ${efiMnt}`, this.echo)
    } else {
        /**
         * Arch linux
         */
        const pathRelativeEfi = '../../../efi/*'
        await exec(`cp -r ${path.resolve(__dirname, pathRelativeEfi)} ${isoDir}`, this.echo)
        readmeContent = `using secure boot from debian on ${isoDir}`
        grubText1 += `using secure boot from debian\n`
    }


    /**
     * creating grub.cfg 2
     */
    Utils.warning("creating grub.cfg 2 (iso)/boot/grub")

    // copy splash to efiWorkDir
    const splashDest = `${efiWorkDir}/boot/grub/splash.png`
    let splashSrc = path.resolve(__dirname, `../../../addons/${theme}/theme/livecd/splash.png`)
    if (this.theme.includes('/')) {
        splashSrc = `${theme}/theme/livecd/splash.png`
    }

    if (!fs.existsSync(splashSrc)) {
        Utils.warning('Cannot find: ' + splashSrc)
        process.exit(1)
    }
    await exec(`cp ${splashSrc} ${splashDest}`, this.echo)

    // select themeSrc
    let themeSrc = path.resolve(__dirname, `../../../addons/${theme}/theme/livecd/grub.theme.cfg`)
    if (this.theme.includes('/')) {
        themeSrc = `${theme}/theme/livecd/grub.theme.cfg`
    }

    // copy theme
    const themeDest = `${isoDir}/boot/grub/theme.cfg`
    if (!fs.existsSync(themeSrc)) {
        Utils.warning('Cannot find: ' + themeSrc)
        process.exit(1)
    }
    fs.copyFileSync(themeSrc, themeDest)

    // selecting available fonts
    if (fs.existsSync('/usr/share/grub/font.pf2')) {
        await exec(`cp /usr/share/grub/font.pf2 ${efiWorkDir}boot/grub/font.pf2`, this.echo)
    } else if (fs.existsSync('/usr/share/grub/unicode.pf2')) {
        await exec(`cp /usr/share/grub/unicode.pf2 ${efiWorkDir}boot/grub/font.pf2`, this.echo)
    } else if (fs.existsSync('/usr/share/grub/ascii.pf2')) {
        await exec(`cp /usr/share/grub/ascii.pf2 ${efiWorkDir}boot/grub/font.pf2`, this.echo)
    }

    // Copy workdir files to ISO/boot
    await exec(`rsync -avx  ${efiWorkDir}/boot ${isoDir}/`, this.echo)

    readmeContent += `\n`
    readmeContent += `Copyng on ${isoDir}\n`
    readmeContent += `${GAE} is /EFI/boot/${nameGAE()}\n`

    /**
     * prepare main grub.cfg from grub.main.cfg
     */
    let grubTemplate = `${theme}/theme/livecd/grub.main.cfg`
    if (!fs.existsSync(grubTemplate)) {
        grubTemplate = path.resolve(__dirname, '../../../addons/eggs/theme/livecd/grub.main.cfg')
    }

    if (!fs.existsSync(grubTemplate)) {
        Utils.warning('Cannot find: ' + grubTemplate)
        process.exit(1)
    }

    const kernel_parameters = Diversions.kernelParameters(this.familyId, this.volid) // this.kernelParameters()
    const g2 = path.join(isoDir, '/boot/grub/grub.cfg')
    const template = fs.readFileSync(grubTemplate, 'utf8')

    const view = {
        fullname: this.settings.remix.fullname.toUpperCase(),
        initrdImg: `/live${this.settings.initrdImg}`,
        kernel: Utils.kernelVersion(),
        kernel_parameters,
        vmlinuz: `/live${this.settings.vmlinuz}`
    }
    let grubText2 = `# grub.cfg 2\n`
    grubText2 += ` # created on ${g2}`
    grubText2 += `\n`
    grubText2 += mustache.render(template, view)

    fs.writeFileSync(g2, grubText2)

    /**
     * create loopback.cfg
     */
    fs.writeFileSync(`${isoDir}/boot/grub/loopback.cfg`, 'source /boot/grub/grub.cfg\n')

    /**
     * config.cfg
     */
    await exec(`cp ${path.resolve(__dirname, `../../../assets/config.cfg`)} ${isoDir}/boot/grub`)

    fs.writeFileSync(`${readmes}/grub1.cfg`, grubText1)
    fs.writeFileSync(`${readmes}/grub2.cfg`, grubText2)
    fs.writeFileSync(`${readmes}/README.md`, readmeContent)
}


/**
 * 
 * @returns 
 */
function bootArchEfi(): string {
    let bn = 'nothing.efi'
    if (process.arch === 'x64') {
        bn = 'bootx64.efi'
    } else if (process.arch === 'arm64') {
        bn = 'bootaa64.efi'
    }
    return bn
}


/**
 * FUNCTIONS
 */
function nameGAE(): string {
    let bn = 'nothing.efi'
    if (process.arch === 'x64') {
        bn = 'grubx64.efi'
    } else if (process.arch === 'arm64') {
        bn = 'grubaa64.efi'
    }
    return bn
}

function nameGAES(): string {
    return nameGAE() + '.signed'
}

function srcGAE(): string {
    return '/usr/lib/grub/' + Utils.uefiFormat() + '/monolithic/' + nameGAE()
}

function srcGAES(): string {
    return '/usr/lib/grub/' + Utils.uefiFormat() + '-signed/' + nameGAES()
}

function srcShim(): string {
    const signedShim = '/usr/lib/shim/shimx64.efi.signed';
    const unsignedShim = '/usr/lib/shim/shimx64.efi';
    return fs.existsSync(signedShim) ? signedShim : unsignedShim;
}