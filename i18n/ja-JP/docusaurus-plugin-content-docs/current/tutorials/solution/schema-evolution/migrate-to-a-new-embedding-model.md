---
title: "新しい埋め込みモデルへの移行 | Cloud"
slug: /migrate-to-a-new-embedding-model
sidebar_label: "新しい埋め込みモデルへの移行"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このランブックでは、コレクションを再構築せずに、既存のコレクションをある埋め込みモデルから別の埋め込みモデルへ移行する方法を説明します。新しい埋め込み表現用のベクトルフィールドを追加し、既存データと受信データをそのフィールドに移行して新しい表現を検証したうえで、本番検索を新しいフィールドに切り替えます。 | Cloud"
type: origin
token: QTdywCXmKi0q10kWnencBLQinuc
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 新しい埋め込みモデルへの移行

このランブックでは、コレクションを再構築せずに、既存のコレクションをある埋め込みモデルから別の埋め込みモデルへ移行する方法を説明します。新しい埋め込み表現用のベクトルフィールドを追加し、既存データと受信データをそのフィールドに移行して新しい表現を検証したうえで、本番検索を新しいフィールドに切り替えます。

## このランブックを使用する場合\{#when-to-use-this-runbook}

既存のコレクションとその既存データをそのまま維持しつつ、コレクションの埋め込み表現を置き換える必要がある場合は、このランブックを使用します。たとえば、次のような場合です。

- 新しい埋め込みモデルにアップグレードする。

- 埋め込みプロバイダーまたはモデルファミリーを切り替える。

- 新旧のベクトルに互換性がなくなるように埋め込み構成を変更する。

- 既存のコレクションを再構築せずに移行する。

既存の表現を置き換えずに、マルチモーダル検索用の画像埋め込みなど、追加の表現を加えたい場合は、代わりにマルチモーダル検索のランブックに従ってください。

## 移行の仕組み\{#how-migration-works}

異なるモデルで生成された埋め込みは、一般に異なるベクトル空間に属するため、同じベクトルフィールドに混在させるべきではありません。現在のフィールドを上書きするのではなく、新しい表現用の NULL 許容のベクトルフィールドを追加し、移行中は両方のフィールドを利用できる状態に保ちます。

新規および更新されたエンティティは、過去のエンティティがバックフィルされる前に、新しい表現を受け取り始めます。新しい表現が完全に投入されて検証されるまで、本番検索は既存のモデルとフィールドを使用し続けます。カットオーバー後は、ロールバック期間中、元の表現を利用できる状態に保ちます。

```python
┌─────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────┐
│ embedding_v1        │      │ embedding_v1            │      │ embedding_v1        │
│ serves production   │ ───▶ │ embedding_v2 being      │ ───▶ │ kept for rollback   │
│ search              │      │ populated               │      │ embedding_v2 serves │
│                     │      │                         │      │ production search   │
└─────────────────────┘      └─────────────────────────┘      └─────────────────────┘

        v1 only                  v1 + v2                         v2 primary
```

重要な原則は、新しい表現が完成し、検証され、本番トラフィックを処理できる状態になるまで、古い表現を使用可能な状態に保つことです。

## 事前準備\{#before-you-start}

移行を開始する前に、次の条件を満たしていることを確認してください。

- 新しい埋め込みモデルを選択し、そのベクトル次元と類似度メトリクスを確認していること。

- 既存のエンティティの埋め込み生成に使用したソースコンテンツに、引き続きアクセスできること。

- 各ソースレコードを、安定したプライマリキーを通じて既存のエンティティにマッピングできること。

- 移行の検証中に現在の検索パスと新しい検索パスを比較するために使用できる、固定の評価セットがあること。

- 本番トラフィックに許容できない影響を与えずに移行を完了するための、埋め込み、書き込み、インデックス作成、ストレージの十分な容量があること。

## ステップ 1: 移行データを準備する\{#step-1-prepare-the-migration-data}

コレクションまたは本番アプリケーションを変更する前に、新しい埋め込み表現用のクリーンで検証済みのデータセットを準備します。信頼できるソースデータから新しい埋め込みを生成し、必要に応じて重複レコードや異常なレコードをクリーンアップし、ステージングしたデータがバックフィルに使用できる状態であることを確認します。

<Procedures>

1. **ソースコンテンツを収集します。**

    ソースコンテンツが既存のコレクションに保存されている場合は、クエリイテレーターを使用してエンティティをバッチ単位で読み取ります。プライマリキー、埋め込みの生成に使用したソースフィールド、および利用可能な場合はバージョン、タイムスタンプ、またはコンテンツハッシュを取得します。

    Milvus からデータをエクスポートするには、次のようにクエリイテレーターを使用します。

    ```python
    iterator = client.query_iterator(
        collection_name="documents",
        batch_size=1000,
        filter="",
        output_fields=["id", "text", "content_version"],
    )
    
    for batch in iterator:
        save(batch, "migration-source")
    ```

    準備したソースデータは以下の通りです。

    ```plaintext
    id   | text                 | content_version
    1001 | "Example document A" | 42
    1002 | "Example document B" | 17
    ```

    続行する前に、プライマリキーが存在して一意であること、および対象範囲内のすべてのエンティティが新しい埋め込みモデルに必要なソースコンテンツを持っていることを確認します。

1. **新しいモデルで埋め込みを生成します。**

    前のステップで適格性を確認したモデルと構成を使用して、準備したソースデータから `embedding_v2` を生成します。生成した各ベクトルには、プライマリキーとソースのバージョンを保持します。

    次の擬似コードは、処理フローを示しています。

    ```python
    # Pseudocode
    source_records = read("migration-source.parquet")
    
    generated = []
    failed = []
    
    for record in source_records:
        try:
            generated.append({
                "id": record["id"],
                "embedding_v2": embed(
                    record["text"],
                    model="new-embedding-model",
                ),
                "content_version": record["content_version"],
            })
        except Exception as error:
            failed.append({
                "id": record["id"],
                "reason": str(error),
            })
    
    save(generated, "embedding-v2.parquet")
    save(failed, "embedding-v2-failures.json")
    ```

    失敗したプライマリキーとその失敗理由は、黙ってスキップせずに保持します。

1. **必要に応じてステージングデータをクリーンアップします。**

    パイプラインの再試行、エクスポートの繰り返し、または処理実行の失敗により、ステージングしたデータセットに重複レコードや異常なレコードが混入することがあります。バックフィルの前にこれらの問題を解消します。

    同じエンティティが複数回出現する場合は、プライマリキーによる重複排除を使用します。ほぼ重複した埋め込みや異常な埋め込みが疑われる場合は、ベクトル類似度による重複排除または異常検知を使用して、レビュー対象のレコードを特定します。詳細については、[プライマリキー重複排除](./primary-key-dedup)、[ベクトル類似度重複排除](./vector-similarity-dedup)、[異常検知](./anomaly-detection) を参照してください。

    続行する前に、説明のつかない重複したプライマリキーや疑わしいレコードが残っていないことを確認します。

1. **生成したデータを検証します。**

    プライマリキーが存在して一意であること、ベクトルが期待される次元と有効な数値を持っていること、およびすべてのソースレコードが漏れなく処理されていることを確認します。

    次の擬似コードは、検証を示しています。

    ```python
    # Pseudocode
    source_records = read("migration-source.parquet")
    generated = read("embedding-v2.parquet")
    failed = read("embedding-v2-failures.json")
    
    EXPECTED_DIM = 1024
    
    source_ids = {record["id"] for record in source_records}
    generated_ids = {record["id"] for record in generated}
    failed_ids = {record["id"] for record in failed}
    
    assert len(generated_ids) == len(generated)
    
    for record in generated:
        vector = record["embedding_v2"]
        assert record["id"] is not None
        assert len(vector) == EXPECTED_DIM
        assert all(is_valid_number(value) for value in vector)
    
    unaccounted_ids = source_ids - generated_ids - failed_ids
    
    if unaccounted_ids:
        raise ValueError(
            f"{len(unaccounted_ids)} source records are unaccounted for"
        )
    ```

    続行する前に、説明のつかない欠落レコード、無効なベクトル、またはプライマリキーの競合がないことを確認します。

1. **移行データをステージングし、ベースラインを記録します。**

    検証済みの移行データセットを、Parquet、JSON、Lance、CSV などのサポートされている形式で保存します。ステージングしたデータを、バックフィルジョブからアクセスできる外部ボリュームにアップロードします。外部ボリュームの作成方法については、[外部ボリューム](./external-volume) を参照してください。

    ソースのウォーターマークまたはスナップショット時刻、埋め込みモデルとバージョン、ベクトル次元、ステージングしたデータセット、およびレコード数を記録します。このベースラインは、照合と最終検証のために移行アーティファクトと一緒に保管します。

    ```yaml
    migration_id: embedding-v2-2026-08
    source_watermark: 2026-08-25T02:00:00Z
    embedding_model: new-embedding-model
    vector_dimension: 1024
    source_records: 10000000
    generated_embeddings: 9999850
    failed_records: 150
    staged_dataset: embedding-v2.parquet
    ```

    すべてのソースレコードがステージングしたデータセットに含まれているか、失敗または除外として明示的に追跡されていれば、移行データセットの準備は完了です。

</Procedures>

## ステップ 2: リーダーとライターを準備する\{#step-2-prepare-readers-and-writers}

本番トラフィックを変更する前に、現在の埋め込み表現と新しい埋め込み表現の両方をサポートするようにアプリケーションを準備します。読み取りと書き込みの切り替えは独立させておき、先に書き込みを移行して新しい表現を検証し、その後に読み取りを切り替えられるようにします。

読み取り側では、クエリ埋め込みモデルと対応するベクトルフィールドを常に組み合わせる 2 つの検索プロファイルを定義します。

```plaintext
v1 = old embedding model + embedding_v1
v2 = new embedding model + embedding_v2
```

あるモデルでクエリをエンコードし、別のモデルで生成されたベクトルフィールドを検索しないでください。

書き込み側では、エンティティに使用したものと同じソースコンテンツから `embedding_v2` を生成するように、挿入パスと更新パスを準備します。新しい書き込みパスはまだ有効にしないでください。本番の書き込みは、v2 フィールドとインデックスを追加した後に切り替えます。

次の例のように、2 つの制御を別々に保ちます。

```plaintext
write_profile = v1 | v1+v2
read_profile  = v1 | v2
```

このステップの終了時点で、本番の読み取りと書き込みは引き続き v1 を使用しますが、アプリケーションは、以降の移行ステップで v2 を個別に有効化できる状態になっている必要があります。

## ステップ 3: v2 フィールドを追加してインデックスを作成する\{#step-3-add-and-index-the-v2-field}

新しいモデルで生成された埋め込み用に、NULL 許容のベクトルフィールドを追加します。その次元は、新しい埋め込みモデルに合わせて設定します。

```python
from pymilvus import DataType

client.add_collection_field(
    collection_name="documents",
    field_name="embedding_v2",
    data_type=DataType.FLOAT_VECTOR,
    dim=1024,
    nullable=True,
)
```

既存のエンティティは、バックフィル中にフィールドを投入するまで `embedding_v2` に `NULL` を持ちます。新しいエンティティは、次のステップで本番ライターを切り替えた後に `embedding_v2` の書き込みを開始できます。

新しいモデル用に選択した類似度メトリクスを使用して、新しいベクトルフィールドにインデックスを作成します。

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="embedding_v2",
    index_type="AUTOINDEX",
    metric_type="COSINE",
)

client.create_index(
    collection_name="documents",
    index_params=index_params,
)
```

NULL 以外の `embedding_v2` 値を持つエンティティのみがインデックスに含まれ、新しいフィールドを介して検索できます。

続行する前に、`embedding_v2` がコレクションスキーマに存在し、その次元とインデックス構成が新しい埋め込みモデルと一致することを確認します。次のステップでライターを切り替えるまでは、本番の読み取りと書き込みを v1 のままにしておきます。

## ステップ 4: 本番の書き込みを切り替える\{#step-4-switch-production-writes}

新規または更新されたすべてのエンティティが `embedding_v1` と `embedding_v2` の両方を受け取るように、本番ライターを更新します。過去のエンティティのバックフィルが進行している間は、本番の読み取りを v1 のままにしておきます。

両方の埋め込みを、同じソースコンテンツとバージョンから生成します。

```python
# Pseudocode
source = get_latest_source(record_id)

write_entity({
    "id": source["id"],
    "text": source["text"],
    "content_version": source["content_version"],
    "embedding_v1": embed(source["text"], model="current-model"),
    "embedding_v2": embed(source["text"], model="new-model"),
})
```

一方の表現の生成が失敗したときに、もう一方の表現だけを書き込まないでください。失敗したエンティティを記録して再試行し、移行中は両方のフィールドを最新の状態に保ちます。

過去のエンティティのバックフィルを開始する前に、本番検索が引き続き `embedding_v1` を使用しつつ、新規および更新されたエンティティが両方のベクトルフィールドで有効な値を受け取っていることを確認します。

## ステップ 5: 既存のエンティティをバックフィルする\{#step-5-backfill-existing-entities}

本番ライターを切り替える前に存在していたエンティティに対して `embedding_v2` をバックフィルします。先に準備したステージング済みの移行データセットを使用し、各レコードをプライマリキーによって既存のエンティティと照合します。

外部ボリュームから、ステージングした Parquet、JSON、Lance、または CSV データをバックフィルワークフローに送信します。プライマリキーと `embedding_v2` の列を、既存のコレクションフィールドにマッピングします。

```bash
export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

curl --request POST \
    --url "https://api.cloud.zilliz.com/v2/projects/{projectId}/jobs/backfill" \
    --header "Authorization: Bearer ${API_KEY}" \
    --header "Idempotency-Key: migrate-to-new-embedding-model-001" \
    --header "Content-Type: application/json" \
  --data '{
    "collectionName": "documents",
    "fields": ["embedding_v2"],
    "input": {
      "type": "volume",
      "volumeId": "migration-data",
      "path": "embedding-v2/",
      "format": "parquet"
    },
    "columnMapping": {
      "id": "id",
      "embedding_v2": "embedding_v2"
    },
    "mode": "coalesce"
  }'
```

ステージングした入力には、既存のエンティティごとに 1 行が含まれている必要があります。

```plaintext
id   | embedding_v2       | content_version
1001 | [0.12, 0.31, ...]  | 42
1002 | [0.18, 0.27, ...]  | 17
```

バックフィルの実行中は、本番のデュアル書き込みを有効にしておきます。移行ベースラインの後に作成または更新されたレコードは、本番ライターによって処理され、次のステップで照合されます。

続行する前に、バックフィルジョブが正常に完了したことを確認し、そのジョブ ID、入力データセット、ソースのウォーターマーク、およびスキップまたは失敗したレコードを記録します。ジョブの成功を、移行が本番の読み取りに対応できる証拠と見なさないでください。カバレッジと正確性は、後の検証ステップで検証します。

## ステップ 6: バックフィル後に行われた変更を照合する\{#step-6-reconcile-changes-made-after-the-backfill}

バックフィルが完了したら、移行ベースラインの後に作成または更新されたレコードを照合し、`embedding_v2` が最新のソースコンテンツを反映するようにします。

先に記録したソースのウォーターマーク、スナップショット時刻、または `content_version` を使用して、影響を受けるエンティティを特定します。最新のソースバージョンから `embedding_v2` を再生成し、本番ライターを通じて書き込みます。

```python
# Pseudocode
baseline = read("migration-baseline.json")

for record in source_store.changed_after(baseline["source_watermark"]):
    latest = source_store.read(record["id"])

    if latest is None or latest["deleted"]:
        continue

    write_embedding_v2(
        id=latest["id"],
        embedding=embed(
            latest["text"],
            model="new-embedding-model",
        ),
        content_version=latest["content_version"],
    )
```

古いソースバージョンから生成された埋め込みを再利用しないでください。埋め込みの生成中にソースが再び変更された場合は、最新バージョンで再試行します。

続行する前に、移行ベースラインの後に行われたすべての変更が `embedding_v2` に適用されているか、再試行またはレビュー用に明示的に記録されていることを確認します。

## ステップ 7: 移行結果を検証する\{#step-7-validate-the-migration-results}

本番の読み取りを `embedding_v2` に移行する前に、移行したデータと新しい検索パスの両方を検証します。チェックを繰り返し実行できるように、移行ベースラインと、先に準備した固定の評価セットを使用します。

<Procedures>

1. **データカバレッジを確認します。**

    想定される移行対象の母集団と、現在 `embedding_v2` を持つエンティティを比較します。対象範囲内のすべてのエンティティは、値が投入されているか、失敗または除外として明示的に追跡されている必要があります。

    ```plaintext
    expected:      10,000,000
    populated:      9,999,850
    excluded:             150
    unexplained:            0
    ```

1. **データの鮮度を確認します。**

    移行中に変更されたエンティティについて、`embedding_v2` が最新のソースバージョンを反映していることを確認します。保存されているバージョンまたはコンテンツハッシュが信頼できるソースと一致しないレコードがあれば調査します。

1. **検索品質を比較します。**

    同じ評価セットを両方の検索プロファイルに対して実行します。

    ```plaintext
    v1 = old embedding model + embedding_v1
    v2 = new embedding model + embedding_v2
    ```

    Recall@K、MRR、nDCG@K など、アプリケーションにとって重要な検索メトリクスを比較します。

    ```plaintext
                     v1       v2
    Recall@10       0.82     0.87
    nDCG@10         0.71     0.76
    ```

    アプリケーションが類似度スコアのしきい値に依存している場合は、古い埋め込みモデルから導出したしきい値を再利用するのではなく、v2 用に再調整します。

1. **本番パフォーマンスを確認します。**

    代表的なトラフィックの下で v2 の検索パスをテストし、クエリ埋め込みのレイテンシ、検索レイテンシ、エラー率、スループット、モデル容量を現在の本番パスと比較します。

</Procedures>

説明のつかないカバレッジまたは鮮度のギャップがなくなり、v2 の検索パスが移行で定義した品質基準と運用基準を満たすまでは、本番の読み取りを切り替えないでください。

## ステップ 8: 本番の読み取りを切り替える\{#step-8-switch-production-reads}

移行が検証に合格したら、本番検索を v1 の検索プロファイルから v2 に移行します。新しいモデルで生成されたクエリが常に `embedding_v2` に対して検索されるように、クエリ埋め込みモデルとベクトルフィールドをまとめて切り替えます。

すべてのトラフィックを一度に切り替えるのではなく、新しい読み取りパスを段階的に展開します。本番トラフィックのごく一部から開始し、検索品質、レイテンシ、エラーを監視し、検証基準が引き続き満たされている限りトラフィックを増やします。

ロールアウト中はデュアル書き込みを有効にし、v1 の検索パスを利用可能な状態に保ちます。新しいパスが劣化した場合は、バックフィルを元に戻したり `embedding_v2` を削除したりすることなく、読み取りを古い埋め込みモデルと古いベクトルフィールドにルーティングし直します。

すべての本番の読み取りが v2 の検索プロファイルを使用し、定義したロールバック期間にわたってサービスが安定するまで続けます。

## ステップ 9: 移行を完了する\{#step-9-complete-the-migration}

すべての本番の読み取りが v2 の検索プロファイルを使用し、ロールバック期間が経過したら、新規および更新されたエンティティに対して `embedding_v1` を生成するのを停止し、古い表現に依存し続けているアプリケーションロジックを削除します。

コレクションが Milvus v3.0.x 以降と互換性がある場合は、コレクションから `embedding_v1` を削除します。

```python
client.drop_collection_field(
    collection_name="documents",
    field_name="embedding_v1",
)
```

フィールドを削除すると、関連するインデックスも削除されます。`embedding_v1` がコレクションに残る最後のベクトルフィールドである場合、この操作は拒否されます。

その後、古いフィールドが存在しないことを確認します。

```python
collection = client.describe_collection(
    collection_name="documents"
)

print(collection["fields"])
```

移行を完了する前に、本番の読み取りと書き込みが新しい埋め込みモデルと `embedding_v2` のみを使用していること、およびロールバックや照合のワークフローが古い表現に依存し続けていないことを確認します。

## 障害対応とロールバック\{#failure-handling-and-rollback}

移行が完了するまでは、現在の v1 の検索パスを利用可能な状態に保ちます。移行のステップが失敗した場合は、すでに正常に完了した変更を元に戻すのではなく、その段階から復旧します。

| **失敗段階** | **復旧方法** |
| --- | --- |
| **移行データの準備** | コレクションを変更する前に、失敗したレコードを修正または再生成します。ステージングしたデータセットに説明のつかない欠落、重複、または無効なレコードがある間は続行しないでください。 |
| **v2 フィールドまたはインデックスの追加** | 本番の読み取りと書き込みを v1 のままにしておきます。ライターを切り替える前に、スキーマまたはインデックス構成を修正します。 |
| **本番の書き込みの切り替え** | 本番の読み取りを v1 のままにしておきます。ライターを修正し、バックフィルを開始する前に、新規および更新されたエンティティが一貫して両方の表現を受け取ることを確認します。 |
| **バックフィル** | デュアル書き込みを有効にし、本番の読み取りを v1 のままにしておきます。可能な場合は、同じ移行データセットを使用してバックフィルを再試行します。スナップショットまたはステージングしたデータが無効になった場合は、新しいベースラインを準備し、影響を受ける部分を再実行します。 |
| **照合** | 読み取りを v1 のままにし、古くなったレコード、失敗したレコード、またはまだ変化しているレコードを再試行します。ソースと embedding_v2 の間に説明のつかない差異が残っている間は続行しないでください。 |
| **検証** | 本番の読み取りを切り替えないでください。カバレッジ、鮮度、検索品質、またはパフォーマンスの問題を修正し、影響を受ける検証チェックを繰り返します。 |
| **読み取りのロールアウト** | 診断のために embedding_v2 とそのインデックスをそのまま維持しつつ、読み取りを v1 の検索プロファイルにルーティングし直します。デュアル書き込みを有効にしておくことで、v1 が有効なロールバックパスとして機能し続けます。 |
| **完全なカットオーバー後** | ロールバック期間を通じて、embedding_v1、そのインデックス、および古いモデル統合を維持します。v2 が劣化した場合は、本番の読み取りを v1 に戻します。 |

ロールバック期間が終了するまでは、`embedding_v1` を削除したり、その維持を停止したりしないでください。古いフィールドとモデル統合を廃止した後は、ロールバックにはトラフィックの切り替えではなく、新しい移行が必要になります。
