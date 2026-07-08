---
title: "ClientConfig | Go | v2"
slug: /go/go/v2-Client-ClientConfig
sidebar_label: "ClientConfig"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation provides the configuration for establishing a connection to a Milvus or Zilliz Cloud server. Pass a pointer to this struct when calling `New()`. | Go | v2"
type: docx
token: NNQmdw1DloRDi6xeO0acaMfdnib
sidebar_position: 1
keywords: 
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - private llms
  - zilliz
  - zilliz cloud
  - cloud
  - ClientConfig
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ClientConfig

This operation provides the configuration for establishing a connection to a Milvus or Zilliz Cloud server. Pass a pointer to this struct when calling `New()`.

```go
type ClientConfig struct {
    Address        string
    Username       string
    Password       string
    DBName         string
    EnableTLSAuth  bool
    APIKey         string
    DialOptions    []grpc.DialOption
    RetryRateLimit *RetryRateLimitOption
    DisableConn    bool
    ServerVersion  string
}
```

**PARAMETERS:**

- **Address** (*string*) -
[REQUIRED] The address of the Milvus server in `host:port` format (e.g., `YOUR_CLUSTER_ENDPOINT`). For Zilliz Cloud, use the full HTTPS endpoint.

- **Username** (*string*) -
The username for password-based authentication.

- **Password** (*string*) -
The password for password-based authentication.

- **DBName** (*string*) -
The name of the database to connect to. Uses the default database if not set.

- **EnableTLSAuth** (*bool*) -
Whether to enable TLS for the connection. Automatically set to `true` if the address uses the `https` scheme.

- **APIKey** (*string*) -
An API key for Zilliz Cloud or authenticated Milvus instances. Preferred over username/password for cloud deployments.

- **DialOptions** ([]*grpc.DialOption*) -
Additional gRPC dial options to customize the connection. Merged with the default options if provided.

- **RetryRateLimit** (*RetryRateLimitOption*) -
Configuration for automatic retry on rate-limit errors.

- **DisableConn** (*bool*) -
If `true`, the client will not establish a connection immediately. Useful for testing or lazy connection scenarios.

- **ServerVersion** (*string*) -
The version string of the connected server. Populated automatically after connection.

**BUILDER METHODS:**

- `WithTLSConfig(tlsConfig *tls.Config)`
This sets a custom TLS configuration for secure connections.

- `WithGrpcAuthority(authority string)`
This sets the gRPC authority header for the connection, useful when connecting through a proxy or load balancer.

**RETURN TYPE:**

*ClientConfig*

**RETURNS:**

A pointer to the updated `ClientConfig` for method chaining.

## Example\{#example}

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

// Connect with username/password
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address:  "YOUR_CLUSTER_ENDPOINT",
    Username: "root",
    Password: "Milvus",
    DBName:   "default",
})
if err != nil {
    log.Fatal("failed to create client:", err)
}
defer client.Close(ctx)

// Connect to Zilliz Cloud with API key
cloudClient, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "https://your-endpoint.api.gcp-us-west1.zillizcloud.com:443",
    APIKey:  "your-api-key",
})
if err != nil {
    log.Fatal("failed to create cloud client:", err)
}
```
