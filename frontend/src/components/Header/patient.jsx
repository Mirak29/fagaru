"use client"
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";


export const PatientLink = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [account, setAccount] = useState('');
    const [role, setRole] = useState('');

    useEffect(() => {
        connectToMetaMask();
    }, [isConnected])

    // Sticky Navbar
  const [sticky, setSticky] = useState(false);
  const handleStickyNavbar = () => {
    if (window.scrollY >= 80) {
      setSticky(true);
    } else {
      setSticky(false);
    }
  };

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
            isConnected ? (
                <Link
                href="/patient"
                className={`flex py-2 text-base lg:mr-0 lg:inline-flex lg:px-0 lg:py-6 ${
                  usePathName === "patient"
                    ? "text-primary dark:text-white"
                    : "text-dark hover:text-primary dark:text-white/70 dark:hover:text-white"
                }`}
              >
                Patient
              </Link>) 
              : ("")
            }
        </>
    )
}

export default PatientLink;