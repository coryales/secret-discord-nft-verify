const keplrConnect = async (chainInfo) => { 
    const chainId = chainInfo.chainId;
    const chainRPC = chainInfo.chainRPC;
    const chainREST = chainInfo.chainREST;

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    while (
        !window.keplr ||
        !window.getEnigmaUtils ||
        !window.getOfflineSignerOnlyAmino
    ) {
        await sleep(100);
    }

    if (!window.keplr) {
        console.log("Keplr not installed");
    } else {
        await window.keplr.experimentalSuggestChain({
            chainId: chainId,
            chainName: chainId,
            rpc: chainRPC,
            rest: chainREST,
            bip44: {
                coinType: 529
            },
            bech32Config: {
                bech32PrefixAccAddr: "secret",
                bech32PrefixAccPub: "secretpub",
                bech32PrefixValAddr: "secretvaloper",
                bech32PrefixValPub: "secretvaloperpub",
                bech32PrefixConsAddr: "secretvalcons",
                bech32PrefixConsPub: "secretvalconspub"
            },
            currencies: [
                {
                    coinDenom: "SCRT",
                    coinMinimalDenom: "uscrt",
                    coinDecimals: 6,
                    coinGeckoId: "secret"
                }
            ],
            feeCurrencies: [
                {
                    coinDenom: "SCRT",
                    coinMinimalDenom: "uscrt",
                    coinDecimals: 6,
                    coinGeckoId: "secret"
                }
            ],
            stakeCurrency: {
                coinDenom: "SCRT",
                coinMinimalDenom: "uscrt",
                coinDecimals: 6,
                coinGeckoId: "secret"
            },
            coinType: 529,
            gasPriceStep: {
                low: 0.1,
                average: 0.25,
                high: 0.3
            }
        });

        await window.keplr.enable(chainId);

        const offlineSigner = window.getOfflineSigner(chainId);
        const enigmaUtils = window.getEnigmaUtils(chainId);

        const accounts = await offlineSigner.getAccounts();

        return [accounts[0].address, offlineSigner, enigmaUtils];
    }
};

const getPermit = async (chainInfo) => {
    const { signature } = await window.keplr.signAmino(
        chainInfo.chainId,
        chainInfo.clientAddress,
        {
            chain_id: chainInfo.chainId,
            account_number: "0", // Must be 0
            sequence: "0", // Must be 0
            fee: {
                amount: [{ denom: "uscrt", amount: "0" }], // Must be 0 uscrt
                gas: "1" // Must be 1
            },
            msgs: [
                {
                    type: "query_permit", // Must be "query_permit"
                    value: {
                        permit_name: "get nfts",
                        allowed_tokens: [chainInfo.nftContractAddress],
                        permissions: ["owner"]
                    }
                }
            ],
            memo: "" // Must be empty
        },
        {
            preferNoSetFee: true, // Fee must be 0, so hide it from the user
            preferNoSetMemo: true // Memo must be empty, so hide it from the user
        }
    );
    chainInfo.clientSignature = signature;
};

export { keplrConnect, getPermit };
