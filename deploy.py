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

byte_code = compiled_sol["contracts"]["TournamentHistory.sol"]["TournamentContract"]["evm"]["bytecode"]["object"]
abi = compiled_sol["contracts"]["TournamentHistory.sol"]["TournamentContract"]["abi"]

try:
    w = Web3(Web3.HTTPProvider('http://127.0.0.1:9545'))
except Exception as e:
    print("ff")
chain_id = 1337

address = "0x20d06180d6129e2ffbea854b3053a94c94f7c688"
address = Web3.to_checksum_address(address)

private_key = "5aa29c45a7e157a7a404fb6d97976d41cc4bac07c4521dddf75a18f152349529"

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
contract_address = tx_receipt.contractAddress
print(f"Done! Contract deployed to", contract_address)
nonce = w.eth.get_transaction_count(address)
print("nonce after:", nonce)
balance_wei = w.eth.get_balance(address)

# Convert the balance to Ether
balance_ether = w.from_wei(balance_wei, 'ether')
print(balance_ether)

tournament_history = w.eth.contract(address=contract_address, abi=abi)


create_tournament_tx = tournament_history.functions.createTournament(1, 1, ["hhhh", "hhhq", "hhhw", "hhhe", "hhhr", "hhht", "hhhy", "hhhu"]).build_transaction(
    {
        "chainId": chain_id,
        "gasPrice": w.eth.gas_price,
        "from": address,
        "nonce": nonce,
    }

)

signed_create_tournament_tx = w.eth.account.sign_transaction(create_tournament_tx, private_key=private_key)
create_tournament_tx_hash = w.eth.send_raw_transaction(signed_create_tournament_tx.rawTransaction)
w.eth.wait_for_transaction_receipt(create_tournament_tx_hash)

response = tournament_history.functions.getInitialTournamentMatches(1).call()

for match in response:
    print(f"Match: {match}")
    print(f"Match: Player One ID {match[2]}, Player Two ID {match[3]}, Status: {match[7]}")

create_tournament_tx = tournament_history.functions.createTournament(2, 1, ["hhhh", "hhhq", "hhhw", "hhhe", "hhhr", "hhht", "hhhy", "hhhu"]).build_transaction(
    {
        "chainId": chain_id,
        "gasPrice": w.eth.gas_price,
        "from": address,
        "nonce": nonce + 1,
    }

)

signed_create_tournament_tx = w.eth.account.sign_transaction(create_tournament_tx, private_key=private_key)
create_tournament_tx_hash = w.eth.send_raw_transaction(signed_create_tournament_tx.rawTransaction)
w.eth.wait_for_transaction_receipt(create_tournament_tx_hash)

response = tournament_history.functions.getInitialTournamentMatches(2).call()

for match in response:
    print(f"Match: {match}")
    print(f"Match: Player One ID {match[2]}, Player Two ID {match[3]}, Status: {match[7]}")

# response = tournament_history.functions.getTournament(5461).call()
# print("getting tournament", json.dumps(response))
# add_match_tx = tournament_history.functions.addMatch(5461, 342, 213, 5).build_transaction(
#     {
#         "chainId": chain_id,
#         "gasPrice": w.eth.gas_price,
#         "from": address,
#         "nonce": nonce + 1,
#     }
# )
# signed_add_match_tx = w.eth.account.sign_transaction(add_match_tx, private_key=private_key)
# add_match_tx_hash = w.eth.send_raw_transaction(signed_add_match_tx.rawTransaction)
# w.eth.wait_for_transaction_receipt(add_match_tx_hash)

# response = tournament_history.functions.getTournament(2).call()
# print("getting tournament", json.dumps(response))