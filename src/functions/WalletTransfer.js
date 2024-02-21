import { ethers } from "ethers"
import { abi, contractAddress } from "../config/contract"

export default paymentTransfer = async (destination , amountInCrypto) => {
    console.log('Enter:', values)
    try {
      // Convert amount to Wei
      const amountInWei = ethers.parseEther(amountInCrypto)
      console.log(amountInWei.toString())
      // Set the contract
      const provider = new ethers.BrowserProvider(window?.ethereum)
      const signer = await provider.getSigner()

      const contract = new ethers.Contract(contractAddress, abi, signer)

      // Execute the publicSaletransfer function
      const tx = await contract.transfer(destination ,amountInWei)
      await tx.wait()
      console.log('Transaction successful!')
      return tx
    } catch (error) {
      console.error('Error:', error)
    }
  }