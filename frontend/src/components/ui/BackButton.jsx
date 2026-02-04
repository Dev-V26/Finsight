import { useNavigate } from "react-router-dom";

export default function BackButton({ to = "/dashboard", children = "← Back" }) {
  const nav = useNavigate();
  return (
    <button
      onClick={() => nav(to)}
      className="text-slate-400 hover:text-slate-200 transition"
    >
      {children}
    </button>
  );
}