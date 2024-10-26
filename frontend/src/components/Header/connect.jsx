"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";


export const ConnectComponent = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [account, setAccount] = useState('');
    const [role, setRole] = useState('');

    useEffect(() => {
        connectToMetaMask();
    }, [isConnected])

  const usePathName = usePathname();

    const connectToMetaMask = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setAccount(accounts[0]);
                setIsConnected(true)
                console.log("---", accounts)
            } catch (error) {
                console.error("User denied account access");
            }
        } else {
            console.error("MetaMask not detected");
        }
    }
    return (
        <>
            {
                !isConnected ? (
                    <div className="flex right-0 items-center pr-16 lg:pr-0">
                        <button
                            onClick={connectToMetaMask}
                            className="ease-in-up shadow-btn hover:shadow-btn-hover rounded-sm bg-primary px-8 py-3 text-base font-medium text-white transition duration-300 hover:bg-opacity-90 md:block md:px-9 lg:px-6 xl:px-9"
                        >
                            Se connecter
                        </button>
                    </div>
                ) : (<Link
                    href="/patient"
                    className="ease-in-up shadow-btn hover:shadow-btn-hover rounded-sm bg-blue-950	 px-8 py-5 text-base font-medium text-white transition duration-300 hover:bg-opacity-90 md:block md:px-9 lg:px-6 xl:px-9"
                  >
                    Dossiers
                  </Link>)
            }
        </>

    )
}

export default ConnectComponent;