---
title: "グローバルクラスターの管理 | BYOC"
slug: /manage-global-cluster
sidebar_label: "グローバルクラスターの管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、セカンダリクラスターの追加と削除、グローバルクラスターの通常クラスターへの変換、およびグローバルクラスター全体の削除について説明します。 | BYOC"
type: origin
token: DW9wwFlgAiwOhBk2PgucY4URnke
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# グローバルクラスターの管理

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Business Critical（SaaS）および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は、すべての AWS リージョンおよび次の Google Cloud リージョン（gcp-us-central1、gcp-us-east4）で利用できます。Microsoft Azure では利用できません。

</FeatureNote>

このページでは、セカンダリクラスターの追加と削除、グローバルクラスターの通常クラスターへの変換、およびグローバルクラスター全体の削除について説明します。

## 事前準備\{#before-you-start}

- **Project Admin** であること。

- プライマリクラスターとセカンダリクラスターはいずれも一時停止できない点に注意すること。

## セカンダリクラスターを追加する\{#add-secondary-cluster}

リージョンのカバレッジを向上させるために、既存のグローバルクラスターに異なるリージョンのセカンダリクラスターを追加できます。

<Admonition type="info" title="Notes">

グローバルクラスターには、セカンダリクラスターを最大5つまでしか追加できません。

</Admonition>

新しいセカンダリクラスターを追加すると、Zilliz Cloud がそれをプロビジョニングし、プライマリクラスターからのデータレプリケーションを開始します。新しいセカンダリクラスターは CREATING ステータスで表示され、初回のデータ同期が完了すると RUNNING に移行します。

- **Web コンソールを使用する場合**

    次のデモでは、1つ以上のセカンダリクラスターを追加する方法を示しています。

    <Supademo id="cmkat4dkp1h55ke4xyc8i7c9y" title=""  />

- **RESTful API を使用する場合**

    次の例では、AWS ap-southeast-1 にデプロイされた `secondary-cluster-ap` という名前の新しいセカンダリクラスターを追加します。API の詳細については、[Add Secondary クラスター](/reference/restful/add-secondary-clusters-v2) を参照してください。

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

    出力例は以下のとおりです。

    ```bash
    {
      "code": 0,
      "data": {
        "jobId": "job-xxxxxxxxxxxxxxxx"
      }
    }
    ```

## セカンダリクラスターを削除する\{#drop-secondary-cluster}

そのリージョンでのカバレッジが不要になった場合や、コストを削減したい場合は、セカンダリクラスターを削除できます。

セカンダリクラスターを削除すると、次のようになります。

- 削除されたセカンダリクラスターは、グローバルクラスターのトポロジーから取り除かれます。

- そのクラスターへのデータレプリケーションは直ちに停止します。

セカンダリクラスターは、Web コンソールまたは RESTful API を使用して削除できます。

- **Web コンソールを使用する場合**

    次のスクリーンショットは、セカンダリクラスターを削除する方法を示しています。

    ![KjCvwgeZWhTEHnb1t3Pc1NoXnCb](https://zdoc-images.s3.us-west-2.amazonaws.com/KjCvwgeZWhTEHnb1t3Pc1NoXnCb.png)

- **RESTful API を使用する場合**

    次の例では、セカンダリクラスターを削除します。API の詳細については、[Delete Global Member Cluster](/reference/restful/delete-global-member-cluster-v2) を参照してください。

    ```bash
    curl --request DELETE \
      --url "https://api.cloud.zilliz.com/v2/globalClusters/glo-xxxxxxxxxxxxxxxx/clusters/in01-xxxxxxxxxxxxxxx" \
      --header "Authorization: Bearer ${API_KEY}" \
      --header "Accept: application/json"
    ```

    出力例は以下のとおりです。

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

## グローバルクラスターを通常クラスターに変換する\{#convert-a-global-cluster-to-a-regular-cluster}

マルチリージョン機能が不要になったものの、プライマリクラスターとそのデータは保持したい場合は、グローバルクラスターを通常の Dedicated クラスターに戻すことができます。

グローバルクラスターを通常クラスターに変換するには、次の手順を実行する必要があります。

<Procedures>

1. すべてのセカンダリクラスターを[削除](./manage-global-cluster#drop-secondary-cluster)します。

1. **Global Cluster** ページで、**Actions** ドロップダウンから **Remove Global Endpoint** をクリックします。

    ![Qg0Mw7gCGh9vlfbMpxockJPVnUg](https://zdoc-images.s3.us-west-2.amazonaws.com/Qg0Mw7gCGh9vlfbMpxockJPVnUg.png)

</Procedures>

RESTful API を使用してグローバルエンドポイントを削除することもできます。以下に例を示します。詳細については、[Remove Global Endpoint](/reference/restful/remove-global-endpoint-v2) を参照してください。

```bash
curl --request POST \
  --url "https://api.cloud.zilliz.com/v2/globalClusters/glo-xxxxxxxxxxxxxxxx/removeGlobalEndpoint" \
  --header "Authorization: Bearer ${API_KEY}" \
  --header "Accept: application/json"
```

グローバルエンドポイントが削除されると、グローバルエンドポイント経由で接続しているアプリケーションは直ちに切断されます。アプリケーションコード内の接続エンドポイントを必ず更新してください。変換後に何が起こるかを次の表に示します。

| **項目** | **動作** |
| --- | --- |
| グローバルエンドポイント | 直ちに削除されます。これを使用しているクライアントは切断されます。 |
| プライマリクラスター | 通常の Dedicated クラスターになります。すべてのデータを保持したまま稼働を継続します。 |
| データレプリケーション | 停止します。データレプリケーションメトリクスは削除されます。 |
| グローバルクラスターメタデータ | クリアされます（グローバルクラスター ID、トポロジー）。 |
| バックアップポリシー | 以前のプライマリクラスターにそのまま残り、変更されません。 |

## グローバルクラスターを削除する\{#drop-global-cluster}

グローバルクラスター全体を削除するには、まず[すべてのセカンダリクラスターを削除](./manage-global-cluster#drop-secondary-cluster)し、その後プライマリクラスターを削除します。プライマリクラスターが削除されると、グローバルクラスターは自動的に削除されます。
