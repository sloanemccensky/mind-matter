import { Link } from "react-router-dom";

export default function Links() {
  return (
    <div className="space-y-4">
      <Link to="/" className="block hover:underline">Homepage</Link>
      <Link to="/journal" className="block hover:underline">Dear Diary</Link>
      <Link to="/mood" className="block hover:underline">Mood Meter</Link>
      <Link to="/gratitude" className="block hover:underline">Gratitude Log</Link>
      <Link to="/evidence" className="block hover:underline">Self-Evidence Board</Link>
    </div>
  );
}
