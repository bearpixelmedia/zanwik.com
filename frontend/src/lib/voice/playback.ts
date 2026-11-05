import { base64Pcm16ToFloat32, TARGET_SAMPLE_RATE } from "./pcm";

const LEAD_SEC = 0.15;

export type PlaybackStats = {
  underruns: number;
  drainMsMax: number;
  maxGapMs: number;
  deltas: number;
  bytes: number;
  queuedMs: number;
};

/**
 * Schedules PCM16 base64 deltas on one AudioContext with ~150 ms lead.
 * Barge-in via stopAll().
 */
export class PcmPlayer {
  private ctx: AudioContext;
  private nextTime = 0;
  private sources: AudioBufferSourceNode[] = [];
  private lastScheduleWall = 0;
  private inResponse = false;
  stats: PlaybackStats = {
    underruns: 0,
    drainMsMax: 0,
    maxGapMs: 0,
    deltas: 0,
    bytes: 0,
    queuedMs: 0,
  };

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
  }

  resetTurn() {
    this.stats = {
      underruns: 0,
      drainMsMax: 0,
      maxGapMs: 0,
      deltas: 0,
      bytes: 0,
      queuedMs: 0,
    };
    this.inResponse = true;
    this.lastScheduleWall = 0;
    // Keep timeline but ensure lead for the next chunk after a gap
    const now = this.ctx.currentTime;
    if (this.nextTime < now + LEAD_SEC) {
      this.nextTime = now + LEAD_SEC;
    }
  }

  enqueueBase64Pcm16(base64: string) {
    const samples = base64Pcm16ToFloat32(base64);
    const buffer = this.ctx.createBuffer(1, samples.length, TARGET_SAMPLE_RATE);
    const channel = buffer.getChannelData(0);
    channel.set(samples);

    const wall = performance.now();
    if (this.lastScheduleWall > 0) {
      const gap = wall - this.lastScheduleWall;
      if (gap > this.stats.maxGapMs) this.stats.maxGapMs = gap;
    }
    this.lastScheduleWall = wall;

    const now = this.ctx.currentTime;
    if (this.inResponse && this.nextTime < now - 0.01) {
      this.stats.underruns += 1;
      this.nextTime = now + LEAD_SEC;
    }
    if (this.nextTime < now + LEAD_SEC) {
      this.nextTime = now + LEAD_SEC;
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(this.ctx.destination);
    src.start(this.nextTime);
    this.sources.push(src);
    src.onended = () => {
      this.sources = this.sources.filter((s) => s !== src);
    };

    const dur = buffer.duration;
    this.nextTime += dur;
    this.stats.deltas += 1;
    this.stats.bytes += samples.length * 2;
    this.stats.queuedMs = Math.max(0, (this.nextTime - now) * 1000);
    const drain = Math.max(0, (this.nextTime - now) * 1000);
    if (drain > this.stats.drainMsMax) this.stats.drainMsMax = drain;
  }

  /** Stop queued playback (barge-in). Returns dropped ms. */
  stopAll(reason = "barge-in"): number {
    const now = this.ctx.currentTime;
    const droppedMs = Math.max(0, (this.nextTime - now) * 1000);
    for (const src of this.sources) {
      try {
        src.stop();
      } catch {
        /* already stopped */
      }
    }
    this.sources = [];
    this.nextTime = now;
    this.inResponse = false;
    void reason;
    return droppedMs;
  }

  endResponse() {
    this.inResponse = false;
  }
}
