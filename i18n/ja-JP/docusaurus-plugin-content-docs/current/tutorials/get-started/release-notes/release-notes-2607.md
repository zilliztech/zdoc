---
title: "2026年7月 リリースノート | Cloud"
slug: /release-notes-2607
sidebar_label: "2026年7月"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "(placeholder) | Cloud"
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

        **2026-07-15**

    </div>

    <div>

        ## BYOC が Storage Integration と External Volume をサポート\{#byoc-supports-storage-integrations-and-external-volumes}

        BYOC が Storage Integration と External Volume をサポートするようになりました。クロスアカウント認証を通じてオブジェクトストレージのバケットを統合し、それを external volume として設定できるようになりました。

        - **IAM ベースの認証:** 長期的なクラウド認証情報を埋め込むことなく、IAM を通じてバケットアクセスを認可できます。

        詳細については、[AWS S3 と統合する](./integrate-with-aws-s3) および [External Volumes](./external-volume) を参照してください。

        ## BYOC が cluster access 向け API Key をサポート\{#byoc-supports-api-key-for-cluster-access}

        cluster endpoint を使用して API Key により cluster にアクセスできるようになりました。cluster レベルのきめ細かなアクセス制御を備えたカスタマイズ API Key もサポートされています。

        詳細については、[API Keys](/docs/byoc/manage-api-keys) を参照してください。

        ## On-Demand Clusters の collection レベルメトリクス\{#collection-level-metrics-for-on-demand-clusters}

        On-Demand Clusters で、レイテンシーや QPS を含む collection レベルのパフォーマンスメトリクスが Web コンソールで公開されるようになりました。これにより、ワークロードの挙動を切り分け、個々の collection をより正確にトラブルシュートできます。

        詳細については、[Metrics Reference](./metrics-alerts-reference) を参照してください。

        ## On-Demand databases と有料 volumes の storage および storage-request 課金\{#storage-and-storage-request-billing-for-on-demand-databases-and-paid-volumes}

        Vector Lakebase は現在、AWS 上の On-Demand databases に対するストレージ容量の計測および課金を行います。storage request は、On-Demand databases と有料 volumes の両方に対して課金されるため、どのストレージリソースと操作がコストに寄与しているかをより明確に把握できます。

        詳細については、[On-Demand Compute Cost](./on-demand-compute-cost) および [Storage Request Cost](./storage-request-cost) を参照してください。

        ## RESTful APIs による storage integrations の管理\{#manage-storage-integrations-through-restful-apis}

        RESTful APIs を通じて Storage Integrations をプログラムで管理できるようになりました。この API は integration の作成、一覧表示、詳細表示、検証、削除をサポートし、RESTful API、CLI、Terraform 間で自動化ワークフローを統一します。

        詳細については、[Storage Integration Operations](/reference/restful/storage-integration-operations-v2) および [AWS S3 と統合する](./integrate-with-aws-s3) を参照してください。

        ## users と roles に説明を追加\{#add-descriptions-to-users-and-roles}

        cluster users と roles に説明を追加および表示できるようになり、権限の識別と管理がより簡単になりました。説明の更新は API と監査ログでも利用できます。

        詳細については、以下のドキュメントを参照してください。

        - [Cluster Users を管理する (Console)](./cluster-users)

        - [Cluster User を管理する (SDK)](./cluster-users-sdk)

        - [Cluster Roles を管理する (Console)](./cluster-roles)

        - [Cluster Roles を管理する (SDK)](./cluster-roles-sdk)

        ## 機能強化\{#enhancements}

        - **Global Cluster:** Global Cluster が自動化ワークフロー向けに RESTful APIs と Terraform の両方をサポートするようになりました。

        - **On-Demand Search の Azure 提供リージョンを拡大:** managed collections を備えた On-Demand Search が Azure East US で利用可能になりました。詳細については、[Cloud Providers & Regions](./cloud-providers-and-regions) および [On-Demand Cluster](/docs/on-demand-cluster) を参照してください。

        - **より高いスケール上限:** 最大レプリカ数は 100、Dedicated Query CU の上限は 2,048 になりました。詳細については、[Zilliz Cloud Limits](./limits) を参照してください。

        - **On-Demand Clusters の auto-suspend をカスタマイズ:** cluster 作成後に On-Demand Cluster の auto-suspend 間隔を更新できるようになりました。これにより、ワークロードパターンの変化に応じて、クエリの即応性とアイドル時のコンピューティングコストのバランスをより柔軟に制御できます。詳細については、[On-Demand Cluster](/docs/on-demand-cluster) を参照してください。

        - **機能ガイダンスの改善:** 新しい製品内ガイダンスにより、CMEK、Global Cluster、Cross-Region Backup を見つけて設定しやすくなりました。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="15,84">

    <div>

        **2026-07-06**

    </div>

    <div>

        ## BYOC-I が GCP で利用可能に\{#byoc-i-now-available-on-gcp}

        Zilliz Cloud **Bring Your Own Cloud Infrastructure (BYOC-I)** が **Google Cloud Platform (GCP)** をサポートするようになりました。

        - **セキュリティの強化:** BYOC-I により、Kubernetes API をパブリックインターネットに公開する必要がなくなります。

        - **高度な柔軟性:** BYOC-I により、公式の Terraform Provider を介して、より広範なカスタムネットワーク設定が可能になります。エンタープライズのニーズに合わせて調整できるようになりました。

        詳細については、手順ごとのマニュアルガイドは [Deploy BYOC-I on GCP](/docs/byoc/deploy-byoc-i-gcp)、IaC 自動化については [Terraform Provider](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs) を参照してください。

        ## 機能強化\{#enhancements}

        - **On-Demand Clusters の利用可能リージョンを拡大** — On-Demand Clusters が、Serving Dedicated のサポート対象リージョンに合わせて、すべての AWS リージョンで利用可能になりました。

    </div>

</Grid>

