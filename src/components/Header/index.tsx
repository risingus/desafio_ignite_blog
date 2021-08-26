import Link from 'next/link';
import { ReactElement } from 'react';
import styles from './header.module.scss';

export default function Header(): ReactElement {
  return (
    <Link href="/">
      <div className={styles.header}>
        <img src="/Logo.svg" alt="logo" />
      </div>
    </Link>
  );
}
