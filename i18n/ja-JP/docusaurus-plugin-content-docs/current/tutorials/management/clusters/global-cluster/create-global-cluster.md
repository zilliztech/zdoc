---
title: "グローバルクラスターの作成 | Cloud"
slug: /create-global-cluster
sidebar_label: "グローバルクラスターの作成"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、グローバルクラスターの作成方法について説明します。 | Cloud"
type: origin
token: MZ2WwklE5ifX4hkO4ZOcXz0indc
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# グローバルクラスターの作成

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Business Critical (SaaS) および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

この機能は、すべての AWS リージョンおよび Google Cloud の gcp-us-central1 と gcp-us-east4 リージョンで利用可能です。Microsoft Azure では利用できません。

</FeatureNote>

このガイドでは、グローバルクラスターの作成方法について説明します。

既存のクラスターでグローバルクラスター機能を有効にする場合は、[クラスターの管理](./manage-cluster#convert-to-a-global-cluster) を参照してください。

## 事前準備\{#before-you-start}

- **Project Admin** 権限を持っていることを確認してください。

- 現在、この機能はすべての AWS リージョンと、Google Cloud の us-central1 および us-east4 リージョンで利用できます。Google Cloud リージョンでグローバルクラスターを作成する場合は、[お問い合わせ](http://support.zilliz.com) ください。

- グローバルクラスターは Milvus 2.6.x にのみ対応しています。

## グローバルクラスターの作成\{#create-a-global-cluster}

- **Web コンソールを使用する場合**

    <Procedures>

    1. **クラスター設定** で **グローバルクラスター** の横にあるスイッチをオンにします。

    1. グローバルクラスターの名前を入力します。

        ![C33Vw8MCshNOoAbDTbjcegOIndd](https://zdoc-images.s3.us-west-2.amazonaws.com/C33Vw8MCshNOoAbDTbjcegOIndd.png)

    1. プライマリクラスターを設定します。

        ![MkZTwsJhfhpKzUbCKcRcJscdnXe](https://zdoc-images.s3.us-west-2.amazonaws.com/MkZTwsJhfhpKzUbCKcRcJscdnXe.png)

        各パラメーターの説明は以下の通りです。

        | **パラメーター** | **説明** |
        | --- | --- |
        | クラスター名 | プライマリクラスターの名前です。 |
        | リージョン | プライマリクラスターをデプロイするリージョンです。 |
        | クラスタータイプ | プライマリクラスターのクラスタータイプ。すべてのセカンダリクラスターは、プライマリクラスターと同じクラスタータイプを使用します。 |
        | Query CU | 自動スケーリングはデフォルトで有効です。入力ボックスに値を入力するかスライダーをドラッグして、自動スケーリング時の Query CU の最小値と最大値を設定できます。詳細については、[自動スケーリング](./auto-scaling) を参照してください。<br/>自動スケーリングを無効にすることも可能です。<br/>セカンダリクラスターの Query CU 数は、プライマリクラスターの設定に連動します。 |
        | レプリカ | プライマリクラスターのレプリカ数です。プライマリクラスターと各セカンダリクラスターで異なるレプリカ数を設定できます。 |

    1. セカンダリクラスターを設定します。セカンダリクラスターは **最大 5 つ** まで作成できます。

        ![NjNUwjHuKhGRwObLoyQc1FKxnVh](https://zdoc-images.s3.us-west-2.amazonaws.com/NjNUwjHuKhGRwObLoyQc1FKxnVh.png)

        各パラメーターの説明は以下の通りです。

        | **パラメーター** | **説明** |
        | --- | --- |
        | クラスター名 | セカンダリクラスターの名前です。 |
        | リージョン | セカンダリクラスターをデプロイするリージョンです。 |
        | レプリカ | セカンダリクラスターのレプリカ数です。プライマリクラスターと各セカンダリクラスターで異なるレプリカ数を設定できます。 |

    1. **作成** をクリックします。

        ![Z9xYwy7dKhQMGob52EzcFpAnnmh](https://zdoc-images.s3.us-west-2.amazonaws.com/Z9xYwy7dKhQMGob52EzcFpAnnmh.png)

    </Procedures>

    グローバルクラスターを作成すると、Zilliz Cloud が以下の処理を実行します:

    1. グローバルクラスター、およびそのプライマリクラスターとセカンダリクラスターのプロビジョニングを開始します。プロビジョニング中、すべてのクラスターは **CREATING** ステータスで表示されます。

    1. プライマリクラスターとセカンダリクラスターの両方のプロビジョニングが完了すると、ステータスが **RUNNING** に変わり、データレプリケーションが開始されます。

    **グローバルクラスター** ページの **グローバルトポロジー** タブから、データ同期のステータスと遅延状況を確認できます。

    ![CLpZwH1e3hd3F1bIXisc6u7GnDg](https://zdoc-images.s3.us-west-2.amazonaws.com/CLpZwH1e3hd3F1bIXisc6u7GnDg.png)

- **RESTful API を使用する場合**

    以下の例では、AWS us-west-2 にプライマリクラスター、AWS eu-west-1 にセカンダリクラスターを配置したグローバルクラスターを作成します。API の詳細については、[グローバルクラスターの作成](/reference/restful/create-global-cluster-v2) を参照してください。

    ```bash
    curl --request POST \
      --url "https://api.cloud.zilliz.com/v2/globalClusters/create" \
      --header "Authorization: Bearer ${API_KEY}" \
      --header "Accept: application/json" \
      --header "Content-Type: application/json" \
      --data-raw '{
        "globalClusterName": "my-global-cluster",
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "cuType": "Performance-optimized",
        "cuSize": 4,
        "primaryCluster": {
          "clusterName": "primary-cluster",
          "regionId": "aws-us-west-2"
        },
        "secondaryClusters": [
          {
            "clusterName": "secondary-cluster-eu",
            "regionId": "aws-eu-west-1"
          }
        ]
      }'
    ```

    出力例は以下の通りです。

    ```json
    {
      "code": 0,
      "data": {
        "globalClusterId": "glo-xxxxxxxxxxxxxxxx",
        "username": "db_admin",
        "password": "********",
        "jobId": "job-xxxxxxxxxxxxxxxx"
      }
    }
    ```

    グローバルクラスターの作成時に、Query CU の自動スケーリングや、プライマリ・セカンダリクラスターそれぞれのレプリカ数を個別に設定することも可能です。以下に設定例を示します。

    ```bash
    curl --request POST \
      --url "https://api.cloud.zilliz.com/v2/globalClusters/create" \
      --header "Authorization: Bearer ${API_KEY}" \
      --header "Accept: application/json" \
      --header "Content-Type: application/json" \
      --data-raw '{
        "globalClusterName": "my-global-cluster",
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "cuType": "Performance-optimized",
        "autoscaling": {
          "cu": {
            "min": 4,
            "max": 16
          }
        },
        "primaryCluster": {
          "clusterName": "primary-cluster",
          "regionId": "aws-us-west-2",
          "replica": 2
        },
        "secondaryClusters": [
          {
            "clusterName": "secondary-cluster-eu",
            "regionId": "aws-eu-west-1",
            "replica": 1
          }
        ]
      }
    ```
