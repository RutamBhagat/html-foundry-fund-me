import { abi, contractAddress } from "./constants.js"

import { ethers } from "./ethers-6.7.esm.min.js"

const connectButton = document.getElementById("connectButton")
const withdrawButton = document.getElementById("withdrawButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
connectButton.onclick = connect
withdrawButton.onclick = withdraw
fundButton.onclick = fund
balanceButton.onclick = getBalance

function showToast(message, type = "info") {
  const toastContainer = document.getElementById("toastContainer")
  const toast = document.createElement("div")
  toast.className = `mb-4 p-4 rounded-md text-white ${
    type === "error" ? "bg-red-500" : "bg-blue-500"
  } transition-opacity duration-300`
  toast.textContent = message

  toastContainer.appendChild(toast)

  setTimeout(() => {
    toast.classList.add("opacity-0")
    setTimeout(() => {
      toastContainer.removeChild(toast)
    }, 300)
  }, 3000)
}

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await ethereum.request({ method: "eth_requestAccounts" })
      const chainId = await ethereum.request({ method: "eth_chainId" })
      if (chainId !== "0xaa36a7") {
        // Sepolia's chain ID
        try {
          await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }], // Sepolia's chain ID
          })
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: "0xaa36a7",
                    chainName: "Sepolia Testnet",
                    nativeCurrency: {
                      name: "Sepolia Ether",
                      symbol: "SEP",
                      decimals: 18,
                    },
                    rpcUrls: ["https://rpc.sepolia.org"],
                    blockExplorerUrls: ["https://sepolia.etherscan.io"],
                  },
                ],
              })
            } catch (addError) {
              console.error("Failed to add Sepolia network", addError)
              showToast("Failed to add Sepolia network", "error")
              return
            }
          } else {
            console.error("Failed to switch to Sepolia network", switchError)
            showToast("Failed to switch to Sepolia network", "error")
            return
          }
        }
      }
      connectButton.innerHTML = "Connected"
      const accounts = await ethereum.request({ method: "eth_accounts" })
      console.log(accounts)
      showToast("Wallet connected successfully")
    } catch (error) {
      console.log(error)
      showToast("Failed to connect wallet", "error")
    }
  } else {
    connectButton.innerHTML = "Please install MetaMask"
    showToast("Please install MetaMask", "error")
  }
}

async function withdraw() {
  console.log(`Withdrawing...`)
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.BrowserProvider(window.ethereum)
    await provider.send("eth_requestAccounts", [])
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      console.log("Processing transaction...")
      showToast("Processing withdrawal...")
      const transactionResponse = await contract.withdraw()
      await transactionResponse.wait(1)
      console.log("Done!")
      showToast("Withdrawal successful")
    } catch (error) {
      console.log(error)
      showToast("Withdrawal failed", "error")
    }
  } else {
    withdrawButton.innerHTML = "Please install MetaMask"
    showToast("Please install MetaMask", "error")
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value
  console.log(`Funding with ${ethAmount}...`)
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.BrowserProvider(window.ethereum)
    await provider.send("eth_requestAccounts", [])
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      showToast("Processing funding...")
      const transactionResponse = await contract.fund(
        2,
        "0x0000000000000000000000000000000000000000",
        {
          value: ethers.parseEther(ethAmount),
        }
      )
      await transactionResponse.wait(1)
      showToast("Funding successful")
    } catch (error) {
      console.log(error)
      showToast("Funding failed", "error")
    }
  } else {
    fundButton.innerHTML = "Please install MetaMask"
    showToast("Please install MetaMask", "error")
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.BrowserProvider(window.ethereum)
    try {
      const balance = await provider.getBalance(contractAddress)
      console.log(ethers.formatEther(balance))
      showToast(`Balance: ${ethers.formatEther(balance)} ETH`)
    } catch (error) {
      console.log(error)
      showToast("Failed to get balance", "error")
    }
  } else {
    balanceButton.innerHTML = "Please install MetaMask"
    showToast("Please install MetaMask", "error")
  }
}
