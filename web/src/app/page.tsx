import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-amber-500/30">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <svg className="w-5 h-5 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">ChatGram</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#features" className="hover:text-amber-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Features</a>
                <a href="#security" className="hover:text-amber-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Security</a>
                <a href="#download" className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-amber-500/20 transition-all">Download APK</a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Messaging, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-amber-400">
              Redefined.
            </span>
          </h1>
          <p className="mt-4 text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Experience the fastest, most secure, and visually stunning messaging app. Packed with premium features, cloud sync, and unlimited storage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#download" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-slate-950 bg-amber-500 rounded-full shadow-xl shadow-amber-500/20 hover:bg-amber-400 hover:scale-105 transition-all">
              Download for Android
            </a>
            <a href="#features" className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-slate-800/50 border border-slate-700 rounded-full hover:bg-slate-800 transition-all">
              Explore Features
            </a>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="py-24 bg-slate-900/50 border-y border-slate-800/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Premium Features Out of the Box</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Everything you need for seamless communication, wrapped in a beautiful Midnight Blue & Gold aesthetic.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-amber-500/50 transition-colors group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Lightning Fast</h3>
              <p className="text-slate-400">Delivers messages faster than any other application. Optimized for both premium and low-end devices globally.</p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-amber-500/50 transition-colors group">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Unmatched Security</h3>
              <p className="text-slate-400">Military-grade encryption keeps your messages safe from hackers. Secret chats feature end-to-end encryption.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-amber-500/50 transition-colors group">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Cloud Based</h3>
              <p className="text-slate-400">Access your messages from multiple devices simultaneously. Never lose your data with unlimited cloud storage.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Download Section */}
      <div id="download" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">Ready to upgrade your chats?</h2>
          <div className="p-8 md:p-12 bg-slate-800/80 backdrop-blur-lg rounded-3xl border border-slate-700 shadow-2xl">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 mb-6 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                <svg className="w-10 h-10 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">ChatGram for Android</h3>
              <p className="text-slate-400 mb-8 max-w-md">Download the latest stable release. Optimized for Android 5.0 and above.</p>
              
              {/* Replace YOUR_GITHUB_USERNAME with actual username when repo is pushed */}
              <a 
                href="https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY/releases/latest/download/app-arm64-v8a.apk"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-slate-950 bg-amber-500 rounded-full shadow-xl shadow-amber-500/20 hover:bg-amber-400 hover:scale-105 transition-all"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download Latest APK
              </a>
              <p className="mt-4 text-sm text-slate-500">Auto-updated via GitHub Actions CI/CD</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
             <div className="w-6 h-6 rounded bg-amber-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
             </div>
             <span className="text-xl font-bold text-white">ChatGram</span>
          </div>
          <p className="text-slate-500">© {new Date().getFullYear()} ChatGram. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
