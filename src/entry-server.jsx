import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import Landing from './pages/Landing';

// Build-time only: renders the public marketing page to plain HTML so
// crawlers (including AI crawlers that don't execute JavaScript) get real
// content in the initial response instead of an empty <div id="root">.
// The client still boots normally afterwards and replaces this markup with
// the interactive React app — this is prerendering, not full SSR/hydration.
export function render() {
  return renderToStaticMarkup(
    <StaticRouter location="/">
      <Landing />
    </StaticRouter>,
  );
}
