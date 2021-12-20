import { useEffect, useMemo, useState} from "react";
import { ThirdwebSDK } from "@3rdweb/sdk";
//import thirdweb provider
import { useWeb3 } from "@3rdweb/hooks";

// We instatiate the sdk on Rinkeby.
const sdk = new ThirdwebSDK("rinkeby");

// We can grab a reference to our ERC-1155 contract.
const bundleDropModule = sdk.getBundleDropModule(
  "0x7E4e74db6F5356aF7C3D6f8a7e6410C0d5d1056F",
);

const App = () => {

  //Use connectWallet hook provided by thirdweb
  const { connectWallet, address, error, provider} = useWeb3();
  console.log("Wallet Address:", address);

  // The signer is required to sign transactions on the blockchain.
  // Without it we can only read data, not write.
  const signer = provider ? provider.getSigner() : undefined;

  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  // isClaiming lets us easily keep a loading state while the NFT is minting.
  const [isClaiming, setIsClaiming] = useState(false);

  // Another useEffect!
  useEffect(() => {
    // We pass the signer to the sdk, which enables us to interact with
    // our deployed contract!
    sdk.setProviderOrSigner(signer);
  }, [signer]);

  useEffect(() => {
  // If they don't have an connected wallet, exit!
    if (!address) {
     return;
    }
      
  // Check if the user has the NFT by using bundleDropModule.balanceOf
  return bundleDropModule
   .balanceOf(address, "0")
   .then((balance) => {
      // If balance is greater than 0, they have our NFT!
     if (balance.gt(0)) {
      setHasClaimedNFT(true);
      console.log("🌟 this user has a membership NFT!")
      } else {
        setHasClaimedNFT(false);
        console.log("😭 this user doesn't have a membership NFT.")
        }
      })
      .catch((error) => {
        setHasClaimedNFT(false);
        console.error("failed to nft balance", error);
      });
    }, [address]);

  //Case User has not connected its wallet - ask him to connect it
  if (!address) {
    return (
      <div className="landing">
        <h1>Welcome to MetaDAO</h1>
        <button onClick={() => connectWallet("injected")} className="btn-hero">
          Connect your wallet to mint your access NFT!
        </button>
      </div>
    );
  }

  //Case user already owns the DAO Acess NFT
  if (hasClaimedNFT) {
    return (
      <div className="member-page">
        <h1>🍪DAO Member Page</h1>
        <p>You are already a member of METADAO!</p>
      </div>
    );
  };

  const mintNft = () => {
    setIsClaiming(true);
    // Call bundleDropModule.claim("0", 1) to mint nft to user's wallet.
    bundleDropModule
    .claim("0", 1)
    .catch((err) => {
      console.error("failed to claim", err);
      setIsClaiming(false);
    })
    .finally(() => {
      // Stop loading state.
      setIsClaiming(false);
      // Set claim state.
      setHasClaimedNFT(true);
      // Show user their fancy new NFT!
      console.log(
        `🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0`
      );
    });
  }

  // Render mint nft screen.
  return (
    <div className="mint-nft">
      <h1>Mint your free 🍪DAO Membership NFT</h1>
      <button
        disabled={isClaiming}
        onClick={() => mintNft()}
      >
        {isClaiming ? "Minting..." : "Mint your nft (FREE)"}
      </button>
    </div>
  );
};

export default App;