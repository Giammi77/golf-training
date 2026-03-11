import type { Ranking } from '@/types';

interface LeaderboardTableProps {
  rankings: Ranking[];
}

export default function LeaderboardTable({ rankings }: LeaderboardTableProps) {
  if (!rankings.length) {
    return <p className="text-center text-gray-500 py-4">Nessun giocatore in classifica</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 mx-4 my-2">
      <table className="w-full text-sm">
        <thead className="bg-golf-green text-white">
          <tr>
            <th className="py-2 px-3 text-left w-12">Pos.</th>
            <th className="py-2 px-3 text-left">Giocatore</th>
            <th className="py-2 px-3 text-right w-16">Punti</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rankings.map((r, i) => (
            <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="py-2 px-3 font-bold">{r.posizione ?? '-'}</td>
              <td className="py-2 px-3">{r.golfer_name}</td>
              <td className="py-2 px-3 text-right font-bold">{r.punti}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
