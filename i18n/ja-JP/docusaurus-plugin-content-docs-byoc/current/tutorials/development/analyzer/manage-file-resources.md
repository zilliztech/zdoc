---
title: "ファイルリソースを管理する | BYOC"
slug: /manage-file-resources
sidebar_label: "ファイルリソースを管理する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ファイルリソースとは、テキストアナライザーが実行時に利用する外部辞書ファイルへのサーバー登録済み参照です。Milvus 3.0 では、4 つの analyzer コンポーネントが、インライン配列の代わりにファイルリソースから辞書を読み込めます | BYOC"
type: origin
token: TBErwF79wil25bkkUIocVqI2nfb
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# ファイルリソースを管理する

**ファイルリソース**とは、テキストアナライザーが実行時に利用する外部辞書ファイルへのサーバー登録済み参照です。Milvus 3.0 では、4 つの analyzer コンポーネントが、インライン配列の代わりにファイルリソースから辞書を読み込めます。

| **Analyzer component** | **ファイルリソースを受け付けるパラメーター** |
| --- | --- |
| [Jieba tokenizer](./jieba-tokenizer) | `extra_dict_file` |
| [Stop filter](./stop-filter) | `stop_words_file` |
| [Decompounder filter](./decompounder-filter) | `word_list_file` |
| [Synonym filter](./synonym-filter) | `synonyms_file` |

ファイルリソースは、インライン辞書配列に関する実用上の 2 つの問題を解決します。

- 実際の辞書は大きいことが多くあります。中国語の Jieba 語彙は数万行に及ぶことがあり、同義語テーブルも通常は数千のルールになります。これらを analyzer の設定にインラインで埋め込むのは実用的ではありません。

- 同じ辞書は通常複数の collection 間で共有されます。一度登録して名前で参照することで、スキーマを小さく保てるうえ、辞書の更新も 1 回の操作で済みます。

## File resource types\{#file-resource-types}

Milvus は、管理責任が異なる 2 種類のファイルリソースをサポートしています。

| **Type** | **ファイルの配置場所** | **ファイルの管理者** | **適した用途** |
| --- | --- | --- | --- |
| **Remote** | Milvus cluster がすでに使用するよう設定されているオブジェクトストア（MinIO / S3 / GCS / Azure）内 | `add_file_resource` / `remove_file_resource` / `list_file_resources` の client API を通じた Milvus | ほとんどのデプロイで推奨されます。 |
| **Local** | すべての Milvus コンポーネント（DataNode、QueryNode、StreamingNode）のローカルファイルシステム上の同一絶対パス | あなた自身 — たとえば Kubernetes volume を使って自分でファイルをマウントします | 辞書ファイルを Milvus の外部で管理したいオープンソース / セルフホスト環境。 |

このページの残りでは、より一般的な remote タイプから始めて、両方のタイプを順に説明します。

## Prerequisites\{#prerequisites}

- **Remote** ファイルリソースでは、Milvus デプロイメントがオブジェクトストアを使用するよう構成されている必要があります。ほとんどのデプロイはすでにそのように構成されています。`milvus.yaml` の `minio:` セクション（または同等の Helm chart の values）を確認してください。`bucketName` と `rootPath` の値をメモしておいてください。ファイルリソース登録時に必要になります。

- **Local** ファイルリソースでは、すべての Milvus pod / container の同一絶対パスにファイルを配置できる必要があります。方法はデプロイ環境によって異なります（bind mount、ConfigMap-backed volume、init container など）。

## Register a remote file resource\{#register-a-remote-file-resource}

remote ファイルリソースの登録は 3 ステップのワークフローです。まずファイルをオブジェクトストレージに**アップロード**し、次に選択した名前で Milvus に**登録**し、最後にそれを必要とする analyzer から**参照**します。

### Step 1. Upload the dictionary file to object storage\{#step-1-upload-the-dictionary-file-to-object-storage}

独自のツール（`mc`、`aws s3 cp`、`boto3`、または任意の S3 互換クライアント）を使って、Milvus が使用するよう設定されているバケットにファイルを配置します。

たとえば、`milvus.yaml` に次の内容が含まれている場合:

```yaml
minio:
  bucketName: milvus-bucket
  rootPath: file
```

`rootPath` をプレフィックスとして `chinese_terms.txt` という名前のファイルをアップロードすると、そのオブジェクトは `s3://milvus-bucket/file/chinese_terms.txt` に配置されます。

ステップ 2 で `add_file_resource` に渡す `path` 引数は、**rootPath プレフィックスを含む完全なオブジェクトキー**です。上の例では `path="file/chinese_terms.txt"` です。プレフィックスなしのパス（たとえば単に `"chinese_terms.txt"`）は、`file resource path not exist` というエラーで拒否されます。

### Step 2. Register the file with `add_file_resource`\{#step-2-register-the-file-with-addfileresource}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

client.add_file_resource(
    name="chinese_terms",                # short, unique name you'll reference later
    path="file/chinese_terms.txt",       # full S3 object key, including the rootPath prefix
)
```

`add_file_resource` は同期的に検証を行います。この呼び出しは、設定済みオブジェクトストア内の `path` にオブジェクトが存在することを Milvus が確認した後にのみ返ります。オブジェクトが存在しない場合、この呼び出しは `MilvusException(code=65535, "file resource path not exist")` を送出します。先にファイルをアップロードしてから、再試行してください。

この呼び出しは冪等です。同じ `name` と `path` で `add_file_resource` を 2 回呼び出しても、重複は作成されません。

### Step 3. Reference the file resource from an analyzer\{#step-3-reference-the-file-resource-from-an-analyzer}

analyzer のパラメーターがファイル参照（`extra_dict_file`、`stop_words_file`、`word_list_file`、`synonyms_file`）を受け付ける場所では、次の標準的な remote 形式を使用します。

```python
{
    "type": "remote",
    "resource_name": "chinese_terms",    # must match the name in add_file_resource
    "file_name": "chinese_terms.txt",    # filename only — Milvus uses this to identify the file inside the resource
}
```

4 つすべての analyzer パラメーターは同じ形式を使用し、異なるのは周囲の analyzer キーだけです。analyzer ごとの具体例については、Jieba tokenizer、Stop filter、Decompounder filter、Synonym filter を参照してください。

パラメーター名は `resource_name` と `file_name` です。`name` と `file` ではありません。`name` / `file` を使った場合（または `"type": "resource"` を `"type": "remote"` の代わりに使った場合）、analyzer 作成時に `MilvusException` が送出され、`resource name of remote file ... must be set` のようなメッセージが表示されます。

## List file resources\{#list-file-resources}

```python
resources = client.list_file_resources()
for r in resources:
    print(r.name, r.path)
# chinese_terms file/chinese_terms.txt
```

`list_file_resources()` は `FileResourceInfo` オブジェクトのリストを返し、それぞれに `.name` と `.path` 属性があります。空の cluster では `[]` が返ります。リソース単位の `get` はなく、読み取り API は `list_file_resources` のみです。

## Remove a file resource\{#remove-a-file-resource}

```python
client.remove_file_resource(name="chinese_terms")
```

`remove_file_resource` は冪等です。存在しない名前に対して呼び出しても、例外を送出せず `None` を返します。

ファイルリソースを削除する前に、その analyzer 設定でそのリソースを参照している collection を削除または変更してください。どの collection も依存していない状態になるまでファイルリソースを残しておくことで、リソース削除後に analyzer の参照が失敗するリスクを避けられます。

## Use a local file resource\{#use-a-local-file-resource}

**local** ファイルリソースは、各 Milvus コンポーネントのローカルファイルシステム上のパスを直接指します。`add_file_resource` の呼び出しはありません。Milvus は local リソースを追跡しません。関連するすべての pod または container 上の同一絶対パスに自分でファイルを配置し、その後パスで参照します。

```python
{
    "type": "local",
    "path": "/var/lib/milvus/dicts/chinese_terms.txt",
}
```

local ファイルリソースが有効なのは、DataNodes、QueryNodes、StreamingNodes のファイルシステムを自分で制御できるデプロイに限られます。通常は、ベアメタル上のセルフホスト Milvus、または volume mount を追加できる Kubernetes cluster 上の環境です。ファイルはすべてのコンポーネント上でまったく同じ絶対パスに存在している必要があります。そうでない場合、一部のノードが analyzer の読み込み時に失敗します。

ファイルは analyzer が最初に作成されるときに開かれます。その時点でパスが存在しない場合、analyzer の作成は `MilvusException(code=2000, "IOError: No such file or directory")` で失敗します。

## Considerations\{#considerations}

- **Cluster 全体での利用可能化は即時ではありません。** `add_file_resource` が返った後、Milvus はそのファイルを必要とするすべてのコンポーネントへ同期します。この短い時間帯では、そのリソースを参照する collection の作成が、まだ同期していないノードで失敗することがあります。通常の対処法は、数秒待ってから create 呼び出しを再試行することです。

- **どの collection もリソースに依存しなくなったときだけ削除してください。** `remove_file_resource` を呼び出す前に、その analyzer 設定でそのリソースを参照している collection を削除または変更し、ファイルを見つけられない analyzer 参照が発生しないようにしてください。

- **メタデータのみです。** `list_file_resources()` が返すのは `name` と `path` のみで、サイズ、チェックサム、アップロード時刻、その他のメタデータはありません。必要であれば、辞書のバージョンは独自の命名規則で管理してください。

