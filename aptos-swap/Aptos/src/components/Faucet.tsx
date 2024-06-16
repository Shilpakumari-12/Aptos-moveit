import { useWallet } from '@aptos-labs/wallet-adapter-react'

const faucet_contract =
  '0x51b93af89c1ad9d13251853e673c7bedd8535f0abe9bf092290b78f1f7454b1d'
let faucet_map = [
  {
    name: 'USDC',
    coin_type: `${faucet_contract}::faucet::USDC`,
  },

  {
    name: 'WETH',
    coin_type: `${faucet_contract}::faucet::WETH`,
  },
  {
    name: 'WBTC',
    coin_type: `${faucet_contract}::faucet::WBTC`,
  },
  ,
]

export function Faucet() {
  const { signAndSubmitTransaction } = useWallet()

  return (
    <>
      <div className="tradeBox">
        <div className="tradeBoxHeader">
          <h4>Faucet</h4>
        </div>
        <div className="inputs">
          {faucet_map.map((item) => (
            <>
              <button
                onClick={async () => {
                  try {
                    await signAndSubmitTransaction({
                      // @ts-ignore
                      data: {
                        function: `${faucet_contract}::faucet::mint`,
                        typeArguments: [item?.coin_type || ''],
                        functionArguments: ['1000000000'],
                      },
                    })
                  } catch (e) {
                    console.log(e)
                  }
                }}
              >
                {item?.name}
              </button>
            </>
          ))}
        </div>
      </div>
    </>
  )
}
