/**
 * AudioWorklet: capture mic Float32 and post ~100 ms chunks to the main thread.
 */
class PcmCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._buf = [];
    this._frames = 0;
    this._target = Math.max(1, Math.round(sampleRate * 0.1));
  }

  process(inputs) {
    const channel = inputs[0] && inputs[0][0];
    if (!channel) return true;
    for (let i = 0; i < channel.length; i++) {
      this._buf.push(channel[i]);
      this._frames++;
    }
    while (this._frames >= this._target) {
      const chunk = this._buf.splice(0, this._target);
      this._frames -= this._target;
      this.port.postMessage(new Float32Array(chunk));
    }
    return true;
  }
}

registerProcessor("pcm-capture", PcmCaptureProcessor);
