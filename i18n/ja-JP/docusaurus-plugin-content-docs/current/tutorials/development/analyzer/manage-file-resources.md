---
title: "File Resource の管理 | Cloud"
slug: /manage-file-resources
sidebar_label: "File Resource の管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "file resource は、テキスト analyzer が実行時に利用する外部辞書ファイルへの、サーバーに登録された参照です。Milvus 3.0 では、4 つの analyzer コンポーネントが、インライン配列ではなく file resource から辞書を読み込むことができます | Cloud"
type: origin
token: TBErwF79wil25bkkUIocVqI2nfb
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# File Resource の管理

**file resource** は、テキスト analyzer が実行時に利用する外部辞書ファイルへの、サーバーに登録された参照です。Milvus 3.0 では、4 つの analyzer コンポーネントが、インライン配列ではなく file resource から辞書を読み込むことができます。

| **Analyzer コンポーネント** | **file resource を受け入れるパラメーター** |
| --- | --- |
| [Jieba tokenizer](./jieba-tokenizer) | `extra_dict_file` |
| [Stop filter](./stop-filter) | `stop_words_file` |
| [Decompounder filter](./decompounder-filter) | `word_list_file` |
| [Synonym filter](./synonym-filter) | `synonyms_file` |

file resource は、インライン辞書配列に関する 2 つの実用上の問題を解決します。

- 実際の辞書は大規模です。中国語の Jieba 語彙は数万行になることがあり、synonym テーブルは通常数千のルールで構成されます。それらを analyzer 設定にインライン化するのは現実的ではありません。

- 同じ辞書は通常、複数の collection で共有されます。一度登録してから名前で参照することで、スキーマを小さく保ち、辞書の更新を単一の操作にできます。

## File resource のタイプ\{#file-resource-types}

Milvus は、管理責任が異なる 2 種類の file resource タイプをサポートしています。

| **タイプ** | **ファイルの場所** | **ファイルの管理者** | **適合する用途** |
| --- | --- | --- | --- |
| **Remote** | Milvus cluster がすでに使用するように設定されている object store（MinIO / S3 / GCS / Azure）内 | Milvus（`add_file_resource` / `remove_file_resource` / `list_file_resources` クライアント API 経由） | ほとんどのデプロイメントに推奨されます。 |
| **Local** | すべての Milvus コンポーネント（DataNode、QueryNode、StreamingNode）のローカルファイルシステム上の同じ絶対パス | ユーザー — たとえば Kubernetes volume 経由でファイルを自分でマウントします | Milvus の外部で辞書ファイルを管理したい open-source / self-hosted シナリオ。 |

このページの残りの部分では、より一般的な remote タイプから始めて、両方のタイプについて説明します。

## 前提条件\{#prerequisites}

- **Remote** file resource の場合、Milvus デプロイメントが object store で設定されている必要があります。ほとんどのデプロイメントではすでに設定されています — `milvus.yaml` の `minio:` セクション（または同等の Helm chart values）を確認してください。`bucketName` と `rootPath` の値をメモしておいてください。file resource を登録する際に必要になります。

- **Local** file resource の場合、すべての Milvus pod / container に同じ絶対パスでファイルを配置できる必要があります。その方法はデプロイメント（bind mount、ConfigMap-backed volume、init container など）によって異なります。

## remote file resource を登録する\{#register-a-remote-file-resource}

remote file resource の登録は、3 ステップのワークフローです。ファイルを object storage に**アップロード**し、選択した名前で Milvus に**登録**し、それを必要とする任意の analyzer から**参照**します。

### ステップ 1. 辞書ファイルを object storage にアップロードする\{#step-1-upload-the-dictionary-file-to-object-storage}

独自のツール（`mc`、`aws s3 cp`、`boto3`、または任意の S3-compatible client）を使用して、Milvus が使用するように設定されている bucket にファイルを配置します。

たとえば、`milvus.yaml` に次の内容が含まれている場合:

```yaml
minio:
  bucketName: milvus-bucket
  rootPath: file
```

`rootPath` をプレフィックスとして `chinese_terms.txt` という名前のファイルをアップロードすると、オブジェクトは `s3://milvus-bucket/file/chinese_terms.txt` に配置されます。

ステップ 2 で `add_file_resource` に渡す `path` 引数は、**rootPath プレフィックスを含む完全なオブジェクトキー**です — 上記の例では `path="file/chinese_terms.txt"` です。プレフィックスなしのパス（たとえば単に `"chinese_terms.txt"`）は、`file resource path not exist` というエラーで拒否されます。

### ステップ 2. `add_file_resource` でファイルを登録する\{#step-2-register-the-file-with-addfileresource}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

client.add_file_resource(
    name="chinese_terms",                # 後で参照する短く一意な名前
    path="file/chinese_terms.txt",       # rootPath プレフィックスを含む完全な S3 オブジェクトキー
)
```

`add_file_resource` は同期的に検証します。この呼び出しは、Milvus が設定済み object store 内の `path` にオブジェクトが存在することを確認した後にのみ戻ります。オブジェクトが存在しない場合、呼び出しは `MilvusException(code=65535, "file resource path not exist")` を発生させます — 先にファイルをアップロードしてから再試行してください。

この呼び出しは冪等です。同じ `name` と `path` で `add_file_resource` を 2 回呼び出しても、重複は作成されません。

### ステップ 3. analyzer から file resource を参照する\{#step-3-reference-the-file-resource-from-an-analyzer}

analyzer パラメーターがファイル参照（`extra_dict_file`、`stop_words_file`、`word_list_file`、`synonyms_file`）を受け入れる場所では、標準的な remote 形式を使用します。

```python
{
    "type": "remote",
    "resource_name": "chinese_terms",    # add_file_resource の名前と一致する必要があります
    "file_name": "chinese_terms.txt",    # ファイル名のみ — Milvus はこれを使用して resource 内のファイルを識別します
}
```

4 つすべての analyzer パラメーターで同じ形状を使用します。異なるのは周囲の analyzer キーのみです。analyzer ごとの具体例については、Jieba tokenizer、Stop filter、Decompounder filter、Synonym filter を参照してください。

パラメーター名は `resource_name` と `file_name` です — `name` と `file` ではありません。`name` / `file`（または `"type": "remote"` の代わりに `"type": "resource"`）を使用すると、analyzer 作成時に `resource name of remote file ... must be set` のようなメッセージを伴う `MilvusException` が発生します。

## file resource を一覧表示する\{#list-file-resources}

```python
resources = client.list_file_resources()
for r in resources:
    print(r.name, r.path)
# chinese_terms file/chinese_terms.txt
```

`list_file_resources()` は `FileResourceInfo` オブジェクトのリストを返し、それぞれに `.name` 属性と `.path` 属性があります。空の cluster は `[]` を返します。resource ごとの `get` はありません。`list_file_resources` が唯一の読み取り API です。

## file resource を削除する\{#remove-a-file-resource}

```python
client.remove_file_resource(name="chinese_terms")
```

`remove_file_resource` は冪等です。存在しない名前に対して呼び出しても、例外を発生させずに `None` を返します。

file resource を削除する前に、その analyzer 設定がそれを参照している collection を drop または alter してください。どの collection も依存しなくなるまで file resource を保持することで、resource がなくなった後に analyzer ルックアップが失敗するリスクを避けられます。

## local file resource を使用する\{#use-a-local-file-resource}

**local** file resource は、各 Milvus コンポーネントのローカルファイルシステム上のパスを直接指します。`add_file_resource` 呼び出しはありません — Milvus は local resource を追跡しません。ユーザー自身が関連するすべての pod または container の同じ絶対パスにファイルを配置し、その後パスで参照します。

```python
{
    "type": "local",
    "path": "/var/lib/milvus/dicts/chinese_terms.txt",
}
```

Local file resource は、DataNode、QueryNode、StreamingNode のファイルシステムを制御できるデプロイメントでのみ有効です — 通常は bare-metal 上、または volume mount を追加できる Kubernetes cluster 上の self-hosted Milvus です。ファイルはすべてのコンポーネントでまったく同じ絶対パスに存在する必要があります。そうでない場合、一部のノードが analyzer の読み込み時に失敗します。

ファイルは analyzer が最初に作成されるときに開かれます。その時点でパスが存在しない場合、analyzer の作成は `MilvusException(code=2000, "IOError: No such file or directory")` で失敗します。

## 考慮事項\{#considerations}

- **Cluster 全体での可用性は即時ではありません。** `add_file_resource` が戻った後、Milvus はそのファイルを必要とするすべてのコンポーネントに同期します。この短い時間枠の間、resource を参照する collection は、まだ同期していないノード上で作成に失敗する可能性があります。一般的な対処方法は、数秒後に create 呼び出しを再試行することです。

- **resource に依存する collection がない場合にのみ削除してください。** ファイルを見つけられずに analyzer ルックアップが失敗することを避けるため、`remove_file_resource` を呼び出す前に、その analyzer 設定が resource を参照している collection を drop または alter してください。

- **メタデータのみです。** `list_file_resources()` は `name` と `path` を返します — サイズ、チェックサム、アップロード時刻、その他のメタデータはありません。必要な場合は、独自の命名規則で辞書のバージョンを追跡してください。
