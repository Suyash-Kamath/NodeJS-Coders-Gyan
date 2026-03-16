import chalk from "chalk";
import os from "node:os";

function monitor() {
  const oldCPUs = os.cpus();

  setTimeout(() => {
    const newCPUs = os.cpus();

    const usage = newCPUs.map((cpu, i) => {
      return {
        core: i,
        usage: calculateCPU(oldCPUs[i], newCPUs[i]) + "%",
      };
    });

    console.clear();
    console.log(chalk.bgMagenta("======= System Stats ======="));

    console.table(usage);

    const usedMemory =
      (os.totalmem() - os.freemem()) / (1024 * 1024 * 1024);
    const totalMemory =
      os.totalmem() / (1024 * 1024 * 1024);

    console.log(
      "Memory Used:",
      usedMemory > 5
        ? chalk.redBright(
            `${usedMemory.toFixed(2)}GB / ${totalMemory.toFixed(2)}GB`
          )
        : chalk.greenBright(
            `${usedMemory.toFixed(2)}GB / ${totalMemory.toFixed(2)}GB`
          )
    );
  }, 1000);
}

function calculateCPU(oldCPU, newCPU) {
  const oldTotal = Object.values(oldCPU.times).reduce((a, b) => a + b);
  const newTotal = Object.values(newCPU.times).reduce((a, b) => a + b);

  const idle = newCPU.times.idle - oldCPU.times.idle;
  const total = newTotal - oldTotal;
  const used = total - idle;

  return ((100 * used) / total).toFixed(1);
}

setInterval(monitor, 1000);