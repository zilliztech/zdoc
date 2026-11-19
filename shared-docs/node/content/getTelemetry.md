# getTelemetry()

This operation returns the telemetry manager attached to this client for inspection and custom command handlers.

```typescript
milvusClient.getTelemetry()
```

**RETURN TYPE:**

*ClientTelemetryManager*

**RETURNS:**

The telemetry manager attached to this client. Use it to inspect telemetry state and to register custom command handlers.

**METHODS:**

- **start** (*void*) -

    Starts the telemetry heartbeat loop.

- **setSdkVersion** (*void*) -

    Sets the SDK version reported with telemetry events.

- **stop** (*void*) -

    Stops the telemetry heartbeat loop.

- **isSupported** (*boolean*) -

    Reports whether the connected server supports client telemetry.

- **getConfig** (*Required&lt;TelemetryConfig&gt;*) -

    Returns the resolved telemetry configuration: enabled, heartbeatIntervalMs, samplingRate, errorMaxCount, and clientId.

- **registerCommandHandler** (*void*) -

    Registers a handler for a named server command type. The handler runs when the server delivers a matching command through `processCommands()`.

- **recordOperation** (*void*) -

    Records one client operation (latency, collection, and success or error) into the telemetry collectors. Records are sampled per the configured sampling rate.

- **getRecentErrors** (*TelemetryError[]*) -

    Returns the most recent telemetry errors, newest first, up to `maxCount` (default 100).

- **getMetricsSnapshots** (*TelemetrySnapshot[]*) -

    Returns the current per-operation metric snapshots, pruned to the retention window.

- **processCommands** (*Promise&lt;void&gt;*) -

    Processes the commands delivered by the server through the registered handlers. It cannot be called recursively from a command handler.

**EXCEPTIONS:**

- **MilvusError**

    Raised when the server rejects the request or the RPC fails. Inspect the server error message for the exact failure reason.

## Example\{#example}

```javascript
const telemetry = milvusClient.getTelemetry();
```
