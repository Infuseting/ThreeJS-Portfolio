import Scene from '@/components/Scene'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-zinc-950 font-sans text-zinc-100">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-zinc-800 bg-zinc-900/50 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-zinc-800/50 lg:p-4">
          Get started by editing&nbsp;
          <code className="font-mono font-bold">src/app/page.tsx</code>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-zinc-950 via-zinc-950 lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0 font-bold tracking-widest"
            href="https://threejs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            THREE.JS PORTFOLIO
          </a>
        </div>
      </div>

      <div className="relative flex place-items-center h-[50vh] w-full my-8 z-0 rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/20 ring-1 ring-zinc-800 bg-zinc-900/50">
        <Scene />
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left gap-4">
        <a
          href="https://threejs.org/docs/"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-zinc-800 hover:bg-zinc-900/50"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Three.js <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">-&gt;</span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-80 text-zinc-400">
            Learn more about Three.js and its WebGL API.
          </p>
        </a>

        <a
          href="https://r3f.docs.pmnd.rs/getting-started/introduction"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-zinc-800 hover:bg-zinc-900/50"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            R3F <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">-&gt;</span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-80 text-zinc-400">
            Explore the React renderer for Three.js.
          </p>
        </a>

        <a
          href="https://github.com/pmndrs/drei"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-zinc-800 hover:bg-zinc-900/50"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Drei <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">-&gt;</span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-80 text-zinc-400">
            Useful helpers and abstractions for React.
          </p>
        </a>
      </div>
    </main>
  )
}
