# How it works
https://user-images.githubusercontent.com/11604549/164133916-a8ac4c21-d287-434a-b205-d8811b98bb21.mov 

### What this sample code does
- Uses a ReactJs app to 
  - Take in a user's discord tag
  - Creates a signing signature and the tokenId of a Secret Network NFT they hold related to the set contract address and makes a request to a nodejs api
- Uses a NodeJs api to
  - Validate that the user is the owner of the Secret Network NFT sent to the POST
  - Adds a role to the user in the set Discord Guild if the user's tag exists and is in the guild already
  - Send a private message from the bot to the user letting them know they have a new role.


### Configuring Bot
- Create an application in the discord developer portal.
- Select the bot tab
  - Check the boxes for **Manage Roles** and **Send Messages** permissions
  - Guild_Member privledged gateway must be turned on to query for guild Members
- Then generate an api Token
- Click on OAuth2 URL Generator and select bot. Then check the boxes for Manage Roles and Send Messages permissions again. 
- Use the generated url to add the bot to your discord server.
- **Make sure the bot has a role that is higher than the roles it will assign or else you will get a 403 error**

### Update the .env with your values
>REACT_APP_CHAIN_REST="" 
>
>REACT_APP_NFT_CONTRACT_ADDRESS=""
