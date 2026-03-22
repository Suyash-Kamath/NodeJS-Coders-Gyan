import * as fs from 'node:fs/promises'


async function deleteFolder(folderPath) {

    await fs.rm(folderPath,{recursive:true})
    
}

async function createFolder(foldername) {
    await fs.mkdir(foldername, { recursive: true })
}

async function readFile(pathname) {
    const data = await fs.readFile(pathname, 'utf-8') // returns string
    console.log('Data:', data)
}

async function deleteFile(filepath){
    await fs.unlink(filepath)
}

async function writeToFile(pathname, content = '') {
    await fs.appendFile(pathname, content)
}

async function createFile(pathname, content = '') {
    await fs.writeFile(pathname, content)
}

async function getFileInfo(filePath) {
    const stats = await fs.stat(filePath)

    return {
        size: ((stats.size)/1024).toFixed(2) + 'KB',
        created: stats.birthtime.toLocaleString(),
        modified: stats.mtime.toLocaleString(),
        permissions: stats.mode

    }
    
    
}

// createFolder('./contents/images/logos')

// readFile('./hello.txt')

// deleteFile('./hello.txt')


// deleteFolder('./contents/images/logos')
// deleteFolder('./contents')


// createFile('./hello.txt','Hello NodeJS\n');

// const stats=await getFileInfo('./hello.txt') 

//                  or

const stats= getFileInfo('./hello.txt').then((data)=>{
    console.log(data)
})

// console.log(stats) // returns promise 
