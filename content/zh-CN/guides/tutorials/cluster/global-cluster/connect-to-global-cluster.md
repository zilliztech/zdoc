---
title: "连接全球集群 | Cloud"
slug: /connect-to-global-cluster
sidebar_key: connect-to-global-cluster
sidebar_label: "连接全球集群"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "全球集群开始运行后，您可以使用 Endpoint 和身份验证 Token 连接集群。本文介绍两种 Endpoint 类型、各自的适用场景，以及在优雅切换和强切期间的路由行为。 | Cloud"
type: origin
token: VfF8wgQEmixhpkkxEFDchYoinBv
sidebar_position: 3
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 管理
  - 全球集群
  - 连接
  - endpoint
  - 路由

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Procedures from '@site/src/components/Procedures';

# 连接全球集群

全球集群开始运行后，您可以使用 Endpoint 和身份验证 Token 连接集群。本文介绍两种 Endpoint 类型、各自的适用场景，以及在优雅切换和强切期间的路由行为。

<Admonition type="info" icon="📘" title="说明">

如需使用该功能请[提交工单](http://support.zilliz.com.cn)。

</Admonition>

## 选择 Endpoint 类型\{#choose-an-endpoint-type}

全球集群提供两种连接方式：

- 通过**全球 Endpoint** 连接，支持全自动的切换

- 通过全球集群的**子集群 Endpoint** 连接，支持 Private Endpoint 和 Public Endpoint，不支持切换

下表对比了两种连接 Endpoint。

<table>
   <tr>
     <th></th>
     <th><p><strong>全球 Endpoint</strong></p></th>
     <th><p><strong>子集群的Endpoint</strong></p></th>
   </tr>
   <tr>
     <td><p>写入路由</p></td>
     <td><p>自动路由到主集群</p></td>
     <td><p>仅主集群的公共 Endpoint 接受写入</p></td>
   </tr>
   <tr>
     <td><p>读取路由</p></td>
     <td><p>路由到主集群</p><p>（即将支持按延迟智能路由）</p></td>
     <td><p>读取请求由您连接的特定集群处理</p></td>
   </tr>
   <tr>
     <td><p>优雅切换 / 强切</p></td>
     <td><p>自动重新路由，无需修改代码</p></td>
     <td><p>需要手动更新连接，指向新的主集群</p></td>
   </tr>
   <tr>
     <td><p>Private Link</p></td>
     <td><p>不支持（需要公网访问）</p></td>
     <td><p>支持</p></td>
   </tr>
   <tr>
     <td><p>最佳适用场景</p></td>
     <td><p>需要自动故障切换和基于延迟路由的生产应用</p></td>
     <td><p>直接访问特定集群（例如环境复制、测试、调试）</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="说明">

建议在生产环境中使用全球 Endpoint。它无需在优雅切换或强切期间在应用代码中处理 Endpoint 变更。

</Admonition>

## 获取 Endpoint 和 Token\{#get-your-endpoint-and-token}

<Procedures>

1. 导航到全球集群或目标集群：

    - **全球 Endpoint**：前往**全球集群页面**。

    - **公共 Endpoint**：前往特定主集群或从集群的**集群详情页面**。

1. 在**连接**卡片中，复制全球 Endpoint 或公共 Endpoint。

    ![Z38HbClxuoAHA1xtG7yc1gAmnee](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/Z38HbClxuoAHA1xtG7yc1gAmnee.png "Z38HbClxuoAHA1xtG7yc1gAmnee")

1. 准备身份验证 Token。Token 可以是 [API 密钥](./manage-api-keys)或[集群身份凭证](./cluster-credentials)（用户名:密码）。

</Procedures>

## 检查 SDK 版本\{#check-sdk-version}

请确保已安装 SDK。连接全球集群前，请确认 SDK 满足以下最低版本要求。

<table>
   <tr>
     <th><p><strong>SDK</strong></p></th>
     <th><p><strong>最低版本</strong></p></th>
   </tr>
   <tr>
     <td><p>Python</p></td>
     <td><p>2.6.9</p></td>
   </tr>
   <tr>
     <td><p>Node.js</p></td>
     <td><p>2.6.10</p></td>
   </tr>
   <tr>
     <td><p>Java</p></td>
     <td><p>2.6.14</p></td>
   </tr>
   <tr>
     <td><p>Go</p></td>
     <td><p>2.6.2</p></td>
   </tr>
</table>

## 通过全球 Endpoint 连接\{#connect-using-the-global-endpoint}

全球 Endpoint 是一个统一的 URL，会将请求路由到全球集群中的相应集群。在 SDK 客户端中将其作为 `uri` 使用。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

# Use the global endpoint for automatic routing
client = MilvusClient(
    uri="YOUR_GLOBAL_ENDPOINT",  # Global endpoint from the console
    token="YOUR_CLUSTER_TOKEN"   # API key or username:password
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.client.ConnectConfig;

// Use the global endpoint for automatic routing
ConnectConfig connectConfig = ConnectConfig.builder()
    .uri("YOUR_GLOBAL_ENDPOINT")  // Global endpoint from the console
    .token("YOUR_CLUSTER_TOKEN")  // API key or username:password
    .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node")

// Use the global endpoint for automatic routing
const client = new MilvusClient({
    address: "YOUR_GLOBAL_ENDPOINT",  // Global endpoint from the console
    token: "YOUR_CLUSTER_TOKEN"       // API key or username:password
})
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v2/milvusclient"

// Use the global endpoint for automatic routing
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_GLOBAL_ENDPOINT", // Global endpoint from the console
    APIKey:  "YOUR_CLUSTER_TOKEN", // API key or username:password
})
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_GLOBAL_ENDPOINT" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{"dbName": "default"}'
```

</TabItem>
</Tabs>

## 通过公共 Endpoint 连接\{#connect-using-a-public-endpoint}

全球集群中的每个集群都有自己的公共 Endpoint。当您需要直接访问特定集群时，可以使用此方式。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

# Connect directly to a specific cluster
client = MilvusClient(
    uri="YOUR_CLUSTER_PUBLIC_ENDPOINT",  # Public endpoint of a specific cluster
    token="YOUR_CLUSTER_TOKEN" # API key or username:password
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.client.ConnectConfig;

// Connect directly to a specific cluster
ConnectConfig connectConfig = ConnectConfig.builder()
    .uri("YOUR_CLUSTER_PUBLIC_ENDPOINT")  // Public endpoint of a specific cluster
    .token("YOUR_CLUSTER_TOKEN")  // API key or username:password
    .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node")

// Connect directly to a specific cluster
const client = new MilvusClient({
    address: "YOUR_CLUSTER_PUBLIC_ENDPOINT",  // Public endpoint of a specific cluster
    token: "YOUR_CLUSTER_TOKEN"  // API key or username:password
})
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v2/milvusclient"

// Connect directly to a specific cluster
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_PUBLIC_ENDPOINT",  // Public endpoint of a specific cluster
    APIKey:  "YOUR_CLUSTER_TOKEN",  // API key or username:password
})
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_PUBLIC_ENDPOINT" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{"dbName": "default"}'
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="说明">

使用公共 Endpoint 时，仅主集群的公共 Endpoint 接受写入操作。向从集群的公共 Endpoint 写入将会失败。

</Admonition>

## 路由行为\{#routing-behavior}

### 正常运行期间\{#during-normal-operation}

<table>
   <tr>
     <th><p><strong>请求类型</strong></p></th>
     <th><p><strong>全球 Endpoint</strong></p></th>
     <th><p><strong>公共 Endpoint</strong></p></th>
   </tr>
   <tr>
     <td><p>写入（insert、upsert、delete）</p></td>
     <td><p>路由到主集群</p></td>
     <td><p>仅主集群的 Endpoint 接受</p></td>
   </tr>
   <tr>
     <td><p>读取（search、query）</p></td>
     <td><p>路由到主集群。（即将支持按延迟智能路由。）</p></td>
     <td><p>由您连接的特定集群处理</p></td>
   </tr>
</table>

### 优雅切换 / 强切期间及之后\{#during-and-after switchover-failover}

<table>
   <tr>
     <th><p><strong>场景</strong></p></th>
     <th><p><strong>全球 Endpoint</strong></p></th>
     <th><p><strong>公共 Endpoint</strong></p></th>
   </tr>
   <tr>
     <td><p>优雅切换进行中</p></td>
     <td><p>写入短暂暂停，随后在新主集群上恢复。读取不受影响。</p></td>
     <td><p>Endpoint 无变化。原主集群变为从集群。</p></td>
   </tr>
   <tr>
     <td><p>强切进行中</p></td>
     <td><p>写入不可用，直到新主集群提升完成。从集群上的读取不受影响。</p></td>
     <td><p>原主集群的 Endpoint 变为不可达。</p></td>
   </tr>
   <tr>
     <td><p>完成后</p></td>
     <td><p>自动路由到新主集群，无需修改代码。</p></td>
     <td><p>需要更新代码，使用新主集群的公共 Endpoint 进行写入。</p></td>
   </tr>
</table>

### SDK 自动重连\{#sdk-automatic-reconnection}

使用全球 Endpoint 时，Zilliz Cloud SDK 会在优雅切换和强切期间自动处理 Endpoint 重新路由。您的应用无需为路由变更实现重试逻辑。但在切换瞬间正在执行的写入操作可能会收到短暂错误——应用中的标准重试逻辑即可处理这些情况。