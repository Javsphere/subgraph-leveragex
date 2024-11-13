GRAPH := ./node_modules/.bin/graph
MUSTACHE := ./node_modules/.bin/mustache


all: build-testnet

codegen:
	$(GRAPH) codegen

constants-base-sepolia: codegen
	$(MUSTACHE) config/constants/base-sepolia.json config/constants/template.hbs > generated/constants.ts

constants-base: codegen
	$(MUSTACHE) config/constants/base.json config/constants/template.hbs > generated/constants.ts

build-base-sepolia: constants-base-sepolia
	$(GRAPH) build --network-file config/networks/testnet.json --network base-sepolia

build-base: constants-base
	$(GRAPH) build --network-file config/networks/mainnet.json --network base


