require("dotenv").config({ path: "./.env" });

const express = require("express");
const cors = require("cors");
const { CosmWasmClient } = require("secretjs");
const { Client, Intents } = require("discord.js");

const options = {
    origin: process.env.CORS_ORIGINS
};
const app = express();
app.use(express.json());
app.use(cors(options));

const port = process.env.PORT || 5000;

const chainInfo = {
    chainId: process.env.CHAIN_ID,
    chainREST: process.env.CHAIN_REST,
    nftContractAddress: process.env.NFT_CONTRACT_ADDRESS
};

const discordToken = process.env.DISCORD_TOKEN;
const guildId = process.env.DISCORD_GUILD_ID;
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS]
});
client.login(discordToken);

// This displays message that the server running and listening to specified port
app.listen(port, () => console.log(`Listening on port ${port}`)); //Line 6

// Test Route
app.get("/test", (req, res) => {
    res.send({ express: "YOUR EXPRESS BACKEND IS CONNECTED TO REACT" });
});

app.post("/validatediscord", async function (req, res) {
    const guild = client.guilds.cache.get(guildId);
    const roleToAdd = guild.roles.cache.find((r) => r.name === "Wolf");

    // Fetch for the user from members instead of members.cache. Cache isn't always correct
    const member = await guild.members
        .fetch()
        .then((members) =>
            members.find((member) => member.user.tag === req.body.discordTag)
        );
    let response = { msg: "" };

    try {
        // Send message back if user is not part of the discord guild
        if (!member) {
            response.msg = "You are not a member of the discord";
        } else {
            const userRole = member.roles.cache.find(
                (r) => r.id === roleToAdd.id
            );

            // If user tries to verify more than once tell them they are already verified
            if (userRole) {
                response.msg = "You are already a verified member";
            } else {
                // Check if user is owner of an NFT and add role
                // If anything is wrong in the request such as an invalid tokenId or sig then it'll drop into the catch
                const metaData = await queryMetadata(
                    req.body.clientSignature,
                    req.body.tokenId
                );

                if (
                    metaData.nft_dossier &&
                    metaData.nft_dossier.owner === req.body.clientAddress
                ) {
                    member.roles.add(roleToAdd);
                    member.send(
                        "Welcome to the Club! You now have the role of " +
                            roleToAdd.name
                    );

                    response.msg = "Welcome to the Club!!!";
                } else {
                    response.msg = "You could not be verified";
                }
            }
        }
    } catch (error) {
        response.msg = "You could not be verified";
    }

    res.end(JSON.stringify(response));
});

const queryMetadata = async (clientSignature, tokenId) => {
    const client = new CosmWasmClient(chainInfo.chainREST);

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
                signature: clientSignature
            }
        }
    };
    const data = await client.queryContractSmart(
        chainInfo.nftContractAddress,
        msg,
        {}
    );
    return data;
};
