---
title: "GKE サービスアカウントの作成 | BYOC"
slug: /create-gke-service-account
sidebar_key: create-gke-service-account
sidebar_label: "GKE サービスアカウントの作成"
beta: CONTACT SALES
notebook: FALSE
description: "このページでは、Zilliz Cloud プロジェクト向けに Google Kubernetes Engine (GKE) クラスターをデプロイするために必要なサービスアカウントを作成し、構成する方法について説明します。| BYOC"
type: origin
token: JkXDwmB2QijMfvkLoWEclz9Nnbe
sidebar_position: 2
keywords: 
  - zilliz
  - byoc
  - byoc-i
  - gcp
  - 権限
  - 最小権限
  - milvus
  - ベクトルデータベース

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# GKE サービスアカウントの作成

このページでは、Zilliz Cloud プロジェクト用に Google Kubernetes Engine (GKE) クラスターをデプロイするためのサービスアカウントを作成し、構成する方法について説明します。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC は現在<strong>一般提供</strong>中です。アクセスおよび実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloud 営業担当者</a>までお問い合わせください。</p>

</Admonition>

## 手順\{#procedure}

Google Cloud Platform (GCP) ダッシュボードを使用して EKS ロールを作成できます。あるいは、Zilliz Cloud が提供する Terraform スクリプトを使用して、GCP 上の Zilliz Cloud プロジェクト向けインフラストラクチャをブートストラップすることもできます。詳細については、[Terraform Provider](./terraform-provider) を参照してください。

<Supademo id="cmc1oadayjm7fsn1rqyu2h33u" title=""  />

サービスアカウントを作成する手順は以下の通りです。

<Procedures>

1. GCP コンソールで、**IAM と管理** を見つけてクリックします。

1. 左側のナビゲーションペインで、**サービスアカウント** を選択します。

1. **サービスアカウントを作成** をクリックします。

1. 作成するサービスアカウントに適切な名前を設定します。

    このデモでは、`your-org-gke-node-sa` に設定できます。サービスアカウント ID は、サービスアカウント名の最初の 18 文字である必要があります。適切な値を手動で設定できます。

1. **作成して続行** をクリックします。

1. **権限** セクションで、**ロールの選択** ドロップダウンリストから **Kubernetes Engine Default Node Service アカウント** を選択します。

1. **IAM 条件を追加** をクリックし、条件タイトルを設定して、**条件エディタ** に条件式を入力します。条件は以下の通りです。

    ```json
    resource.name.startsWith("projects/PROJECT_ID/locations/REGION/clusters/CLUSTER_NAME")
    ```

    <Admonition type="info" icon="📘" title="Notes">

    <p>上記の式にある 3 つのプレースホルダーを実際の値に置き換える必要があります。</p>
    <ul>
    <li><code>PROJECT_ID</code></li>
    </ul>
    <p>これはあなたの GCP プロジェクト ID である必要があります。</p>
    <ul>
    <li><code>REGION</code></li>
    </ul>
    <p>これはあなたの BYOC プロジェクトのクラウドリージョンである必要があります。</p>
    <ul>
    <li><code>CLUSTER_NAME</code></li>
    </ul>
    <p>これは Zilliz Cloud があなたに代わって作成する GKE クラスターの名前である必要があります。</p>

    </Admonition>

1. **Save** をクリックします。

1. 設定した権限を付与するには、**Save** を再度クリックします。

</Procedures>