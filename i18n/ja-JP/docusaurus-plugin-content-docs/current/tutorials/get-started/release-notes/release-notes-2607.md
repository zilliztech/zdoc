---
title: "2026年7月 リリースノート | Cloud"
slug: /release-notes-2607
sidebar_label: "2026年7月"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "(プレースホルダー) | Cloud"
type: origin
token: CUuywySLVil4MKkmYZecUl9snLg
sidebar_position: 2
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 2026年7月 リリースノート

<Grid columnSize="2" widthRatios="15,84">

    <div>

        **2026-07-30**

    </div>

    <div>

        ## 機能強化\{#enhancements}

        - **Hugging Face 埋め込みモデル** — Bring Your Own Key 統合を通じて、Hugging Face がモデルプロバイダーとして利用可能になりました。詳細は、[Hugging Face](./hugging-face) を参照してください。

        - **BYOC のオンデマンド利用**: BYOC 組織は、オンデマンド利用を有効にすることで、コミット済み vCPU 容量を超えて引き続きスケールできるようになりました。コミットメントを超えた使用量は vCPU-分単位で計測され、Usage および Invoice ページに反映されます。詳細は、[Understand BYOC Billing](/docs/byoc/understand-byoc-billing) を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="15,84">

    <div>

        **2026-07-15**

    </div>

    <div>

        ## BYOC が Storage Integration と External Volume をサポート\{#byoc-supports-storage-integrations-and-external-volumes}

        BYOC が Storage Integration と External Volume をサポートするようになりました。クロスアカウント認可を通じてオブジェクトストレージバケットを統合し、External Volume として設定できるようになりました。

        - **IAM ベースの認可:** 長期的なクラウド認証情報を埋め込むことなく、IAM を通じてバケットアクセスを認可します。

        詳細は、[Integrate with AWS S3](./integrate-with-aws-s3) および [External Volumes](./external-volume) を参照してください。

        ## BYOC が Cluster Access 用の API Key をサポート\{#byoc-supports-api-key-for-cluster-access}

        API Key を使用して cluster endpoint 経由で cluster にアクセスできるようになりました。cluster レベルのきめ細かなアクセス制御を備えたカスタマイズ API Key もサポートされています。

        詳細は、[API Keys](/docs/byoc/manage-api-keys) を参照してください。

        ## オンデマンド Cluster 向け collection レベルのメトリクス\{#collection-level-metrics-for-on-demand-clusters}

        オンデマンド Cluster では、レイテンシーや QPS を含む collection レベルのパフォーマンスメトリクスが Web コンソールで表示されるようになり、ワークロードの挙動を切り分けて、個々の collection をより正確にトラブルシュートできるようになりました。

        詳細は、[Metrics Reference](./metrics-alerts-reference) を参照してください。

        ## オンデマンド database と有料 volume のストレージおよび storage-request 課金\{#storage-and-storage-request-billing-for-on-demand-databases-and-paid-volumes}

        Vector Lakebase では、AWS 上のオンデマンド database に対するストレージ容量の計測と課金が開始されました。storage request は、オンデマンド database と有料 volume の両方で課金されるようになり、どのストレージリソースと操作がコストに寄与しているかをより明確に把握できます。

        詳細は、[On-Demand Compute Cost](./on-demand-compute-cost) および [Storage Request Cost](./storage-request-cost) を参照してください。

        ## RESTful API による storage integration の管理\{#manage-storage-integrations-through-restful-apis}

        RESTful API を通じて Storage Integrations をプログラムで管理できるようになりました。この API は integration の作成、一覧表示、詳細取得、検証、削除をサポートし、RESTful API、CLI、Terraform 間で自動化ワークフローを統一します。

        詳細は、[Storage Integration Operations](/reference/restful/storage-integration-operations-v2) および [Integrate with AWS S3](./integrate-with-aws-s3) を参照してください。

        ## ユーザーとロールに説明を追加\{#add-descriptions-to-users-and-roles}

        cluster ユーザーとロールに説明を追加および表示できるようになり、権限の識別と管理が容易になりました。説明の更新は API と監査ログからも利用できます。

        詳細は、以下のドキュメントを参照してください。

        - [Manage Cluster Users (Console)](./cluster-users)

        - [Manage Cluster User (SDK)](./cluster-users-sdk)

        - [Manage Cluster Roles (Console)](./cluster-roles)

        - [Manage Cluster Roles (SDK)](./cluster-roles-sdk)

        ## 機能強化\{#enhancements}

        - **Global Cluster: Global Cluster は、自動化ワークフロー向けに RESTful API と Terraform の両方をサポートするようになりました。

        - **オンデマンド Search の Azure 提供リージョン拡大:** マネージド collection を備えたオンデマンド Search が Azure East US で利用可能になりました。詳細は、[Cloud Providers & Regions](./cloud-providers-and-regions) および [On-Demand Cluster](/docs/on-demand-cluster) を参照してください。

        - **より高いスケール上限:** 最大レプリカ数は 100 となり、Dedicated Query CU 上限は 2,048 になりました。詳細は、[Zilliz Cloud Limits](./limits) を参照してください。

        - **オンデマンド Cluster の auto-suspend をカスタマイズ:** cluster 作成後にオンデマンド Cluster の auto-suspend 間隔を更新できるようになりました。これにより、ワークロードパターンの変化に応じて、クエリの即応性とアイドル時のコンピュートコストのバランスをより細かく制御できます。詳細は、[On-Demand Cluster](/docs/on-demand-cluster) を参照してください。

        - **機能ガイダンスの改善:** 製品内ガイダンスが新しくなり、CMEK、Global Cluster、Cross-Region Backup を見つけて設定しやすくなりました。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="15,84">

    <div>

        **2026-07-06**

    </div>

    <div>

        ## GCP で BYOC-I が利用可能に\{#byoc-i-now-available-on-gcp}

        Zilliz Cloud **Bring Your Own Cloud Infrastructure (BYOC-I)** が **Google Cloud Platform (GCP)** をサポートするようになりました。

        - **セキュリティの強化:** BYOC-I により、Kubernetes API をパブリックインターネットへ公開する必要がなくなります。

        - **高度な柔軟性:** BYOC-I により、公式 Terraform Provider を通じて、より広範なカスタムネットワーク設定が可能になります。企業ニーズに合わせた構成が行えるようになりました。

        詳細は、手順ごとの手動ガイドについては [Deploy BYOC-I on GCP](/docs/byoc/deploy-byoc-i-gcp)、IaC 自動化については [Terraform Provider](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs) を参照してください。

        ## 機能強化\{#enhancements}

        - **オンデマンド Cluster の提供リージョン拡大** — オンデマンド Clusters は、Serving Dedicated のサポート対象リージョンに合わせて、すべての AWS リージョンで利用可能になりました。

    </div>

</Grid>

