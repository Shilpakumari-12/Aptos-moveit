import Apt from '../assets/apt.svg';
import { Link } from 'react-router-dom';
import { WalletSelector } from '@aptos-labs/wallet-adapter-ant-design';

export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="header-link">
          <div className="header-item">Swap</div>
        </Link>
        <Link to="/faucet" className="header-link">
          <div className="header-item">Faucet</div>
        </Link>
      </div>
      <div className="header-right">
        <div className="header-item">
          <img src={Apt} alt="Aptos logo" className="apt-logo" />
          Aptos
        </div>
        <div className="connect-button">
          <WalletSelector />
        </div>
      </div>
    </header>
  );
}
