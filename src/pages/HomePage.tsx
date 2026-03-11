import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <>
      <h1>Suimote</h1>
      <Link to="/records">練習記録を見る</Link>
    </>
  );
}
