const { execSync } = require('child_process');

const port = Number(process.env.PORT || 3001);

function getWindowsPidsByPort(targetPort) {
  try {
    const output = execSync(`netstat -ano | findstr :${targetPort}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
    const pids = output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => line.includes('LISTENING'))
      .map((line) => line.split(/\s+/).pop())
      .filter(Boolean);

    return [...new Set(pids)];
  } catch (_error) {
    return [];
  }
}

function killPid(pid) {
  try {
    execSync(`taskkill /PID ${pid} /F`, { stdio: ['ignore', 'pipe', 'ignore'] });
    console.log(`Stopped process ${pid} on port ${port}`);
  } catch (_error) {
    // If process exited between lookup and kill, continue.
  }
}

function main() {
  if (process.platform !== 'win32') {
    return;
  }

  const pids = getWindowsPidsByPort(port);

  if (pids.length === 0) {
    console.log(`No listener found on port ${port}`);
    return;
  }

  pids.forEach(killPid);
}

main();