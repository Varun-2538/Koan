"use client"

import { Button } from "@/components/ui/button"
import { Github, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { GridBackground } from "@/components/grid-background"
import { FloatingPanel } from "@/components/floating-panel"

export default function LandingHero() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <GridBackground />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-gray-800/50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
            <Image
              src="/logo.jpg"
              alt="Kōan Logo"
              width={32}
              height={32}
              className="rounded-lg object-cover"
            />
          </div>
          <span className="text-white font-semibold text-lg">Kōan </span>
        </div>

        {/* <div className="hidden md:flex items-center space-x-8">
          <Link href="#" className="text-gray-300 hover:text-white transition-colors">
            Docs
          </Link>
          <div className="relative group">
            <button className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1">
              <span>Resources</span>
              <ArrowRight className="w-4 h-4 rotate-90" />
            </button>
          </div>
          <div className="relative group">
            <button className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1">
              <span>Community</span>
              <ArrowRight className="w-4 h-4 rotate-90" />
            </button>
          </div>
          <Link href="#" className="text-gray-300 hover:text-white transition-colors">
            Download
          </Link>
        </div> */}

        {/* <div className="flex items-center space-x-4 text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <Github className="w-4 h-4" />
            <span>9.1k</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
              <span className="text-xs">D</span>
            </div>
            <span>20k</span>
          </div>
        </div> */}
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex items-center justify-between px-6 py-20 max-w-7xl mx-auto">
        <div className="flex-1 max-w-2xl">
          {/* Hero Title Card */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>
            <div className="relative bg-gray-900/30 backdrop-blur-sm border border-gray-600/30 rounded-3xl p-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Where Ideas Flow{" "}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Not Code
                </span>
              </h1>
              <div className="absolute top-4 right-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
            Kōan is a no-code platform enabling users to design workflows and deploy dApps with node-based flows.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/tooling-selection">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Start Building
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 px-8 py-3 rounded-lg transition-all duration-200 bg-transparent"
            >
              <Github className="w-5 h-5 mr-2" />
              Star on GitHub
            </Button>
          </div>

          {/* Social Proof */}
          <div className="mt-16">
            <p className="text-gray-500 text-sm mb-4">One Stop Solution for DeFi Development</p>
            {/* <div className="flex items-center space-x-8 opacity-60">
              <div className="text-gray-400 font-semibold">Uniswap</div>
              <div className="text-gray-400 font-semibold">Compound</div>
              <div className="text-gray-400 font-semibold">Aave</div>
              <div className="text-gray-400 font-semibold">MakerDAO</div>
            </div> */}
          </div>
        </div>

        {/* Floating Panel */}
        <div className="hidden lg:block flex-1 max-w-md ml-12">
          <FloatingPanel />
        </div>
      </div>

      {/* Connecting Line */}
      <div className="absolute top-1/2 right-1/2 transform translate-x-32 -translate-y-8 hidden lg:block">
        <svg width="200" height="100" viewBox="0 0 200 100" className="text-blue-500">
          <path d="M 0 50 Q 100 20 200 50" stroke="currentColor" strokeWidth="2" fill="none" className="opacity-60" />
          <circle cx="200" cy="50" r="4" fill="currentColor" className="animate-pulse" />
        </svg>
      </div>
    </div>
  )
} 