// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

// Cloned from with IVersionableResolver removed
// https://github.com/ensdomains/ens-contracts/blob/staging/contracts/resolvers/ResolverBase.sol

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

abstract contract ResolverBase is ERC165 {
    mapping(bytes32 => uint64) public recordVersions;

    function isAuthorised(bytes32 node) internal view virtual returns (bool);

    modifier authorised(bytes32 node) {
        require(isAuthorised(node));
        _;
    }
}