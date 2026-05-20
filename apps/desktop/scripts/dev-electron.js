const { spawn } = require('child_process');
const electron = require('electron');
const path = require('path');

let electronProcess = null;

function startElectron() {
  if (electronProcess) {
    try {
      electronProcess.kill('SIGTERM');
    } catch (e) {
      // Ignore if already dead
    }
  }

  // Spawn electron in the desktop workspace directory
  electronProcess = spawn(electron, ['.'], {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });

  electronProcess.on('close', (code) => {
    // If the process closed without being killed by us, exit
    if (electronProcess && !electronProcess.killed) {
      process.exit(code || 0);
    }
  });
}

startElectron();
