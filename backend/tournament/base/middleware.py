from web3 import Web3

class BlockchainMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

        self.web3 = Web3(Web3.HTTPProvider('http://blockchain:9545'))

        if self.web3.is_connected():
            print("Connected to Truffle Blockchain!")
        else:
            print("Failed to connect to Truffle Blockchain!")
        
        def __call__(self, request):
            request.web3 = self.web3
            response = self.get_response(request)

            return response
            