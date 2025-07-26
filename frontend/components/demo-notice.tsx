"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Info, ExternalLink } from "lucide-react"

export function DemoNotice() {
  return (
    <Alert className="m-4 border-blue-200 bg-blue-50">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-blue-800">
          <strong>Demo Mode:</strong> This is a prototype version. All data is simulated and won't persist between
          sessions.
        </span>
        <Button variant="outline" size="sm" className="ml-4 bg-transparent">
          <ExternalLink className="w-4 h-4 mr-2" />
          View Code
        </Button>
      </AlertDescription>
    </Alert>
  )
}
