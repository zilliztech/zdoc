---
title: "New() | Go | v2"
slug: /go/v2-Client-New
sidebar_label: "New()"
beta: FALSE
added_since: v2.5.x
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This method creates a Milvus client that connects to a specific Milvus deployment. | Go | v2"
type: origin
token: EWYCwnWupirM3LkjYZDc0db1nmb
sidebar_position: 1
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# New()

This method creates a Milvus client that connects to a specific Milvus deployment.

```go
func New(ctx context.Context, config *ClientConfig) (*Client, error)
```

## Request Parameters{#request-parameters}

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>ctx</code></p></td>
     <td><p>Context for the current call to work.</p></td>
     <td><p><code>context.Context</code></p></td>
   </tr>
   <tr>
     <td><p><code>config</code></p></td>
     <td><p>Client configurations. </p><p>For details, refer to the <a href="./v2-Client-New#clientconfig">ClientConfig</a> section.</p></td>
     <td><p><a href="./v2-Client-New#clientconfig"><code>ClientConfig</code></a></p></td>
   </tr>
</table>

### ClientConfig{#clientconfig}

This struct type defines all possible client configuration items as follows:

```go
type ClientConfig struct {
    Address  string // Remote address, "YOUR_CLUSTER_ENDPOINT".
    Username string // Username for auth.
    Password string // Password for auth.
    DBName   string // DBName for this client.
    EnableTLSAuth bool   // Enable TLS Auth for transport security.
    APIKey        string // API key
    RetryRateLimit *RetryRateLimitOption // option for retry on rate limit inteceptor
}
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>Address</code></p></td>
     <td><p>Specifies the address of your Zilliz Cloud cluster.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
   <tr>
     <td><p><code>Username</code></p></td>
     <td><p>Specifies a valid username for authentication.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
   <tr>
     <td><p><code>Password</code></p></td>
     <td><p>Specifies the password of the above user.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
   <tr>
     <td><p><code>DBName</code></p></td>
     <td><p>Specifies the database to access.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
   <tr>
     <td><p><code>EnableTLSAuth</code></p></td>
     <td><p>Specifies whether to connect with TLS authentication enabled.</p></td>
     <td><p><code>bool</code></p></td>
   </tr>
   <tr>
     <td><p><code>APIKey</code></p></td>
     <td><p>Specifies the API key with sufficient permissions to access the above Zilliz Cloud cluster.</p></td>
     <td><p><code>string</code></p></td>
   </tr>
   <tr>
     <td><p><code>RetryRateLimit</code></p></td>
     <td><p>Specifies the retry rate limit in case the connection fails.</p><p>For details, refer to the <a href="./v2-Client-New#retryratelimitoption">RetryRateLimitOption</a> section.</p></td>
     <td><p><code>*&#91;RetryRateLimitOption</code>](./v2-Client-New#retryratelimitoption)</p></td>
   </tr>
</table>

### RetryRateLimitOption{#retryratelimitoption}

This struct type defines the retry options for the connection.

```go
type RetryRateLimitOption struct {
    MaxRetry   uint
    MaxBackoff time.Duration
}
```

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Description</p></th>
     <th><p>Type</p></th>
   </tr>
   <tr>
     <td><p><code>MaxRetry</code></p></td>
     <td><p>Specifies the maximum number of times the client should retry the connection.</p></td>
     <td><p><code>uint</code></p></td>
   </tr>
   <tr>
     <td><p><code>MaxBackoff</code></p></td>
     <td><p>Specifies the maximum back-off duration for the connection.</p></td>
     <td><p><code>time.Duration</code></p></td>
   </tr>
</table>

## Return{#return}

A `Client` object.

## Example{#example}

```go
import (
   "context"
   "github.com/milvus-io/milvus/v2/milvusclient"
)

// user cluster username and password
mclient, err := client.New(context.Background(), client.Config{
   Address: "YOUR_CLUSTER_ENDPOINT",
   Username: "YOUR_USERNAME",
   Password: "YOUR_PASSWORD"
})

// or use an API key with appropriate permissions
// client, err := client.New(context.Background(), client.Config{
//    Address: "YOUR_CLUSTER_ENDPOINT",
//    APIKey: "YOUR_API_KEY",
//    EnableTLSAuth: true,
// })

```

