---
title: "グローバルクラスタの管理 | BYOC"
slug: /manage-global-cluster
sidebar_label: "グローバルクラスタの管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、セカンダリクラスタの追加と削除、グローバルクラスタの通常クラスタへの変換、およびグローバルクラスタ全体の削除について説明します。 | BYOC"
type: origin
token: DW9wwFlgAiwOhBk2PgucY4URnke
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# グローバルクラスタの管理

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Business Critical（SaaS）および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は、すべての AWS リージョンと、次の Google Cloud リージョンで利用できます：gcp-us-central1 および gcp-us-east4。Microsoft Azure では利用できません。

</FeatureNote>

このページでは、セカンダリクラスタの追加と削除、グローバルクラスタの通常クラスタへの変換、およびグローバルクラスタ全体の削除について説明します。

## 始める前に\{#before-you-start}

- **Project Admin** であることを確認してください。

- プライマリクラスタとセカンダリクラスタはいずれも一時停止できない点に注意してください。

## セカンダリクラスタを追加する\{#add-secondary-cluster}

リージョンのカバレッジを向上させるために、既存のグローバルクラスタに異なるリージョンのセカンダリクラスタを追加できます。

<Admonition type="info" icon="📘" title="注">

グローバルクラスタには最大 5 つのセカンダリクラスタまでしか追加できません。

</Admonition>

新しいセカンダリクラスタを追加すると、Zilliz Cloud はそれをプロビジョニングし、プライマリクラスタからのデータレプリケーションを開始します。新しいセカンダリクラスタは CREATING ステータスで表示され、初回のデータ同期が完了すると RUNNING に移行します。

- **Web コンソールから**

    次のデモは、1 つ以上のセカンダリクラスタを追加する方法を示しています。

    <Supademo id="cmkat4dkp1h55ke4xyc8i7c9y" title=""  />

- **RESTful API 経由**

    次の例では、AWS ap-southeast-1 にデプロイされた `secondary-cluster-ap` という名前の新しいセカンダリクラスタを追加します。API の詳細については、[セカンダリクラスタの追加](/reference/restful/add-secondary-clusters-v2) を参照してください。

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

## セカンダリクラスタを削除する\{#drop-secondary-cluster}

そのリージョンでのカバレッジが不要になった場合や、コストを削減したい場合は、セカンダリクラスタを削除できます。

セカンダリクラスタを削除すると、次のようになります。

- 削除されたセカンダリクラスタは、グローバルクラスタのトポロジーから取り除かれます。

- そのクラスタへのデータレプリケーションは即座に停止します。

セカンダリクラスタは、Web コンソールまたは RESTful API のいずれかで削除できます。

- **Web コンソールから**

    次のスクリーンショットは、セカンダリクラスタを削除する方法を示しています。

    ![KjCvwgeZWhTEHnb1t3Pc1NoXnCb](https://zdoc-images.s3.us-west-2.amazonaws.com/KjCvwgeZWhTEHnb1t3Pc1NoXnCb.png)

- **RESTful API 経由**

    次の例ではセカンダリクラスタを削除します。API の詳細については、[グローバルメンバークラスタの削除](/reference/restful/delete-global-member-cluster-v2) を参照してください。

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

## グローバルクラスタを通常クラスタに変換する\{#convert-a-global-cluster-to-a-regular-cluster}

マルチリージョン機能が不要になったものの、プライマリクラスタとそのデータは保持したい場合は、グローバルクラスタを通常の Dedicated クラスタに戻すことができます。 

グローバルクラスタを通常クラスタに変換するには、次の手順を実行する必要があります。

<Procedures>

1. すべてのセカンダリクラスタを[削除](./manage-global-cluster#drop-secondary-cluster)します。

1. **Global Cluster** ページで、**Actions** ドロップダウンから **Remove Global Endpoint** をクリックします。

    ![Qg0Mw7gCGh9vlfbMpxockJPVnUg](https://zdoc-images.s3.us-west-2.amazonaws.com/Qg0Mw7gCGh9vlfbMpxockJPVnUg.png)

</Procedures>

RESTful API を使用してグローバルエンドポイントを削除することもできます。以下はその例です。詳細については、[グローバルエンドポイントの削除](/reference/restful/remove-global-endpoint-v2) を参照してください。

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
| プライマリクラスタ | 通常の Dedicated クラスタになります。すべてのデータを保持したまま稼働を継続します。 |
| データレプリケーション | 停止します。データレプリケーションメトリクスは削除されます。 |
| グローバルクラスタメタデータ | クリアされます（グローバルクラスタ ID、トポロジー）。 |
| バックアップポリシー | 以前のプライマリクラスタにそのまま残り、変更されません。 |
| 課金 | [データ転送](./data-transfer-cost) 料金は停止します。残るクラスタは通常の [Dedicated クラスタ](./dedicated-cluster-cost) として課金されます。 |

## グローバルクラスタを削除する\{#drop-global-cluster}

グローバルクラスタ全体を削除するには、まず[すべてのセカンダリクラスタを削除](./manage-global-cluster#drop-secondary-cluster)し、その後プライマリクラスタを削除します。プライマリクラスタが削除されると、グローバルクラスタは自動的に削除されます。

