export interface XrayConfig {
  log: LogConfig;
  inbounds: Inbound[];
  outbounds: Outbound[];
}

export interface LogConfig {
  loglevel: string;
  access: string;
  error: string;
}

export interface Inbound {
  port: number;
  protocol: string;
  settings: InboundSettings;
  streamSettings: StreamSettings;
}

export interface InboundSettings {
  clients: XrayClient[];
  decryption: string;
}

export interface XrayClient {
  id: string;
  flow: string;
  email: string;
}

export interface StreamSettings {
  network: string;
  security: string;
  realitySettings: RealitySettings;
}

export interface RealitySettings {
  show: boolean;
  dest: string;
  serverNames: string[];
  privateKey: string;
  shortIds: string[];
  xver: number;
}

export interface Outbound {
  protocol: string;
  tag: string;
  settings?: Record<string, unknown>;
}

export interface ConnectionInfo {
  ip: string;
  port: string;
  inbound: string;
  appointment: string;
  dateConnection: string;
}

export interface ConnectionLog {
  userId: string;
  connections: ConnectionInfo[];
}

export type ConnectionLogs = ConnectionLog[];

export interface LimitedConnection {
  userId: string;
  limit: number;
  IPs: string[];
  isBlocked: boolean;
}

export type ReadFileOptions = {
  asJson?: boolean;
  encoding?: BufferEncoding;
};
