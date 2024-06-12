import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Header() {
    return (

        <>
            <nav className="p-5  flex flex-row ">
                <img src='https://i.ibb.co/k63986L/logo-Drawproof-100px-1.png' />
                {/* <h1 className="py-4 px-4 font-bold text-3xl text-white"> DrawProof</h1> */}
                <div className="ml-auto py-2 px-4">
                    <ConnectButton />
                </div>
            </nav>
        </>
    )
}