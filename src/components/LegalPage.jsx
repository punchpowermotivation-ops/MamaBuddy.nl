import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function LegalPage({ title, updatedAt, children }) {
  return (
    <div className="min-h-svh bg-cream">
      <div className="border-b border-line bg-white px-[5%] py-4.5 flex items-center justify-between">
        <Link to="/" aria-label="MamaBuddy" className="flex items-center">
          <Logo width={160} />
        </Link>
        <Link to="/" className="text-rose text-sm font-medium no-underline">
          ← Terug naar mamabuddy.nl
        </Link>
      </div>

      <div className="max-w-[720px] mx-auto px-6 py-12">
        <h1 className="font-serif text-3xl text-ink mb-2">{title}</h1>
        <p className="text-sm text-muted mb-10">Laatst bijgewerkt: {updatedAt}</p>

        <div className="flex flex-col gap-7 text-[15px] text-mid leading-relaxed [&_h2]:font-serif [&_h2]:text-xl [&_h2]:text-ink [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5 [&_strong]:text-ink [&_a]:text-rose">
          {children}
        </div>

        <p className="text-sm text-muted mt-12 pt-6 border-t border-line">
          Vragen over dit document? Mail ons op{' '}
          <a href="mailto:mamabuddynl@gmail.com" className="text-rose">
            mamabuddynl@gmail.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
