import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getMe, updateMe, changePassword, resetMyScores } from '@/api/auth';

export default function ProfilePage() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [nrTessera, setNrTessera] = useState('');
  const [hcp, setHcp] = useState('');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [resetMsg, setResetMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setEmail(user.email);
      setNrTessera(user.golfer_profile?.nr_tessera ?? '');
      setHcp(String(user.golfer_profile?.hcp ?? ''));
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: updateMe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setEditing(false);
    },
  });

  const pwdMutation = useMutation({
    mutationFn: () => changePassword(oldPassword, newPassword),
    onSuccess: () => {
      setPwdMsg({ type: 'success', text: 'Password aggiornata con successo.' });
      setOldPassword('');
      setNewPassword('');
    },
    onError: (err: any) => {
      const detail =
        err?.response?.data?.old_password?.[0] ||
        err?.response?.data?.new_password?.[0] ||
        err?.response?.data?.detail ||
        'Errore nel cambio password.';
      setPwdMsg({ type: 'error', text: detail });
    },
  });

  const handleChangePassword = () => {
    setPwdMsg(null);
    pwdMutation.mutate();
  };

  const resetScoresMutation = useMutation({
    mutationFn: resetMyScores,
    onSuccess: (data) => {
      setResetMsg({ type: 'success', text: data.detail });
      queryClient.invalidateQueries({ queryKey: ['history'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
    onError: () => {
      setResetMsg({ type: 'error', text: 'Errore nel reset dei risultati.' });
    },
  });

  const handleResetScores = () => {
    if (!window.confirm('Sei sicuro di voler cancellare TUTTI i tuoi risultati? Le statistiche ripartiranno da zero. Questa azione non e\' reversibile.')) return;
    setResetMsg(null);
    resetScoresMutation.mutate();
  };

  const handleSave = () => {
    mutation.mutate({
      first_name: firstName,
      last_name: lastName,
      email,
      golfer_profile: {
        nr_tessera: nrTessera,
        hcp: parseFloat(hcp) || 54,
      },
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const profile = user?.golfer_profile;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Profilo Golfista</h2>
        {user && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-golf-green font-semibold"
          >
            Modifica
          </button>
        )}
      </div>

      {user && !editing && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-4">
            {profile?.img && (
              <img
                src={profile.img}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div>
              <div className="text-xl font-bold">
                {user.first_name} {user.last_name}
              </div>
              <div className="text-sm text-gray-500">{user.username}</div>
              {user.email && (
                <div className="text-sm text-gray-500">{user.email}</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500">Handicap</div>
              <div className="text-2xl font-bold text-golf-green">{profile?.hcp ?? '-'}</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500">Tessera</div>
              <div className="text-lg font-bold">{profile?.nr_tessera || '-'}</div>
            </div>
          </div>
        </div>
      )}

      {user && editing && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-golf-green focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cognome</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-golf-green focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-golf-green focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Handicap</label>
              <input
                type="number"
                step="0.1"
                value={hcp}
                onChange={(e) => setHcp(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-golf-green focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nr. Tessera</label>
              <input
                type="text"
                value={nrTessera}
                onChange={(e) => setNrTessera(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-golf-green focus:border-transparent"
              />
            </div>
          </div>

          {/* Cambio Password */}
          <div className="border-t border-gray-200 pt-3 mt-1">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Cambia Password</h3>
            <div className="space-y-2">
              <input
                type="password"
                placeholder="Password attuale"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-golf-green focus:border-transparent"
              />
              <input
                type="password"
                placeholder="Nuova password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-golf-green focus:border-transparent"
              />
              {pwdMsg && (
                <p className={`text-sm ${pwdMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                  {pwdMsg.text}
                </p>
              )}
              <button
                onClick={handleChangePassword}
                disabled={!oldPassword || !newPassword || pwdMutation.isPending}
                className="w-full bg-gray-700 text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {pwdMutation.isPending ? 'Aggiornamento...' : 'Cambia Password'}
              </button>
            </div>
          </div>

          {mutation.isError && (
            <p className="text-red-500 text-sm">Errore nel salvataggio</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setEditing(false)}
              className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg font-semibold"
            >
              Annulla
            </button>
            <button
              onClick={handleSave}
              disabled={mutation.isPending}
              className="flex-1 bg-golf-green text-white py-2.5 rounded-lg font-semibold
                         disabled:opacity-50"
            >
              {mutation.isPending ? 'Salvataggio...' : 'Salva'}
            </button>
          </div>
        </div>
      )}

      {/* Reset Risultati */}
      <div className="mt-6 border-t border-gray-200 pt-4">
        <button
          onClick={handleResetScores}
          disabled={resetScoresMutation.isPending}
          className="w-full bg-orange-500 text-white py-2.5 rounded-lg font-semibold disabled:opacity-50"
        >
          {resetScoresMutation.isPending ? 'Cancellazione...' : 'Azzera Risultati'}
        </button>
        {resetMsg && (
          <p className={`text-sm mt-2 text-center ${resetMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
            {resetMsg.text}
          </p>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="w-full mt-4 bg-red-500 text-white py-2.5 rounded-lg font-semibold"
      >
        Esci
      </button>
    </div>
  );
}
