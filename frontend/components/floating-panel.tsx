"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Settings, Zap } from "lucide-react"

export function FloatingPanel() {
  return (
    <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl sm:rounded-2xl blur-xl"></div>
      <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-600/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm sm:text-base">Protocol Builder</h3>
          <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        </div>

        {/* Input Field */}
        <div className="space-y-1 sm:space-y-2">
          <label className="text-xs sm:text-sm text-gray-400">Input</label>
          <Input
            disabled
            className="bg-gray-800/50 border-gray-600 text-white text-sm h-8 sm:h-10"
          />
        </div>

        {/* Model Selection */}
        <div className="space-y-1 sm:space-y-2">
          <label className="text-xs sm:text-sm text-gray-400">Protocol</label>
          <Select disabled>
            <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white text-sm h-8 sm:h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              <SelectItem value="uniswap-v3">uniswap-v3</SelectItem>
              <SelectItem value="compound-v2">compound-v2</SelectItem>
              <SelectItem value="aave-v3">aave-v3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* API Key */}
        <div className="space-y-1 sm:space-y-2">
          <label className="text-xs sm:text-sm text-gray-400">API Key</label>
          <Input
            type="password"
            disabled
            className="bg-gray-800/50 border-gray-600 text-white text-sm h-8 sm:h-10"
          />
        </div>

        {/* Slider */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm text-gray-400">Gas Price</label>
            <span className="text-xs sm:text-sm text-white">0.5</span>
          </div>
          <Slider defaultValue={[0.5]} max={1} min={0} step={0.1} className="w-full" />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Precise</span>
              <span className="sm:hidden">Fast</span>
            </span>
            <span className="flex items-center gap-1">
              <Settings className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Creative</span>
              <span className="sm:hidden">Slow</span>
            </span>
          </div>
        </div>

        {/* Deploy Button */}
        <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold text-sm sm:text-base h-8 sm:h-10">
          <span className="hidden sm:inline">Deploy Protocol</span>
          <span className="sm:hidden">Deploy</span>
        </Button>
      </div>
    </div>
  )
} 