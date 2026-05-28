import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/30 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-500/20 blur-[120px] rounded-full pointer-events-none" />

      <main className="z-10 flex flex-col items-center max-w-3xl text-center space-y-8">
        {/* Logo / App Icon Placeholder */}
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 shadow-2xl flex items-center justify-center border border-slate-700/50">
          <svg className="w-12 h-12 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-300">
            Welcome to ChatGram
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            The premium, fast, and secure messaging experience. Download the latest version for Android today.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <a
            href="https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY/releases/latest/download/app-arm64-v8a.apk"
            className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-white bg-blue-600 border border-transparent rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900 transition-all hover:scale-105 active:scale-95"
          >
            <svg className="w-5 h-5 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download APK
          </a>
          <a
            href="#features"
            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-slate-300 bg-slate-800/50 border border-slate-700 rounded-full hover:bg-slate-800 hover:text-white transition-all"
          >
            Learn More
          </a>
        </div>
      </main>
    </div>
  );
}
