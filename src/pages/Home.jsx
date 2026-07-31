import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-svh bg-cream flex flex-col items-center justify-center gap-4 px-8 text-center">
      <h1 className="font-serif text-3xl text-ink">Hoi {profile?.naam || ''} 💛</h1>
      <p className="text-mid">De rest van de app (Home, Buddy, Mijn hoofd, Profiel) volgt in Prompt 2.</p>
      <button
        onClick={signOut}
        className="text-rose text-sm font-medium bg-transparent border-none cursor-pointer mt-4"
      >
        Uitloggen
      </button>
    </div>
  );
}
