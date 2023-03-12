import styles from "./layout.module.scss";

export const Footer = () => {
  return <footer className={styles.footer}>© {new Date().getFullYear()} Boerderij bloem</footer>;
};
