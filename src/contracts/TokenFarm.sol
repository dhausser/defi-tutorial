pragma solidity >=0.5.0 <0.8.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm {
  string public name = "Dapp Token Farm";
  address public owner;
  DappToken public dappToken;
  DaiToken public daiToken;

  address[] public stakers;
  mapping(address => uint) public stakingBalance;
  mapping(address => bool) public hasStaked;
  mapping(address => bool) public isStaking;

  constructor(DappToken _dappToken, DaiToken _daiToken) public {
    dappToken = _dappToken;
    daiToken = _daiToken;
    owner = msg.sender;
  }

  // 1. Stakes Tokens (Deposit)
  function stakeTokens(uint _amount) public {
    // Transfer Mock Dai token to this contract for staking
    daiToken.transferFrom(msg.sender, address(this), _amount);

    // Update staking balance
    stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

    // Add user to staker array *only* if they haven't staked already
    if(!hasStaked[msg.sender]) {
      stakers.push(msg.sender);
    }

    // Update stating status
    isStaking[msg.sender] = true;
    hasStaked[msg.sender] = true;
  }

  // 2. Unstaking Tokens (Withdraw)

  // 3. Issuing Token
  function issueTokens() public {
    // Only the owner can call this function
    require(msg.sender == owner, "caller must be the owner");

    // Issue tokens to all stakers
    for (uint i=0; i<stakers.length; i++) {
      address recipient = stakers[i];
      uint balance = stakingBalance[recipient];
      if(balance > 0) {
        dappToken.transfer(recipient, balance);
      }
    }
  }
}
