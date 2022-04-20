import { useState } from "react";
import { keplrConnect, getPermit } from "../helpers/KeplrConnect";
import { SigningCosmWasmClient } from "secretjs";
import { queryOwnedTokens, validatediscord } from "../helpers/Queries";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Snackbar from "@mui/material/Snackbar";
import CircularProgress from "@mui/material/CircularProgress";
import "./main.css";

const darkTheme = createTheme({
    palette: {
        mode: "dark"
    }
});

const chainInfo = {
    chainId: process.env.REACT_APP_CHAIN_ID,
    chainREST: process.env.REACT_APP_CHAIN_REST,
    nftContractAddress: process.env.REACT_APP_NFT_CONTRACT_ADDRESS,
    client: null,
    clientAddress: null,
    offlineSigner: null,
    clientSignature: null
};

function Main() {
    const [discordTag, setDiscordTag] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState(false);
    const [isLoading, setisLoading] = useState(false);

    const handleConnect = async () => {
        let enigmaUtils;
        [chainInfo.clientAddress, chainInfo.offlineSigner, enigmaUtils] =
            await keplrConnect(chainInfo);

        chainInfo.client = new SigningCosmWasmClient(
            chainInfo.chainREST,
            chainInfo.clientAddress,
            chainInfo.offlineSigner,
            enigmaUtils
        );
    };

    const validateDiscordClick = async () => {
        if (discordTag.length > 2) {
            await handleConnect();

            if (chainInfo.clientSignature === null) {
                await getPermit(chainInfo);
            }

            if (chainInfo.clientSignature) {
                setisLoading(true);
                const owned = await queryOwnedTokens(chainInfo);
                if (owned.length > 0) {
                    const response = await validatediscord(
                        discordTag,
                        chainInfo,
                        owned[0]
                    );
                    setisLoading(false);
                    setSnackbarMsg(response.data.msg);
                    setOpenSnackbar(true);
                }
            }
        }
    };

    const handleDiscordTagChange = (event) => {
        setDiscordTag(event.target.value);
    };

    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setOpenSnackbar(false);
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <div className="main">
                <h2>Discord Secret Network NFT Validator</h2>
                <div id="discord-form-container">
                    <h3>Join the Club</h3>
                    <div id="discord-tag-input">
                        <TextField
                            label="Discord Tag"
                            placeholder="Tag#158"
                            variant="outlined"
                            onChange={handleDiscordTagChange}
                        />
                    </div>
                    <div className="button-container">
                        <Button
                            variant="contained"
                            onClick={validateDiscordClick}
                            className="connect-btn"
                        >
                            Join The Club
                        </Button>
                        {isLoading && (
                            <CircularProgress className="progress-spinner" />
                        )}
                    </div>
                </div>
            </div>
            <Snackbar
                className="snackbar"
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={handleClose}
                message={snackbarMsg}
            />
        </ThemeProvider>
    );
}

export default Main;
