// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console, console2} from "forge-std/Test.sol";

import {ENS} from "../src/ENS.sol";
import {OnOffChainResolver} from "../src/OnOffChainResolver.sol";
import {IExtendedResolver} from "../src/IExtendedResolver.sol";

import {ContentHashResolver} from "../src/ContentHashResolver.sol";
import {TextResolver} from "../src/TextResolver.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract ResolverTest is Test {
    using ECDSA for bytes32;
    OnOffChainResolver public resolver;
    uint256 verifier_key;
    ENS ens = ENS(0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e);

    bytes32 node1 = bytes32("a.eth");

    string key1 = "a";
    string value1 = "123";   

    function setUp() public {
        string memory url = "https://example.com";
        address[] memory signers = new address[](2);
        signers[0] = 0x1234567890123456789012345678901234567890;
        signers[1] = 0x0987654321098765432109876543210987654321;
        // Deploy the OnOffChainResolver contract
        resolver = new OnOffChainResolver(ens, url, signers);

        resolver.setContenthash(node1, "0x123");
        resolver.setText(node1, key1, value1);
    }

    function testInterface() public view {
        bool result = resolver.supportsInterface(type(IExtendedResolver).interfaceId);
        assertEq(result, true); // IExtendedResolver
    }

    function testResolveGateway() public {
        // selector can be anything
        bytes memory callData = abi.encodeWithSelector(OnOffChainResolver.resolve.selector,  abi.encodePacked(node1));


        // TODO fix and check against whole calldata
        // bytes revertData = OnOffChainResolver.OffchainLookup(
        //     address(resolver),
        //     ["https://example.com"],
        //     callData,
        //     OnOffChainResolver.resolveWithProof.selector,
        //     abi.encode(callData, address(resolver))
        // );
             
        // vm.expectRevert(OnOffChainResolver.resolve.selector);

        // bytes memory result = resolver.resolve(abi.encodePacked(node1), callData);
    }

    function testContenthash() public view {
        bytes memory result = resolver.contenthash(node1);
        assertEq(result, "0x123"); 
    }

    function testResolveContenthash() public view {
        // refers packages/contracts/test/TestOnOffChainResolver.js
        bytes memory data = abi.encodeWithSelector(ContentHashResolver.contenthash.selector,  abi.encodePacked(node1));
        bytes memory result = resolver.resolve(abi.encodePacked(node1), data);
        
        // no revert
        assertEq(result, "0x123"); 
        
    }

    
    function testResolveText() public view {
        console.log("name");
        console.logBytes32(node1);
        bytes memory textCall = abi.encodeWithSelector(TextResolver.text.selector, abi.encodePacked(node1), key1);
        bytes memory result = resolver.resolve(abi.encodePacked(node1), textCall);
        
        // no revert
        assertEq(result, bytes(value1)); 
        
    }



}
