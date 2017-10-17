const app = electron.app;


checkForVault = function() {
    let vaultPath = app.getPath('appData');
    console.log(vaultPath);
}