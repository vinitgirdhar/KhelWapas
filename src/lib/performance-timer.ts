/**
 * Performance timing utility for profiling requests
 */

export class PerformanceTimer {
  private startTime: number
  private checkpoints: Map<string, number> = new Map()
  private lastCheckpoint: number

  constructor(private label: string = 'Timer') {
    this.startTime = performance.now()
    this.lastCheckpoint = this.startTime
  }

  checkpoint(name: string): number {
    const now = performance.now()
    const duration = now - this.lastCheckpoint
    this.checkpoints.set(name, duration)
    this.lastCheckpoint = now
    return duration
  }

  end(): void {
    const total = performance.now() - this.startTime
    
    console.log(`\n🔍 ${this.label} - Performance Report`)
    console.log('─'.repeat(50))
    
    for (const [name, duration] of this.checkpoints) {
      console.log(`  ${name}: ${duration.toFixed(2)}ms`)
    }
    
    console.log('─'.repeat(50))
    console.log(`  TOTAL: ${total.toFixed(2)}ms\n`)
  }

  getTotal(): number {
    return performance.now() - this.startTime
  }

  getCheckpoints(): Record<string, number> {
    return Object.fromEntries(this.checkpoints)
  }
}
