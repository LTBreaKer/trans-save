const fs = require('fs');
const path = require('path');

module.exports = {
  networks: {
    develop: {
      port: 9545,
      network_id: 5777,
      accounts: 1,
      defaultEtherBalance: 1000,
      onStart: function(provider) {
        // Get the accounts and private keys
        const accounts = provider.getInitialAccounts();
        
        // Prepare the output
        const output = Object.entries(accounts).map(([address, data]) => {
          return `Address: ${address}\nPrivate Key: ${data.secretKey.toString('hex')}\n`;
        }).join('\n');

        // Define the output file path
        const outputPath = path.resolve(__dirname, 'truffle-accounts.txt');

        // Write to the file
        fs.writeFileSync(outputPath, output, { flag: 'w' });
      }
    }
  },
  compilers: {
    solc: {
      version: ">=0.8.0 <0.9.0"
    }
  }
};