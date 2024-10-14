module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Adresse de Ganache
      port: 7545,            // Port par défaut de Ganache
      network_id: "*"        // Connecté à n'importe quel réseau
    }
  },
  compilers: {
    solc: {
      version: "0.8.0",     // Version compatible avec ton contrat
    }
  }
};
