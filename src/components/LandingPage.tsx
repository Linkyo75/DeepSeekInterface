import React from 'react';
import { Terminal, MessageSquare, Shield, Cpu, Zap, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-100">
      <div className="relative">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>
        
        <div className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="text-center space-y-8 mb-16">
              <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Your AI, Your Privacy
              </h1>
              <p className="max-w-2xl mx-auto text-xl text-gray-600">
                Run powerful open-source AI models locally with complete privacy. No data ever leaves your device - your conversations stay yours alone.
              </p>
              <div className="flex justify-center gap-4">
                <Link to="/chat">
                  <Button 
                    size="lg" 
                    className="relative overflow-hidden group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 gap-2 text-lg px-8 py-6 shadow-lg transition-all duration-300 hover:shadow-xl text-white"
                  >
                    <div className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-500" />
                    <span className="relative">Start Private Chat</span>
                    <Lock className="h-5 w-5 relative" />
                  </Button>
                </Link>
                <Link to="/docs">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="gap-2 text-lg px-8 py-6 border-2 hover:bg-gray-50"
                  >
                    Documentation
                  </Button>
                </Link>
              </div>
            </div>

            {/* Key Features */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="relative group h-full">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg h-full">
                  <div className="bg-blue-50 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                    <Shield className="h-7 w-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">100% Private</h3>
                  <p className="text-gray-600 leading-relaxed">All processing happens locally on your device. We don't store, log, or transmit any of your conversations. Your data never leaves your computer.</p>
                </div>
              </div>

              <div className="relative group h-full">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg h-full">
                  <div className="bg-blue-50 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                    <Zap className="h-7 w-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Quick Setup</h3>
                  <p className="text-gray-600 leading-relaxed">Be up and running in about 10 minutes. Just install Ollama, choose your model, and start chatting. No accounts, no subscriptions, no complications.</p>
                </div>
              </div>

              <div className="relative group h-full">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                <div className="relative bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg h-full">
                  <div className="bg-blue-50 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                    <Cpu className="h-7 w-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Hardware Aware</h3>
                  <p className="text-gray-600 leading-relaxed">Choose models that match your hardware capabilities. From lightweight options for older machines to powerful models for modern GPUs.</p>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-16">
              <div className="p-8">
                <h2 className="text-2xl font-semibold mb-6">Before You Start</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                      1
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">System Requirements</h3>
                      <p className="text-gray-600">Your computer's capabilities will determine which models you can run effectively. Larger models require more RAM and processing power.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                      2
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">To Get Started</h3>
                      <p className="text-gray-600">Quick and easy: you only need to download and install Ollama from <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer"  className="text-blue-600 hover:underline">ollama.ai</a></p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                      3
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Initial Download Time for models</h3>
                      <p className="text-gray-600">Models can be large (2-30GB). First-time setup requires downloading your chosen model, which depends on your internet speed.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                      4
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Response Times</h3>
                      <p className="text-gray-600">Since processing happens on your device, response times may vary based on your hardware and the chosen model size.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-8">
                <h2 className="text-2xl font-semibold mb-6">Support the project</h2>
                <div className="space-y-6">
                    <p className="text-gray-600 mb-4">This tool is completely free and open source. If you find it useful, consider supporting its development through a donation or contributing to the project on <a href="https://github.com/Linkyo75/DeepSeekInterface" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">GitHub </a>. You can help by reporting bugs, suggesting features, or submitting pull requests.</p>
                    <div className="space-y-2 font-mono text-sm">
                      <div className="p-2 bg-gray-50 rounded">
                        <span className="text-gray-500">ETH: </span>0xA42fACe29c9368e257440990Ffd25a88DB3EC23F
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <span className="text-gray-500">BTC: </span>bc1q3ej7jw0n3xpwdk6peah3s46hnhmnuz64lp27ju
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <span className="text-gray-500">SOL: </span>CgDQHF7bLaxz7pCdAGMqBxVPSq3MwdXeGc4o2kyDFq2B
                      </div>
                      <div className="p-2 bg-gray-50 rounded">
                        <span className="text-gray-500">Ko-Fi: </span>
                        <a href="https://ko-fi.com/linkyo" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ko-fi.com/linkyo</a>
                      </div>
                    </div>
                    </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;