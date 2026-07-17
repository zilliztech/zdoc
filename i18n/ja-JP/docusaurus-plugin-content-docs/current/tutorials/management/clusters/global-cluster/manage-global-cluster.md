---
title: "Global Cluster を管理する | Cloud"
slug: /manage-global-cluster
sidebar_label: "Global Cluster を管理する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、secondary cluster の追加と削除、global cluster の通常の cluster への変換、および global cluster 全体の削除について説明します。 | Cloud"
type: origin
token: DW9wwFlgAiwOhBk2PgucY4URnke
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Global Cluster を管理する

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Business Critical (SaaS) および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能はすべての AWS リージョンと、次の Google Cloud リージョンで利用できます: gcp-us-central1 および gcp-us-east4。Microsoft Azure では利用できません。

</FeatureNote>

このページでは、secondary cluster の追加と削除、global cluster の通常の cluster への変換、および global cluster 全体の削除について説明します。

## 開始する前に\{#before-you-start}

- **Project Admin** であることを確認してください。

- primary cluster と secondary cluster はどちらも一時停止できないことに注意してください。

## secondary cluster を追加する\{#add-secondary-cluster}

リージョンのカバレッジを向上させるために、既存の global cluster に異なるリージョンの secondary cluster を追加できます。

<Admonition type="info" icon="📘" title="注意">

global cluster には最大 5 つの secondary cluster までしか追加できません。

</Admonition>

新しい secondary cluster を追加すると、Zilliz Cloud がそれをプロビジョニングし、primary からのデータレプリケーションを開始します。新しい secondary cluster は `CREATING` ステータスで表示され、初回のデータ同期が完了すると `RUNNING` に移行します。

- **Web コンソールから**

    次のデモは、1 つ以上の secondary cluster を追加する方法を示しています。

    <Supademo id="cmkat4dkp1h55ke4xyc8i7c9y" title=""  />

- **RESTful API から**

    次の例では、AWS ap-southeast-1 にデプロイされた `secondary-cluster-ap` という名前の新しい secondary cluster を追加します。API の詳細については、[Add Secondary Clusters](/reference/restful/add-secondary-clusters-v2) を参照してください。

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

    以下は出力例です。

    ```bash
    {
      "code": 0,
      "data": {
        "jobId": "job-xxxxxxxxxxxxxxxx"
      }
    }
    ```

## secondary cluster を削除する\{#drop-secondary-cluster}

そのリージョンでのカバレッジが不要になった場合や、コストを削減したい場合は、secondary cluster を削除できます。

secondary cluster を削除すると、次のようになります。

- 削除された secondary cluster は、global cluster のトポロジから取り除かれます。

- その cluster へのデータレプリケーションは直ちに停止します。

secondary cluster は、Web コンソールまたは RESTful API のいずれかで削除できます。

- **Web コンソールから**

    次のスクリーンショットは、secondary cluster を削除する方法を示しています。

    ![KjCvwgeZWhTEHnb1t3Pc1NoXnCb](https://zdoc-images.s3.us-west-2.amazonaws.com/KjCvwgeZWhTEHnb1t3Pc1NoXnCb.png)

- **RESTful API から**

    次の例では、secondary cluster を削除します。API の詳細については、[Delete Global Member Cluster](/reference/restful/delete-global-member-cluster-v2) を参照してください。

    ```bash
    curl --request DELETE \
      --url "https://api.cloud.zilliz.com/v2/globalClusters/glo-xxxxxxxxxxxxxxxx/clusters/in01-xxxxxxxxxxxxxxx" \
      --header "Authorization: Bearer ${API_KEY}" \
      --header "Accept: application/json"
    ```

    以下は出力例です。

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

## global cluster を通常の cluster に変換する\{#convert-a-global-cluster-to-a-regular-cluster}

マルチリージョン機能が不要になったものの、primary cluster とそのデータは保持したい場合は、global cluster を通常の Dedicated cluster に戻すことができます。 

global cluster を通常の cluster に変換するには、次の手順を実行する必要があります。

<Procedures>

1. すべての secondary clusters を[削除](./manage-global-cluster#drop-secondary-cluster)します。

1. **Global Cluster** ページで、**Actions** ドロップダウンから **Remove Global Endpoint** をクリックします。

    ![Qg0Mw7gCGh9vlfbMpxockJPVnUg](https://zdoc-images.s3.us-west-2.amazonaws.com/Qg0Mw7gCGh9vlfbMpxockJPVnUg.png)

</Procedures>

RESTful API を使用して global endpoint を削除することもできます。以下はその例です。詳細については、[Remove Global Endpoint](/reference/restful/remove-global-endpoint-v2) を参照してください。

```bash
curl --request POST \
  --url "https://api.cloud.zilliz.com/v2/globalClusters/glo-xxxxxxxxxxxxxxxx/removeGlobalEndpoint" \
  --header "Authorization: Bearer ${API_KEY}" \
  --header "Accept: application/json"
```

global endpoint が削除されると、global endpoint 経由で接続しているアプリケーションは直ちに切断されます。アプリケーションコード内の接続 endpoint を必ず更新してください。次の表は、変換後に何が起こるかを示しています。

| **Item** | **Behavior** |
| --- | --- |
| Global endpoint | 即座に削除されます。これを使用しているクライアントは切断されます。 |
| Primary cluster | 通常の Dedicated cluster になります。すべてのデータを保持したまま稼働を継続します。 |
| Data replication | 停止します。データレプリケーションのメトリクスは削除されます。 |
| Global cluster metadata | クリアされます（global cluster ID、トポロジ）。 |
| Backup policy | 以前の primary cluster にそのまま残り、変更されません。 |
| Billing | [Data transfer](./data-transfer-cost) の課金は停止します。残る cluster には通常の [Dedicated cluster](./dedicated-cluster-cost) として課金されます。 |

## global cluster を削除する\{#drop-global-cluster}

global cluster 全体を削除するには、まず[すべての secondary clusters を削除](./manage-global-cluster#drop-secondary-cluster)し、その後 primary cluster を削除します。primary cluster が削除されると、global cluster は自動的に削除されます。

