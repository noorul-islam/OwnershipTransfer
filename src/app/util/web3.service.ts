import { Injectable } from '@angular/core';
import * as contract from 'truffle-contract';
import { Subject } from 'rxjs/Rx';
declare let require: any;
const Web3 = require('web3');
var Accounts = require('web3-eth-accounts');



declare let window: any;

@Injectable()
export class Web3Service {
  public web3: any;
  public accounts: string[];
  public ready = false;
  public MetaCoin: any;
  public accountsObservable = new Subject<string[]>();

  constructor() {
    window.addEventListener('load', (event) => {
      this.bootstrapWeb3();
    });

  }

  public sign(data, privateKey) {
    console.log("Data: "+data+" ,PrivateKey: "+privateKey);
    var signature = this.web3.eth.accounts.sign(data, privateKey);
    return signature;
  }

  public myFunc() {
    console.log("MyFunc()");
    var acc1 = this.web3.eth.accounts.create();
    console.log(acc1)
    var privateKey = "0x5ccdaffada2560dc53c855252681266c364ae8beeaae0df9816155f33d43b0b9"
    var acc2 = this.web3.eth.accounts.privateKeyToAccount(privateKey);
    console.log(acc2);
    var message = "Hello World!";
    var hash = this.web3.eth.accounts.hashMessage(message);
    console.log(message + ", " + hash)
    var signature = this.web3.eth.accounts.sign(message, privateKey);
    console.log(signature)
    var recover = this.web3.eth.accounts.recover(signature);
    console.log(recover)
  }

  public bootstrapWeb3() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window.web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
      this.web3 = new Web3(window.web3.currentProvider);
    } else {
      console.log('No web3? You should consider trying MetaMask!');

      // Hack to provide backwards compatibility for Truffle, which uses web3js 0.20.x
      Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
    }

    // setInterval(() => this.refreshAccounts(), 100);
    this.refreshAccounts();
    this.myFunc();
  }

  public async artifactsToContract(artifacts) {
    if (!this.web3) {
      const delay = new Promise(resolve => setTimeout(resolve, 100));
      await delay;
      return await this.artifactsToContract(artifacts);
    }

    const contractAbstraction = contract(artifacts);
    contractAbstraction.setProvider(this.web3.currentProvider);
    return contractAbstraction;

  }

  // private refreshAccounts() {
  //   this.web3.eth.getAccounts((err, accs) => {
  //     console.log('Refreshing accounts');
  //     if (err != null) {
  //       console.warn('There was an error fetching your accounts.');
  //       return;
  //     }

  //     // Get the initial account balance so it can be displayed.
  //     if (accs.length === 0) {
  //       console.warn('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
  //       return;
  //     }

  //     if (!this.accounts || this.accounts.length !== accs.length || this.accounts[0] !== accs[0]) {
  //       console.log('Observed new accounts');

  //       console.log("accs: "+accs);
  //       this.accountsObservable.next(accs);     
  //       this.accounts = accs;
  //     }

  //     this.ready = true;
  //   });
  // }

  private refreshAccounts() {
    this.web3.eth.getAccounts((err, accs) => {
      console.log('Refreshing accounts');
      if (err != null) {
        console.warn('There was an error fetching your accounts.');
        return;
      }

      // Get the initial account balance so it can be displayed.
      if (accs.length === 0) {
        console.warn('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
        return;
      }

      if (!this.accounts || this.accounts.length !== accs.length || this.accounts[0] !== accs[0]) {
        console.log('Observed new accounts');

        console.log("accs: " + accs);
        this.accountsObservable.next(accs);
        this.accounts = accs;
      }

      this.ready = true;
    });
  }
}
