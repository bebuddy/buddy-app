"use client";

import { useCallback, useRef, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";
import { useVoiceCallStore } from "@/lib/voiceCallStore";
import type { RealtimeServerEvent } from "@/types/realtimeTypes";

const REALTIME_URL = "https://api.openai.com/v1/realtime";

export function useRealtimeCall() {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);

  const [isConnecting, setIsConnecting] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const store = useVoiceCallStore;

  const handleDataChannelMessage = useCallback((ev: MessageEvent) => {
    let event: RealtimeServerEvent;
    try {
      event = JSON.parse(ev.data);
    } catch {
      return;
    }

    switch (event.type) {
      case "response.function_call_arguments.done": {
        const e = event as Extract<RealtimeServerEvent, { type: "response.function_call_arguments.done" }>;
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(e.arguments);
        } catch {
          break;
        }

        if (e.name === "update_post_draft") {
          store.getState().updateField(args);

          // Send function output back so the model continues
          const output = {
            type: "conversation.item.create",
            item: {
              type: "function_call_output",
              call_id: e.call_id,
              output: JSON.stringify({ success: true, updated_fields: Object.keys(args) }),
            },
          };
          dcRef.current?.send(JSON.stringify(output));
          dcRef.current?.send(JSON.stringify({ type: "response.create" }));
        } else if (e.name === "get_draft_status") {
          const draft = store.getState().draft;
          const allFields = [
            "category", "title", "content", "level", "days", "times",
            "seniorType", "juniorType", "classType", "budget", "budgetType",
            "seniorGender", "juniorGender",
          ];
          const filled = allFields.filter((f) => {
            const v = draft[f];
            if (v === undefined || v === null || v === "") return false;
            if (Array.isArray(v) && v.length === 0) return false;
            return true;
          });
          const missing = allFields.filter((f) => !filled.includes(f));

          const output = {
            type: "conversation.item.create",
            item: {
              type: "function_call_output",
              call_id: e.call_id,
              output: JSON.stringify({ filled, missing, total: allFields.length }),
            },
          };
          dcRef.current?.send(JSON.stringify(output));
          dcRef.current?.send(JSON.stringify({ type: "response.create" }));
        }
        break;
      }

      case "conversation.item.input_audio_transcription.completed": {
        const e = event as Extract<RealtimeServerEvent, { type: "conversation.item.input_audio_transcription.completed" }>;
        if (e.transcript?.trim()) {
          store.getState().addTranscript({
            role: "user",
            text: e.transcript.trim(),
            timestamp: Date.now(),
          });
        }
        break;
      }

      case "response.audio_transcript.done": {
        const e = event as Extract<RealtimeServerEvent, { type: "response.audio_transcript.done" }>;
        if (e.transcript?.trim()) {
          store.getState().addTranscript({
            role: "ai",
            text: e.transcript.trim(),
            timestamp: Date.now(),
          });
        }
        break;
      }

      case "error": {
        const e = event as Extract<RealtimeServerEvent, { type: "error" }>;
        console.error("Realtime error:", e.error);
        setError(e.error.message);
        break;
      }
    }
  }, [store]);

  const startAudioLevelMonitor = useCallback((stream: MediaStream) => {
    try {
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        const avg = sum / data.length / 255;
        setAudioLevel(avg);
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      // Web Audio not available
    }
  }, []);

  const endCall = useCallback(() => {
    // Stop audio level monitoring
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
    setAudioLevel(0);

    // Close data channel
    if (dcRef.current) {
      dcRef.current.close();
      dcRef.current = null;
    }

    // Close peer connection
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    // Stop local mic tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    // Remove audio element
    if (audioElRef.current) {
      audioElRef.current.srcObject = null;
      audioElRef.current.remove();
      audioElRef.current = null;
    }

    store.getState().endCall();
    setIsConnecting(false);
    setError(null);
  }, [store]);

  const startCall = useCallback(
    async (postType: "junior" | "senior") => {
      setIsConnecting(true);
      setError(null);

      try {
        // 1. Get ephemeral token
        const tokenRes = await apiFetch("/api/realtime/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postType }),
        });
        const tokenJson = await tokenRes.json();
        if (!tokenRes.ok || !tokenJson.success) {
          throw new Error(tokenJson.message || "세션 생성 실패");
        }
        const { clientSecret } = tokenJson.data;

        // 2. Create RTCPeerConnection
        const pc = new RTCPeerConnection();
        pcRef.current = pc;

        // 3. Get microphone
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // Start audio level monitoring
        startAudioLevelMonitor(stream);

        // 4. Handle remote audio
        pc.ontrack = (e) => {
          const audio = document.createElement("audio");
          audio.autoplay = true;
          audio.srcObject = e.streams[0];
          audioElRef.current = audio;
        };

        // 5. Create data channel
        const dc = pc.createDataChannel("oai-events");
        dcRef.current = dc;
        dc.onmessage = handleDataChannelMessage;
        dc.onopen = () => {
          // AI가 먼저 인사하도록 response 생성 요청
          dc.send(JSON.stringify({ type: "response.create" }));
        };

        // 6. ICE connection state monitoring
        pc.oniceconnectionstatechange = () => {
          const state = pc.iceConnectionState;
          if (state === "disconnected" || state === "failed") {
            endCall();
          }
        };

        // 7. Create SDP offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // 8. Send offer to OpenAI, get answer
        const model = "gpt-realtime";
        const sdpRes = await fetch(`${REALTIME_URL}?model=${model}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${clientSecret}`,
            "Content-Type": "application/sdp",
          },
          body: offer.sdp,
        });

        if (!sdpRes.ok) {
          throw new Error("WebRTC SDP 교환 실패");
        }

        const answerSdp = await sdpRes.text();
        await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

        // Mark call as active in store
        store.getState().startCall(postType);
        setIsConnecting(false);
      } catch (err) {
        console.error("startCall error:", err);
        const msg =
          err instanceof DOMException && err.name === "NotAllowedError"
            ? "마이크 권한이 필요합니다. 브라우저 설정에서 마이크를 허용해주세요."
            : err instanceof Error
              ? err.message
              : "통화 연결에 실패했습니다.";
        setError(msg);
        setIsConnecting(false);
        endCall();
      }
    },
    [store, handleDataChannelMessage, startAudioLevelMonitor, endCall],
  );

  return { startCall, endCall, isConnecting, audioLevel, error };
}
