
let spinnerInterval = null;
let startTime = null;

function startSpinner() {
    const spinnerFrames = ['|', '/', '-', '\\'];
    let spinnerIndex = 0;
    spinnerInterval = setInterval(() => {
        process.stdout.write(
            '\rProcessing all files: ' + spinnerFrames[spinnerIndex]
        );
        spinnerIndex = (spinnerIndex + 1) % spinnerFrames.length;
    }, 100);
}


function stopSpinner() {
    if (spinnerInterval) {
        clearInterval(spinnerInterval);
        spinnerInterval = null;
    }
    if (startTime) {
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        process.stdout.write(
            `\rProcess completed ✓ (Total time: ${duration} seconds)\n`
        );
        startTime = null;
    } else {
        process.stdout.write('\rProcess completed ✓\n');
    }
}

function clearSpinnerLine() {
    process.stdout.write('\r\x1b[K');
}

function startStopSpinner(start = true) {
    // if (process.env.DEBUG === 'true') {
    if (start) {
        startTime = Date.now();
        startSpinner() + '\n';
    } else {
        stopSpinner();
    }
    // }
}

export { startStopSpinner, clearSpinnerLine };