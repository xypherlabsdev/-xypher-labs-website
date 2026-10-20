import { useSmoothScroll } from './lib/scroll';
import { Cursor } from './components/Cursor';
import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { Installs } from './components/Installs';
import { Apps } from './components/Apps';
import { Approach } from './components/Approach';
import { Stack } from './components/Stack';
import { Lab } from './components/Lab';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';

export default function App() {
  useSmoothScroll();
  return (
    <>
      <a className="skip-link" href="#apps">
        Skip to apps
      </a>
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <Installs />
        <Apps />
        <Approach />
        <Stack />
        <Lab />
        <Contact />
      </main>
      <Footer />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
