---
title: "Chroma から Zilliz Cloud への移行 | Cloud"
slug: /migrate-from-chroma
sidebar_label: "Chroma"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このトピックでは、Chroma から移行する際に Zilliz Cloud がデータ型マッピング、メタデータフィールドの変換、コレクションの命名ルールをどのように処理するかについて説明します。 | Cloud"
type: origin
token: JaTxw9EtHivMv9kMSAnckG0vn1b
sidebar_position: 8
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Chroma から Zilliz Cloud への移行

このトピックでは、Chroma から移行する際に Zilliz Cloud がデータ型マッピング、メタデータフィールドの変換、コレクションの命名ルールをどのように処理するかについて説明します。

コンソールでの移行ワークフロー、インデックス設定、移行後の検証については、[External Migration Basics](./external-migration-basics) を参照してください。

## 事前準備\{#prerequisites}

### Chroma の要件\{#chroma-requirements}

| 要件 | 詳細 |
| --- | --- |
| デプロイ | Chroma Cloud、または Chroma REST API v2 を公開するセルフホスト型の Chroma サーバーです。 |
| ネットワークアクセス | ソースエンドポイントには、Zilliz Cloud の移行サービスから到達できる必要があります。ネットワークが制限されている場合は、[Zilliz Cloud の IP アドレス](./zilliz-cloud-ips) からのインバウンド接続を許可してください。ローカルの組み込みデータベースは、コンソール移行の前に、到達可能な Chroma サーバーを介して公開する必要があります。 |
| 接続の詳細 | ソースエンドポイント、テナント、データベース、認証情報です。Chroma Cloud では、X Chroma Token 認証で API キーを使用します。接続の詳細は、その Connect パネルから取得してください。セルフホスト型 Chroma では、認証なし、X Chroma Token、ベアラートークン、またはユーザー名とパスワードによる Basic 認証をサポートしています。デフォルトのテナント名とデータベース名は `default_tenant` と `default_database` です。 |
| データの可用性 | ソースコレクションには、データと埋め込みが含まれている必要があります。空のコレクションは、使用可能なベクトル次元がないため移行できません。 |
| データの一貫性 | 移行中は、ソースコレクションに対する挿入、更新、削除を一時停止してください。ソースを読み取ってもスナップショットは作成されません。 |

### Zilliz Cloud の要件\{#zilliz-cloud-requirements}

| 要件 | 詳細 |
| --- | --- |
| ユーザーロール | Organization Owner または Project Admin です。 |
| ターゲット | ソースデータを保持するのに十分な容量を持つ既存のクラスターとデータベースです。 |
| コレクション名 | ターゲットデータベースでまだ使用されていないターゲットコレクション名を使用してください。マッピングを確認するときに、ターゲットコレクションの名前を変更できます。 |

## データ型マッピング\{#data-type-mapping}

各ソースコレクションはターゲットコレクションにマッピングされます。移行を開始する前に、次のデフォルトマッピングを確認してください。

| Chroma のフィールド | Zilliz Cloud のフィールド | 注記 |
| --- | --- | --- |
| `id` | `id`、VARCHAR 主キー | デフォルトマッピングで元の文字列 ID を保持します。 |
| `embedding` | `embedding`、FLOAT_VECTOR | ベクトル値とソースの次元を保持します。再埋め込みは不要です。 |
| `document` | `document`、nullable VARCHAR | ドキュメントテキストを保持します。デフォルトの最大長は 65,535 UTF-8 バイトです。 |
| `uri` | `uri`、nullable VARCHAR | URI 文字列を保持します。デフォルトの最大長は 65,535 UTF-8 バイトです。URI が参照するファイルはコピーされません。 |
| メタデータ | 動的フィールド | デフォルトでは、メタデータキーを動的フィールドとして保存します。選択したキーは固定フィールドに変換できます。 |

## メタデータフィールドの変換\{#metadata-field-conversion}

エンティティ間でキーが異なる場合は、メタデータを動的フィールドに保持してください。明示的なフィールド名、型、制約が必要な場合は、キーを固定フィールドに変換してください。動的フィールドの詳細については、[動的フィールド](./enable-dynamic-field) を参照してください。

マッピングページでは、メタデータ値を次のターゲット型で表します。

| メタデータ値 | マッピングに表示されるターゲット型 |
| --- | --- |
| 整数 | INT64 |
| 浮動小数点数 | DOUBLE |
| ブール値 | BOOL |
| 文字列 | VARCHAR |
| 配列 | JSON |

メタデータを固定フィールドに変換する場合は、ソースコレクション全体をカバーする型と制約を選択してください。値が欠落する可能性があるフィールドでは、null 値を許可してください。文字列の長さ制限は、文字数ではなく UTF-8 バイト数で測定されます。値の型が混在している、または変化するキーは、動的フィールドに保持してください。

## Chroma 固有の処理ルール\{#chroma-specific-handling-rules}

### コレクションの命名ルール\{#collection-naming-rules}

デフォルトでは、ターゲットコレクションはソース名を使用し、ハイフン（`-`）をアンダースコア（`_`）に置き換えます。たとえば、`support-docs` は `support_docs` になります。

ジョブを送信する前に、各ターゲット名を確認してください。コレクション名が Zilliz Cloud の命名要件を満たさない場合、またはすでに使用されている場合は、コレクションの名前を変更してください。また、`support-docs` と `support_docs` のように、変換後に同一になるソース名がないか確認してください。

### 埋め込みと距離メトリクス\{#embeddings-and-distance-metrics}

既存の埋め込みは再生成されずにコピーされます。Chroma の埋め込み関数は移行されません。アプリケーションは引き続き同じモデルで埋め込みを生成する必要があります。

対応する距離メトリクス名は次の通りです。

| Chroma の距離空間 | Zilliz Cloud のメトリクスタイプ |
| --- | --- |
| `cosine` | `COSINE` |
| `l2` | `L2` |
| `ip` | `IP` |

ターゲットのベクトルインデックスを構成するときに、対応するメトリクスを使用してください。この表はメトリクスの対応関係を示すものであり、ソースのインデックス構成が移行されることを意味するものではありません。
