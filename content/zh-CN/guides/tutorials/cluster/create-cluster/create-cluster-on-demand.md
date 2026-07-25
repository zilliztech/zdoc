---
title: "创建按量计费集群 | Cloud"
slug: /create-cluster-on-demand
sidebar_key: create-cluster-on-demand
sidebar_label: "创建按量计费集群"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "集群对应一组用于运行向量数据库工作负载的计算资源。Zilliz Cloud 提供两种集群：Serving Clusters（持续运行，适用于需要持续在线、低延迟访问的生产负载）和 On-demand 集群（仅在请求到达时自动拉起，空闲时自动缩容至 0）。 | Cloud"
type: origin
token: MAFcwBTqqiR5YZkdkd4cADg0nub
sidebar_position: 1
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 创建集群
  - 创建按量计费集群
  - 按量计费

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 创建按量计费集群

集群对应一组用于运行向量数据库工作负载的计算资源。Zilliz Cloud 提供两种集群：Serving Clusters（持续运行，适用于需要持续在线、低延迟访问的生产负载）和 On-demand 集群（仅在请求到达时自动拉起，空闲时自动缩容至 0）。

## 注意事项\{#considerations}

请确保已完成以下步骤：

- 已注册 Zilliz Cloud 账户。有关更多信息，请参见[注册账号](./register-with-zilliz-cloud)。

- 在目标组织或项目中，您具有集群创建权限。有关角色和权限的信息，请参见[管理组织用户](./organization-users) 和 [管理项目用户](./project-users)。

- 每个项目中最多可创建 100 个 Serverless 集群、100 个 Dedicated 集群、20 个 On-demand 集群。

## 创建 Serving 集群\{#create-a-serving-cluster}

Zilliz Cloud 提供多种集群部署方式以满足不同的业务需求。

- **Free**：适用于探索学习向量数据库的场景或个人项目。

- **Serverless**：Serverless 集群是一种共享的运行环境，可根据业务负载自动伸缩，无需手动配置资源。该部署方式在应对不可预测或突发流量时，具备卓越的成本效益与弹性表现。

- **Dedicated**：Dedicated 集群为关键业务提供独享的运行环境，确保性能稳定可控。该部署方式适用于持续高并发和低延时的场景，满足生产级工作负载的性能要求。

如需了解不同部署方式的详细信息，请参考 [Zilliz Cloud 定价](https://zilliz.com.cn/pricing)。

### 创建 Free 集群\{#set-up-a-free-cluster}

<Admonition type="info" icon="📘" title="说明">

每个组织中仅支持创建 1 个 Free 集群。如需更多集群，请选择创建 Serverless 或 Dedicated 集群。

</Admonition>

<Tabs groupId="cluster" defaultValue="console" values={[{"label":"Cloud 控制台","value":"console"},{"label":"cURL","value":"bash"}]}>

<TabItem value="console">

<Supademo id="cmhiy4bab62lefatixofbu7uk" title=""  />

集群创建过程中，请保存集群访问凭证（用户名和密码）。该信息将仅展示一次。

当集群状态转为**运行中**，则表示集群创建成功。您可以复制集群 Endpoint 和 Token 以[连接集群](./connect-to-cluster)。

</TabItem>

<TabItem value="bash">

以下为示例代码，请将示例中的 `{API_KEY}` 替换为您自己的Zilliz Cloud API 密钥。

以下 `POST` 通过请求体在项目 `proj-xxxxxxxxxxxxxxxxxxxxx` 中创建了 1 个名称为 `cluster-free` 的 Free 集群。

```bash
curl --request POST \
     --url https://api.cloud.zilliz.com.cn/v2/clusters/createFree \
     --header 'Authorization: Bearer ${API_KEY}' \
     --header 'accept: application/json' \
     --header 'content-type: application/json' \
     --data-raw '{
        "clusterName": "cluster-free",
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "regionId": "${REGION_ID}"
      }'
      
#  {
#    code: 0,
#    data: {
#      "clusterId": "inxx-xxxxxxxxxxxxxxx",
#      "username":"db_xxxxxxxx",
#      "password":"*************",
#      "prompt": "Successfully submitted, cluster is being created. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK with the admin account and the initial password you specified."
#    }
#  }
```

以下为参数说明：

- `{API_KEY}`：用于验证 API 请求的鉴权信息。请使用您自己的 Zilliz Cloud API 密钥。

- `clusterName`：需要创建的集群名称。

- `projectId`：需要创建的集群所属的项目的 ID。如需查看项目 ID，请使用[查看项目列表](/reference/restful/list-projects-v2)。

- `regionId`：需要创建的集群所部署的云服务地域 ID。目前，仅支持在 `ali-cn-hangzhou` 创建 Free 集群。如需查看所有 Zilliz Cloud 支持的云服务地域 ID，请使用[查看云服务区域](/reference/restful/list-cloud-regions-v2)。

更多详情，请参考[创建 Free 集群](/reference/restful/create-free-cluster-v2)。

</TabItem>

</Tabs>

### 创建 Serverless 集群\{#create-a-serverless-cluster}

<Tabs groupId="cluster" defaultValue="console" values={[{"label":"Cloud 控制台","value":"console"},{"label":"cURL","value":"bash"}]}>

<TabItem value="console">

<Supademo id="cmhiy9c2h0aldvc0igs9yh589" title=""  />

集群创建过程中，请保存集群访问凭证（用户名和密码）。该信息将仅展示一次。

当集群状态转为**运行中**，则表示集群创建成功。您可以复制集群 Endpoint 和 Token 以[连接集群](./connect-to-cluster)。

</TabItem>

<TabItem value="bash">

以下为示例代码，请将示例中的 `{API_KEY}` 替换为您自己的Zilliz Cloud API 密钥。

以下 `POST` 通过请求体在项目 `proj-xxxxxxxxxxxxxxxxxxxxx` 中创建了 1 个名称为 `cluster-serverless` 的 Serverless 集群。

```bash
curl --request POST \
     --url https://api.cloud.zilliz.com.cn/v2/clusters/createServerless \
     --header 'Authorization: Bearer ${API_KEY}' \
     --header 'accept: application/json' \
     --header 'content-type: application/json' \
     --data-raw '{
        "clusterName": "cluster-serverless",
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxxx",
        "regionId": "${REGION_ID}"
      }'
     
# {
#    code: 0,
#    data: {
#       "clusterId": "inxx-xxxxxxxxxxxxxxx",
#       "username":"db_xxxxxxxx",
#       "password":"***********",
#       "prompt": "Successfully submitted, cluster is being created. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK with the admin account and the initial password you specified."
#    }
#  }
```

以下为参数说明：

- `{API_KEY}`：用于验证 API 请求的鉴权信息。请使用您自己的 Zilliz Cloud API 密钥。

- `clusterName`：需要创建的集群名称。

- `projectId`：需要创建的集群所属的项目的 ID。如需查看项目 ID，请使用[查看项目列表](/reference/restful/list-projects-v2)。

- `regionId`：需要创建的集群所部署的云服务地域 ID。目前，仅支持在 `ali-cn-hangzhou` 创建 Serverless 集群。如需查看所有 Zilliz Cloud 支持的云服务地域 ID，请使用[查看云服务区域](/reference/restful/list-cloud-regions-v2)。

更多详情，请参考[创建 Serverless 集群](/reference/restful/create-serverless-cluster-v2)。

</TabItem>

</Tabs>

### 创建 Dedicated 集群\{#create-a-dedicated-cluster}

<Tabs groupId="cluster" defaultValue="console" values={[{"label":"Cloud 控制台","value":"console"},{"label":"cURL","value":"bash"}]}>

<TabItem value="console">

<Supademo id="cmhiydksy083hy90ibirrjb9x" title=""  />

您需要配置以下集群信息：

- **集群名称**：请输入集群的名称。当前存在随机默认值，您可根据需要修改该名称。

- **集群设置**：

    - **集群类型**：想了解更多关于集群类型的相关内容，可参见[选择合适的 CU 类型](/docs/cu-types-explained)。如需选择分层存储型 CU，集群规格需至少为 8 Query CU。

    - **Query CU 数量**：您可以使用[计算器](https://zilliz.com.cn/pricing#calculator)估算所需 Query CU 数量。

- （可选）**备份策略**：设置定时创建备份的频率。开启后，系统将立即创建一个备份文件以保护数据。后续备份将按照您指定的策略定时创建。

集群创建过程中，请保存集群访问凭证（用户名和密码）。该信息将仅展示一次。

当集群状态转为**运行中**，则表示集群创建成功。您可以复制集群 Endpoint 和 Token 以[连接集群](./connect-to-cluster)。

</TabItem>

<TabItem value="bash">

以下为示例代码，请将示例中的 `{API_KEY}` 替换为您自己的Zilliz Cloud API 密钥。

以下 `POST` 通过请求体在项目 `proj-xxxxxxxxxxxxxxxxxxxxx` 中创建了 1 个名称为 `Cluster-02`、Query CU 数量为 1、 集群类型为性能型的 Dedicated 集群。

```bash
curl --request POST \
     --url https://api.cloud.zilliz.com.cn/v2/clusters/createDedicated \
     --header 'Authorization: Bearer ${API_KEY}' \
     --header 'accept: application/json' \
     --header 'content-type: application/json' \
     --data-raw '{
        "clusterName": "Cluster-02",
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "regionId": "${REGION_ID}",
        "plan": "Enterprise",
        "clusterType": "Performance-optimized",
        "cuSize": 1
      }'
     
#  {
#    code: 0,
#    data: {
#      "clusterId": "inxx-xxxxxxxxxxxxxxx",
#      "username":"db_admin",
#      "password":"****************",
#      "prompt": "Successfully submitted, cluster is being created. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK with the admin account and the initial password you specified."
#     }
#  }
```

以下为参数说明：

- `{API_KEY}`：用于验证 API 请求的鉴权信息。请使用您自己的 Zilliz Cloud API 密钥。

- `clusterName`：需要创建的集群名称。

- `projectId`：需要创建的集群所属的项目的 ID。如需查看项目 ID，请使用[查看项目列表](/reference/restful/list-projects-v2)。

- `regionId`：需要创建的集群所部署的云服务地域 ID。如需查看所有 Zilliz Cloud 支持的云服务地域 ID，请使用[查看云服务区域](/reference/restful/list-cloud-regions-v2)。

- `clusterType`：集群的类型。可选的参数值包含：**Performance-optimized**（性能型）和 **Capacity-optimized**（容量型）。

- `cuSize`：集群的 Query CU 数量。参数值为 1-256 之间的整数。

更多详情，请参考[创建 Dedicated 集群](/reference/restful/create-dedicated-cluster-v2)。

</TabItem>

</Tabs>

## 创建 On-demand 集群\{#create-an-on-demand-cluster}

<Admonition type="info" icon="📘" title="说明">

此功能仅适用于**企业版**项目。

</Admonition>

- **通过 RESTful API**

    ```bash
    curl --request POST \
         --url "https://${BASE_URL}/v2/clusters/createQueryCluster" \
         --header "Authorization: Bearer ${API_KEY}" \
         --header "Accept: application/json" \
         --header "Content-Type: application/json" \
         --data-raw '{
            "projectId": "proj-09ee1f4b1151d5dd1edbc5",
            "regionId": "ali-cn-hangzhou",
            "clusterName": "my-on-demand",
            "cu": 8,
            "sessionTTL": "5m"
          }'
         
    # {
    #   "code": 0,
    #   "data": {
    #     "clusterId": "in07-7d6ac8697204a6a",
    #     "regionId": "ali-cn-hangzhou",
    #     "projectId": "proj-09ee1f4b1151d5dd1edbc5"
    #   }
    # }
    ```

    下表为参数说明。

    <table>
       <tr>
         <th><p><strong>参数</strong></p></th>
         <th><p><strong>说明</strong></p></th>
       </tr>
       <tr>
         <td><p><code>projectId</code></p></td>
         <td><p>创建 On-demand 集群的项目 ID。</p></td>
       </tr>
       <tr>
         <td><p><code>regionId</code></p></td>
         <td><p>部署集群的地域。必须与项目地域一致。</p></td>
       </tr>
       <tr>
         <td><p><code>cu</code></p></td>
         <td><p>要分配给该集群的 Query CU 数量。集群会根据负载在 0 和该值之间自动扩缩容——有请求到达时拉起至指定 Query CU，空闲时自动缩容至 0。</p><p>最小值为 8 CU，最大值为 256 CU，并且仅支持按 8 CU 递增（例如 8、16、24）。超过 8 CU 的集群需要绑定支付方式。</p><p>该值在创建后固定，无法修改。</p></td>
       </tr>
       <tr>
         <td><p><code>clusterName</code></p></td>
         <td><p>要创建的集群的名称。</p></td>
       </tr>
       <tr>
         <td><p><code>sessionTTL</code></p></td>
         <td><p>集群自动挂起前的空闲时间。在该时间内若未收到请求，集群将自动挂起以停止产生计算费用。</p><ul><li><p>示例: <code>"120s"</code>, <code>"5m"</code>, <code>"1h"</code></p></li><li><p>最小值: <code>"120s"</code></p></li></ul></td>
       </tr>
    </table>

- **通过 Web 控制台**

    [Supademo]

    <Procedures>

    1. 点击**按需计算**。

    1. 点击 **+ 集群**。

    1. 配置集群。

        下表为参数说明 。

        <table>
           <tr>
             <th><p><strong>参数</strong></p></th>
             <th><p><strong>说明</strong></p></th>
           </tr>
           <tr>
             <td><p>集群名称</p></td>
             <td><p>要创建的集群的名称。</p></td>
           </tr>
           <tr>
             <td><p>Query CU</p></td>
             <td><p>要分配给该集群的 Query CU 数量。集群会根据负载在 0 和该值之间自动扩缩容——有请求到达时拉起至指定 Query CU，空闲时自动缩容至 0。</p><p>最小值为 8 CU，最大值为 256 CU，并且仅支持按 8 CU 递增（例如 8、16、24）。超过 8 CU 的集群需要绑定支付方式。</p><p>该值在创建后固定，无法修改。</p></td>
           </tr>
           <tr>
             <td><p>自动挂起</p></td>
             <td><p>集群自动挂起前的空闲时间。默认值为 120 秒。在该时间内若未收到请求，集群将自动挂起以停止产生计算费用。</p></td>
           </tr>
        </table>

    1. 点击**创建**。

    </Procedures>

## 常见问题\{#faq}

**能否在创建集群时指定 Milvus 版本？**   

不支持。Zilliz Cloud 会自动使用最新的 Milvus 版本创建集群，并通过滚动升级保持版本更新。如需使用特定版本，请[提交工单](https://support.zilliz.com.cn/hc/zh-cn/requests/new)并说明您的使用场景。                                                         