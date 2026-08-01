---
title: "管理集群 | BYOC"
slug: /manage-cluster
sidebar_label: "管理集群"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本文介绍如了集群的生命周期，以便您能够充分利用 Zilliz Cloud 控制台来管理集群。 | BYOC"
type: origin
token: IRirwe30tilo1qkJlR7ca2MUnvn
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 管理集群

本文介绍如了集群的生命周期，以便您能够充分利用 Zilliz Cloud 控制台来管理集群。

## 重命名集群\{#rename-cluster}

<Procedures>

1. 前往目标集群的**集群详情**页。

1. 点击**操作**并选择**重命名**。

    ![PGmQbV5RFom1emxTc0Kct0sQnAb](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/pgmqbv5rfom1emxtc0kct0sqnab.png "PGmQbV5RFom1emxTc0Kct0sQnAb")

1. 输入集群的新名称并点击**保存**。

    ![XGqrbaHUKoTJ1rx6vifcdnYqnmg](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/xgqrbahukotj1rx6vifcdnyqnmg.png "XGqrbaHUKoTJ1rx6vifcdnYqnmg")

</Procedures>

## 修改集群描述\{#edit-description}

<Procedures>

1. 前往目标集群的**集群详情**页。

1. 鼠标移动到集群描述上，点击**编辑**按钮。

    ![NZTpbPC9NoEdDlxE0ndcmaSmn1b](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/nztpbpc9noeddlxe0ndcmasmn1b.png "NZTpbPC9NoEdDlxE0ndcmaSmn1b")

1. 输入集群的新描述并点击**保存**。

    ![Ot7Vb8HN7oufPoxnMQPc6vItnXg](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/ot7vb8hn7oufpoxnmqpc6vitnxg.png "Ot7Vb8HN7oufPoxnMQPc6vItnXg")

</Procedures>

## 挂起集群\{#suspend-cluster}

您可以通过 Web 控制台或使用 RESTful API 和 SDK 挂起 Dedicated 集群。

<Tabs groupId="cluster" defaultValue="console" values={[{"label":"Cloud 控制台","value":"console"},{"label":"cURL","value":"bash"}]}>

<TabItem value="console">

前往目标集群的**集群详情**页，并跟随以下指南挂起 Dedicated 集群。

<Supademo id="cm9uraerl02a5wbbiavqhws6u" title=""  />

</TabItem>

<TabItem value="bash">

以下为示例代码，请将示例中的 `{API_KEY}` 替换为您自己的Zilliz Cloud API 密钥。

以下 `POST` 通过请求体挂起了 Dedicated 集群。

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com.cn/v2/clusters/${CLUSTER_ID}/suspend" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \

# {
#     "code": 0,
#     "data": {
#         "clusterId": "inxx-xxxxxxxxxxxxxxx",
#         "prompt": "Successfully Submitted. The cluster will not incur any computing costs when suspended. You will only be billed for the storage costs during this time."
#     }
# }     
```

以下为参数说明：

- `{API_KEY}`：用于验证 API 请求的鉴权信息。请使用您自己的 Zilliz Cloud API 密钥。值得注意的是，API 密钥仅能用于调用平台 API（控制面）请求。对于数据面连接，请使用集群鉴权凭据（`username:password`）。

- `{CLUSTER_ID}`: 需要挂起的 Dedicated 集群的 ID。

更多详细信息，请参考[挂起集群](https://docs.zilliz.com.cn/reference/restful/suspend-cluster-v2)。

</TabItem>

</Tabs>

集群挂起请求成功后，会生成一条任务记录。您可以前往[任务中心](./job-center)查看任务进度。

## 恢复运行集群\{#resume-cluster}

请注意，在集群处于“恢复运行中”的状态下，您无法对集群进行其他操作。

您可以通过 Web 控制台或使用 RESTful API 和 SDK 恢复运行集群。

<Tabs groupId="cluster" defaultValue="console" values={[{"label":"Cloud 控制台","value":"console"},{"label":"cURL","value":"bash"}]}>

<TabItem value="console">

前往目标集群的**集群详情**页，并跟随以下指南恢复运行集群。

<Supademo id="cm9urqadl02ifwbbijvvktj23" title=""  />

<Admonition type="info" icon="📘" title="说明">

在单击**恢复运行**后，您将看到自动弹出的**检查项目资源配额**窗口。如果当前项目的资源充足，该窗口在检查完成后会自动消失。如果资源不足，您可以：

- 单击**前往项目资源设置**按钮，以便编辑当前项目的资源设置，或者

- 单击**返回上一步**按钮，以便编辑当前集群的相关设置。

操作期间会消耗少量额外资源，并在操作完成后释放。

</Admonition>

</TabItem>

<TabItem value="bash">

以下为示例代码，请将示例中的 `{API_KEY}` 替换为您自己的Zilliz Cloud API 密钥。

以下 `POST` 通过请求体将集群回复运行。

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com.cn/v2/clusters/${CLUSTER_ID}/resume" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \

# {
#     "code": 0,
#     "data": {
#         "clusterId": "inxx-xxxxxxxxxxxxxxx",
#         "prompt": "successfully Submitted. Cluster is being resumed, which is expected to takes several minutes. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK."
#     }
# }     
```

以下为参数说明：

- `{API_KEY}`：用于验证 API 请求的鉴权信息。请使用您自己的 Zilliz Cloud API 密钥。值得注意的是，API 密钥仅能用于调用平台 API（控制面）请求。对于数据面连接，请使用集群鉴权凭据（`username:password`）。

- `{CLUSTER_ID}`: 需要恢复运行的集群的 ID。

更多详细信息，请参考[恢复集群](https://docs.zilliz.com.cn/reference/restful/resume-cluster-v2)。

</TabItem>

</Tabs>

集群恢复运行请求成功后，会生成一条任务记录。您可以前往[任务中心](./job-center)查看任务进度。

## 删除集群\{#drop-cluster}

您可以删除不再需要的集群。您可以通过 Web 控制台或使用 RESTful API 和 SDK 删除集群。

<Tabs groupId="cluster" defaultValue="console" values={[{"label":"Cloud 控制台","value":"console"},{"label":"cURL","value":"bash"}]}>

<TabItem value="console">

前往目标集群的**集群详情**页，并跟随以下指南删除集群。

<Supademo id="cm9us4mn102n1wbbinzd427jg" title=""  />

</TabItem>

<TabItem value="bash">

以下为示例代码，请将示例中的 `{API_KEY}` 替换为您自己的Zilliz Cloud API 密钥。

以下 `DELETE` 通过请求体删除了集群。

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com.cn/v2/clusters/${CLUSTER_ID}/drop" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \

# {
#     "code": 0,
#     "data": {
#         "clusterId": "inxx-xxxxxxxxxxxxxxx",
#         "prompt": "The cluster has been deleted. If you consider this action to be an error, you have the option to restore the deleted cluster from the recycle bin within a 30-day period. Kindly note, this recovery feature does not apply to free clusters."
#     }
# }     
```

以下为参数说明：

- `{API_KEY}`：用于验证 API 请求的鉴权信息。请使用您自己的 Zilliz Cloud API 密钥。值得注意的是，API 密钥仅能用于调用平台 API（控制面）请求。对于数据面连接，请使用集群鉴权凭据（`username:password`）。

- `{CLUSTER_ID}`: 需要恢复运行的集群的 ID。

更多详细信息，请参考[删除集群](https://docs.zilliz.com.cn/reference/restful/drop-cluster-v2)。

</TabItem>

</Tabs>

