import React from 'react'
import DaiToken from '../abis/DaiToken.json'
import DappToken from '../abis/DappToken.json'
import TokenFarm from '../abis/TokenFarm.json'
import Navbar from './Navbar'
import Main from './Main'
import Web3 from 'web3'
import './App.css'

async function loadBlockChainData(setState) {
  const web3 = window.web3

  const accounts = await web3.eth.getAccounts()
  const account = accounts[0]

  const networkId = await web3.eth.net.getId()

  // // Load DaiToken
  const daiTokenData = DaiToken.networks[networkId]
  let daiToken, daiTokenBalance
  if (daiTokenData) {
    daiToken = new web3.eth.Contract(DaiToken.abi, daiTokenData.address)
    daiTokenBalance = await daiToken.methods.balanceOf(account).call()
    daiTokenBalance = daiTokenBalance.toString()
  } else {
    window.alert('DaiToken contract not deployed to detected network.')
  }

  // Load DappToken
  const dappTokenData = DaiToken.networks[networkId]
  let dappToken, dappTokenBalance
  if (dappTokenData) {
    dappToken = new web3.eth.Contract(DappToken.abi, dappTokenData.address)
    dappTokenBalance = await dappToken.methods.balanceOf(account).call()
    dappTokenBalance = dappTokenBalance.toString()
  } else {
    window.alert('DaiToken contract not deployed to detected network.')
  }

  // Load TokenFarm
  const tokenFarmData = TokenFarm.networks[networkId]
  let tokenFarm, stakingBalance
  if (tokenFarmData) {
    tokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address)
    stakingBalance = await tokenFarm.methods.stakingBalance(account).call()
    stakingBalance = stakingBalance.toString()
  } else {
    window.alert('TokenFarm contract not deployed to detected network.')
  }

  setState({
    account,
    daiToken,
    daiTokenBalance,
    dappToken,
    dappTokenBalance,
    tokenFarm,
    stakingBalance,
    loading: false
  })
}

async function loadWeb3() {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum)
    await window.ethereum.enable()
  } else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider)
  } else {
    window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
  }
}

function App() {
  const [state, setState] = React.useState({
    account: '0x0',
    daiToken: {},
    dappToken: {},
    tokenFarm: {},
    daiTokenBalance: '0',
    dappTokenBalance: '0',
    stakingBalance: '0',
    loading: true
  })

  function stakeTokens(amount) {
    setState({ ...state, loading: true })
    state.daiToken.methods
      .approve(state.tokenFarm._address, amount)
      .send({ from: state.account })
      .on('transactionHash', hash => {
        state.tokenFarm.methods
          .stakeTokens(amount)
          .send({ from: state.account })
          .on('transactionHash', hash => {
            setState({ ...state, loading: false })
          })
      })
  }

  function unstakeTokens() {
    setState({ ...state, loading: true })
    state.tokenFarm.methods
      .unstakeTokens()
      .send({ from: state.account })
      .on('transactionHash', hash => {
        setState({ ...state, loading: false })
      })
  }

  React.useEffect(() => {
    loadWeb3()
    loadBlockChainData(setState)
  }, [])

  if (state.loading)
    return (
      <p id="loader" className="text-center">
        Loading...
      </p>
    )

  return (
    <div>
      <Navbar account={state.account} />
      <div className="container-fluid mt-5">
        <div className="row">
          <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
            <div className="content mr-auto ml-auto">
              <Main
                daiTokenBalance={state.daiTokenBalance}
                dappTokenBalance={state.dappTokenBalance}
                stakingBalance={state.stakingBalance}
                stakeTokens={stakeTokens}
                unstakeTokens={unstakeTokens}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default App
