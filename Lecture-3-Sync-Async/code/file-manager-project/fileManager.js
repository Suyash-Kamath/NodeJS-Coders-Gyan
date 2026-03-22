import * as readline from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import chalk from 'chalk'

// Importing all file system utility functions
import {
    createFolder,
    createFile,
    writeToFile,
    deleteFile,
    deleteFolder,
    listItems
} from './fsAPIProject.js'

// Creating readline interface for CLI interaction
const rl = readline.createInterface({
    input: stdin,
    output: stdout
})


// Main menu function
async function menu() {

    console.log(chalk.blue.bold('\n📁 File System Manager\n'))

    // List of available options
    const options = [
        'Create Folder',
        'Create File',
        'Write to File',
        'Delete File',
        'Delete Folder',
        'List Items',
        'Exit'
    ]

    // Display options with numbering
    options.forEach((opt, i) => {
        console.log(chalk.yellow(`${i + 1}. ${chalk.white(opt)}`))
    })

    // NOTE:
    // Whatever input user enters will ALWAYS be in STRING format
    const answer = await rl.question(chalk.cyan('\nSelect Option: '))

    switch (answer) {

        case '1': {
            const folderPath = await rl.question(chalk.cyan('Folder Path: '))
            await createFolder(folderPath)

            console.log(chalk.green('✅ Folder created successfully'))
            break
        }

        case '2': {
            const filePath = await rl.question(chalk.cyan('File Path: '))
            const initialContent = await rl.question(chalk.cyan('Initial Content: '))

            await createFile(filePath, initialContent)

            console.log(chalk.green('✅ File created successfully'))
            break
        }

        case '3': {
            const appendFilePath = await rl.question(chalk.cyan('File Path: '))
            const content = await rl.question(chalk.cyan('Content to append: '))

            // Adding new line before appending content
            await writeToFile(appendFilePath, `\n${content}`)

            console.log(chalk.green('✅ Content added to file'))
            break
        }

        case '4': {
            const deleteFilePath = await rl.question(chalk.cyan('File to delete: '))
            await deleteFile(deleteFilePath)

            console.log(chalk.green('✅ File deleted successfully'))
            break
        }

        case '5': {
            const deleteFolderPath = await rl.question(chalk.cyan('Folder to delete: '))
            await deleteFolder(deleteFolderPath)

            console.log(chalk.green('✅ Folder deleted successfully'))
            break
        }

        case '6': {
            const listPath = await rl.question(
                chalk.cyan('Folder path (Press Enter for current folder): ')
            )

            // If user presses Enter, default to current directory "./"
            const items = await listItems(listPath || './')

            console.log(chalk.blue('\nContents:\n'))

            items.forEach(item => {
                const icon = item.type === 'folder' ? '📂' : '📄'
                console.log(`${icon} ${chalk.yellow(item.name)}`)
            })

            break
        }

        case '7': {
            console.log(chalk.red('\n👋 Exiting File Manager...'))
            rl.close()
            return
        }

        default: {
            console.log(chalk.red('\n❌ Invalid option. Please try again.'))
        }
    }

    await rl.question(chalk.grey('\nPress ENTER to continue...'))

    // 🔁 Call menu again after each operation (important for continuous CLI)
    menu()
}

// Start the application
menu()