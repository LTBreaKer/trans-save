from solcx import compile_standard
import json
import solcx
from web3 import Web3

with open ('./TournamentHistory.sol', 'r') as file:
    contract_source_code = file.read()

solcx.install_solc("0.8.19")
solcx.set_solc_version('0.8.19')
compiled_sol = compile_standard({
    "language": "Solidity",
    "sources": {
        "TournamentHistory.sol": {
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

byte_code = compiled_sol["contracts"]["TournamentHistory.sol"]["TournamentHistory"]["evm"]["bytecode"]["object"]
abi = compiled_sol["contracts"]["TournamentHistory.sol"]["TournamentHistory"]["abi"]

w = Web3(Web3.HTTPProvider('HTTP://127.0.0.1:7545'))

chain_id = 1337

address = "0x68694675ba482e75ae4E4AF736B4bc3514b44940"

private_key = "0x389e7634ed3fe05d383ce0a37ed4c48bc41239526d12144fd9780c46cfadec35"

TournamentHistory = w.eth.contract(abi=abi, bytecode=byte_code)

nonce = w.eth.get_transaction_count(address)
print("nonce before:", nonce)

transaction = TournamentHistory.constructor().build_transaction(
    {
        "chainId": chain_id,
        "gasPrice": w.eth.gas_price,
        "from": address,
        "nonce": nonce,
    }
)

signed_txn = w.eth.account.sign_transaction(transaction, private_key=private_key)
print("Deploying Contract…")
tx_hash = w.eth.send_raw_transaction(signed_txn.rawTransaction)
print("Waiting for transaction to finish...")

tx_receipt = w.eth.wait_for_transaction_receipt(tx_hash)

print(f"Done! Contract deployed to", tx_receipt.contractAddress)
nonce = w.eth.get_transaction_count(address)
print("nonce after:", nonce)