require("dotenv").config({ path: "./.env" });

const { openMessage } = require("curve25519-js");
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

    let response = { msg: "" };

    try {
        if (req.body.tokenId) {
            // Check if user is owner of an NFT and add role
            const metaData = await queryMetadata(req.body.tokenId);
            const pubKey = metaData.nft_dossier.public_metadata.extension.key;
            const uint8key = Uint8Array.from(pubKey);
            const signedMessage = Uint8Array.from(
                req.body.signedMessage.split(",")
            );
            const openedMessage = openMessage(uint8key, signedMessage);
            const discordTag = new TextDecoder().decode(openedMessage);

            if (!openMessage || !discordTag) {
                response.msg = "You could not be verified";
            } else {
                // Fetch for the user from members instead of members.cache. Cache isn't always correct
                const member = await guild.members
                    .fetch()
                    .then((members) =>
                        members.find((member) => member.user.tag === discordTag)
                    );

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
                        response.msg = "Welcome to the Club!!!";
                    }
                }
            }
        } else {
            response.msg = "Invalid Request";
        }
    } catch (error) {
        console.log(error);
        response.msg = "You could not be verified";
    }

    res.end(JSON.stringify(response));
});

const queryMetadata = async (tokenId) => {
    const client = new CosmWasmClient(chainInfo.chainREST);
    const msg = {
        nft_dossier: {
            token_id: tokenId
        }
    };
    const data = await client.queryContractSmart(
        chainInfo.nftContractAddress,
        msg,
        {}
    );
    return data;
};
