---
title: "2026年7月リリースノート | Cloud"
slug: /release-notes-2607
sidebar_key: release-notes-2607
sidebar_label: "2026年7月"
beta: FALSE
notebook: FALSE
description: "2026年7月リリースノート | Cloud"
type: origin
token: CUuywySLVil4MKkmYZecUl9snLg
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - リリースノート

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 2026年7月リリースノート

<Grid columnSize="2" widthRatios="15,84">

    <div>

        **2026-07-30**

    </div>

    <div>

        ## 機能強化\{#enhancements}

        - **Hugging Face 埋め込みモデル**：Bring Your Own Key 連携を通じて、Hugging Face をモデルプロバイダーとして利用できるようになりました。詳細については、[Hugging Face](./hugging-face)を参照してください。

        - **BYOC のオンデマンド使用量**：BYOC 組織は、オンデマンド使用量を有効にすることで、契約済みの vCPU キャパシティを超えてスケールできるようになりました。契約量を超えた使用量は vCPU 分単位で計測され、Usage ページと請求書ページに反映されます。詳細については、[BYOC の請求について](/docs/byoc/understand-byoc-billing)を参照してください。

    </div>

</Grid>

<Grid columnSize="2" widthRatios="15,84">

    <div>

        **2026-07-15**

    </div>

    <div>

        ## BYOC がストレージ統合と外部ボリュームをサポート\{#byoc-supports-storage-integrations-and-external-volumes}

        BYOC が Storage Integration と External Volume をサポートするようになりました。クロスアカウント認証を通じてオブジェクトストレージバケットを統合し、外部ボリュームとして設定できるようになりました。

        - **IAM ベースの認証:** 長期的なクラウド認証情報を埋め込むことなく、IAM を通じてバケットへのアクセスを認証できます。

        詳細については、[AWS S3 との統合](./integrate-with-aws-s3)および[外部ボリューム](./external-volume)を参照してください。

        ## オンデマンドクラスターのコレクションレベルメトリクス\{#collection-level-metrics-for-on-demand-clusters}

        オンデマンドクラスターで、レイテンシーや QPS などのコレクションレベルのパフォーマンスメトリクスを Web コンソールに表示できるようになりました。これにより、ワークロードの挙動を分離し、個々のコレクションをより正確にトラブルシューティングできます。

        詳細については、[メトリクスリファレンス](./metrics-alerts-reference)を参照してください。

        ## オンデマンドデータベースと有料ボリュームのストレージおよびストレージリクエストの課金\{#storage-and-storage-request-billing-for-on-demand-databases-and-paid-volumes}

        Vector Lakebase では、AWS 上のオンデマンドデータベースのストレージ容量が計測され、課金されるようになりました。ストレージリクエストは、オンデマンドデータベースと有料ボリュームの両方で課金されます。これにより、コストの要因となるストレージリソースと操作をより明確に把握できます。

        詳細については、[オンデマンドコンピュートのコスト](./on-demand-compute-cost)および[ストレージリクエストのコスト](./storage-request-cost)を参照してください。

        ## RESTful API によるストレージ統合の管理\{#manage-storage-integrations-through-restful-apis}

        RESTful API を使用して Storage Integration をプログラムで管理できるようになりました。この API は統合の作成、一覧表示、詳細表示、検証、削除をサポートし、RESTful API、CLI、Terraform 間で自動化ワークフローを統一できます。

        詳細については、[Storage Integration Operations](/reference/restful/storage-integration-operations-v2)および[AWS S3 との統合](./integrate-with-aws-s3)を参照してください。

        ## ユーザーとロールへの説明の追加\{#add-descriptions-to-users-and-roles}

        クラスターユーザーとロールに説明を追加して表示できるようになり、権限を識別および管理しやすくなりました。説明の更新は API と監査ログでも利用できます。

        詳細については、以下のドキュメントを参照してください。

        - [クラスターユーザーの管理（コンソール）](./cluster-users)

        - [クラスターユーザーの管理（SDK）](./cluster-users-sdk)

        - [クラスターロールの管理（コンソール）](./cluster-roles)

        - [クラスターロールの管理（SDK）](./cluster-roles-sdk)

        ## 機能強化\{#enhancements}

        - **グローバルクラスター:** グローバルクラスターが RESTful API と Terraform の両方をサポートし、自動化ワークフローで利用できるようになりました。

        - **オンデマンド検索の Azure 対応リージョン拡大:** マネージドコレクションを使用するオンデマンド検索が Azure East US で利用できるようになりました。詳細については、[クラウドプロバイダーとリージョン](./cloud-providers-and-regions)および[オンデマンドクラスター](/docs/on-demand-cluster)を参照してください。

        - **スケール上限の引き上げ:** レプリカ数の上限が 100、Dedicated Query CU の上限が 2,048 になりました。詳細については、[Zilliz Cloud の制限](./limits)を参照してください。

        - **オンデマンドクラスターの自動サスペンドのカスタマイズ:** オンデマンドクラスターの作成後に、自動サスペンド間隔を更新できるようになりました。これにより、ワークロードパターンの変化に応じて、クエリの即応性とアイドル時のコンピュートコストのバランスをより柔軟に制御できます。詳細については、[オンデマンドクラスター](/docs/on-demand-cluster)を参照してください。

        - **機能ガイダンスの改善:** 新しい製品内ガイダンスにより、CMEK、グローバルクラスター、クロスリージョンバックアップをより簡単に見つけて設定できるようになりました。

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

        - **柔軟性の向上:** BYOC-I では、公式 Terraform Provider を通じて、より広範なカスタムネットワーク設定を利用できます。エンタープライズ要件に合わせて調整できます。

        詳細については、手動でのステップバイステップ手順は [GCP 上で BYOC-I をデプロイ](/docs/byoc/deploy-byoc-i-gcp) を、IaC 自動化については [Terraform Provider](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs) を参照してください。

    </div>

</Grid>
