GRAPH := ./node_modules/.bin/graph



all: build-testnet

codegen:
	$(GRAPH) codegen

build-base-sepolia: codegen
	$(GRAPH) build --network-file config/networks/testnet.json --network base-sepolia

build-mainnet: codegen
	$(GRAPH) build --network-file config/networks/mainnet.json --network mainnet


