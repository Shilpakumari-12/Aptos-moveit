import { useState, useEffect } from 'react';
import { Input, Modal, message } from 'antd';
import { formatUnits, parseUnits } from 'viem';
import { ArrowDownOutlined, DownOutlined } from '@ant-design/icons';
import tokenList from '../assets/tokenList.json';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Aptos, AptosConfig, MoveStructId, Network } from '@aptos-labs/ts-sdk';

const contract = '0x51b93af89c1ad9d13251853e673c7bedd8535f0abe9bf092290b78f1f7454b1d'; // Your contract address here

const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

function Swap() {
  const [messageApi, contextHolder] = message.useMessage();
  const [tokenOneAmount, setTokenOneAmount] = useState('0');
  const [tokenTwoAmount, setTokenTwoAmount] = useState('0');
  const [tokenOne, setTokenOne] = useState(tokenList[0]);
  const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [tokenOnePool, setTokenOnePool] = useState('0');
  const [tokenTwoPool, setTokenTwoPool] = useState('0');

  const {
    connected: isConnected,
    submitTransaction,
    signTransaction,
    account,
  } = useWallet();

  function getTokenPool(tokenOneType: MoveStructId, tokenTwoType: MoveStructId) {
    setTokenOnePool('0');
    setTokenTwoPool('0');
    aptos
      .view({
        payload: {
          function: `${contract}::pool::get_liqidity`,
          typeArguments: [tokenOneType, tokenTwoType],
          functionArguments: [],
        },
      })
      .then((data) => {
        setTokenOnePool(data[0]);
        setTokenTwoPool(data[1]);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  function changeAmount(e: React.ChangeEvent<HTMLInputElement>) {
    setTokenOneAmount(e.target.value);
    const amount = parseFloat(e.target.value);

    if (amount) {
      setTokenTwoAmount(
        formatUnits(
          (BigInt(tokenTwoPool) * parseUnits(e.target.value, tokenOne.decimals)) /
          (BigInt(tokenOnePool) + parseUnits(e.target.value, tokenOne.decimals)),
          tokenTwo.decimals
        )
      );
    } else {
      setTokenTwoAmount('0');
    }
  }

  function switchTokens() {
    setTokenOneAmount('0');
    setTokenTwoAmount('0');
    const one = tokenOne;
    const two = tokenTwo;
    setTokenOne(two);
    setTokenTwo(one);
    getTokenPool(tokenOne.address as MoveStructId, tokenTwo.address as MoveStructId);
  }

  function openModal(index: number) {
    setChangeToken(index);
    setIsOpen(true);
  }

  function modifyToken(index: number) {
    setTokenOneAmount('0');
    setTokenTwoAmount('0');
    if (changeToken === 1) {
      setTokenOne(tokenList[index]);
      getTokenPool(tokenList[index].address as MoveStructId, tokenTwo.address as MoveStructId);
    } else {
      setTokenTwo(tokenList[index]);
      getTokenPool(tokenOne.address as MoveStructId, tokenList[index].address as MoveStructId);
    }
    setIsOpen(false);
  }

  useEffect(() => {
    getTokenPool(tokenList[0].address as MoveStructId, tokenList[1].address as MoveStructId);
  }, []);

  useEffect(() => {
    messageApi.destroy();
    if (isLoading) {
      messageApi.open({
        type: 'loading',
        content: 'Transaction is Pending...',
        duration: 5,
      }).then(() => {
        setIsLoading(false);
      });
    }
  }, [isLoading, messageApi]);

  useEffect(() => {
    messageApi.destroy();
    if (isSuccess) {
      messageApi.open({
        type: 'success',
        content: 'Transaction Successful',
        duration: 1.5,
      }).then(() => {
        setIsSuccess(false);
        setIsLoading(false);
      });
    }
  }, [isSuccess, messageApi]);

  useEffect(() => {
    messageApi.destroy();
    if (isError) {
      messageApi.open({
        type: 'error',
        content: 'Transaction Failed',
        duration: 1.5,
      }).then(() => {
        setIsError(false);
        setIsLoading(false);
      });
    }
  }, [isError, messageApi]);

  return (
    <>
      {contextHolder}
      <Modal
        open={isOpen}
        footer={null}
        onCancel={() => setIsOpen(false)}
        title="Select a token"
      >
        <div className="modalContent">
          {tokenList?.map((item, index) => (
            <div
              className="tokenChoice"
              key={index}
              onClick={() => modifyToken(index)}
            >
              <img src={item.img} alt={item.ticker} className="tokenLogo" />
              <div className="tokenChoiceNames">
                <div className="tokenName">{item.name}</div>
                <div className="tokenTicker">{item.ticker}</div>
              </div>
            </div>
          ))}
        </div>
      </Modal>
      <div className="tradeBox">
        <div className="tradeBoxHeader">
          <h4>Swap</h4>
        </div>
        <div className="inputs">
          <Input
            placeholder="0"
            value={tokenOneAmount}
            onChange={changeAmount}
            disabled={tokenOnePool === '0' || tokenTwoPool === '0'}
          />
          <Input placeholder="0" value={tokenTwoAmount} disabled={true} />
          <div className="switchButton" onClick={switchTokens}>
            <ArrowDownOutlined className="switchArrow" />
          </div>
          <div className="assetOne" onClick={() => openModal(1)}>
            <img src={tokenOne.img} alt="assetOneLogo" className="assetLogo" />
            {tokenOne.ticker}
            <DownOutlined />
          </div>
          <div className="assetTwo" onClick={() => openModal(2)}>
            <img src={tokenTwo.img} alt="assetOneLogo" className="assetLogo" />
            {tokenTwo.ticker}
            <DownOutlined />
          </div>
        </div>
        <button
          className="swapButton"
          disabled={tokenOneAmount === '0' || !isConnected}
          onClick={async () => {
            setIsLoading(true);
            const token_one_amount = parseUnits(
              parseFloat(tokenOneAmount).toString(),
              tokenOne.decimals
            );

            const txn_wait_sign = await aptos.transaction.build.simple({
              sender: account?.address || '',
              data: {
                function: `${contract}::pool::swap`,
                typeArguments: [tokenOne.address, tokenTwo.address],
                functionArguments: [token_one_amount.toString(), 0],
              },
            });

            const txn_with_sign = await signTransaction(txn_wait_sign);

            submitTransaction({
              transaction: txn_wait_sign,
              senderAuthenticator: txn_with_sign,
            }).then((txn) => {
              aptos
                .waitForTransaction({
                  transactionHash: txn.hash,
                })
                .then(() => {
                  setIsSuccess(true);
                })
                .catch(() => {
                  setIsError(true);
                })
                .finally(() => {
                  setTokenOneAmount('0');
                  setTokenTwoAmount('0');
                  getTokenPool(
                    tokenOne.address as MoveStructId,
                    tokenTwo.address as MoveStructId
                  );
                });
            });
          }}
        >
          Swap
        </button>
      </div>
    </>
  );
}

export default Swap;
