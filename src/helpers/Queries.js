import axios from "axios";

const tokenCount = async (chainInfo) => {
    const msg = {
        with_permit: {
            query: {
                num_tokens: {}
            },
            permit: {
                params: {
                    permit_name: "get nfts",
                    allowed_tokens: [chainInfo.nftContractAddress],
                    chain_id: chainInfo.chainId,
                    permissions: ["owner"]
                },
                signature: chainInfo.clientSignature
            }
        }
    };
    const result = await chainInfo.client.queryContractSmart(
        chainInfo.nftContractAddress,
        msg
    );
    return result.num_tokens.count;
};

const queryOwnedTokens = async (chainInfo) => {
    const msg = {
        with_permit: {
            query: {
                tokens: {
                    owner: chainInfo.clientAddress,
                    limit: 300
                }
            },
            permit: {
                params: {
                    permit_name: "get nfts",
                    allowed_tokens: [chainInfo.nftContractAddress],
                    chain_id: chainInfo.chainId,
                    permissions: ["owner"]
                },
                signature: chainInfo.clientSignature
            }
        }
    };
    let data = await chainInfo.client.queryContractSmart(
        chainInfo.nftContractAddress,
        msg,
        {}
    );
    return data.token_list.tokens;
};

const queryMetadata = async (chainInfo, tokenId) => {
    const msg = {
        with_permit: {
            query: {
                nft_dossier: {
                    token_id: tokenId
                }
            },
            permit: {
                params: {
                    permit_name: "get nfts",
                    allowed_tokens: [chainInfo.nftContractAddress],
                    chain_id: chainInfo.chainId,
                    permissions: ["owner"]
                },
                signature: chainInfo.clientSignature
            }
        }
    };
    let data = await chainInfo.client.queryContractSmart(
        chainInfo.nftContractAddress,
        msg,
        {}
    );
    return data;
};

const validatediscord = async (discordTag, chainInfo, tokenId) => {
    debugger;
    return axios.post("http://localhost:5000/validatediscord", {
        discordTag,
        clientAddress: chainInfo.clientAddress,
        clientSignature: chainInfo.clientSignature,
        tokenId
    });
};

export { tokenCount, queryOwnedTokens, queryMetadata, validatediscord };
