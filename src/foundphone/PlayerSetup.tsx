import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "./persistence";
import { personalizeWork } from "./playerSetup";
import type { Work } from "./schema";
import "./player-setup.css";

export function PlayerSetup({ work, children }: { work: Work; children: (work: Work) => ReactNode }) {
  const [personalized, setPersonalized] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  useEffect(() => {
    let active = true;
    setLoading(true);
    setPersonalized(null);
    void db.saves.get(work.id).then((saved) => {
      const existing = saved?.state.variables.playerName;
      if (active && typeof existing === "string" && existing.trim()) {
        setName(existing);
        setPersonalized(personalizeWork(work, existing));
      }
    }).catch(() => {}).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [work.id, work.updatedAt]);
  if (loading) return <p role="status">正在打开手机…</p>;
  if (personalized) return children(personalized);
  return (
    <section className="player-setup" aria-label="设置自己的名字">
      <span className="player-setup-kicker">EXO · 新人经纪人</span>
      <h1>你的名字</h1>
      <form onSubmit={(event) => { event.preventDefault(); if (name.trim()) setPersonalized(personalizeWork(work, name)); }}>
        <label htmlFor="player-name">姓名</label>
        <input id="player-name" autoComplete="nickname" autoFocus maxLength={24} value={name} placeholder="输入你的名字" onChange={(event) => setName(event.target.value)} required />
        <Button type="submit" disabled={!name.trim()}>开始上班 <ArrowRight size={18} /></Button>
      </form>
    </section>
  );
}