import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerGolfer, login, getMe } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import InstallHelpModal from '@/components/InstallHelpModal';
import { useIsInstalled } from '@/hooks/useIsInstalled';

export default function Register() {
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();
  const isInstalled = useIsInstalled();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nrTessera, setNrTessera] = useState('');
  const [hcp, setHcp] = useState('54');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [showInstallHelp, setShowInstallHelp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerGolfer({
        username,
        password,
        first_name: firstName,
        last_name: lastName,
        email: email || undefined,
        nr_tessera: nrTessera || undefined,
        hcp: hcp ? Number(hcp) : undefined,
      });
      const tokens = await login(username, password);
      setTokens(tokens.access, tokens.refresh);
      const user = await getMe();
      setUser(user);
      setRegistered(true);
      if (!isInstalled) {
        setShowInstallHelp(true);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { username?: string[]; detail?: string } } })
          ?.response?.data?.username?.[0] ??
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Registrazione fallita. Riprova.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (registered && !showInstallHelp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-golf-green p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 text-center">
          <h1 className="text-xl font-bold text-golf-green mb-2">Registrazione completata! 🎉</h1>
          <p className="text-sm text-gray-600 mb-4">
            Ora puoi selezionare il tuo club e iniziare a giocare.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-golf-green text-white py-2.5 rounded-lg font-semibold"
          >
            Vai al login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-golf-green p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center mb-5">
          <h1 className="text-2xl font-bold text-golf-green">Benvenuto!</h1>
          <p className="text-gray-500 text-xs mt-1">Registrati a Golf Training</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Nome"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <input
              placeholder="Cognome"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="email"
            placeholder="Email (facoltativa)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="password"
            placeholder="Password (min. 6 caratteri)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Nr. Tessera"
              value={nrTessera}
              onChange={(e) => setNrTessera(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="number"
              step="0.1"
              placeholder="HCP"
              value={hcp}
              onChange={(e) => setHcp(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-golf-green text-white py-2.5 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? 'Registrazione...' : 'Registrati'}
          </button>
        </form>

        <div className="mt-4 text-center text-xs">
          <button
            onClick={() => navigate('/login')}
            className="text-golf-green underline"
          >
            Hai gia' un account? Accedi
          </button>
        </div>
      </div>

      <InstallHelpModal
        open={showInstallHelp}
        onClose={() => {
          setShowInstallHelp(false);
          navigate('/login');
        }}
      />
    </div>
  );
}
