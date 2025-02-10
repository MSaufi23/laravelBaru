import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function WalletConnect() {
    const [account, setAccount] = useState('');
    const [provider, setProvider] = useState(null);
    const [chainId, setChainId] = useState(null);
    const [error, setError] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);

    const SEPOLIA_CHAIN_ID = '0xaa36a7'; // Chain ID for Sepolia testnet
    const SEPOLIA_RPC_URL = 'https://sepolia.infura.io/v3/';

    useEffect(() => {
        // Check if MetaMask is installed
        if (typeof window.ethereum !== 'undefined') {
            // Check if already connected
            window.ethereum.request({ method: 'eth_accounts' })
                .then(handleAccountsChanged)
                .catch(console.error);

            // Setup event listeners
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
            window.ethereum.on('disconnect', handleDisconnect);
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
                window.ethereum.removeListener('disconnect', handleDisconnect);
            }
        };
    }, []);

    const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
            setAccount('');
            setError('Please connect to MetaMask.');
        } else {
            setAccount(accounts[0]);
            setError('');
        }
    };

    const handleChainChanged = (chainId) => {
        setChainId(chainId);
        if (chainId !== SEPOLIA_CHAIN_ID) {
            setError('Please switch to Sepolia testnet.');
        } else {
            setError('');
        }
    };

    const handleDisconnect = () => {
        setAccount('');
        setProvider(null);
        setError('Wallet disconnected');
    };

    const connectWallet = async () => {
        if (isConnecting) return;
        
        try {
            setIsConnecting(true);
            setError('');

            if (!window.ethereum) {
                setError('Please install MetaMask!');
                return;
            }

            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setAccount(accounts[0]);

            // Check if we're on Sepolia testnet
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            setChainId(chainId);

            if (chainId !== SEPOLIA_CHAIN_ID) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: SEPOLIA_CHAIN_ID }],
                    });
                } catch (switchError) {
                    // This error code indicates that the chain has not been added to MetaMask
                    if (switchError.code === 4902) {
                        try {
                            await window.ethereum.request({
                                method: 'wallet_addEthereumChain',
                                params: [{
                                    chainId: SEPOLIA_CHAIN_ID,
                                    chainName: 'Sepolia Testnet',
                                    nativeCurrency: {
                                        name: 'Sepolia ETH',
                                        symbol: 'ETH',
                                        decimals: 18
                                    },
                                    rpcUrls: [SEPOLIA_RPC_URL],
                                    blockExplorerUrls: ['https://sepolia.etherscan.io']
                                }],
                            });
                        } catch (addError) {
                            setError('Failed to add Sepolia network.');
                            return;
                        }
                    } else {
                        setError('Failed to switch to Sepolia network.');
                        return;
                    }
                }
            }

            // Create ethers provider
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            setProvider(provider);
            setError('');

        } catch (err) {
            console.error('Error connecting wallet:', err);
            setError(err.message || 'Failed to connect wallet.');
        } finally {
            setIsConnecting(false);
        }
    };

    const disconnectWallet = () => {
        setAccount('');
        setProvider(null);
        setError('');
    };

    return (
        <div className="flex items-center space-x-4">
            {error && (
                <div className="text-sm text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}
            
            {!account ? (
                <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
                        isConnecting 
                            ? 'bg-purple-400 cursor-not-allowed' 
                            : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                >
                    {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
            ) : (
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {account.slice(0, 6)}...{account.slice(-4)}
                    </span>
                    <button
                        onClick={disconnectWallet}
                        className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
                    >
                        Disconnect
                    </button>
                </div>
            )}
        </div>
    );
} 