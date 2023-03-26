import styles from "../styles/general.module.scss";
import { Link } from "react-router-dom";

export const NotFound = () => {
  return (
    <main className="not-found">
      <h1>404 | pagina niet gevonden</h1>
      <p>
        Deze pagina bestaat niet, <Link to="/">Terug naar de homepage</Link>.
      </p>
    </main>
  );
};
