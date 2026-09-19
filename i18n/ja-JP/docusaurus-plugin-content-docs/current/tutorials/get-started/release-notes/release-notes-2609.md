---
title: "2026年9月 リリースノート | Cloud"
slug: /release-notes-2609
sidebar_label: "2026年9月"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "(プレースホルダー) | Cloud"
type: origin
token: O1kHwD3jsioeD1km983cCRx7ndh
sidebar_position: 2
displayed_sidebar: releasesSidebar

---

import Admonition from '@theme/Admonition';


import Grid from '@site/src/components/Grid';

# 2026年9月 リリースノート

<Grid columnSize="2" widthRatios="20,80">

    <div>

        **2026-09-03**

    </div>

    <div>

        ## カスタムロールと SCIM プロビジョニングによるアクセス制御の強化\{#enhanced-access-control-with-custom-roles-and-scim-provisioning}

        Zilliz Cloud は、組織ロールとプロジェクトロールを分離し、カスタムプロジェクトロールを定義できるようにするとともに、SCIM を通じて ID プロバイダーからユーザーとグループをプロビジョニングするようになりました。これにより、各レベルで最小権限のアクセスを付与し、組織の状況に合わせて維持できます。

        - **組織ロールとプロジェクトロールの分離:** 組織ロール（Organization Owner、Billing Admin、Public）は、組織の設定と請求を管理します。プロジェクトロール（Project Admin、Data Admin、Data Operator、Data Viewer）は、プロジェクト内のクラスターとデータを管理します。ユーザーまたはグループは複数のロールを保持でき、有効な権限はそれらの和集合になります。詳細は、[Access Control Explained](./access-control-overview) を参照してください。

        - **カスタムプロジェクトロール:** 定義済みのテンプレートからロールを作成し、プラットフォーム、コンピュート、データアクセスの権限を組み合わせて、コンピュートとデータアクセスのスコープをプロジェクト内のすべてのクラスターまたは特定のクラスターに設定できます。詳細は、[Manage Platform Roles](./manage-platform-roles) および [Platform Resource Privilege Reference](./platform-privileges) を参照してください。

        - **グループベースのロール割り当て:** ID プロバイダーから同期されたグループに組織ロールとプロジェクトロールを割り当てることで、チームのメンバーシップに応じてアクセスが決まります。詳細は、[View SCIM-Synced Groups](./view-scim-synced-groups) を参照してください。

        - **Okta および Microsoft Entra による SCIM プロビジョニング:** ID プロバイダーからユーザー、グループ、グループメンバーシップをプロビジョニングします。SCIM が同期するのは ID のみで、ロールは Zilliz Cloud で割り当てます。詳細は、[SCIM Provisioning Overview](./scim-provisioning-overview)、[Configure SCIM Provisioning with Okta](./configure-scim-provisioning-with-okta)、および [Configure SCIM Provisioning with Microsoft Entra](./configure-scim-provisioning-with-microsoft-entra) を参照してください。

        - **RESTful API によるロール管理:** ロールの一覧表示、カスタムプロジェクトロールの作成、メンバーおよびグループに対するロールの付与や取り消しをプログラムから実行できるため、自動化ワークフローでコンソールと同じモデルを利用できます。詳細は、[Role Management API Reference](/reference/restful/list-cloud-roles-v2) を参照してください。

        - **Access Control ページの刷新:** Members、Groups、Project Roles の各タブに加え、組織ロールと任意のプロジェクトアクセスを 1 つのステップで設定できる Invite Member フローを備えています。詳細は、[Manage Platform Users](./manage-platform-users) を参照してください。

        <Admonition type="info" title="Notes">

        - **Organization Owner はプロジェクトへのアクセスを継承しなくなりました。** 組織ロールが対象とするのは、組織の設定、メンバー、請求、認証のみになりました。Organization Owner がプロジェクトのリソースを管理またはアクセスするには、プロジェクトロールが必要です。プロジェクトを作成した Organization Owner には、そのプロジェクトの Project Admin ロールが自動的に付与されます。
        
        - **既存の Organization Owner のアクセスは維持されます。** このリリースより前にアクセスできていたすべてのプロジェクトで、Project Admin ロールが付与されています。このリリース以降に他のメンバーが作成したプロジェクトについては、Web コンソールから、または **API 経由で** プロジェクトロールを明示的に割り当ててください。
        
        - **既存のロール割り当ては自動的にマッピングされます。** Admin は Data Admin に、Read-Write は Data Operator に、Read-Only は Data Viewer になります。特定のクラスターに限定された割り当ては、同じ制限を持つカスタムロールになります。有効な権限は変わりません。
        
        - **対応が必要なのは、ロール管理を自動化している場合だけです。** Terraform または API でロールを管理している場合は、Organization Owner にプロジェクトロールを明示的に割り当て、新しいロール名を使用するようにワークフローを更新してください。

        </Admonition>

        ## Dedicated クラスターのスローログ\{#slow-logs-for-dedicated-clusters}

        Enterprise プロジェクトの Dedicated クラスターでは、低速な Search、Hybrid Search、Query リクエストを記録し、追加費用なしで Storage Integration を通じてご自身のオブジェクトストレージに配信できるようになりました。

        - **しきい値の設定:** 実行時間が設定したしきい値（デフォルトは 150 ms）を超えたすべてのリクエストをログに記録します。変更は新しいエントリにすぐに適用されます。

        - **ご利用のバケットへの配信:** Storage Integration とディレクトリを選択します。ログは、JSON Lines ファイルとして `/<cluster-id>/slow/<date>/` に書き込まれます。

        - <strong>分析に利用できるフィールド:</strong>  タイムスタンプ、実行時間、データベース、コレクション、SDK とバージョン、クライアント IP、Trace ID、ステータスが含まれており、下流での可観測性と分析に活用できます。

        詳細は、[Configure Slow Logs](./configure-slow-logs) および [Slow Logs Reference](./slow-log-reference) を参照してください。

        ## クラスター作成時のレプリカとオートスケーリング\{#replicas-and-autoscaling-at-cluster-creation}

        Dedicated クラスターまたは Global クラスター を作成するときに、レプリカ数と Query CU のオートスケーリング範囲を設定できるようになりました。クラスターの稼働後に調整する必要はありません。

        - **Dedicated クラスター:** Enterprise プロジェクトでは、Query CU のオートスケーリングがデフォルトで有効になっており、最小値と最大値を設定できます。レプリカ数も選択できます。複数のレプリカを使用するには 8 CU 以上が必要です。

        - **Global クラスター:** コンソールまたは Create Global クラスター API から、プライマリクラスターでオートスケーリングを構成し、プライマリクラスターと各セカンダリクラスターに異なるレプリカ数を設定します。

        詳細は、[Create クラスター](./create-cluster) および [Create Global クラスター](./create-global-cluster) を参照してください。

        ## リージョンを考慮したプロジェクトナビゲーション\{#region-aware-project-navigation}

        Web コンソールでプロジェクトのリソースがリージョンごとに整理されるようになり、マルチリージョンプロジェクトを扱いやすくなりました。

        - **プロジェクトレベルのリージョンセレクター:** クラスター、Volumes、Backups、On-Demand、API Playground の各ページでは一度に 1 つのリージョンが表示され、選択内容はプロジェクトごとに記憶されます。

        - **Project Settings ページ:** プロジェクトの情報とバインドされているすべてのリージョンを確認し、1 か所からリージョンを追加できます。刷新された Create Project ダイアログと Add Region ダイアログには、クラウドプロバイダーと各リージョンでサポートされるクラスタータイプが表示されます。

        - **クラスター作成の迅速化:** Create クラスター では現在のリージョンが事前に選択されます。Business Critical プロジェクトでは、作成時に新しいリージョンを自動的に追加できます。

        - **マルチリージョンプロジェクトからのリージョンの削除** — Business Critical プロジェクトでは、クラスター、ボリューム、バックアップ、統合が存在しなくなったリージョンを、コンソールまたは API から削除できるようになりました。少なくとも 1 つのリージョンは残す必要があります。BYOC プロジェクトでは利用できません。

        詳細は、[Manage Projects](./manage-projects) を参照してください。

        ## 機能強化\{#enhancements}

        - **Resize On-Demand クラスター in place** — You can now change the number of query CUs, along with the name, description, and auto-suspend interval, on an existing On-Demand クラスター from the console or the Update On-Demand クラスター API. For details, refer to [Manage On-Demand クラスター](./manage-on-demand-clusters).

        - **デフォルトプロジェクトの削除** — デフォルトプロジェクトも、クラスターやボリュームなどが存在しなくなれば、他のプロジェクトと同様に削除できるようになりました。詳細は、[Manage Projects](./manage-projects) を参照してください。

        - **コンソールでのコレクションエイリアスの管理** — コレクションリストと Overview ページにエイリアスが表示されるようになり、SDK を呼び出さずに Actions メニューからエイリアスを作成、変更、削除できます。詳細は、[Manage コレクション (Console)](./manage-collections-console) を参照してください。

        - **移行におけるソースとターゲットの選択の明確化** — クラスター間移行ウィザードで、各側で選択したプロジェクトに基づいてクラスターが絞り込まれるようになり、有効なソースクラスターとターゲットクラスターのみが表示されます。詳細は、[Offline Migration](./offline-migration) を参照してください。

        - **ログ転送失敗に対するプロジェクトアラート** — Audit Log、Access Log、Slow Log の転送失敗に対してプロジェクトアラートを作成できるようになりました。転送が失敗すると、Zilliz Cloud が設定された受信者に通知するため、問題をすばやく特定できます。Audit Log の課金は自動的に一時停止され、転送が復旧すると再開されます。詳細は、[Manage Project Alerts](./manage-project-alerts) を参照してください。

        - **On-Demand Compute for BYOC** — BYOC projects can now enable On-Demand Compute per Data Plane from the new On-Demand entry under Serving Clusters, and use On-Demand Clusters, external コレクション, and project データベース inside your own cloud account. For details, refer to [Quick Start to On-Demand Search](/docs/byoc/quick-start-to-on-demand-search), [On-Demand データベース](/docs/byoc/on-demand-database), and [Manage External コレクション (Console)](/docs/byoc/manage-external-collections-console).

    </div>

</Grid>

