// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {ENS} from "../src/ENS.sol";
import {OnOffChainResolver} from "../src/OnOffChainResolver.sol";

contract OnOffChainResolverScript is Script {
    function setUp() public {}

    function run() public {
        ENS ens = ENS(0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e);

        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_WALLET_PRIVATE_KEY");
        address deployerAddress = vm.rememberKey(deployerPrivateKey);
        console.log("deployer address", deployerAddress);
        vm.startBroadcast(deployerAddress);

        // https://docs.ens.domains/learn/deployments
        // sepolia
        address registrator = 0x5a07C75Ae469Bf3ee2657B588e8E6ABAC6741b4f;

        // If the URL template does not contain the {data} substitution parameter, the client MUST send a POST request
        // data is contract callData

        string memory url = "https://ens-gateway.debuggingfuturecors.workers.dev/lookup/{sender}/{data}.json";
        address[] memory signers = new address[](2);
        signers[0] = 0x7f890c611c3B5b8Ff44FdF5Cf313FF4484a2D794;
        signers[1] = 0x0987654321098765432109876543210987654321;

        address verifier = 0x7f890c611c3B5b8Ff44FdF5Cf313FF4484a2D794;
        address controller = 0x7f890c611c3B5b8Ff44FdF5Cf313FF4484a2D794;  

        // Deploy the OnOffChainResolver contract
        OnOffChainResolver resolver = new OnOffChainResolver(ens, url, signers, verifier, controller);



    }
}
