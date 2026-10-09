---
title: "updateReplicateConfiguration() | Java | v2"
slug: /java/java/v2-Management-updateReplicateConfiguration
sidebar_label: "updateReplicateConfiguration()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation updates replication configuration across Milvus clusters. This is used to configure cross-cluster data replication by defining cluster connections and the replication topology. | Java | v2"
type: docx
token: EQ2LdAQqIo79HAxVl45cS8pknTe
sidebar_position: 28
keywords: 
  - Machine Learning
  - RAG
  - NLP
  - Neural Network
  - zilliz
  - zilliz cloud
  - cloud
  - updateReplicateConfiguration()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# updateReplicateConfiguration()

This operation updates replication configuration across Milvus clusters. This is used to configure cross-cluster data replication by defining cluster connections and the replication topology.

```java
public UpdateReplicateConfigurationResp updateReplicateConfiguration(UpdateReplicateConfigurationReq request)
```

## Request Syntax\{#request-syntax}

```java
updateReplicateConfiguration(UpdateReplicateConfigurationReq.builder()
    .replicateConfiguration(ReplicateConfiguration config)
    .forcePromote(boolean forcePromote)
    .build()
);
```

**BUILDER METHODS:**

- `replicateConfiguration(ReplicateConfiguration config)` -

    **[REQUIRED]**

    The replication configuration containing cluster definitions and topology.

- `forcePromote(boolean forcePromote)`

    Whether a forced promote is requested when updating the replication configuration.

**RETURN TYPE:**

*UpdateReplicateConfigurationResp*

**RETURNS:**

An **UpdateReplicateConfigurationResp** acknowledgment of the update. The response carries no payload.

**PARAMETERS:**

- **UpdateReplicateConfigurationResp** (*object*) -

    An empty acknowledgment object returned after the server accepts the updated replication configuration. It carries no payload fields to inspect; request validation and RPC failures raise a **MilvusClientException** instead of being reflected in the response.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.service.cdc.request.CrossClusterTopology;
import io.milvus.v2.service.cdc.request.MilvusCluster;
import io.milvus.v2.service.cdc.request.ReplicateConfiguration;
import io.milvus.v2.service.cdc.request.UpdateReplicateConfigurationReq;

import java.util.ArrayList;

// Define source and target Milvus clusters
MilvusCluster sourceCluster = MilvusCluster.builder()
        .clusterId("upstream-cluster")
        .uri("http://192.168.1.1:19530")
        .pchannels(pchannelList)
        .build();
MilvusCluster targetCluster = MilvusCluster.builder()
        .clusterId("downstream-cluster")
        .uri("http://192.168.1.2:19530")
        .pchannels(pchannelList)
        .build();

// Define cross-cluster replication topology
CrossClusterTopology topology = CrossClusterTopology.builder()
        .sourceClusterId("upstream-cluster")
        .targetClusterId("downstream-cluster")
        .build();

// Build and apply replication configuration
ReplicateConfiguration configuration = ReplicateConfiguration.builder()
        .clusters(new ArrayList<MilvusCluster>() {{
            add(sourceCluster);
            add(targetCluster);
        }})
        .crossClusterTopologies(new ArrayList<CrossClusterTopology>() {{
            add(topology);
        }})
        .build();

client.updateReplicateConfiguration(
    UpdateReplicateConfigurationReq.builder()
        .replicateConfiguration(configuration)
        .build()
);
```
