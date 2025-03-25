export interface XrayConfig {
  inbounds: Inbound[];
  outbounds: Outbound[];
  routing: Routing;
  policy: Policy;
}

export interface Inbound {
  listen?: string;
  port: number;
  protocol: string;
  settings: InboundSettings;
  streamSettings?: StreamSettings;
}

export interface InboundSettings {
  clients?: Client[];
  decryption?: string;
  services?: string[];
}

export interface Client {
  id: string;
  flow: string;
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
  settings?: {
    address?: string;
  };
}

export interface Routing {
  rules: RoutingRule[];
}

export interface RoutingRule {
  type: string;
  inboundTag: string[];
  outboundTag: string;
}

export interface Policy {
  levels: {
    [key: string]: {
      statsUserUplink: boolean;
      statsUserDownlink: boolean;
    };
  };
  system: {
    statsInboundUplink: boolean;
    statsInboundDownlink: boolean;
  };
}

export interface VlessLinkParams {
  userId: string;
  protocol: string;
  security: string;
  flow: string;
  pbk: string;
  shortId: string;
  tag: string;
}
