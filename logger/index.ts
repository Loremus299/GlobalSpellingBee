import { LogLayer } from "loglayer";
import { serializeError } from "serialize-error";
import { getPrettyTerminal } from "@loglayer/transport-pretty-terminal";
import { DefaultContextManager } from "@loglayer/context-manager";

export const log = new LogLayer({
  enabled: true,
  errorSerializer: serializeError,
  transport: [
    getPrettyTerminal({
      enabled: true,
      disableInteractiveMode: true,
    }),
  ],
}).withContextManager(new DefaultContextManager());

export const critical =
  " .Critical Error. Please report it at https://git.gay/Loremus/GlobalSpellingBee";

export const refresh = " .Minor error. This error can be fixed with refresh :3";
