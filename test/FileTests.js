const File = artifacts.require("File");

require('chai')
.use(require('chai-as-promised'))
.should()

contract('File', (accounts) => {
//Test Here...
let file

describe('Deployment', async () => {
    it('Successful Deployment', async () =>{
        file = await File.deployed()
        const address = file.address
        assert.notEqual(address, null)
        assert.notEqual(address, '')
        assert.notEqual(address, undefined)
        assert.notEqual(address, 0x0)
        console.log(address)
    })
})
})
describe('emission', async () => {
    it("...should emit an event when you send an IPFS address.", 
async () => {
   // Wait for the contract to be deployed
   const file = await File.deployed();
   // Set a variable to false, and create an event listener
   // to set it to true if the event fires.   
   ipfshash = "sample hash"    
   eventEmitted = false
   var event = file.events.ipfsSent()
   await event.watch((err, res) => {
       eventEmitted = true
   })
   // Call the contract function which sends an IPFS address
   await file.sendIPFS(accounts[1], 
       "SampleAddress", { from: accounts[0] });
   // Check if the variable is set to true by this time
   assert.equal(eventEmitted, true, 
       "Sending an IPFS request does not emit an event.");

})
})


