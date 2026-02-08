// OpenAI Realtime API event types (WebRTC data channel)

export interface RealtimeSessionConfig {
  model: string;
  voice: string;
  instructions: string;
  tools: RealtimeToolDef[];
  turn_detection: { type: "server_vad" };
  input_audio_transcription: { model: string };
}

export interface RealtimeToolDef {
  type: "function";
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

// --- Server events received via data channel ---

export interface SessionCreatedEvent {
  type: "session.created";
  session: { id: string };
}

export interface ResponseFunctionCallArgumentsDoneEvent {
  type: "response.function_call_arguments.done";
  call_id: string;
  name: string;
  arguments: string; // JSON string
}

export interface InputAudioTranscriptionCompletedEvent {
  type: "conversation.item.input_audio_transcription.completed";
  item_id: string;
  transcript: string;
}

export interface ResponseAudioTranscriptDoneEvent {
  type: "response.audio_transcript.done";
  transcript: string;
}

export interface ResponseDoneEvent {
  type: "response.done";
  response: {
    id: string;
    status: string;
    output: Array<{
      type: string;
      name?: string;
      call_id?: string;
      arguments?: string;
    }>;
  };
}

export interface ErrorEvent {
  type: "error";
  error: {
    type: string;
    code: string;
    message: string;
  };
}

export type RealtimeServerEvent =
  | SessionCreatedEvent
  | ResponseFunctionCallArgumentsDoneEvent
  | InputAudioTranscriptionCompletedEvent
  | ResponseAudioTranscriptDoneEvent
  | ResponseDoneEvent
  | ErrorEvent
  | { type: string; [key: string]: unknown };
