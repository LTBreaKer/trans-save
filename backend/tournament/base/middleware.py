from eth_tester import EthereumTester, PyEVMBackend
from web3 import Web3, EthereumTesterProvider
import solcx
import json

class BlockchainMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

        self.eth_tester = EthereumTester(backend=PyEVMBackend())
        self.w3 = Web3(EthereumTesterProvider(self.eth_tester))

        if self.w3.is_connected():
            print("Connected to Truffle Blockchain!")

            self.w3.eth.default_account = self.w3.eth.accounts[0]

            with open('./tools/TournamentContract.sol', 'r') as file:
                contract_source_code = file.read()
            solcx.install_solc("0.8.19")
            solcx.set_solc_version('0.8.19')

            compiled_sol = solcx.compile_standard({
                "language": "Solidity",
                "sources": {
                    "TournamentContract.sol": {
                        "content": contract_source_code
                    }
                },
                "settings": {
                    "outputSelection": {
                        "*": {
                            "*": ["abi", "metadata", "evm.bytecode", "evm.sourceMap"]
                        }
                    }
                }
            })

            with open("compiled_code.json", "w") as file:
                json.dump(compiled_sol, file)

            bytecode = compiled_sol["contracts"]["TournamentContract.sol"]["TournamentContract"]["evm"]["bytecode"]["object"]
            abi = compiled_sol["contracts"]["TournamentContract.sol"]["TournamentContract"]["abi"]

            TournamentContract = self.w3.eth.contract(abi=abi, bytecode=bytecode)

            tx_hash = TournamentContract.constructor().transact()
            tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)

            contract_address = tx_receipt.contractAddress

            self.contract = self.w3.eth.contract(address=contract_address, abi=abi)
            print("TournamentContract deployed!")

        else:
            print("Failed to connect to Truffle Blockchain!")
        
    def __call__(self, request):
        request.w3 = self.w3
        request.contract = self.contract
        response = self.get_response(request)

        return response
            