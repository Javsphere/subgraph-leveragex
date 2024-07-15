GRAPH := ./node_modules/.bin/graph



all: build-testnet

codegen:
	$(GRAPH) codegen

build-testnet: codegen
	$(GRAPH) build --network-file config/networks/testnet.json --network testnet

build-mainnet: codegen
	$(GRAPH) build --network-file config/networks/mainnet.json --network mainnet


