// Demo utilities for the hackathon prototype
export const isDemo = true

// Mock data helpers
export const mockDelay = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms))

export const generateId = () => `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

export type Database = {
  // Type definitions for future Supabase integration
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          name: string
          description: string
          created_at: string
          updated_at: string
          user_id: string
        }
      }
      flows: {
        Row: {
          id: string
          project_id: string
          nodes: any[]
          edges: any[]
          created_at: string
          updated_at: string
        }
      }
    }
  }
}
