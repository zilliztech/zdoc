import React, {lazy, Suspense, useEffect, useMemo, useRef, useState} from 'react';
import {inkeepSettings} from '../../../inkeep.config';

// Load the Inkeep search modal (and its heavy dependency chain: @inkeep/cxkit-react,
// zod, zod-to-json-schema) on demand instead of bundling it into main.js.
// The modal is only mounted when Inkeep credentials are present, and the UI is
// triggered by user interaction (search button / Cmd+K), so deferring keeps the
// initial page payload small.
const InkeepModalSearchAndChat = lazy(() =>
  import('@inkeep/cxkit-react').then(module => ({
    default: module.InkeepModalSearchAndChat,
  })),
);

type LazyInkeepModalProps = {
  apiKey?: string;
  integrationId?: string;
  organizationId?: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export default function LazyInkeepModal({
  apiKey,
  integrationId,
  organizationId,
  isOpen,
  onOpenChange,
}: LazyInkeepModalProps) {
  const [mounted, setMounted] = useState(false);
  const mountedRef = useRef(false);

  // Mount the Inkeep modal only once the user actually opens it. Keeping it
  // mounted after the first open avoids reloading the (cached) chunk on every
  // subsequent open, while deferring the initial download past page load.
  useEffect(() => {
    if (isOpen && !mountedRef.current) {
      mountedRef.current = true;
      setMounted(true);
    }
  }, [isOpen]);

  const config = useMemo(() => ({
    ...inkeepSettings,
    baseSettings: {
      ...inkeepSettings.baseSettings,
      apiKey,
      integrationId,
      organizationId,
    },
    modalSettings: {
      isOpen,
      onOpenChange,
    },
  }), [apiKey, integrationId, organizationId, isOpen, onOpenChange]);

  if (!mounted) return null;

  return (
    <Suspense fallback={null}>
      <InkeepModalSearchAndChat
        {...(config as any)}
        defaultView="search"
        forceDefaultView
        shouldShowAskAICard
      />
    </Suspense>
  );
}
