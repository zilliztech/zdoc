---
title: "updateReplicateConfiguration() | Java | v2"
slug: /java/java/v2-Management-updateReplicateConfiguration
sidebar_label: "updateReplicateConfiguration()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会更新跨多个 Milvus 集群的复制配置。它用于通过定义集群连接和复制拓扑来配置跨集群数据复制。 | Java | v2"
type: docx
token: EQ2LdAQqIo79HAxVl45cS8pknTe
sidebar_position: 28
keywords: 
  - 机器学习
  - RAG
  - NLP
  - 神经网络
  - zilliz
  - zilliz cloud
  - 云
  - updateReplicateConfiguration()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# updateReplicateConfiguration()

此操作会更新跨多个 Milvus 集群的复制配置。它用于通过定义集群连接和复制拓扑来配置跨集群数据复制。

```java
public UpdateReplicateConfigurationResp updateReplicateConfiguration(UpdateReplicateConfigurationReq request)
```

## 请求语法\{#request-syntax}

```java
updateReplicateConfiguration(UpdateReplicateConfigurationReq.builder()
    .replicateConfiguration(ReplicateConfiguration config)
    .forcePromote(boolean forcePromote)
    .build()
);
```

**构建器方法：**

- `replicateConfiguration(ReplicateConfiguration config)` -

    **[必需]**

    包含集群定义和拓扑的复制配置。

- `forcePromote(boolean forcePromote)`

    更新复制配置时是否请求强制提升。

**返回类型：**

*UpdateReplicateConfigurationResp*

**返回：**

**UpdateReplicateConfigurationResp** 对象是对本次更新的确认。该响应不携带任何负载。

**参数：**

- **UpdateReplicateConfigurationResp**（*object*） -

    服务器接受更新后的复制配置后返回的空确认对象。它不包含可供检查的负载字段；请求验证和 RPC 失败会引发 **MilvusClientException**，而不会反映在响应中。

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

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
