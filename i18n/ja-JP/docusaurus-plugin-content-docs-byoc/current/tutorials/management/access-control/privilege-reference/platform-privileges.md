---
title: "プラットフォームリソースの権限  | BYOC"
slug: /platform-privileges
sidebar_label: "プラットフォーム権限"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このリファレンスでは、Zilliz Cloud のアクセス制御で使用されるプラットフォームリソースの権限を一覧表示し、組み込みの組織ロールおよびプロジェクトロールがこれらの権限にどのようにマッピングされるかを示します。 | BYOC"
type: origin
token: GsofwhPKqi0Bfkkk7YqcRzndnah
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# プラットフォームリソースの権限

このリファレンスでは、Zilliz Cloud のアクセス制御で使用されるプラットフォームリソースの権限を一覧表示し、組み込みの組織ロールおよびプロジェクトロールがこれらの権限にどのようにマッピングされるかを示します。

このページは、次のような疑問に答える必要があるときに参照してください。

- 各プラットフォームリソースで利用できる権限はどれですか？

- オブジェクトレベルのロール付与をサポートするリソースはどれですか？

- 各組み込みの組織ロールまたはプロジェクトロールには何が含まれますか？

- アクセスは組織レベル、プロジェクトレベル、クラスターレベルのいずれで管理すべきですか？

クラスターのデータプレーン権限については、[クラスター権限と権限グループ](./cluster-privileges) を参照してください。このページでは、組織レベルおよびプロジェクトレベルのプラットフォームリソースを対象としています。

## このリファレンスの読み方\{#how-to-read-this-reference}

各リソースのエントリには、次のフィールドが含まれます。

| フィールド | 説明 |
| --- | --- |
| **ドメイン** | リソースが属するアクセス制御ドメイン（IAM、組織、プロジェクト、データなど）。 |
| **リソース** | 権限セットによって制御されるリソースタイプ。 |
| **利用可能な権限** | リソースに対して付与できるアクション。 |
| **オブジェクトレベルの付与** | リソースタイプ全体ではなく、個々のオブジェクトに対して権限を付与できるかどうか。 |
| **組み込みロールのアクセス** | 各組み込みの組織ロールまたはプロジェクトロールによって付与されるアクセス。 |

ロールマッピングの表では、次の値を使用します。

| 値 | 意味 |
| --- | --- |
| `*` | ロールに、そのリソースについて一覧表示されたすべての権限が含まれます。 |
| `view` | ロールはリソースを表示できます。 |
| `view, modify` | ロールはリソースを表示および変更できます。 |
| `Read` | ロールはリソースのデータを読み取ることができます。 |
| `Read, Write` | ロールはリソースのデータを読み取りおよび書き込むことができます。 |
| `-` | ロールにはそのリソースの権限が含まれていません。 |

プロジェクトロールの場合、権限は割り当てられたプロジェクト内でのみ適用されます。あるプロジェクトの Project Admin が、別のプロジェクトでも自動的に Project Admin になるわけではありません。

## 対象となる定義済みロール\{#predefined-roles-covered}

このリファレンスでは、次の組み込みロールを対象としています。

| スコープ | 定義済みロール |
| --- | --- |
| 組織 | Org Owner、Billing Admin、Public |
| プロジェクト | Project Admin、Data Admin、Data Operator、Data Viewer |

## RBAC リソース\{#rbac-resources}

IAM リソースは、Zilliz Cloud プラットフォームで使用される ID、認証情報、およびロールを制御します。

| リソース | 表示カテゴリ | 利用可能な権限 | オブジェクトレベルの付与 | Org Owner | Billing Admin | Public | Project Admin | Data Admin | Data Operator | Data Viewer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `org_member` | Identity | view、create、modify、delete | いいえ | `*` | `view` | `-` | `-` | `-` | `-` | `-` |
| `project_member` | Identity | view、create、modify、delete | いいえ | `-` | `-` | `-` | `*` | `-` | `-` | `-` |
| `group` | Identity | view、create、modify、delete | いいえ | `*` | `-` | `-` | `-` | `-` | `-` | `-` |
| `custom_api_key` | Credential | view、create、modify、delete | いいえ | `*` | `-` | `-` | `-` | `-` | `-` | `-` |
| `org_role` | Role | view、grant | いいえ | `*` | `-` | `-` | `-` | `-` | `-` | `-` |
| `project_role` | Role | view、grant | いいえ | `*`（すべてのプロジェクト） | `-` | `-` | `*`（割り当てられたプロジェクト） | `view`（割り当てられたプロジェクト） | `view`（割り当てられたプロジェクト） | `view`（割り当てられたプロジェクト） |
| `project_custom_role` | Role | view、create、modify、delete、grant | いいえ | `*` | `-` | `-` | `*` | `-` | `-` | `-` |

<Admonition type="info" title="Notes">

- 個人用 API キーは個々のユーザーが所有します。各ユーザーは自身の個人用 API キーをリセットできます。個人用 API キーの権限は、リソース権限モデルを通じて個別に管理されません。

- プロジェクトロールのアクセスはプロジェクト単位です。たとえば、Project Admin は Project Admin ロールが割り当てられているプロジェクトでのみプロジェクトロールを管理できます。

- カスタム API キーは組織レベルで管理されます。

</Admonition>

## 組織リソース\{#organization-resources}

組織リソースは、組織全体の設定と機能を制御します。

| リソース | 説明 | 利用可能な権限 | オブジェクトレベルの付与 | Org Owner | Billing Admin | Public | Project Admin | Data Admin | Data Operator | Data Viewer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Org Control Ops | 組織の設定および組織レベルの操作 | view、modify、delete | いいえ | `*` | `view` | `view` | `-` | `-` | `-` | `-` |
| Billing & Cost | 請求、コスト、支払い、使用量、および組織アラートへのアクセス | view、manage | いいえ | `*` | `*` | `-` | `-` | `-` | `-` | `-` |
| Authentication | 組織の認証設定 | view、manage | いいえ | `*` | `-` | `-` | `-` | `-` | `-` | `-` |
| Recovery (Recycle Bin) | 組織のごみ箱および復元操作 | view、manage | いいえ | `*` | `-` | `-` | `-` | `-` | `-` | `-` |
| Project | プロジェクトのプロビジョニング | create | いいえ | `*` | `-` | `-` | `-` | `-` | `-` | `-` |
| All project | 組織全体のプロジェクトの可視性 | view | いいえ | `*` | `-` | `-` | `-` | `-` | `-` | `-` |

組織リソースはプロジェクト単位ではありません。これらの権限は、組織全体の管理を必要とするユーザーまたはグループにのみ付与してください。

## プロジェクトリソース\{#project-resources}

プロジェクトリソースは、プロジェクトのライフサイクル、プロジェクトの機能、リソースのプロビジョニング、およびプロジェクト単位のリソース操作を制御します。

### プロジェクトライフサイクル\{#project-lifecycle}

| リソース | 利用可能な権限 | オブジェクトレベルの付与 | Org Owner | Billing Admin | Public | Project Admin | Data Admin | Data Operator | Data Viewer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Project | view、modify、delete、update_plan、update_region | はい | `-` | `-` | `-` | `*`（割り当てられたプロジェクト） | `view` | `view` | `view` |

### プロジェクトの制御機能\{#project-control-capabilities}

| リソース | 説明 | 利用可能な権限 | オブジェクトレベルの付与 | Org Owner | Billing Admin | Public | Project Admin | Data Admin | Data Operator | Data Viewer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Security | プロジェクトのセキュリティ構成 | view、manage | いいえ | `-` | `-` | `-` | `*` | `view` | `view` | `view` |
| Backup | プロジェクトのバックアップ構成およびバックアップへのアクセス | view、manage | いいえ | `-` | `-` | `-` | `*` | `view` | `view` | `view` |
| Observability | プロジェクトの監視、メトリクス、およびオブザーバビリティへのアクセス | view、manage | いいえ | `-` | `-` | `-` | `*` | `*` | `view` | `view` |

### リソースのプロビジョニング\{#resource-provisioning}

リソースプロビジョニング権限は、誰がプロジェクトリソースを作成できるかを制御します。対象のリソースがまだ存在しないため、これらの権限はオブジェクトレベルの付与ではありません。

| リソース | 表示カテゴリ | 利用可能な権限 | オブジェクトレベルの付与 | Org Owner | Billing Admin | Public | Project Admin | Data Admin | Data Operator | Data Viewer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `serving_cluster` | Compute & storage | create | いいえ | `-` | `-` | `-` | `*` | `-` | `-` | `-` |
| `on_demand_cluster` | Compute & storage | create | いいえ | `-` | `-` | `-` | `*` | `-` | `-` | `-` |
| `volume` | Compute & storage | create | いいえ | `-` | `-` | `-` | `*` | `-` | `-` | `-` |
| `storage_integration` | Integration | create | いいえ | `-` | `-` | `-` | `*` | `-` | `-` | `-` |
| `model_provider_integration` | Integration | create | いいえ | `-` | `-` | `-` | `*` | `-` | `-` | `-` |
| `kms_integration` | Integration | create | いいえ | `-` | `-` | `-` | `*` | `-` | `-` | `-` |
| `datadog_integration` | Integration | create | いいえ | `-` | `-` | `-` | `*` | `-` | `-` | `-` |

### リソースのライフサイクル\{#resource-lifecycle}

リソースライフサイクル権限は、既存のプロジェクトリソースに対する操作を制御します。

| リソース | 表示カテゴリ | 利用可能な権限 | オブジェクトレベルの付与 | Org Owner | Billing Admin | Public | Project Admin | Data Admin | Data Operator | Data Viewer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `serving_cluster` | Compute & storage | view、modify、delete、scale | はい | `-` | `-` | `-` | `*` | `*` | `view` | `view` |
| `on_demand_cluster` | Compute & storage | view、modify、delete、scale | はい | `-` | `-` | `-` | `*` | `*` | `view` | `view` |
| `volume` | Compute & storage | view、modify、delete、usage | はい | `-` | `-` | `-` | `*` | `*` | `view, modify` | `view` |
| `storage_integration` | Integration | view、modify、delete、usage | はい | `-` | `-` | `-` | `*` | `*` | `view, modify` | `view` |
| `model_provider_integration` | Integration | view、modify、delete、usage | はい | `-` | `-` | `-` | `*` | `*` | `view, modify` | `view` |
| `kms_integration` | Integration | view、modify、delete、usage | はい | `-` | `-` | `-` | `*` | `*` | `view, modify` | `view` |
| `datadog_integration` | Integration | view、modify、delete、usage | はい | `-` | `-` | `-` | `*` | `*` | `-` | `-` |

## データリソース\{#data-resources}

データリソースは、データを保持するリソースへのプロジェクトレベルのアクセスを制御します。これらの権限はクラスターレベルの RBAC とは別のものです。プロジェクトレベルのデータ権限を使用して Zilliz Cloud プラットフォームからの広範なアクセスを制御し、クラスターロールおよび権限グループを使用してクラスター内のデータベースおよびコレクションの詳細な操作を制御します。

| リソース | 表示カテゴリ | 利用可能な権限 | オブジェクトレベルの付与 | Org Owner | Billing Admin | Public | Project Admin | Data Admin | Data Operator | Data Viewer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `serving_cluster_data` | Compute & storage | Read, Write, &ast; | はい | `-` | `-` | `-` | `*` | `*` | `Read, Write` | `Read` |
| `on_demand_compute_data` | Compute & storage | Read, Write, &ast; | いいえ | `-` | `-` | `-` | `*` | `*` | `Read, Write` | `Read` |
| `volume_data` | Compute & storage | Read, Write, &ast; | はい | `-` | `-` | `-` | `*` | `*` | `Read, Write` | `Read` |

データ権限を構成する場合、`Write` は `Read` を意味します。`*` を選択すると、`Read` と `Write` の両方が付与されます。

## オブジェクトレベルの付与\{#object-level-grants}

一部のリソースはオブジェクトレベルの付与をサポートしています。オブジェクトレベルの付与を使用すると、管理者は特定のオブジェクト（特定のプロジェクトリソース、クラスター、ボリューム、インテグレーションなど）へのアクセスを割り当てることができます。

アクセスを狭くする必要がある場合は、オブジェクトレベルの付与を使用します。

- Data Viewer ロールに、1 つのプロジェクトを表示するアクセス権を付与します。

- Data Operator ロールに、1 つのボリュームまたはインテグレーションを操作するアクセス権を付与します。

- データロールに、プロジェクト内のすべてのデータリソースではなく、1 つのデータリソースを読み取りまたは書き込みするアクセス権を付与します。

オブジェクトレベルの付与をサポートしていないリソースは、より広い組織スコープまたはプロジェクトスコープで管理されます。
