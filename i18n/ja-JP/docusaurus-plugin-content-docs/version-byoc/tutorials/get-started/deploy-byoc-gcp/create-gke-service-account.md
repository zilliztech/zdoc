---
title: "GKE サービスアカウントの作成 | BYOC"
slug: /create-gke-service-account
sidebar_label: "GKE サービスアカウントの作成"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud が Zilliz Cloud プロジェクト用に Google Kubernetes Engine (GKE) クラスターを展開するためのサービスアカウントを作成および構成する方法について説明します。 | BYOC"
type: origin
token: JkXDwmB2QijMfvkLoWEclz9Nnbe
sidebar_position: 2
keywords:
  - zilliz
  - byoc
  - byoc-i
  - gcp
  - permissions
  - minimum permissions
  - milvus
  - vector database
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# GKE サービスアカウントの作成

このページでは、Zilliz Cloud が Zilliz Cloud プロジェクト用に Google Kubernetes Engine (GKE) クラスターを展開するためのサービスアカウントを作成および構成する方法について説明します。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC は現在、<strong>一般提供</strong>されています。アクセスおよび実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloud 営業担当</a>にお問い合わせください。</p>

</Admonition>

## 手順\{#procedure}

Google Cloud Platform (GCP) ダッシュボードを使用して EKS ロールを作成できます。別の方法として、Zilliz Cloud が提供する Terraform スクリプトを使用して、GCP 上の Zilliz Cloud プロジェクト用インフラストラクチャをブートストラップできます。詳細については、[Terraform プロバイダー](./terraform-provider) を参照してください。

<Supademo id="cmc1oadayjm7fsn1rqyu2h33u" title=""  />

サービスアカウントを作成する手順は以下のとおりです：

1. GCP コンソールで、**IAM & Admin** を検索してクリックします。

1. 左側のナビゲーションペインで **サービスアカウント** を選択します。

1. **サービスアカウントを作成** をクリックします。

1. 作成するサービスアカウントに適切な名前を設定します。

    このデモでは、`your-org-gke-node-sa` に設定できます。サービスアカウントIDはサービスアカウント名の最初の18文字です。適切な値に手動で設定できます。

1. **作成して続行** をクリックします。

1. **権限** セクションで、**ロールの選択** ドロップダウンリストから **Kubernetes Engine Default Node Service Account** を選択します。

1. **IAM条件を追加** をクリックし、条件のタイトルを設定し、**条件エディター** に条件式を入力します。条件は以下のとおりです：

    ```json
    resource.name.startsWith("projects/PROJECT_ID/locations/REGION/clusters/CLUSTER_NAME")
    ```

    <Admonition type="info" icon="📘" title="Notes">

    <p>上記の式の3つのプレースホルダーを実際の値に置き換える必要があります：</p>
    <ul>
    <li><code>PROJECT_ID</code></li>
    </ul>
    <p>これはあなたの GCP プロジェクトIDである必要があります。</p>
    <ul>
    <li><code>REGION</code></li>
    </ul>
    <p>これは BYOC プロジェクトのクラウドリージョンである必要があります。</p>
    <ul>
    <li><code>CLUSTER_NAME</code></li>
    </ul>
    <p>これは Zilliz Cloud が代理で作成する GKE クラスターの名前である必要があります。</p>

    </Admonition>

1. **保存** をクリックします。

1. 設定された権限を付与するために、**保存** をもう一度クリックします。
