import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { login, getMe } from '@/api/auth';
import { getClubs } from '@/api/clubs';
import { useIsInstalled } from '@/hooks/useIsInstalled';
import InstallHelpModal from '@/components/InstallHelpModal';

export default function Login() {
  const navigate = useNavigate();
  const { setTokens, setUser, setClubId } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedClub, setSelectedClub] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const isInstalled = useIsInstalled();

  const { data: clubs = [] } = useQuery({
    queryKey: ['clubs'],
    queryFn: getClubs,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const tokens = await login(username, password);
      setTokens(tokens.access, tokens.refresh);

      const user = await getMe();
      const isAdminOnly = user.is_staff && !user.golfer_profile;

      if (!isAdminOnly && !selectedClub) {
        setError('Seleziona un club');
        setLoading(false);
        return;
      }

      if (selectedClub) setClubId(selectedClub);
      setUser(user);

      navigate(isAdminOnly ? '/gestione/giocatori' : '/match');
    } catch {
      setError('Credenziali non valide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-golf-green p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-golf-green">Golf Training</h1>
          <p className="text-gray-500 text-sm mt-1">Accedi al tuo account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Club</label>
            <select
              value={selectedClub ?? ''}
              onChange={(e) => setSelectedClub(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-golf-green focus:border-transparent"
            >
              <option value="">Seleziona club...</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.ragione_sociale}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-golf-green focus:border-transparent"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-golf-green focus:border-transparent"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-golf-green text-white py-2.5 rounded-lg font-semibold
                       hover:bg-golf-dark transition disabled:opacity-50"
          >
            {loading ? 'Accesso...' : 'Accedi'}
          </button>
        </form>

        {!isInstalled && (
          <button
            onClick={() => setShowInstallHelp(true)}
            className="w-full mt-4 text-xs text-golf-green underline text-center"
          >
            📱 Come installare l'app sul telefono
          </button>
        )}
      </div>

      <InstallHelpModal open={showInstallHelp} onClose={() => setShowInstallHelp(false)} />
    </div>
  );
}
