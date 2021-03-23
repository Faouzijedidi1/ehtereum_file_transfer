import React, { Component } from "react";

import File from "./contracts/File.json";
import Web3 from 'web3';
import ipfs from "./ipfs";

import "./App.css";


class App extends Component {

  constructor(props){
    super(props)
    this.state = {
      web3:null,
      accounts:null,
      address:null,
      contract:null,
      ipfsFileHash:null,
      formIPFS:"",
      formAddress:"",
      receivedIPFS:""
    };
    this.handleChangeAddress = this.handleChangeAddress.bind(this);
    this.handleChangeIPFS= this.handleChangeIPFS.bind(this);
    this.handleSend = this.handleSend.bind(this);
    this.handleReceiveIPFS = this.handleReceiveIPFS.bind(this);
  }

  handleChangeAddress(event){
    this.setState({formAddress: event.target.value});
  }

  handleChangeIPFS(event){
    this.setState({formIPFS: event.target.value});
  }

  handleSend(event){
    event.preventDefault();
    const contract = this.state.contract
    const account = this.state.accounts[0]

    document.getElementById('notif-form').reset()
    this.setState({showNotification: true});
    contract.methods.sendIPFS(this.state.formAddress, this.state.formIPFS).send({from: account})
    .then(result => {
      this.setState({formAddress:""});
      this.setState({formIPFS: ""})
    })
  }

  handleReceiveIPFS(event){
    event.preventDefault();
    const contract = this.state.contract
    const account = this.state.accounts[0]
    contract.methods.checkInbox().send({from: account})
  }

  async loadWeb3() {
    if (window.ethereum){
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    if(window.web3){
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else{
      window.alert('Please Install MetaMask')
    }
  }

  async loadBlockchainData(){
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({accounts: accounts})
    console.log(accounts)
    const netId = await web3.eth.net.getId()
    console.log(netId)
    const networkData = File.networks[netId]
    if(networkData){
      const abi = File.abi
      const address = networkData.address
      const txHash = networkData.transactionHash
      this.setState({txHash:txHash})
      this.setState({address: address})
      const contract = new web3.eth.Contract(abi, address)
      this.setState({contract: contract})
      console.log(contract)
      this.setEventListeners();
    }
    else{
      window.alert('Smart Contract Not deployed')
    }
    
  }
  state = { storageValue: 0, web3: null, accounts: null, contract: null };

  // componentDidMount = async () => {
  //   try {
  //     // Get network provider and web3 instance.
  //     const web3 = await getWeb3();

  //     // Use web3 to get the user's accounts.
  //     const accounts = await web3.eth.getAccounts();

  //     // Get the contract instance.
  //     const networkId = await web3.eth.net.getId();
  //     const deployedNetwork = File.networks[networkId];
  //     const instance = new web3.eth.Contract(
  //       File.abi,
  //       deployedNetwork && deployedNetwork.address,
  //     );

  //     // Set web3, accounts, and contract to the state, and then proceed with an
  //     // example of interacting with the contract's methods.
  //     this.setState({ web3, accounts, contract: instance });
  //     this.setEventListeners();
  //   } catch (error) {
  //     // Catch any errors for any of the above operations.
  //     alert(
  //       `Failed to load web3, accounts, or contract. Check console for details.`,
  //     );
  //     console.error(error);
  //   }
  // };
  async componentWillMount(){
    try {
    
    await this.loadWeb3();
    await this.loadBlockchainData();
  } catch (error) {  
        // Catch any errors for any of the above operations.
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`,
        );
        console.error(error);
      }
  }

  capFile = (event) =>{
    event.preventDefault();
    console.log('.......................File Captured...................')
    //Process File For ipfs
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () =>{
      this.setState({buffer: Buffer(reader.result)})
      console.log('buffer', this.state.buffer)
    };
  };


  onIpfsSubmit = async (event) =>{
    event.preventDefault();
    await ipfs.add(this.state.buffer, (err,ipfsFileHash) =>{
      console.log(err,ipfsFileHash);
      this.setState({ipfsFileHash:ipfsFileHash[0].hash});
    })
  };

  setEventListeners(){
    this.state.contract.events.inboxResponse().on('data', result => {
      this.setState({receivedIPFS: result.returnValues.response})
      console.log(result.returnValues.response)
    }
    );
  }


  render() {
    return (
      <div className="App">
        <nav className="navbar navbar-dark navbar-static-top bg-dark p-3 shadow">
          <a className="navbar-brand " href="#"> Blockchain File transfer App </a>
          <ul className="navbar-nav">
                  <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
                    <small className="text-white">{this.state.accounts}</small>
                  </li>
                </ul>
        </nav>

        <div className="container">
          <div className="row">
            <main role="main" className="col text-center">
            &nbsp;

    
              <div className="content mr-auto ml-auto">

                &nbsp;
                <h2>Upload File To Transfer</h2>
                &nbsp;
                <form id="ipfs-hash-form" onSubmit={this.onIpfsSubmit}>
                  
                  <input type='file' onChange={this.capFile} />
                  <input type='submit' value='Upload' className="btn btn-primary"/>
                </form>
                &nbsp;
                <p>Your IPFS hash is: {this.state.ipfsFileHash}</p>
                &nbsp;
                <h2>Transfer File</h2>
                <p>&nbsp;</p>
                <form id="notif-form" className="scep-form" onSubmit={this.handleSend}>
                <div class="form-group row">
                  <label>Receiver Address:</label>
                    <input type="text" value={this.state.value} onChange={this.handleChangeAddress} className="form-control"/>
                 
                  <label>IPFS Hash:</label>
                    <input type="text" value={this.state.value} onChange={this.handleChangeIPFS} className="form-control"/>

                    </div>
                  <button type='submit' className="btn btn-primary btn-lg btn-block">Send Now</button>
                  
              </form>
              <p>&nbsp;</p>
              <p>&nbsp;</p>
              <h2>3. Receive Notif Here </h2>
              <button onClick={this.handleReceiveIPFS} className="btn btn-primary btn-lg btn-block">Receive File</button>
              <h3>Received File Hash: {this.state.receivedIPFS}</h3>
              <a href={`https://ipfs.infura.io/ipfs/${this.state.receivedIPFS}`} target='_blank' className="btn btn-primary btn-lg btn-block" >Open File</a>

              </div>
            </main>
          </div>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
          <tr>
                  <td> Received IPFS Hash</td>
                  <td>{this.state.receivedIPFS} &nbsp;&nbsp;<a href={`https://ipfs.infura.io/ipfs/${this.state.receivedIPFS}`} target='_blank' className="btn btn-primary">Open File</a></td>
          </tr>
          <tr>
                  <td>Account</td>
                  <td>{this.state.accounts}</td>
          </tr>
          <tr>
                  <td>Contract Address</td>
                  <td>{this.state.address}</td>
          </tr>
          <tr>
                  <td>Transaction Hash</td>
                  <td>{this.state.txHash}</td>
          </tr>

          </tbody>
        </table>
    </div>
    );
  }
}

export default App;
