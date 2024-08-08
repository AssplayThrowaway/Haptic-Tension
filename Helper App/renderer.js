document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#connectbtn').addEventListener('click', async () => {
        res = await window.electronAPI.connect(document.querySelector('#connectinput').value)
        if (res === -1) {
            document.querySelector('#connectbtn').style.backgroundColor = "lightcoral"
                document.querySelector('#connectbtn').textContent = "Failed to Connect" 
            setTimeout(() => { 
                document.querySelector('#connectbtn').style.backgroundColor = "" 
                document.querySelector('#connectbtn').textContent = "Connect to Server" 
            }, 2000);
        } else {
            document.querySelector('#connectbtn').style.backgroundColor = "lightgreen";
            document.querySelector('#connectbtn').textContent = "Successfully Connected" 
            setTimeout(() => { 
                document.querySelector('#connectbtn').style.backgroundColor = "" 
                document.querySelector('#connectbtn').textContent = "Connect to Server" 
            }, 2000);
        }
    });
    document.querySelector('#browsebtn').addEventListener('click', async () => {
        res = await window.electronAPI.selectDirectory()
        if (res !== undefined) {
            document.querySelector('#browsetext').value = res
        }
    });
    document.querySelector('#factorinput').addEventListener('change', async () => {
        await window.electronAPI.updateFactor(parseFloat(document.querySelector('#factorinput').value))
    });
});