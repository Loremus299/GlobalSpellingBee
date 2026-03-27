import { createAuthClient } from "better-auth/react";
import { auth } from ".";
import {
  anonymousClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>(), anonymousClient()],
});
