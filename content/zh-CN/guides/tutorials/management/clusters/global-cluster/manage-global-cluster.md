---
title: "管理全球集群 | Cloud"
slug: /manage-global-cluster
sidebar_label: "管理全球集群"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本文介绍如何添加和删除从集群、将全球集群转换为普通集群，以及完全删除全球集群。 | Cloud"
type: origin
token: NpmyweSc9icYKak5XFvcP8iAnXd
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 管理全球集群

本文介绍如何添加和删除从集群、将全球集群转换为普通集群，以及完全删除全球集群。

<Admonition type="info" icon="📘" title="说明">

如需使用该功能请[提交工单](http://support.zilliz.com.cn)。

</Admonition>

## 前提条件\{#before-you-start}

- 请确保具备项目管理员权限。

- 主集群和从集群均不支持挂起操作。

## 添加从集群\{#add-secondary-cluster}

为提升地域覆盖能力，您可以为现有全球集群在不同区域添加更多从集群。

<Admonition type="info" icon="📘" title="说明">

1 个全球集群最多只能包含 **5 个从集群**。

</Admonition>

添加新的从集群后，Zilliz Cloud 将创建该集群并开始从主集群复制数据。新从集群显示为 CREATING 状态，初始数据同步完成后转为 RUNNING 状态。

- **通过 Web 控制台**

    以下 Demo 展示了如何添加从集群。

    <Supademo id="cmkat4dkp1h55ke4xyc8i7c9y" title=""  />

- **通过 RESTful API**

    以下示例展示了如何添加从集群。详情请参考[创建全球集群](https://docs.zilliz.com.cn/reference/restful/create-global-cluster-v2)。

    ```bash
    curl --request POST \
      --url "https://api.cloud.zilliz.com/v2/globalClusters/glo-xxxxxxxxxxxxxxxx/secondaryClusters" \
      --header "Authorization: Bearer ${API_KEY}" \
      --header "Accept: application/json" \
      --header "Content-Type: application/json" \
      --data-raw '{
        "secondaryClusters": [
          {
            "clusterName": "secondary-cluster-ap",
            "regionId": "aws-ap-southeast-1"
          }
        ]
      }'
    ```

    以下为输出结果。

    ```bash
    {
      "code": 0,
      "data": {
        "jobId": "job-xxxxxxxxxxxxxxxx"
      }
    }
    ```

## 删除从集群\{#drop-secondary-cluster}

当您不再需要某个区域的覆盖或希望降低成本时，可以删除从集群。

删除从集群后：

- 该从集群将从全球集群拓扑中移除。

- 向该集群的数据复制立即停止。

您可以通过 Web 控制台或 RESTful API 删除从集群。

- **通过 Web 控制台**

    以下截图展示了如何删除从集群。

    ![HoGrwE4RyhqZVNbG1WscPHVLnxl](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/HoGrwE4RyhqZVNbG1WscPHVLnxl.png)

- **通过 RESTful API**

    以下示例展示了如何删除从集群。详情请参考[删除全球集群成员集群](https://docs.zilliz.com.cn/reference/restful/delete-global-member-cluster-v2)。

    ```bash
    curl --request DELETE \
      --url "https://api.cloud.zilliz.com/v2/globalClusters/glo-xxxxxxxxxxxxxxxx/clusters/in01-xxxxxxxxxxxxxxx" \
      --header "Authorization: Bearer ${API_KEY}" \
      --header "Accept: application/json"
    ```

    以下为输出结果。

    ```bash
    {
      "code": 0,
      "data": {
        "globalClusterId": "glo-xxxxxxxxxxxxxxxx",
        "clusterId": "in01-xxxxxxxxxxxxxxx",
        "prompt": "The cluster has been deleted. If you consider this action to be an error, you have the option to restore the deleted cluster from the recycle bin within a 30-day period. Kindly note, this recovery feature does not apply to free clusters."
      }
    }
    ```

## 将全球集群转换为普通集群\{#convert-a-global-cluster-to-a-regular-cluster}

如果您不再需要多区域能力，但希望保留主集群及其数据，可以将全球集群转换回普通的 Dedicated 集群。

要将全球集群转换为普通集群，您需要：

<Procedures>

1. 删除所有从集群。

1. 在全球集群页面，点击操作下拉菜单中的**移除全球 Endpoint**。

    ![Q2ygwsmNdhXFreb2pzGcWFrBnIf](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/Q2ygwsmNdhXFreb2pzGcWFrBnIf.png)

</Procedures>

您还可以通过 RESTful API 移除全球 Endpoint。以下为示例代码，详情请参考[移除全球端点](https://docs.zilliz.com.cn/reference/restful/remove-global-endpoint-v2)。

```bash
curl --request POST \
  --url "https://api.cloud.zilliz.com/v2/globalClusters/glo-xxxxxxxxxxxxxxxx/removeGlobalEndpoint" \
  --header "Authorization: Bearer ${API_KEY}" \
  --header "Accept: application/json"
```

全球 Endpoint 移除后，通过全球 Endpoint 连接的应用将立即断开。请确保更新应用代码中的连接 Endpoint。下表说明了转换后的变化。

| **项目** | **行为** |
| --- | --- |
| 全球 Endpoint | 立即删除。使用该 Endpoint 的客户端将断开连接。 |
| 主集群 | 转为普通 Dedicated 集群，继续运行，所有数据保持不变。 |
| 数据复制 | 停止。数据复制指标将被清除。 |
| 全球集群元数据 | 清除（全球集群 ID、拓扑信息）。 |
| 备份策略 | 保留在原主集群上，不受影响。 |
| 计费 | [数据传输费用](./data-transfer-cost)停止计费。剩余集群按普通 [Dedicated 集群计费](./dedicated-cluster-cost)。 |

## 删除全球集群\{#drop-global-cluster}

如需完全删除全球集群，请先[删除所有从集群](./manage-global-cluster#drop-secondary-cluster)，然后删除主集群。主集群删除后，全球集群将自动移除。

